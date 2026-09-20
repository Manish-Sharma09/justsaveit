import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DropDocument } from "./drops";
import { unlockCookieName, verifyUnlockToken } from "./crypto";

/**
 * Password gate.
 *
 * There are no accounts. A drop is protected by a password, and proving you
 * know it sets a short-lived, signed, httpOnly cookie scoped to that one drop.
 */
export async function isUnlocked(drop: DropDocument): Promise<boolean> {
  return hasUnlockCookie(drop.room_id, !!drop.password_hash);
}

/**
 * Cookie check that needs only the id and whether a password is set, so
 * callers on the locked path never have to load the drop itself.
 */
export async function hasUnlockCookie(
  dropId: string,
  passwordProtected: boolean
): Promise<boolean> {
  if (!passwordProtected) return true;
  const store = await cookies();
  const token = store.get(unlockCookieName(dropId))?.value;
  return !!token && verifyUnlockToken(dropId, token);
}

/**
 * Returns a 401 response when the caller has not unlocked the drop, or `null`
 * when the request may proceed. Callers do `const denied = await
 * assertUnlocked(drop); if (denied) return denied;`
 */
export async function assertUnlocked(
  drop: DropDocument
): Promise<NextResponse | null> {
  if (await isUnlocked(drop)) return null;
  return NextResponse.json(
    { status: "locked", message: "This drop is password protected." },
    { status: 401 }
  );
}
