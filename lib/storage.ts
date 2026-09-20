import { Binary } from "mongodb";
import { promises as fs, createReadStream } from "node:fs";
import path from "node:path";
import { getDb } from "./mongodb";
import { env } from "./env";

/**
 * Binary storage.
 *
 * Files are split into fixed-size chunks so that a single HTTP request never
 * carries more than CHUNK_SIZE bytes. That keeps uploads inside the request
 * body limits imposed by serverless platforms (Vercel caps a request at
 * ~4.5 MB), makes uploads resumable, and gives the UI real progress.
 *
 * Two drivers are available, both free to run:
 *   • "mongo" (default) — chunks live in the same MongoDB database as the
 *     drops. No extra service and no extra bill; bounded by the cluster quota.
 *   • "local" — chunks are appended to files on disk. Intended for
 *     self-hosting on a box with a persistent filesystem.
 */

export const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB

export function chunkCountFor(size: number): number {
  return Math.max(1, Math.ceil(size / CHUNK_SIZE));
}

interface BlobDriver {
  writeChunk(fileId: string, index: number, data: Buffer): Promise<void>;
  read(fileId: string, start: number, end: number): AsyncIterable<Buffer>;
  remove(fileIds: string[]): Promise<void>;
}

/* ------------------------------------------------------------------ mongo -- */

const mongoDriver: BlobDriver = {
  async writeChunk(fileId, index, data) {
    const db = await getDb();
    await db.collection("blob_chunks").updateOne(
      { file_id: fileId, n: index },
      { $set: { file_id: fileId, n: index, data: new Binary(data) } },
      { upsert: true }
    );
  },

  async *read(fileId, start, end) {
    const db = await getDb();
    const firstChunk = Math.floor(start / CHUNK_SIZE);
    const lastChunk = Math.floor(end / CHUNK_SIZE);

    const cursor = db
      .collection("blob_chunks")
      .find({ file_id: fileId, n: { $gte: firstChunk, $lte: lastChunk } })
      .sort({ n: 1 });

    for await (const doc of cursor) {
      const chunkStart = (doc.n as number) * CHUNK_SIZE;
      const buffer = Buffer.from((doc.data as Binary).buffer);
      // Trim the first and last chunks down to the requested byte range.
      const from = Math.max(0, start - chunkStart);
      const to = Math.min(buffer.length, end - chunkStart + 1);
      if (to > from) yield buffer.subarray(from, to);
    }
  },

  async remove(fileIds) {
    if (fileIds.length === 0) return;
    const db = await getDb();
    await db.collection("blob_chunks").deleteMany({ file_id: { $in: fileIds } });
  },
};

/* ------------------------------------------------------------------ local -- */

function localPath(fileId: string): string {
  // Two-level fan-out keeps directory listings small.
  const dir = path.resolve(env.localStorageDir, fileId.slice(0, 2), fileId.slice(2, 4));
  return path.join(dir, fileId);
}

const localDriver: BlobDriver = {
  async writeChunk(fileId, index, data) {
    const target = localPath(fileId);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const handle = await fs.open(target, "r+").catch(() => fs.open(target, "w+"));
    try {
      await handle.write(data, 0, data.length, index * CHUNK_SIZE);
    } finally {
      await handle.close();
    }
  },

  async *read(fileId, start, end) {
    const stream = createReadStream(localPath(fileId), { start, end });
    for await (const chunk of stream) yield chunk as Buffer;
  },

  async remove(fileIds) {
    await Promise.all(
      fileIds.map((id) => fs.rm(localPath(id), { force: true }).catch(() => {}))
    );
  },
};

/* ---------------------------------------------------------------- exports -- */

export function blobDriver(): BlobDriver {
  return env.storageDriver === "local" ? localDriver : mongoDriver;
}

export async function writeChunk(fileId: string, index: number, data: Buffer) {
  return blobDriver().writeChunk(fileId, index, data);
}

export function readBlob(fileId: string, start: number, end: number) {
  return blobDriver().read(fileId, start, end);
}

export async function removeBlobs(fileIds: string[]) {
  return blobDriver().remove(fileIds);
}

/** Adapt an async iterable of Buffers to a web ReadableStream for Response. */
export function toReadableStream(source: AsyncIterable<Buffer>): ReadableStream<Uint8Array> {
  const iterator = source[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(new Uint8Array(value));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}
