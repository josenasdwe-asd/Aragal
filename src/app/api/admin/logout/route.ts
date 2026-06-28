import { NextResponse } from "next/server";
import { logout } from "@/lib/admin-auth";

/**
 * POST /api/admin/logout
 * Clears the httpOnly admin cookie.
 */
export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
