import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/subscribers — list all newsletter subscribers (admin only)
 * DELETE /api/admin/subscribers — delete all subscribers (bulk cleanup)
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const { error } = await supabaseAdmin.from("subscribers").delete().neq("id", 0);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Todos los suscriptores eliminados" });
}
