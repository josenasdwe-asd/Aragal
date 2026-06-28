import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit-log";
import { ENTITY_REGISTRY, sanitiseBody } from "@/lib/admin-registry";

/**
 * GET  /api/admin/[entity]         — list all rows (sorted by sort_order).
 * POST /api/admin/[entity]         — create a new row (auto-id entities only).
 *
 * Both require a valid admin cookie.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ entity: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { entity: entitySlug } = await context.params;
  const entity = ENTITY_REGISTRY[entitySlug];
  if (!entity) {
    return NextResponse.json({ ok: false, error: "Entidad desconocida" }, { status: 404 });
  }

  // For singleton entities, just return the single row.
  let query = supabaseAdmin.from(entity.table).select("*");
  if (!entity.singleton) {
    // Order by sort_order when the entity has it; otherwise fall back to a
    // sensible column (e.g. tracks has no sort_order — order by title).
    if (entity.columns.includes("sort_order")) {
      query = query.order("sort_order", { ascending: true });
    } else if (entitySlug === "tracks") {
      query = query.order("title", { ascending: true });
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: entity.singleton ? (data[0] ?? null) : data });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ entity: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { entity: entitySlug } = await context.params;
  const entity = ENTITY_REGISTRY[entitySlug];
  if (!entity) {
    return NextResponse.json({ ok: false, error: "Entidad desconocida" }, { status: 404 });
  }
  if (entity.singleton) {
    return NextResponse.json(
      { ok: false, error: "No se puede crear otra fila en una entidad singleton" },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const payload = sanitiseBody(entity, body);

  // Handle the `id` column on inserts:
  //  - Numeric PK with DB default (identity/serial): omit `id` so Postgres
  //    auto-generates it. (Used by timeline, collaborations, gallery, news.)
  //  - Numeric PK without DB default: compute `max(id) + 1` ourselves.
  //    (Used by stats — its `id` column is NOT NULL with no default.)
  //  - String PK: the client must provide the id (e.g. a track slug).
  if (entity.pkType === "number") {
    if (entity.idHasDbDefault === false) {
      const { data: maxRow } = await supabaseAdmin
        .from(entity.table)
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextId = ((maxRow?.id as number | undefined) ?? 0) + 1;
      payload.id = nextId;
    }
    // else: omit `id` — Postgres will auto-generate.
  } else if (entity.pkType === "string" && typeof body.id === "string" && body.id.trim()) {
    // Allow the client to specify a string id (e.g. track slug).
    payload.id = body.id.trim();
  }

  // Auto-assign sort_order if not provided: max(sort_order) + 1.
  if (!("sort_order" in payload) && entity.columns.includes("sort_order")) {
    const { data: maxRow } = await supabaseAdmin
      .from(entity.table)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const next = (maxRow?.sort_order ?? 0) + 1;
    payload.sort_order = next;
  }

  const { data, error } = await supabaseAdmin
    .from(entity.table)
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/", "layout");
  await auditLog("create", entitySlug, (data as { id?: string | number }).id ?? "", `Creado en ${entitySlug}`);
  return NextResponse.json({ ok: true, data });
}
