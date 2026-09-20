import { NextResponse } from "next/server";
import {
  countFiles,
  findDrop,
  listFiles,
  registerFile,
  usedBytes,
} from "@/lib/drops";
import { assertUnlocked } from "@/lib/guard";
import { chunkCountFor, CHUNK_SIZE } from "@/lib/storage";
import { generateFileId, normaliseDropId } from "@/lib/ids";
import { env } from "@/lib/env";
import { formatBytes } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/drops/:id/files — list completed files. */
export async function GET(_req: Request, { params }: Params) {
  const id = normaliseDropId((await params).id);
  const drop = await findDrop(id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const denied = await assertUnlocked(drop);
  if (denied) return denied;

  return NextResponse.json({ files: await listFiles(id) });
}

/**
 * POST /api/drops/:id/files — reserve an upload slot.
 *
 * The body is metadata only; the bytes follow as chunk PUTs to
 * /api/files/:fileId. This keeps every request small enough for serverless
 * body limits and makes an interrupted upload resumable.
 */
export async function POST(req: Request, { params }: Params) {
  const id = normaliseDropId((await params).id);
  const drop = await findDrop(id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const denied = await assertUnlocked(drop);
  if (denied) return denied;

  let body: { name?: string; mime?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 255) || "untitled";
  const mime = (body.mime ?? "").slice(0, 255) || "application/octet-stream";
  const size = Number(body.size);

  if (!Number.isFinite(size) || size < 0) {
    return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
  }
  if (size > env.maxFileBytes) {
    return NextResponse.json(
      { error: `Files are limited to ${formatBytes(env.maxFileBytes)}.` },
      { status: 413 }
    );
  }

  if ((await countFiles(id)) >= env.maxFilesPerDrop) {
    return NextResponse.json(
      { error: `A drop can hold ${env.maxFilesPerDrop} files.` },
      { status: 409 }
    );
  }

  const used = await usedBytes(id);
  if (used + size > env.maxDropBytes) {
    return NextResponse.json(
      {
        error: `This drop is full. The limit is ${formatBytes(env.maxDropBytes)}.`,
        remaining: Math.max(0, env.maxDropBytes - used),
      },
      { status: 413 }
    );
  }

  const fileId = generateFileId();
  const blob = await registerFile({
    dropId: id,
    fileId,
    name,
    mime,
    size,
    chunkCount: chunkCountFor(size),
    expiresAt: drop.expires_at ?? null,
  });

  return NextResponse.json(
    {
      fileId,
      chunkSize: CHUNK_SIZE,
      chunkCount: blob.chunk_count,
      received: blob.received,
    },
    { status: 201 }
  );
}
