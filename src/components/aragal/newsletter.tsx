"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: "" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Error de red");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--gold)" }}>
        <CheckCircle2 className="h-4 w-4" />
        <span>¡Gracias! Te avisaremos de novedades.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Mail className="h-3 w-3" style={{ color: "var(--gold)" }} />
        Recibe novedades de ARAGAL
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="focus-gold min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50"
          style={{
            borderColor: "var(--glass-border)",
            background: "rgba(255,255,255,0.04)",
          }}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="focus-gold flex flex-shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all disabled:opacity-60"
          style={{ background: "var(--gold)", color: "#0a0a0a" }}
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Suscribir"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1.5 text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}
    </form>
  );
}
