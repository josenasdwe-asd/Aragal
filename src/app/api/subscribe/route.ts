import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Falta el email" },
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

    // Insert (ignore duplicates via ON CONFLICT — upsert with no changes)
    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert(
        { email: email.toLowerCase().slice(0, 200), source: "footer" },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) {
      console.error("[ARAGAL] Error guardando subscriber:", error.message);
      return NextResponse.json(
        { ok: false, error: "No se pudo suscribir" },
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
