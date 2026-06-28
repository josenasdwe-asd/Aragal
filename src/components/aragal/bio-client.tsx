"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { TitleFlourish } from "./ornament";
import { WaxSeal } from "./lucero";
import type { Bio as BioType, TimelineItem } from "@/lib/data";

type Props = {
  bio: BioType;
  timeline: TimelineItem[];
};

/**
 * BioClient — the interactive bio with parallax photo + staggered text reveal.
 * Receives data as props from the server parent (Bio) so Supabase fetch
 * stays server-side.
 */
export function BioClient({ bio, timeline }: Props) {
  const photoRef = useRef<HTMLDivElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);

  // Parallax: photo moves slower than scroll (depth illusion)
  useEffect(() => {
    const photo = photoRef.current;
    if (!photo) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = photo.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Only apply parallax when the photo is in viewport
        if (rect.bottom < 0 || rect.top > windowHeight) return;
        // Offset: photo moves at 70% of scroll speed (slower = depth)
        const offset = (rect.top - windowHeight * 0.5) * 0.15;
        photo.style.transform = `translateY(${offset}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Stagger reveal: paragraphs fade in one by one as they enter viewport
  useEffect(() => {
    const container = paragraphsRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      container.querySelectorAll("[data-stagger]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.stagger || "0";
            el.style.transitionDelay = `${delay}ms`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    container.querySelectorAll("[data-stagger]").forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(20px)";
      (el as HTMLElement).style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const manifestoLines = bio.manifesto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section id="bio" className="staff-texture relative overflow-hidden py-20 sm:py-28">
      {/* Wax seal watermark */}
      <div
        className="pointer-events-none absolute right-4 top-20 opacity-[0.12] sm:right-12 sm:top-24"
        aria-hidden="true"
      >
        <WaxSeal size={140} />
      </div>
      <div className="aragal-container relative z-10">
        <div className="mb-14 text-center">
          <span className="section-eyebrow">El Artista</span>
          <div className="flex items-center justify-center gap-3">
            <TitleFlourish flip />
            <h2 className="section-title">Biografía</h2>
            <TitleFlourish />
          </div>
        </div>

        <div className="grid items-start gap-10 md:grid-cols-[45%_55%] lg:gap-14">
          {/* Text column with stagger */}
          <div ref={paragraphsRef} className="space-y-5 text-[1.05rem] leading-relaxed text-muted-foreground">
            <p className="drop-cap" data-stagger="0">{bio.intro}</p>
            {bio.body1 && <p data-stagger="100">{bio.body1}</p>}
            {bio.body2 && <p data-stagger="200">{bio.body2}</p>}
            {bio.body3 && <p data-stagger="300">{bio.body3}</p>}
            {bio.body4 && <p data-stagger="400">{bio.body4}</p>}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="mt-10" data-stagger="500">
                <div className="relative grid grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: "var(--glass-border)" }}>
                  <div
                    className="absolute left-[16%] right-[16%] top-[3.05rem] h-px"
                    style={{
                      background: "linear-gradient(to right, transparent, var(--gold) 20%, var(--gold) 80%, transparent)",
                      opacity: 0.5,
                    }}
                    aria-hidden="true"
                  />
                  {timeline.map((item) => (
                    <div key={item.id} className="relative flex flex-col items-center text-center">
                      <span
                        className="mb-3 h-3 w-3 rounded-full ring-4"
                        style={{
                          background: "var(--gold)",
                          boxShadow: "0 0 12px color-mix(in srgb, var(--gold) 60%, transparent)",
                          ["--tw-ring-color" as string]: "color-mix(in srgb, var(--gold) 18%, transparent)",
                        }}
                      />
                      <span
                        className="text-xs font-bold sm:text-sm"
                        style={{
                          color: "var(--gold)",
                          fontFamily: "var(--font-display)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {item.year}
                      </span>
                      <span className="mt-1 text-[0.7rem] leading-snug text-muted-foreground sm:text-xs">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image column with parallax */}
          <div className="md:sticky md:top-24">
            <div
              ref={photoRef}
              className="gold-frame group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl"
              style={{ willChange: "transform" }}
            >
              <Image
                src={bio.imageUrl || "/assets/images/bio.jpg"}
                alt="Mario Aravena, compositor chileno de música cubana, en sesión de grabación con guitarra acústica"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 45%)" }}
              />
              <div
                className="absolute bottom-4 left-4 rounded-lg border px-3 py-1.5 backdrop-blur-md"
                style={{
                  borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
                  background: "rgba(10,10,10,0.55)",
                }}
              >
                <span
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--gold)" }}
                >
                  Mario Aravena · Sesión de grabación
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
