import { Reveal } from "./reveal";
import { TitleFlourish } from "./ornament";

const HIGHLIGHTS = [
  {
    icon: "🇨🇺",
    title: "Conexión Cuba",
    text: "Colaboración directa con Jesús «Aguaje» Ramos, Director del Orquesta Buena Vista Social Club.",
    spin: false,
  },
  {
    icon: "🌎",
    title: "Proyección Global",
    text: "Expansión de su catálogo en mercados de Miami, Orlando y Centroamérica desde 2021.",
    spin: true,
  },
  {
    icon: "📜",
    title: "Legado SCD",
    text: "Más de 24 años como miembro activo de la Sociedad Chilena del Derecho de Autor.",
    spin: false,
  },
] as const;

export function Highlights() {
  return (
    <section
      className="border-y py-20 sm:py-28"
      style={{
        background:
          "linear-gradient(to right, var(--background), var(--secondary))",
        borderColor: "var(--glass-border)",
      }}
    >
      <div className="aragal-container">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-eyebrow">Alcance Internacional</span>
          <div className="flex items-center justify-center gap-3">
            <TitleFlourish flip />
            <h2 className="section-title">Hitos Internacionales</h2>
            <TitleFlourish />
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal key={h.title} direction="up" delay={i * 0.12}>
              <div
                className="h-full rounded-2xl border p-8 transition-all duration-300 hover:border-[var(--glass-border)]"
                style={{
                  borderColor: "transparent",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <div
                  className="mb-5 text-4xl"
                  style={
                    h.spin
                      ? { animation: "globe-spin 12s linear infinite", display: "inline-block" }
                      : undefined
                  }
                >
                  {h.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--gold)" }}>
                  {h.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {h.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
