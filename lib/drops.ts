import type { Collection, Db } from "mongodb";
import { getDb } from "./mongodb";
import { detectKind, type FileKind } from "./filetypes";
import { legacyTimestamp } from "./format";
import type { DropFile, DropSummary } from "./drop-types";
import { BURN_GRACE_MS } from "./drop-types";

/**
 * Data access for drops.
 *
 * A "drop" is stored in the same `rooms` collection this project has always
 * used, and the document shape is a strict superset of the original
 * `{ room_id, content, last_modified }`. Every field added here is optional,
 * so drops created by earlier versions keep loading and saving unchanged with
 * no migration step.
 */

export interface DropDocument {
  room_id: string;
  content: string;
  last_modified: string;
  created_at?: Date;
  updated_at?: Date;
  password_hash?: string | null;
  expires_at?: Date | null;
  burn_after_read?: boolean;
  burn_triggered_at?: Date | null;
  view_count?: number;
}

export interface BlobDocument {
  _id: string;
  drop_id: string;
  name: string;
  mime: string;
  size: number;
  kind: FileKind;
  chunk_count: number;
  received: number[];
  complete: boolean;
  created_at: Date;
  expires_at?: Date | null;
}

export type { DropFile, DropSummary, ExpiryValue } from "./drop-types";
export {
  EXPIRY_OPTIONS,
  DEFAULT_EXPIRY,
  BURN_GRACE_MS,
  expiryToDate,
} from "./drop-types";

/* ---------------------------------------------------------------- indexes -- */

let indexesReady: Promise<void> | null = null;

/**
 * Indexes are created once per process, lazily, and never fatally: an index
 * build failing (for example a unique index rejected by pre-existing duplicate
 * data) must not take the app down.
 */
function ensureIndexes(db: Db): Promise<void> {
  indexesReady ??= (async () => {
    const results = await Promise.allSettled([
      db.collection("rooms").createIndex({ room_id: 1 }, { unique: true }),
      db.collection("rooms").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
      db.collection("blobs").createIndex({ drop_id: 1 }),
      db.collection("blobs").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
      db.collection("blob_chunks").createIndex({ file_id: 1, n: 1 }, { unique: true }),
      db.collection("blob_chunks").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
    ]);
    for (const result of results) {
      if (result.status === "rejected") {
        console.warn("[justsaveit] index creation skipped:", result.reason?.message);
      }
    }
  })();
  return indexesReady;
}

export async function collections(): Promise<{
  db: Db;
  drops: Collection<DropDocument>;
  blobs: Collection<BlobDocument>;
}> {
  const db = await getDb();
  await ensureIndexes(db);
  return {
    db,
    drops: db.collection<DropDocument>("rooms"),
    blobs: db.collection<BlobDocument>("blobs"),
  };
}

/* ------------------------------------------------------------------ reads -- */

function isExpired(doc: DropDocument): boolean {
  return !!doc.expires_at && doc.expires_at.getTime() <= Date.now();
}

export function toDropFile(blob: BlobDocument): DropFile {
  return {
    id: blob._id,
    name: blob.name,
    mime: blob.mime,
    size: blob.size,
    kind: blob.kind,
    complete: blob.complete,
    createdAt: blob.created_at.toISOString(),
  };
}

export async function findDrop(id: string): Promise<DropDocument | null> {
  const { drops } = await collections();
  const doc = await drops.findOne({ room_id: id });
  // The TTL monitor only sweeps once a minute, so filter defensively on read.
  if (!doc || isExpired(doc)) return null;
  return doc;
}

/**
 * The minimum needed to decide whether a viewer may see a drop.
 *
 * Deliberately projects away `content` and `password_hash`: the locked render
 * path must never hold the protected material in scope, so it cannot be
 * leaked by a serialiser, a logger or a debug overlay.
 */
export interface DropAccess {
  hasPassword: boolean;
  burnAfterRead: boolean;
  burnTriggered: boolean;
  expiresAt: Date | null;
}

