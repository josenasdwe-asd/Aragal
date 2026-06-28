"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Bio } from "@/lib/data";

type Props = {
  bio: Bio;
};

/**
 * ManifiestoClient — the interactive horizontal slider. Receives the bio data
 * as props (fetched by the server parent component) so it doesn't need to
 * import the server-only Supabase client.
 */
export function ManifiestoClient({ bio }: Props) {
  const lines = bio.manifesto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(index, lines.length - 1));
    const slideWidth = container.clientWidth;
    container.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
    setActiveIndex(clamped);
  }, [lines.length]);

  const onScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const idx = Math.round(container.scrollLeft / container.clientWidth);
    setActiveIndex(idx);
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight") scrollTo(activeIndex + 1);
    if (e.key === "ArrowLeft") scrollTo(activeIndex - 1);
  }, [activeIndex, scrollTo]);

  useEffect(() => {
    const section = document.getElementById("manifiesto");
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible) {
          window.addEventListener("keydown", onKeyDown);
        } else {
          window.removeEventListener("keydown", onKeyDown);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  if (lines.length === 0) return null;

  return (
    <section
      id="manifiesto"
      className="relative h-screen min-h-[600px] overflow-hidden bg-black"
    >
      {/* Warm gold radial light from top */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in srgb, var(--gold) 10%, transparent) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      {/* Eyebrow — fixed at top */}
      <div className="absolute left-1/2 top-[12vh] z-20 -translate-x-1/2 text-center">
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.4em]"
          style={{ color: "var(--gold)", opacity: 0.7 }}
        >
          Manifiesto
        </span>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {lines.map((line, i) => {
          const isLast = i === lines.length - 1;
          return (
            <div
              key={i}
              className="flex h-full w-full flex-shrink-0 snap-center items-center justify-center px-6"
            >
              <div className="max-w-3xl text-center">
                <p
                  className="font-display italic leading-snug"
                  style={{
                    fontFamily: "var(--font-display), serif",
                    fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
                    fontWeight: 400,
                    color: isLast ? "var(--gold)" : "#f5efe0",
                    opacity: isLast ? 0.95 : 0.85,
                    letterSpacing: "0.01em",
                    textShadow: isLast
                      ? "0 2px 30px color-mix(in srgb, var(--gold) 30%, transparent)"
                      : "none",
                  }}
                >
                  {line}
                </p>

                {/* Signature on last slide */}
                {isLast && (
                  <p
                    className="mt-12 text-xs uppercase tracking-[0.3em]"
                    style={{ color: "var(--gold)", opacity: 0.6 }}
                  >
                    — Mario Aravena
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows (desktop only) */}
      <button
        type="button"
        onClick={() => scrollTo(activeIndex - 1)}
        disabled={activeIndex === 0}
        aria-label="Verso anterior"
        className="focus-gold absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-110 disabled:opacity-20 disabled:hover:scale-100 md:flex"
        style={{
          borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
          background: "rgba(10,10,10,0.5)",
          color: "var(--gold)",
        }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollTo(activeIndex + 1)}
        disabled={activeIndex === lines.length - 1}
        aria-label="Verso siguiente"
        className="focus-gold absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-110 disabled:opacity-20 disabled:hover:scale-100 md:flex"
        style={{
          borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
          background: "rgba(10,10,10,0.5)",
          color: "var(--gold)",
        }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-[8vh] left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {lines.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Ir al verso ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? "32px" : "8px",
              background:
                i === activeIndex
                  ? "var(--gold)"
                  : "color-mix(in srgb, var(--gold) 25%, transparent)",
            }}
          />
        ))}
      </div>

      {/* Hint text (first slide only, mobile) */}
      {activeIndex === 0 && (
        <p
          className="absolute bottom-[5vh] left-1/2 z-20 -translate-x-1/2 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground/50 md:hidden"
          style={{ animation: "scroll-bounce 2s infinite" }}
        >
          Desliza →
        </p>
      )}
    </section>
  );
}
