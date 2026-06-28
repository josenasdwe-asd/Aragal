import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp, rateLimitedResponse } from "@/lib/rate-limit";

// 5 suscripciones por IP cada 15 minutos
const MAX_SUBSCRIBE = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  // Rate limit
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit("subscribe", ip, MAX_SUBSCRIBE, WINDOW_MS);
  if (!allowed) {
    return rateLimitedResponse(retryAfter);
  }

  try {
    const { email, website } = (await request.json()) as { email?: string; website?: string };

    // Honeypot: if website field is filled, it's a bot
    if (website) {
      return Response.json({ ok: true }); // pretend success, don't save
    }

    if (!email) {
      return Response.json(
        { ok: false, error: "Falta el email" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { ok: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    // Sanitize: strip HTML tags
    const cleanEmail = email.replace(/<[^>]*>/g, "").trim().toLowerCase().slice(0, 200);

    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert(
        { email: cleanEmail, source: "footer" },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) {
      console.error("[ARAGAL] Error guardando subscriber:", error.message);
      return Response.json(
        { ok: false, error: "No se pudo suscribir" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
