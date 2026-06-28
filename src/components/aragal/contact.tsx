"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Reveal } from "./reveal";
import { useToast } from "@/hooks/use-toast";
import { TitleFlourish } from "./ornament";

const SOCIALS = [
  {
    href: "https://open.spotify.com/intl-es/artist/4bugRe9qz3z8As6rKmMc7r",
    icon: "🎧",
    title: "Spotify",
    text: "Escucha mi música",
  },
  {
    href: "https://www.instagram.com/mario.aravena.oficial/",
    icon: "📸",
    title: "Instagram",
    text: "@mario.aravena.oficial",
  },
  {
    href: "https://www.facebook.com/profile.php/?id=61556996900962",
    icon: "👥",
    title: "Facebook",
    text: "Mario Aravena Artista",
  },
] as const;

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // honeypot
    if (data.get("website")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
      toast({
        title: "Mensaje enviado",
        description: "Gracias por escribir. Te responderemos pronto.",
      });
    } catch {
      setStatus("idle");
      toast({
        title: "No se pudo enviar",
        description: "Inténtalo nuevamente en unos minutos.",
        variant: "destructive",
      });
    }
  }

  return (
    <section id="contacto" className="py-20 sm:py-28">
      <div className="aragal-container">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-eyebrow">Hablemos</span>
          <div className="flex items-center justify-center gap-3">
            <TitleFlourish flip />
            <h2 className="section-title">Conecta con ARAGAL</h2>
            <TitleFlourish />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            ¿Tienes alguna pregunta o propuesta de colaboración? Completa el
            formulario y nos pondremos en contacto contigo pronto.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <Reveal direction="right" className="glass p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre" htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="focus-gold w-full rounded-lg border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60"
                    style={{
                      borderColor: "var(--glass-border)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  />
                </Field>
                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="focus-gold w-full rounded-lg border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60"
                    style={{
                      borderColor: "var(--glass-border)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  />
                </Field>
              </div>
              <Field label="Asunto" htmlFor="subject">
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Asunto del mensaje"
                  className="focus-gold w-full rounded-lg border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60"
                  style={{
                    borderColor: "var(--glass-border)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
              </Field>
              <Field label="Mensaje" htmlFor="message">
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Tu mensaje..."
                  className="focus-gold w-full resize-y rounded-lg border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60"
                  style={{
                    borderColor: "var(--glass-border)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
              </Field>

              {/* honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="btn-gold focus-gold w-full disabled:opacity-70"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Mensaje enviado
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </Reveal>

          {/* Socials */}
          <Reveal direction="left" className="flex flex-col gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.title}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass focus-gold group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:border-[var(--gold)]"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "color-mix(in srgb, var(--gold) 12%, transparent)",
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    {s.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{s.text}</p>
                </div>
              </a>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
