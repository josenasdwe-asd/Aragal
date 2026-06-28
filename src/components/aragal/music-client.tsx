"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACK_GENRES, type TrackGenre } from "@/lib/site";
import type { Track } from "@/lib/data";

type Filter = "all" | Track["genre"];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todo" },
  ...TRACK_GENRES.map((g) => ({ value: g.value, label: g.label })),
];

type Props = {
  tracks: Track[];
};

export function MusicClient({ tracks }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? tracks : tracks.filter((t) => t.genre === filter),
    [filter, tracks]
  );

  return (
    <section
      id="musica"
      className="border-t py-20 sm:py-28"
      style={{ background: "var(--secondary)", borderColor: "var(--glass-border)" }}
    >
      <div className="aragal-container">
        {/* Title and filters are static (no Reveal) — see Task 9 worklog:
            scroll-triggered animations cause iframe reflow flicker. */}
        <div className="mb-10 text-center">
          <span className="section-eyebrow">Discografía</span>
          <h2 className="section-title">Música</h2>
        </div>

        {/* Filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "focus-gold rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.1em] transition-all duration-200",
                filter === f.value
                  ? "text-[#0a0a0a]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{
                background:
                  filter === f.value ? "var(--gold)" : "transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Minimalist track list — ordinal numbers + fine gold dividers.
            No scroll-triggered animation to avoid iframe reflow flicker. */}
        <div className="mx-auto flex max-w-3xl flex-col">
          {filtered.map((track, i) => (
            <article
              key={track.id}
              className="flex flex-col gap-3 py-7"
              style={{
                borderTop:
                  i === 0
                    ? "none"
                    : "1px solid color-mix(in srgb, var(--gold) 18%, transparent)",
              }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display text-2xl font-semibold leading-none sm:text-3xl"
                    style={{
                      fontFamily: "var(--font-display), serif",
                      color: "color-mix(in srgb, var(--gold) 50%, transparent)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                    {track.title}
                  </h3>
                </div>
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {track.category}
                </span>
              </div>
              {track.badge && (
                <span
                  className="ml-9 text-[0.6rem] font-bold uppercase tracking-[0.15em]"
                  style={{ color: "var(--gold)", marginTop: "-0.5rem" }}
                >
                  {track.badge}
                </span>
              )}
              <iframe
                src={track.spotifyUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Reproductor de Spotify — ${track.title}`}
                className="w-full overflow-hidden rounded-lg"
                style={{ background: "#181818", colorScheme: "dark" }}
              />
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://open.spotify.com/intl-es/artist/4bugRe9qz3z8As6rKmMc7r"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-gold inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver todo en Spotify
          </a>
        </div>
      </div>
    </section>
  );
}
