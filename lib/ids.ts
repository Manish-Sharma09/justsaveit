/**
 * Id helpers.
 *
 * Randomness comes from the Web Crypto API rather than `node:crypto` so this
 * module is safe to import from client components — `normaliseDropId` is
 * needed in the browser to keep the input field and the URL in agreement.
 */

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Unambiguous alphabet: no 0/O, 1/l/I. Codes are meant to be read aloud,
 * typed on a phone, and printed on the share stub.
 */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

/** Cryptographically uniform random code, free of modulo bias. */
export function generateDropId(length = 8): string {
  const max = 256 - (256 % ALPHABET.length);
  let out = "";
  while (out.length < length) {
    for (const byte of randomBytes(length)) {
      if (byte >= max) continue; // reject to keep the distribution uniform
      out += ALPHABET[byte % ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export function generateFileId(): string {
  return Array.from(randomBytes(12), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const DROP_ID_MIN = 3;
export const DROP_ID_MAX = 64;

/** Reserved words that would collide with application routes. */
const RESERVED = new Set([
  "api", "r", "_next", "new", "about", "privacy", "terms", "favicon",
  "robots", "sitemap", "static", "public", "admin", "login", "signup",
]);

/**
 * Normalise a user-supplied drop id to the canonical URL form.
 * Kept permissive on input (people paste all sorts of things) and strict on
 * output so that a drop id is always safe in a URL, a cookie name and a
 * MongoDB query.
 */
export function normaliseDropId(input: string): string {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, DROP_ID_MAX);
}

export type DropIdError = "too-short" | "too-long" | "reserved" | "empty";

export function validateDropId(id: string): DropIdError | null {
  if (!id) return "empty";
  if (id.length < DROP_ID_MIN) return "too-short";
  if (id.length > DROP_ID_MAX) return "too-long";
  if (RESERVED.has(id)) return "reserved";
  return null;
}

export function dropIdErrorMessage(error: DropIdError): string {
  switch (error) {
    case "empty":
      return "Enter a name for your drop.";
    case "too-short":
      return `Use at least ${DROP_ID_MIN} characters.`;
    case "too-long":
      return `Use at most ${DROP_ID_MAX} characters.`;
    case "reserved":
      return "That name is reserved. Try another.";
  }
}
