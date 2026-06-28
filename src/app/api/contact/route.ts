import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp, rateLimitedResponse } from "@/lib/rate-limit";

// 3 mensajes por IP cada 15 minutos
const MAX_CONTACT = 3;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  // Rate limit
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit("contact", ip, MAX_CONTACT, WINDOW_MS);
  if (!allowed) {
    return rateLimitedResponse(retryAfter);
  }

  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      website?: string;
    };

    // Honeypot: if website field is filled, it's a bot
    if (website) {
      return Response.json({ ok: true }); // pretend success, don't save
    }

    if (!name || !email || !message) {
      return Response.json(
        { ok: false, error: "Faltan campos obligatorios" },
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

    // Additional sanitization: strip HTML tags
    const clean = (s: string) => s.replace(/<[^>]*>/g, "").trim();

    const { error } = await supabaseAdmin.from("messages").insert({
      name: clean(name).slice(0, 200),
      email: clean(email).slice(0, 200),
      subject: subject ? clean(subject).slice(0, 300) : null,
      message: clean(message).slice(0, 5000),
    });

    if (error) {
      console.error("[ARAGAL] Error guardando mensaje:", error.message);
      return Response.json(
        { ok: false, error: "No se pudo guardar el mensaje" },
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
