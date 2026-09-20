import { NextResponse } from "next/server";
import { findDrop } from "@/lib/drops";
import { normaliseDropId } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Existence probe for the "open a drop" field.
 *
 * Deliberately returns nothing but a boolean and whether a password is set —
 * never content — so it cannot be used to read a protected drop.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = normaliseDropId((await params).id);
  const drop = await findDrop(id);
  return NextResponse.json({
    exists: !!drop,
    hasPassword: !!drop?.password_hash,
  });
}
