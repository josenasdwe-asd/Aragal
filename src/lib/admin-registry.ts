import { supabaseAdmin } from "@/lib/supabase";

/**
 * Per-entity schema registry used by the admin CRUD routes.
 *
 * Each entry whitelists the columns the admin is allowed to read/write, so
 * the dynamic route handlers can safely filter the request body without
 * shipping a separate route file per entity.
 */
export type EntityConfig = {
  /** Supabase table name (also used as the URL slug). */
  table: string;
  /** PK type — used to coerce the URL id param. */
  pkType: "number" | "string";
  /** Whitelisted columns the admin can write (snake_case, as in Supabase). */
  columns: string[];
  /** If true, the entity has a single row keyed by id=1 (no list/create). */
  singleton?: boolean;
  /** Columns whose values are arrays (so we can normalise input). */
  arrayColumns?: string[];
  /** Columns whose values are nullable strings (so we can store null). */
  nullableColumns?: string[];
  /**
   * Whether the database gives the `id` column a default (identity/serial).
   * - true (default for numeric PKs): we omit `id` from the insert payload
   *   and let Postgres auto-generate it.
   * - false: the column is NOT NULL without a default, so we compute
   *   `max(id) + 1` ourselves before insert.
   */
  idHasDbDefault?: boolean;
};

export const ENTITY_REGISTRY: Record<string, EntityConfig> = {
  bio: {
    table: "bio",
    pkType: "number",
    columns: [
      "intro",
      "body1",
      "body2",
      "body3",
      "body4",
      "manifesto",
      "quote",
      "image_url",
    ],
    singleton: true,
    nullableColumns: [],
  },
  stats: {
    table: "stats",
    pkType: "number",
    columns: ["number", "label", "sort_order"],
    // `stats.id` is NOT NULL without a DB default — we compute max(id)+1.
    idHasDbDefault: false,
  },
  timeline: {
    table: "timeline",
    pkType: "number",
    columns: ["year", "text", "sort_order"],
  },
  tracks: {
    table: "tracks",
    pkType: "string",
    columns: ["title", "category", "genre", "badge", "cover_url", "spotify_url"],
    nullableColumns: ["badge"],
  },
  collaborations: {
    table: "collaborations",
    pkType: "number",
    columns: [
      "role",
      "name",
      "subtitle",
      "image_url",
      "works",
      "impact",
      "sort_order",
    ],
    arrayColumns: ["works"],
    nullableColumns: ["image_url"],
  },
  gallery: {
    table: "gallery",
    pkType: "number",
    columns: ["src", "caption", "alt", "sort_order"],
  },
  news: {
    table: "news",
    pkType: "number",
    columns: ["date", "title", "description", "url", "url_label", "sort_order"],
    nullableColumns: ["url", "url_label"],
  },
  videos: {
    table: "videos",
    pkType: "number",
    columns: ["title", "youtube_id", "sort_order"],
  },
  press: {
    table: "press",
    pkType: "number",
    columns: ["type", "source", "title", "quote", "url", "date", "sort_order"],
    nullableColumns: ["quote", "url"],
  },
};

/** Coerce a string id from the URL into the entity's PK type. */
export function coerceId(entity: EntityConfig, raw: string): number | string {
  return entity.pkType === "number" ? Number(raw) : raw;
}

/**
 * Filter the request body to only whitelisted columns, normalise arrays and
 * convert empty strings to null for nullable columns.
 */
export function sanitiseBody(
  entity: EntityConfig,
  body: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of entity.columns) {
    if (!(col in body)) continue;
    let value = body[col];

    if (entity.arrayColumns?.includes(col)) {
      // Accept either a JSON array or a comma-separated string.
      if (Array.isArray(value)) {
        value = value
          .map((v) => (typeof v === "string" ? v.trim() : String(v)))
          .filter(Boolean);
      } else if (typeof value === "string") {
        value = value
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        value = [];
      }
    } else if (typeof value === "string" && value === "") {
      if (entity.nullableColumns?.includes(col)) {
        value = null;
      }
    }
    out[col] = value;
  }
  return out;
}

/** Re-fetch the full row after an upsert/update, so the client gets fresh data. */
export async function fetchRow(
  entity: EntityConfig,
  id: number | string
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabaseAdmin
    .from(entity.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.warn(`[admin] fetchRow(${entity.table}, ${id}) error:`, error.message);
    return null;
  }
  return data;
}
