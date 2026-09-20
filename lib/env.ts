/**
 * Central, validated access to server configuration.
 *
 * Everything here is read lazily so that importing a module in a client bundle
 * or at build time never throws — only the first actual use does.
 */

import { randomBytes } from "node:crypto";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

let cachedSecret: string | null = null;

export const env = {
  get mongodbUri() {
    return required("MONGODB_URI");
  },

  /**
   * Signing key for unlock cookies. Required in production; in development we
   * fall back to an ephemeral per-process key so `npm run dev` works out of the
   * box (the only cost is that unlock cookies are invalidated on restart).
   */
  get appSecret(): string {
    if (cachedSecret) return cachedSecret;
    const fromEnv = process.env.APP_SECRET;
    if (fromEnv) {
      cachedSecret = fromEnv;
    } else if (process.env.NODE_ENV === "production") {
      throw new Error(
        "APP_SECRET must be set in production. Generate one with: openssl rand -hex 32"
      );
    } else {
      cachedSecret = randomBytes(32).toString("hex");
      console.warn(
        "[justsaveit] APP_SECRET is not set — using an ephemeral development key."
      );
    }
    return cachedSecret!;
  },

  get storageDriver(): "mongo" | "local" {
    return process.env.STORAGE_DRIVER === "local" ? "local" : "mongo";
  },

  get localStorageDir() {
    return process.env.LOCAL_STORAGE_DIR || ".data/blobs";
  },

  get maxFileBytes() {
    return int("MAX_FILE_BYTES", 25 * 1024 * 1024);
  },

  get maxDropBytes() {
    return int("MAX_DROP_BYTES", 100 * 1024 * 1024);
  },

  get maxFilesPerDrop() {
    return int("MAX_FILES_PER_DROP", 25);
  },
} as const;
