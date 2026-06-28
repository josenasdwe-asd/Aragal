import { Reveal } from "./reveal";
import { getStats } from "@/lib/data";

export async function Stats() {
  const stats = await getStats();

  return (
    <section
      className="border-y"
      style={{
        background: "var(--secondary)",
        borderColor: "var(--glass-border)",
      }}
    >
      <div className="aragal-container flex flex-wrap items-stretch justify-center gap-0 py-10 sm:py-12">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.id}
            delay={i * 0.1}
            direction="up"
            className="relative flex min-w-[120px] flex-1 flex-col items-center justify-center px-6 sm:px-10"
          >
            <span
              className="block leading-none"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontWeight: 500,
                fontStyle: "italic",
                color: "var(--gold)",
                letterSpacing: "0.02em",
                opacity: 0.92,
              }}
            >
              {stat.number}
            </span>
            <span
              className="mt-2.5 block text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground"
              style={{ letterSpacing: "0.28em" }}
            >
              {stat.label}
            </span>
            {/* Subtle gold divider between stats (not after the last) */}
            {i < stats.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute right-0 top-1/2 hidden h-10 w-px -translate-y-1/2 sm:block"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--gold) 30%, transparent), transparent)",
                }}
              />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
