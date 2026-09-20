import { NextResponse } from "next/server";
import { deleteFile, findBlob, findDrop, markChunkReceived } from "@/lib/drops";
import { isUnlocked } from "@/lib/guard";
import { CHUNK_SIZE, readBlob, toReadableStream, writeChunk } from "@/lib/storage";
import { canServeInline } from "@/lib/filetypes";
import { getDb } from "@/lib/mongodb";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ fileId: string }> };

/** Only hex ids are ever issued; reject anything else before it reaches Mongo. */
function validId(id: string): boolean {
  return /^[a-f0-9]{24}$/.test(id);
}

/**
 * PUT /api/files/:fileId — upload one chunk.
 * The chunk index travels in the `x-chunk-index` header and the body is raw
 * bytes, which avoids multipart overhead.
 */
export async function PUT(req: Request, { params }: Params) {
  const fileId = (await params).fileId;
  if (!validId(fileId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blob = await findBlob(fileId);
  if (!blob) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const drop = await findDrop(blob.drop_id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await isUnlocked(drop))) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  const index = Number.parseInt(req.headers.get("x-chunk-index") ?? "", 10);
  if (!Number.isInteger(index) || index < 0 || index >= blob.chunk_count) {
    return NextResponse.json({ error: "Bad chunk index" }, { status: 400 });
  }

  const data = Buffer.from(await req.arrayBuffer());
  if (data.length === 0 || data.length > CHUNK_SIZE) {
    return NextResponse.json({ error: "Bad chunk size" }, { status: 400 });
  }

  // The declared size is the contract; refuse chunks that would exceed it.
  const expected =
    index === blob.chunk_count - 1 ? blob.size - index * CHUNK_SIZE : CHUNK_SIZE;
  if (data.length !== expected) {
    return NextResponse.json({ error: "Chunk does not match declared size" }, { status: 400 });
  }

  await writeChunk(fileId, index, data);

  // Chunks ride the same TTL clock as the drop so storage reclaims itself.
  if (env.storageDriver === "mongo" && drop.expires_at) {
    const db = await getDb();
    await db
      .collection("blob_chunks")
      .updateOne({ file_id: fileId, n: index }, { $set: { expires_at: drop.expires_at } });
  }

  const updated = await markChunkReceived(fileId, index);

  return NextResponse.json({
    received: updated?.received.length ?? 0,
    chunkCount: blob.chunk_count,
    complete: updated?.complete ?? false,
  });
}

/** GET /api/files/:fileId — stream the file, with range support. */
export async function GET(req: Request, { params }: Params) {
  const fileId = (await params).fileId;
  if (!validId(fileId)) return new NextResponse("Not found", { status: 404 });

  const blob = await findBlob(fileId);
  if (!blob || !blob.complete) return new NextResponse("Not found", { status: 404 });

  const drop = await findDrop(blob.drop_id);
  if (!drop) return new NextResponse("Not found", { status: 404 });
  if (!(await isUnlocked(drop))) return new NextResponse("Locked", { status: 401 });

  const url = new URL(req.url);
  const forceDownload = url.searchParams.get("download") === "1";

  // `inline` only for types that cannot execute script on our origin.
  const disposition =
    forceDownload || !canServeInline(blob.mime) ? "attachment" : "inline";
  const filename = blob.name.replace(/["\\\r\n]/g, "_");

  const headers = new Headers({
    "Content-Type": blob.mime,
    "Content-Disposition": `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(blob.name)}`,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });

  const range = req.headers.get("range");
  let start = 0;
  let end = blob.size - 1;
  let status = 200;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      const [, rawStart, rawEnd] = match;
      if (rawStart === "" && rawEnd === "") {
        return new NextResponse("Range Not Satisfiable", { status: 416 });
      }
      if (rawStart === "") {
        // Suffix range: the last N bytes.
        start = Math.max(0, blob.size - Number.parseInt(rawEnd, 10));
      } else {
        start = Number.parseInt(rawStart, 10);
        if (rawEnd !== "") end = Math.min(end, Number.parseInt(rawEnd, 10));
      }
      if (!Number.isFinite(start) || start > end || start >= blob.size) {
        return new NextResponse("Range Not Satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${blob.size}` },
        });
      }
      status = 206;
      headers.set("Content-Range", `bytes ${start}-${end}/${blob.size}`);
    }
  }

  headers.set("Content-Length", String(end - start + 1));

  if (req.method === "HEAD") return new NextResponse(null, { status, headers });

  return new NextResponse(toReadableStream(readBlob(fileId, start, end)), {
    status,
    headers,
  });
}

/** DELETE /api/files/:fileId — remove one file from its drop. */
export async function DELETE(_req: Request, { params }: Params) {
  const fileId = (await params).fileId;
  if (!validId(fileId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blob = await findBlob(fileId);
  if (!blob) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const drop = await findDrop(blob.drop_id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await isUnlocked(drop))) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  await deleteFile(blob.drop_id, fileId);
  return NextResponse.json({ status: "deleted" });
}
