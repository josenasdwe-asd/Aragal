import { QuillLogo } from "./quill-logo";
import { NAV_LINKS } from "@/lib/site";
import { Newsletter } from "./newsletter";

export async function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-auto border-t"
      style={{
        borderColor: "var(--glass-border)",
        background:
          "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--gold) 4%, transparent))",
      }}
    >
      <div className="aragal-container py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <QuillLogo className="h-10" />
            <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground md:text-left">
              Compositor chileno que une son cubano, barrio y música espiritual.
            </p>
          </div>

          {/* Nav */}
          <nav aria-label="Enlaces de pie de página">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="focus-gold text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="flex gap-3">
            {[
              { href: "https://open.spotify.com/intl-es/artist/4bugRe9qz3z8As6rKmMc7r", label: "Spotify", icon: "🎧" },
              { href: "https://www.instagram.com/mario.aravena.oficial/", label: "Instagram", icon: "📸" },
              { href: "https://www.youtube.com/@ARAGAL-MarioAravena", label: "YouTube", icon: "▶" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="focus-gold flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-all duration-300 hover:scale-110"
                style={{
                  borderColor: "var(--glass-border)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-10 flex justify-center border-t pt-8" style={{ borderColor: "var(--glass-border)" }}>
          <Newsletter />
        </div>

        {/* Manifesto closing line — emotional signature */}
        <p
          className="mt-10 text-center italic"
          style={{
            fontFamily: "var(--font-display), serif",
            fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)",
            lineHeight: 1.4,
            color: "var(--foreground)",
            opacity: 0.85,
            maxWidth: "42rem",
            marginInline: "auto",
          }}
        >
          «Compongo para que las personas se reconozcan en las historias que cantan.»
        </p>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {year} ARAGAL — Mario Aravena. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Diseñado para la excelencia artística.
          </p>
        </div>
      </div>
    </footer>
  );
}
