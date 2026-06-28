import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    // Persist to Supabase (messages table). Public INSERT allowed by RLS.
    const { error } = await supabaseAdmin.from("messages").insert({
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      subject: (subject ?? "").slice(0, 300) || null,
      message: message.slice(0, 5000),
    });

    if (error) {
      console.error("[ARAGAL] Error guardando mensaje:", error.message);
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el mensaje" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
