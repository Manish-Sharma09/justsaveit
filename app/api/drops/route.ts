import { NextResponse } from "next/server";
import {
  createDrop,
  DEFAULT_EXPIRY,
  expiryToDate,
  findDrop,
} from "@/lib/drops";
import {
  hashPassword,
  signUnlockToken,
  UNLOCK_TTL_MS,
  unlockCookieName,
} from "@/lib/crypto";
import {
  dropIdErrorMessage,
  generateDropId,
  normaliseDropId,
  validateDropId,
} from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateBody {
  id?: string;
  content?: string;
  password?: string;
  expiry?: string;
  burnAfterRead?: boolean;
}

/** POST /api/drops — create a drop and return its id. */
export async function POST(req: Request) {
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let id: string;

  if (body.id) {
    id = normaliseDropId(body.id);
    const invalid = validateDropId(id);
    if (invalid) {
      return NextResponse.json(
        { error: dropIdErrorMessage(invalid), field: "id" },
        { status: 400 }
      );
    }
    if (await findDrop(id)) {
      return NextResponse.json(
        { error: "That name is already taken. Try another.", field: "id" },
        { status: 409 }
      );
    }
  } else {
    // Generated ids collide so rarely that a handful of retries is plenty.
    id = generateDropId();
    for (let attempt = 0; attempt < 5 && (await findDrop(id)); attempt += 1) {
      id = generateDropId(attempt < 3 ? 8 : 10);
    }
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (password && password.length < 4) {
    return NextResponse.json(
      { error: "Use at least 4 characters.", field: "password" },
      { status: 400 }
    );
  }

  const created = await createDrop({
    id,
    content: typeof body.content === "string" ? body.content.slice(0, 256 * 1024) : "",
    passwordHash: password ? await hashPassword(password) : null,
    expiresAt: expiryToDate(body.expiry ?? DEFAULT_EXPIRY),
    burnAfterRead: !!body.burnAfterRead,
  });

  if (!created) {
    return NextResponse.json(
      { error: "That name is already taken. Try another.", field: "id" },
      { status: 409 }
    );
  }

  const response = NextResponse.json({ id }, { status: 201 });

  // Whoever just set the password plainly knows it, so unlock the drop for
  // them straight away — otherwise the creator is locked out of their own
  // share link and never sees the code or the QR.
  if (password) {
    const expiresAt = Date.now() + UNLOCK_TTL_MS;
    response.cookies.set(unlockCookieName(id), signUnlockToken(id, expiresAt), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(UNLOCK_TTL_MS / 1000),
    });
  }

  return response;
}
