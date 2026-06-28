import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/messages — list all contact messages (admin only)
 * DELETE /api/admin/messages — delete all read messages (bulk cleanup)
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  // Delete all messages older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from("messages")
    .delete()
    .lt("created_at", thirtyDaysAgo);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Mensajes anteriores a 30 días eliminados" });
}
