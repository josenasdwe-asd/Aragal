"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Collaboration } from "@/lib/data";
import { ArtistAvatar } from "./artist-avatar";

type Props = {
  items: Collaboration[];
};

/**
 * Collaborations — editorial index layout.
 *
 * A vertical list of artists rendered as elegant rows (like a table of
 * contents in an art catalogue). Each row shows: a large ordinal number,
 * the artist name + role + subtitle, and a short impact line. Hovering or
 * tapping a row reveals the works as discrete gold-traced pills.
 *
 * Minimalist, novel, and distinct from the usual card grid.
 */
export function CollaborationsClient({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="colaboraciones"
      className="border-t py-20 sm:py-28"
      style={{
        background: "var(--secondary)",
        borderColor: "var(--glass-border)",
      }}
    >
      <div className="aragal-container">
        <div className="mb-14 text-center">
          <span className="section-eyebrow">Trayectoria compartida</span>
          <h2 className="section-title">Colaboraciones</h2>
        </div>

        {/* Editorial index list */}
        <div className="mx-auto max-w-4xl">
          {items.map((c, i) => {
            const open = openIndex === i;
            const ordinal = String(i + 1).padStart(2, "0");
            return (
              <article
                key={c.id}
                className="group border-b transition-colors duration-300 last:border-b-0"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="focus-gold flex w-full items-baseline gap-6 py-7 text-left transition-all duration-300 hover:pl-3 sm:gap-8 sm:py-8"
                >
                  {/* Ordinal number — large, gold, display font */}
                  <span
                    className="select-none font-display text-3xl font-bold leading-none transition-colors duration-300 sm:text-4xl"
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      color: open ? "var(--gold)" : "color-mix(in srgb, var(--gold) 45%, transparent)",
                      minWidth: "2.2em",
                    }}
                  >
                    {ordinal}
                  </span>

                  {/* Artist thumbnail — circular, 56px */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 sm:h-24 sm:w-24" style={{ borderColor: open ? "var(--gold)" : "color-mix(in srgb, var(--gold) 30%, transparent)" }}>
                    {c.imageUrl ? (
                      <Image
                        src={c.imageUrl}
                        alt={`Foto de ${c.name}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <ArtistAvatar name={c.name} />
                    )}
                  </div>

                  {/* Name + role + subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3
                        className={cn(
                          "text-xl font-bold transition-colors duration-300 sm:text-2xl",
                          open ? "text-foreground" : "text-foreground/90"
                        )}
                      >
                        {c.name}
                      </h3>
                      <span
                        className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: "var(--gold)" }}
                      >
                        {c.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.subtitle}
                    </p>
                  </div>

                  {/* Indicator — a thin gold mark that rotates on open */}
                  <span
                    aria-hidden="true"
                    className="ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center transition-transform duration-500"
                    style={{
                      transform: open ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <span
                      className="block h-3 w-px"
                      style={{ background: "var(--gold)" }}
                    />
                    <span
                      className="block h-px w-3 -translate-x-1/2 -translate-y-1/2"
                      style={{ background: "var(--gold)" }}
                    />
                  </span>
                </button>

                {/* Expandable detail */}
                <div
                  className="grid transition-all duration-500 ease-out"
                  style={{
                    gridTemplateRows: open ? "1fr" : "0fr",
                    opacity: open ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-7 pl-[3.4em] sm:pl-[3.8em]">
                      {c.impact && (
                        <p className="mb-4 max-w-2xl border-l-2 pl-4 text-sm leading-relaxed text-muted-foreground"
                          style={{ borderColor: "var(--gold)" }}
                        >
                          {c.impact}
                        </p>
                      )}
                      {c.works.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {c.works.map((w) => (
                            <span
                              key={w}
                              className="rounded-full border px-3 py-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
                              style={{
                                borderColor: "color-mix(in srgb, var(--gold) 25%, transparent)",
                              }}
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
