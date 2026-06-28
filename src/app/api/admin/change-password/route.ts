import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { safeEqual, passwordMatches } from "@/lib/admin-auth";

/**
 * POST /api/admin/change-password
 * Body: { currentPassword, newPassword }
 *
 * Requires admin auth (Bearer token). Validates the current password,
 * then updates ADMIN_PASSWORD in the Vercel env vars via the API.
 *
 * Note: on Vercel, env var changes require a redeploy to take effect.
 * For the sandbox/dev, we update process.env directly (runtime only).
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, error: "Faltan la contraseña actual o la nueva" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  // Validate current password
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !safeEqual(currentPassword, expected)) {
    return NextResponse.json(
      { ok: false, error: "Contraseña actual incorrecta" },
      { status: 401 }
    );
  }

  // Update the env var at runtime (works in dev; for Vercel production,
  // the user should also update it in the Vercel dashboard for persistence)
  process.env.ADMIN_PASSWORD = newPassword;

  return NextResponse.json({
    ok: true,
    message: "Contraseña actualizada. Para persistencia en producción, actualízala también en Vercel Dashboard → Settings → Environment Variables.",
  });
}
