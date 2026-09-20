import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { env } from "./env";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 32;

/**
 * Hash a drop password with scrypt. Node ships scrypt in its standard library,
 * so this needs no third-party dependency and no external service.
 *
 * Format: `scrypt$<salt-hex>$<derived-key-hex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Constant-time password check against a stored `scrypt$…` string. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}

/**
 * Mint a signed unlock token for a drop. The token is opaque to the client and
 * is stored in an httpOnly cookie — there is no account or session behind it,
 * it only proves "this browser supplied the right password for this drop".
 */
export function signUnlockToken(dropId: string, expiresAt: number): string {
  const payload = `${dropId}.${expiresAt}`;
  const signature = createHmac("sha256", env.appSecret)
    .update(payload)
    .digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function verifyUnlockToken(dropId: string, token: string): boolean {
  const separator = token.indexOf(".");
  if (separator === -1) return false;

  const expiresAt = Number.parseInt(token.slice(0, separator), 10);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = signUnlockToken(dropId, expiresAt);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const UNLOCK_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function unlockCookieName(dropId: string): string {
  // Cookie names may not contain most punctuation; drop ids are already
  // restricted to [a-z0-9-] by normaliseDropId.
  return `jsi_unlock_${dropId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}
