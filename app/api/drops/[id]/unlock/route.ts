import { NextResponse } from "next/server";
import { findDrop } from "@/lib/drops";
import {
  signUnlockToken,
  UNLOCK_TTL_MS,
  unlockCookieName,
  verifyPassword,
} from "@/lib/crypto";
import { normaliseDropId } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A deliberately small, in-memory throttle. It is per-instance rather than
 * global, which is the honest trade-off for a free, stateless deployment: it
 * blunts casual brute forcing without adding a Redis bill.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function throttled(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (attempts.size > 5000) {
      for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

/** POST /api/drops/:id/unlock — exchange a password for an unlock cookie. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = normaliseDropId((await params).id);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (throttled(`${ip}:${id}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const drop = await findDrop(id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!drop.password_hash) return NextResponse.json({ status: "unlocked" });

  if (!password || !(await verifyPassword(password, drop.password_hash))) {
    return NextResponse.json({ error: "That password is not right." }, { status: 401 });
  }

  const expiresAt = Date.now() + UNLOCK_TTL_MS;
  const response = NextResponse.json({ status: "unlocked" });

  response.cookies.set(unlockCookieName(id), signUnlockToken(id, expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(UNLOCK_TTL_MS / 1000),
  });

  return response;
}