export async function getDropAccess(id: string): Promise<DropAccess | null> {
  const { drops } = await collections();

  // An aggregation rather than a find+projection so the password hash is
  // reduced to a boolean *inside* MongoDB. The hash then never enters this
  // process at all, and cannot be serialised into a response by anything
  // downstream — including React's development-mode debug payload.
  const [doc] = await drops
    .aggregate<{
      hasPassword: boolean;
      burnAfterRead: boolean;
      burnTriggered: boolean;
      expiresAt: Date | null;
    }>([
      { $match: { room_id: id } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          hasPassword: {
            $and: [
              { $ne: [{ $type: "$password_hash" }, "missing"] },
              { $ne: ["$password_hash", null] },
              { $ne: ["$password_hash", ""] },
            ],
          },
          burnAfterRead: { $eq: ["$burn_after_read", true] },
          burnTriggered: { $ne: [{ $type: "$burn_triggered_at" }, "missing"] },
          expiresAt: { $ifNull: ["$expires_at", null] },
        },
      },
    ])
    .toArray();

  if (!doc) return null;
  // The TTL monitor sweeps once a minute, so filter expiry on read as well.
  if (doc.expiresAt && doc.expiresAt.getTime() <= Date.now()) return null;

  return doc;
}

export async function listFiles(dropId: string): Promise<DropFile[]> {
  const { blobs } = await collections();
  const docs = await blobs
    .find({ drop_id: dropId, complete: true })
    .sort({ created_at: 1 })
    .toArray();
  return docs.map(toDropFile);
}

export async function getDropSummary(id: string): Promise<DropSummary | null> {
  const doc = await findDrop(id);
  if (!doc) return null;
  const files = await listFiles(id);
  return {
    id: doc.room_id,
    content: doc.content ?? "",
    files,
    hasPassword: !!doc.password_hash,
    expiresAt: doc.expires_at ? doc.expires_at.toISOString() : null,
    burnAfterRead: !!doc.burn_after_read,
    createdAt: doc.created_at ? doc.created_at.toISOString() : null,
    updatedAt: doc.last_modified ?? "",
    viewCount: doc.view_count ?? 0,
    totalBytes: files.reduce((sum, f) => sum + f.size, 0),
  };
}

/** Total bytes already stored against a drop, including in-flight uploads. */
export async function usedBytes(dropId: string): Promise<number> {
  const { blobs } = await collections();
  const [row] = await blobs
    .aggregate<{ total: number }>([
      { $match: { drop_id: dropId } },
      { $group: { _id: null, total: { $sum: "$size" } } },
    ])
    .toArray();
  return row?.total ?? 0;
}

export async function countFiles(dropId: string): Promise<number> {
  const { blobs } = await collections();
  return blobs.countDocuments({ drop_id: dropId });
}

/* ----------------------------------------------------------------- writes -- */

export interface CreateDropOptions {
  id: string;
  content?: string;
  passwordHash?: string | null;
  expiresAt?: Date | null;
  burnAfterRead?: boolean;
}

/** Inserts a drop. Returns false if the id is already taken. */
export async function createDrop(options: CreateDropOptions): Promise<boolean> {
  const { drops } = await collections();
  const now = new Date();
  try {
    await drops.insertOne({
      room_id: options.id,
      content: options.content ?? "",
      last_modified: legacyTimestamp(now),
      created_at: now,
      updated_at: now,
      password_hash: options.passwordHash ?? null,
      expires_at: options.expiresAt ?? null,
      burn_after_read: options.burnAfterRead ?? false,
      view_count: 0,
    });
    return true;
  } catch (error) {
    // Duplicate key — the id was taken between the check and the insert.
    if ((error as { code?: number }).code === 11000) return false;
    throw error;
  }
}

export async function updateContent(
  id: string,
  content: string,
  lastModified?: string
): Promise<void> {
  const { drops } = await collections();
  const now = new Date();
  await drops.updateOne(
    { room_id: id },
    {
      $set: {
        content,
        last_modified: lastModified ?? legacyTimestamp(now),
        updated_at: now,
      },
    }
  );
}

