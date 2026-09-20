import { NextResponse } from "next/server";
import { collections, findDrop, listFiles } from "@/lib/drops";
import { legacyTimestamp } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy endpoint, kept for backwards compatibility.
 *
 * The request and response shapes are unchanged from the original
 * implementation so that any existing client keeps working:
 *   { status: "already" | "success", data: { content, last_modified } }
 *
 * Password-protected drops are the one addition: they answer 403 rather than
 * handing their content to a client that never proved it knows the password.
 */
export async function POST(req: Request) {
  let room_id: unknown;
  try {
    ({ room_id } = await req.json());
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!room_id || typeof room_id !== "string") {
    return NextResponse.json(
      { status: "error", message: "Missing room_id" },
      { status: 400 }
    );
  }

  try {
    const existing = await findDrop(room_id);

    if (existing) {
      if (existing.password_hash) {
        return NextResponse.json(
          { status: "locked", message: "This drop is password protected." },
          { status: 403 }
        );
      }
      const files = await listFiles(room_id);
      return NextResponse.json({
        status: "already",
        data: {
          content: existing.content,
          last_modified: existing.last_modified,
          // Additive: older clients ignore unknown keys.
          files,
        },
      });
    }

    const now = new Date();
    const timestamp = now.toISOString();
    const { drops } = await collections();

    await drops.insertOne({
      room_id,
      content: "",
      last_modified: timestamp,
      created_at: now,
      updated_at: now,
      password_hash: null,
      expires_at: null,
      burn_after_read: false,
      view_count: 0,
    });

    return NextResponse.json({
      status: "success",
      data: { content: "", last_modified: timestamp, files: [] },
    });
  } catch (error) {
    // A racing insert on the unique index means somebody just created it.
    if ((error as { code?: number }).code === 11000) {
      const existing = await findDrop(room_id);
      if (existing) {
        return NextResponse.json({
          status: "already",
          data: {
            content: existing.password_hash ? "" : existing.content,
            last_modified: existing.last_modified ?? legacyTimestamp(),
            files: [],
          },
        });
      }
    }
    console.error("[createroom]", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
