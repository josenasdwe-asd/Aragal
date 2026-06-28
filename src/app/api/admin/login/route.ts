import { NextResponse } from "next/server";
import { login } from "@/lib/admin-auth";

/**
 * POST /api/admin/login
 * Body: { password: string }
 * Returns a Bearer token on success.
 *
 * Rate limiting: in-memory map of IP → attempt count + first attempt timestamp.
 * Max 5 attempts per 15 minutes per IP. Resets on success.
 * (In-memory means it resets on server restart — acceptable for cost-0.
 * For production with multiple instances, use Upstash Redis free tier.)
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const attempts = new Map<string, { count: number; firstAt: number }>();

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();

  // Check rate limit
  const record = attempts.get(ip);
  if (record) {
    // Reset window if expired
    if (now - record.firstAt > WINDOW_MS) {
      attempts.delete(ip);
    } else if (record.count >= MAX_ATTEMPTS) {
      const retryAfterSec = Math.ceil((record.firstAt + WINDOW_MS - now) / 1000);
      return NextResponse.json(
        {
          ok: false,
          error: `Demasiados intentos. Intenta de nuevo en ${retryAfterSec}s.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON inválido" },
      { status: 400 }
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Falta la contraseña" },
      { status: 400 }
    );
  }

  const result = await login(password);
  if (!result.ok) {
    // Record failed attempt
    const rec = attempts.get(ip);
    if (rec && now - rec.firstAt < WINDOW_MS) {
      rec.count += 1;
    } else {
      attempts.set(ip, { count: 1, firstAt: now });
    }
    const remaining = MAX_ATTEMPTS - (attempts.get(ip)?.count ?? 0);
    // Small delay to discourage brute-force.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json(
      {
        ...result,
        hint: remaining > 0 ? `Quedan ${remaining} intento(s).` : "Bloqueado temporalmente.",
      },
      { status: 401 }
    );
  }

  // Success — clear rate limit for this IP
  attempts.delete(ip);
  return NextResponse.json(result);
}
