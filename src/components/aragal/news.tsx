import { ExternalLink, Newspaper } from "lucide-react";
import { Reveal } from "./reveal";
import { TitleFlourish } from "./ornament";
import { getNews } from "@/lib/data";

export async function News() {
  const news = await getNews();

  return (
    <section
      id="noticias"
      className="border-t py-20 sm:py-28"
      style={{ borderColor: "var(--glass-border)" }}
    >
      <div className="aragal-container">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-eyebrow">Actualidad</span>
          <div className="flex items-center justify-center gap-3">
            <TitleFlourish flip />
            <h2 className="section-title">Últimas Noticias</h2>
            <TitleFlourish />
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {news.map((n, i) => (
            <Reveal key={n.id} direction="up" delay={(i % 2) * 0.1}>
              <article
                className="card-elevated group flex h-full items-start gap-4 rounded-2xl border p-6 hover:border-[var(--gold)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                style={{
                  borderColor: "var(--glass-border)",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--gold) 15%, transparent)",
                    color: "var(--gold)",
                  }}
                >
                  <Newspaper className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {n.date}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {n.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {n.description}
                  </p>
                  {n.url && (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-gold mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors"
                      style={{ color: "var(--gold)" }}
                    >
                      {n.urlLabel ?? "Ver más"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
