import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/session
 * Returns { isAdmin: boolean } — used by the client to know whether to
 * render the admin UI (edit buttons, panel, etc.).
 */
export async function GET() {
  return NextResponse.json({ isAdmin: await isAdmin() });
}
