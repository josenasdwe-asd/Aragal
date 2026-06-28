import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit-log";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * POST /api/admin/upload
 * Receives a multipart/form-data file (image or video), optimizes it, and
 * stores it under /public/uploads/. Returns { ok, url, optimized: {...} }.
 *
 * Images (jpg, png, webp, gif, avif):
 *   - Converted to WebP (best compression with good quality)
 *   - Resized to max 1920px on the longest edge (preserving aspect ratio)
 *   - Quality 82 (sweet spot for size/quality)
 *
 * Videos (mp4, webm, mov, avi):
 *   - Stored as-is under /uploads/<uuid>.<ext>
 *   - For YouTube embeds, use the Videos entity instead.
 *
 * Requires admin auth (Bearer token).
 */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 82;

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "avi", "m4v", "mkv"]);

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "FormData inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Falta el archivo 'file'" }, { status: 400 });
  }

  const originalName = file.name || "upload";
  const ext = originalName.split(".").pop()?.toLowerCase() || "";
  const isImage = IMAGE_EXTS.has(ext);
  const isVideo = VIDEO_EXTS.has(ext);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { ok: false, error: `Extensión no soportada: .${ext}` },
      { status: 400 }
    );
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { ok: false, error: `Archivo demasiado grande. Máximo ${(maxBytes / 1024 / 1024).toFixed(0)}MB.` },
      { status: 413 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (isImage) {
      const meta = await sharp(buffer).metadata();
      const optimized = await sharp(buffer)
        .resize({
          width: MAX_IMAGE_DIMENSION,
          height: MAX_IMAGE_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();

      const uuid = randomUUID();
      const filename = `${uuid}.webp`;
      await fs.writeFile(path.join(uploadsDir, filename), optimized);

      await auditLog("upload", "file", filename, `Imagen subida y optimizada: ${originalName} → ${filename} (${(100 - (optimized.length / buffer.length) * 100).toFixed(0)}% reducción)`);
      return NextResponse.json({
        ok: true,
        url: `/uploads/${filename}`,
        optimized: {
          type: "image",
          originalSize: buffer.length,
          optimizedSize: optimized.length,
          reduction: `${(100 - (optimized.length / buffer.length) * 100).toFixed(0)}%`,
          originalFormat: meta.format,
          finalFormat: "webp",
        },
      });
    }

    // Video: store as-is
    const uuid = randomUUID();
    const filename = `${uuid}.${ext}`;
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${filename}`,
      optimized: {
        type: "video",
        originalSize: buffer.length,
        optimizedSize: buffer.length,
        format: ext,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error al optimizar" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/uploads — lists optimized files in /public/uploads/
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    const data = files
      .filter((f) => /\.(jpg|jpeg|png|webp|gif|avif|svg|mp4|webm|mov|avi)$/i.test(f))
      .map((f) => ({ name: f, url: `/uploads/${f}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: [] });
  }
}
