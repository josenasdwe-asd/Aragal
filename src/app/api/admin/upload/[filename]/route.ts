import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

/**
 * DELETE /api/admin/upload/[filename]
 * Deletes an uploaded file from /public/uploads/. Requires admin auth.
 * Only allows deleting files inside /public/uploads/ (no path traversal).
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { filename } = await context.params;

  // Sanitize: only allow alphanumeric, dash, underscore, dot in the filename.
  // Reject any path separators or ".." to prevent path traversal.
  if (!/^[\w\-.]+$/.test(filename)) {
    return NextResponse.json(
      { ok: false, error: "Nombre de archivo inválido" },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, filename);

  // Verify the resolved path is still inside uploadsDir (extra safety)
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(uploadsDir);
  if (!resolved.startsWith(resolvedDir + path.sep)) {
    return NextResponse.json(
      { ok: false, error: "Acceso denegado" },
      { status: 403 }
    );
  }

  try {
    await fs.unlink(resolved);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg.includes("ENOENT")) {
      return NextResponse.json(
        { ok: false, error: "Archivo no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