export async function updateSettings(
  id: string,
  settings: {
    passwordHash?: string | null;
    expiresAt?: Date | null;
    burnAfterRead?: boolean;
  }
): Promise<void> {
  const { drops, blobs } = await collections();
  const update: Partial<DropDocument> = { updated_at: new Date() };

  if ("passwordHash" in settings) update.password_hash = settings.passwordHash;
  if ("burnAfterRead" in settings) update.burn_after_read = settings.burnAfterRead;
  if ("expiresAt" in settings) update.expires_at = settings.expiresAt;

  await drops.updateOne({ room_id: id }, { $set: update });

  // Keep the blobs and their chunks on the same expiry clock as the drop so
  // that storage is reclaimed by MongoDB's TTL monitor without a cron job.
  if ("expiresAt" in settings) {
    const { db } = await collections();
    await blobs.updateMany(
      { drop_id: id },
      { $set: { expires_at: settings.expiresAt ?? null } }
    );
    const ids = (await blobs.find({ drop_id: id }, { projection: { _id: 1 } }).toArray()).map(
      (b) => b._id
    );
    if (ids.length > 0) {
      await db
        .collection("blob_chunks")
        .updateMany({ file_id: { $in: ids } }, { $set: { expires_at: settings.expiresAt ?? null } });
    }
  }
}

export async function recordView(id: string): Promise<void> {
  const { drops } = await collections();
  await drops.updateOne({ room_id: id }, { $inc: { view_count: 1 } });
}

/**
 * Start the self-destruct clock on a burn-after-read drop. Called the first
 * time somebody other than the creator opens it; the drop (and its files)
 * are then removed by the TTL monitor after the grace period, which leaves
 * enough time to actually download what was shared.
 */
export async function triggerBurn(id: string): Promise<Date> {
  const burnAt = new Date(Date.now() + BURN_GRACE_MS);
  await updateSettings(id, { expiresAt: burnAt });
  const { drops } = await collections();
  await drops.updateOne({ room_id: id }, { $set: { burn_triggered_at: new Date() } });
  return burnAt;
}

export { detectKind };

/* -------------------------------------------------------------- deletions -- */

/** Removes a drop, its file records and every stored chunk. */
export async function deleteDrop(id: string): Promise<void> {
  const { drops, blobs } = await collections();
  const ids = (await blobs.find({ drop_id: id }, { projection: { _id: 1 } }).toArray()).map(
    (b) => b._id
  );
  if (ids.length > 0) {
    const { removeBlobs } = await import("./storage");
    await removeBlobs(ids);
    await blobs.deleteMany({ drop_id: id });
  }
  await drops.deleteOne({ room_id: id });
}

export async function deleteFile(dropId: string, fileId: string): Promise<boolean> {
  const { blobs } = await collections();
  const blob = await blobs.findOne({ _id: fileId, drop_id: dropId });
  if (!blob) return false;

  const { removeBlobs } = await import("./storage");
  await removeBlobs([fileId]);
  await blobs.deleteOne({ _id: fileId });
  return true;
}

/* ------------------------------------------------------------------ blobs -- */

export interface RegisterFileInput {
  dropId: string;
  fileId: string;
  name: string;
  mime: string;
  size: number;
  chunkCount: number;
  expiresAt: Date | null;
}

export async function registerFile(input: RegisterFileInput): Promise<BlobDocument> {
  const { blobs } = await collections();
  const doc: BlobDocument = {
    _id: input.fileId,
    drop_id: input.dropId,
    name: input.name,
    mime: input.mime,
    size: input.size,
    kind: detectKind(input.mime, input.name),
    chunk_count: input.chunkCount,
    received: [],
    complete: false,
    created_at: new Date(),
    expires_at: input.expiresAt,
  };
  await blobs.insertOne(doc);
  return doc;
}

export async function findBlob(fileId: string): Promise<BlobDocument | null> {
  const { blobs } = await collections();
  return blobs.findOne({ _id: fileId });
}

/**
 * Records that a chunk landed. Returns the updated document so the caller can
 * tell the client whether the upload is now complete.
 */
export async function markChunkReceived(
  fileId: string,
  index: number
): Promise<BlobDocument | null> {
  const { blobs } = await collections();
  const updated = await blobs.findOneAndUpdate(
    { _id: fileId },
    { $addToSet: { received: index } },
    { returnDocument: "after" }
  );
  if (!updated) return null;

  if (!updated.complete && updated.received.length >= updated.chunk_count) {
    await blobs.updateOne({ _id: fileId }, { $set: { complete: true } });
    return { ...updated, complete: true };
  }
  return updated;
}
