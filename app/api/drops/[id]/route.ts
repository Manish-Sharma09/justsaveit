import { NextResponse } from "next/server";
import {
  deleteDrop,
  expiryToDate,
  findDrop,
  getDropSummary,
  updateContent,
  updateSettings,
} from "@/lib/drops";
import { assertUnlocked } from "@/lib/guard";
import { hashPassword } from "@/lib/crypto";
import { normaliseDropId } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/drops/:id — full drop, once unlocked. */
export async function GET(_req: Request, { params }: Params) {
  const id = normaliseDropId((await params).id);
  const drop = await findDrop(id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const denied = await assertUnlocked(drop);
  if (denied) return denied;

  return NextResponse.json(await getDropSummary(id));
}

/** PATCH /api/drops/:id — update content and/or settings. */
export async function PATCH(req: Request, { params }: Params) {
  const id = normaliseDropId((await params).id);
  const drop = await findDrop(id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const denied = await assertUnlocked(drop);
  if (denied) return denied;

  let body: {
    content?: string;
    password?: string | null;
    expiry?: string;
    burnAfterRead?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.content === "string") {
    if (Buffer.byteLength(body.content) > 256 * 1024) {
      return NextResponse.json({ error: "Content too large" }, { status: 413 });
    }
    await updateContent(id, body.content);
  }

  const settings: Parameters<typeof updateSettings>[1] = {};

  if (body.password !== undefined) {
    const password = typeof body.password === "string" ? body.password.trim() : "";
    if (password && password.length < 4) {
      return NextResponse.json(
        { error: "Use at least 4 characters.", field: "password" },
        { status: 400 }
      );
    }
    settings.passwordHash = password ? await hashPassword(password) : null;
  }
  if (body.expiry !== undefined) settings.expiresAt = expiryToDate(body.expiry);
  if (body.burnAfterRead !== undefined) settings.burnAfterRead = !!body.burnAfterRead;

  if (Object.keys(settings).length > 0) await updateSettings(id, settings);

  return NextResponse.json(await getDropSummary(id));
}

/** DELETE /api/drops/:id — destroy the drop and everything in it. */
export async function DELETE(_req: Request, { params }: Params) {
  const id = normaliseDropId((await params).id);
  const drop = await findDrop(id);
  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const denied = await assertUnlocked(drop);
  if (denied) return denied;

  await deleteDrop(id);
  return NextResponse.json({ status: "deleted" });
}
