"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const SUBTITLES = [
  "Compositor chileno que une son cubano, barrio y música espiritual",
  "Más de 24 años componiendo para la fe, la memoria y la vida cotidiana",
  "Colaboraciones con directores de Buena Vista Social Club",
  "Un sello espiritual inconfundible de raíz latina",
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SUBTITLES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Force video to play (browsers often block autoplay even when muted).
  // Retry on interaction (first click/tap) as a fallback.
  // The video file itself is a ping-pong (forward + reverse concatenated),
  // so a normal loop produces a seamless bounce with no visible cut.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => {
      if (v.paused) v.play().catch(() => {});
    };
    tryPlay();
    const onInteract = () => {
      tryPlay();
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, { once: true });
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  // Magnetic buttons — attract towards cursor on hover
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];

    magnets.forEach((el) => {
      const move = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      };
      const leave = () => {
        el.style.transform = "translate(0, 0)";
      };
      el.style.transition = "transform 0.3s ease-out";
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return (
    <section
      id="inicio"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-black"
    >
      {/* Full-screen background video — plays on ALL devices.
          Mobile uses a vertical (9:16) version so the artist is fully visible;
          desktop uses the horizontal (16:9) version. Both are slow-motion
          ping-pong loops. */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-left md:object-center"
        poster="/assets/images/hero-bg.webp"
        aria-hidden="true"
      >
        {/* CSS media query picks the right source: vertical for mobile,
            horizontal for desktop. */}
        <source src="/assets/video/hero-loop-mobile-v2.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/assets/video/hero-loop.mp4" type="video/mp4" />
      </video>
      {/* Hidden img for SEO/alt text (the video poster handles the visual) */}
      <img
        src="/assets/images/hero-bg.webp"
        alt="Mario Aravena, compositor chileno, con guitarra acústica"
        className="sr-only"
      />
      {/* Dark gradient overlay — on mobile (single column), a bottom-to-top
          gradient keeps the artist visible while darkening the lower area
          for text legibility. On desktop, a left-to-right gradient darkens
          the right side for the text. */}
      <div
        className="pointer-events-none absolute inset-0 md:block"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.9) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.85) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Subtle bottom fade for scroll continuity */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to bottom, transparent, #000)" }}
        aria-hidden="true"
      />

      {/* Text content — right-aligned on desktop, bottom-aligned on mobile
          so the artist stays visible on top. Unified serif typography. */}
      <div className="aragal-container relative z-10 flex w-full justify-end md:items-center">
        <div className="flex max-w-lg flex-col items-start py-16 md:py-24" style={{ fontFamily: "var(--font-display), serif" }}>
          {/* Eyebrow — small italic, sets editorial tone */}
          <p
            style={{
              fontFamily: "var(--font-display), serif",
              fontStyle: "italic",
              fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
              color: "var(--gold)",
              opacity: 0.75,
              marginBottom: "0.4rem",
              letterSpacing: "0.02em",
            }}
          >
            Compositor & Productor Musical
          </p>

          {/* Main title — the protagonist, serif 700 */}
          <h1
            className="gold-text"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(4rem, 9vw, 7.5rem)",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "0.04em",
              marginBottom: "0.3rem",
              textShadow: "0 4px 30px color-mix(in srgb, var(--gold) 22%, transparent)",
            }}
          >
            ARAGAL
          </h1>

          {/* Name — serif 500, tight beneath title, with a thin gold rule */}
          <div
            className="mb-3 flex items-center gap-3"
            style={{ marginTop: "0.2rem" }}
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: "2.5rem",
                height: "1px",
                background: "var(--gold)",
                opacity: 0.7,
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#f5efe0",
              }}
            >
              Mario Aravena
            </p>
          </div>

          {/* Roles — serif 300, small, gold, airy tracking */}
          <p
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(0.75rem, 1.05vw, 0.95rem)",
              color: "var(--gold)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 300,
              opacity: 0.85,
              marginBottom: "1.5rem",
            }}
          >
            Autor <span style={{ opacity: 0.4 }}>·</span> Compositor{" "}
            <span style={{ opacity: 0.4 }}>·</span> Productor Chileno
          </p>

          {/* Quote — serif italic 400, the emotional anchor */}
          <blockquote
            className="max-w-md"
            style={{
              fontFamily: "var(--font-display), serif",
              fontStyle: "italic",
              fontSize: "clamp(1.15rem, 2vw, 1.6rem)",
              lineHeight: 1.35,
              fontWeight: 400,
              color: "rgba(255,255,255,0.88)",
              borderLeft: "2px solid var(--gold)",
              paddingLeft: "1.25rem",
              marginBottom: "2rem",
            }}
          >
            La música donde la emoción se convierte en eternidad.
          </blockquote>

          {/* CTA buttons — magnetic effect on hover */}
          <div className="flex flex-wrap gap-3">
            <a href="#musica" className="btn-gold focus-gold magnetic-btn" data-magnetic>
              Escuchar Ahora
            </a>
            <a href="#bio" className="btn-outline-gold focus-gold magnetic-btn" data-magnetic>
              Conoce Mi Historia
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#bio"
        aria-label="Desplazarse hacia abajo"
        className="focus-gold absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
        style={{ animation: "scroll-bounce 2s infinite" }}
      >
        <span className="text-[0.7rem] uppercase tracking-[0.25em]">
          Descubre más
        </span>
        <ChevronDown className="h-4 w-4" style={{ color: "var(--gold)" }} />
      </a>
    </section>
  );
}
