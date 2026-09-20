import { NextResponse } from "next/server";
import { findDrop, updateContent } from "@/lib/drops";
import { assertUnlocked } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Maximum size of the text note. Generous, but bounded. */
const MAX_CONTENT_BYTES = 256 * 1024;

/**
 * Legacy endpoint, kept for backwards compatibility. Request and response
 * shapes are unchanged: { room_id, content, last_modified } -> { status }.
 */
export async function POST(req: Request) {
  let body: { room_id?: string; content?: string; last_modified?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { room_id, content, last_modified } = body;

  if (!room_id || content === undefined || !last_modified) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  if (typeof content !== "string" || Buffer.byteLength(content) > MAX_CONTENT_BYTES) {
    return NextResponse.json({ message: "Content too large" }, { status: 413 });
  }

  try {
    const drop = await findDrop(room_id);
    if (!drop) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const denied = await assertUnlocked(drop);
    if (denied) return denied;

    await updateContent(room_id, content, last_modified);
    return NextResponse.json({ status: "updated" });
  } catch (err) {
    console.error("[updateroom]", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
