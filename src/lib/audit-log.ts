import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Append an entry to the audit log. Non-blocking — if it fails, we log to
 * console but don't break the calling request.
 *
 * @param action  "create" | "update" | "delete" | "upload" | "delete-file"
 * @param entity  e.g. "gallery", "tracks", "bio"
 * @param itemId  the id of the affected row (string or number)
 * @param summary a short human description, e.g. "Updated caption to 'X'"
 */
export async function auditLog(
  action: string,
  entity: string,
  itemId: string | number | null,
  summary: string
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_log").insert({
      action,
      entity,
      item_id: itemId != null ? String(itemId) : null,
      summary: summary.slice(0, 500),
    });
  } catch (err) {
    // Non-fatal — don't break the request if logging fails.
    console.warn("[audit-log] failed to write:", err);
  }
}
