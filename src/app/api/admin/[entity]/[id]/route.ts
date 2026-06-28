import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit-log";
import {
  ENTITY_REGISTRY,
  coerceId,
  sanitiseBody,
  fetchRow,
} from "@/lib/admin-registry";

/**
 * PUT    /api/admin/[entity]/[id]   — update a single row by PK.
 * DELETE /api/admin/[entity]/[id]   — delete a single row by PK.
 *
 * Both require a valid admin cookie.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ entity: string; id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { entity: entitySlug, id: idRaw } = await context.params;
  const entity = ENTITY_REGISTRY[entitySlug];
  if (!entity) {
    return NextResponse.json({ ok: false, error: "Entidad desconocida" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const id = coerceId(entity, idRaw);
  if (entity.pkType === "number" && Number.isNaN(id as number)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }

  const payload = sanitiseBody(entity, body);

  const { error } = await supabaseAdmin
    .from(entity.table)
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const fresh = await fetchRow(entity, id);
  revalidatePath("/", "layout");
  await auditLog("update", entitySlug, id, `Actualizado en ${entitySlug}`);
  return NextResponse.json({ ok: true, data: fresh });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ entity: string; id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { entity: entitySlug, id: idRaw } = await context.params;
  const entity = ENTITY_REGISTRY[entitySlug];
  if (!entity) {
    return NextResponse.json({ ok: false, error: "Entidad desconocida" }, { status: 404 });
  }
  if (entity.singleton) {
    return NextResponse.json(
      { ok: false, error: "No se puede eliminar una entidad singleton" },
      { status: 400 }
    );
  }

  const id = coerceId(entity, idRaw);
  if (entity.pkType === "number" && Number.isNaN(id as number)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from(entity.table).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/", "layout");
  await auditLog("delete", entitySlug, id, `Eliminado en ${entitySlug}`);
  return NextResponse.json({ ok: true });
}
