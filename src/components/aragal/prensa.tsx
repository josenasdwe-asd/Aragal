import { getPress } from "@/lib/data";
import { EPKDownload } from "./epk-download";

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  media: { label: "Prensa", icon: "📰", color: "var(--gold)" },
  platform: { label: "Plataforma", icon: "🎵", color: "var(--terracota)" },
  recognition: { label: "Reconocimiento", icon: "🏆", color: "var(--gold)" },
};

/**
 * Prensa / Reconocimientos — showcases press coverage, platform presence,
 * and career recognitions. Builds social proof for bookers, festivals, and
 * industry professionals.
 */
export async function Prensa() {
  const press = await getPress();
  if (press.length === 0) return null;

  // Group by type
  const grouped = press.reduce((acc, item) => {
    const type = item.type || "media";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof press>);

  const typeOrder = ["recognition", "media", "platform"];

  return (
    <section
      id="prensa"
      className="border-t py-20 sm:py-28"
      style={{ background: "var(--secondary)", borderColor: "var(--glass-border)" }}
    >
      <div className="aragal-container">
        <div className="mb-14 text-center">
          <span className="section-eyebrow">Validación</span>
          <h2 className="section-title">Prensa & Reconocimientos</h2>
        </div>

        {typeOrder.map((type) => {
          const items = grouped[type];
          if (!items || items.length === 0) return null;
          const config = TYPE_CONFIG[type] || TYPE_CONFIG.media;

          return (
            <div key={type} className="mb-12 last:mb-0">
              {/* Type label */}
              <div className="mb-6 flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <h3
                  className="text-sm font-semibold uppercase tracking-[0.2em]"
                  style={{ color: config.color }}
                >
                  {config.label}
                </h3>
                <div
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(to right, color-mix(in srgb, ${config.color} 30%, transparent), transparent)`,
                  }}
                />
              </div>

              {/* Items grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-xl border p-5 transition-all duration-300 hover:border-[var(--gold)] hover:shadow-lg"
                    style={{
                      borderColor: "var(--glass-border)",
                      background: "rgba(255,255,255,0.025)",
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-bold uppercase tracking-[0.15em]"
                        style={{ color: config.color }}
                      >
                        {item.source}
                      </span>
                      {item.date && (
                        <span className="text-[0.65rem] text-muted-foreground">
                          {item.date}
                        </span>
                      )}
                    </div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      {item.title}
                    </h4>
                    {item.quote && (
                      <p className="text-xs leading-relaxed text-muted-foreground italic">
                        «{item.quote}»
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-[0.7rem] font-medium uppercase tracking-[0.1em] transition-colors hover:underline"
                        style={{ color: config.color }}
                      >
                        Ver enlace →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* EPK download CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t pt-12" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-center text-sm text-muted-foreground max-w-md">
            ¿Eres booker, festival o productor? Descarga el dossier completo
            de ARAGAL con toda la información profesional.
          </p>
          <EPKDownload />
        </div>
      </div>
    </section>
  );
}
