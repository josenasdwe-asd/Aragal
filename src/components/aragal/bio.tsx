import Image from "next/image";
import { Reveal } from "./reveal";
import { TitleFlourish } from "./ornament";
import { WaxSeal } from "./lucero";
import { getBio, getTimeline } from "@/lib/data";

export async function Bio() {
  const [bio, timeline] = await Promise.all([getBio(), getTimeline()]);

  return (
    <section id="bio" className="staff-texture relative overflow-hidden py-20 sm:py-28">
      {/* Wax seal watermark — top right, very subtle */}
      <div
        className="pointer-events-none absolute right-4 top-20 opacity-[0.12] sm:right-12 sm:top-24"
        aria-hidden="true"
      >
        <WaxSeal size={140} />
      </div>
      <div className="aragal-container relative z-10">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-eyebrow">El Artista</span>
          <div className="flex items-center justify-center gap-3">
            <TitleFlourish flip />
            <h2 className="section-title">Biografía</h2>
            <TitleFlourish />
          </div>
        </Reveal>

        <div className="grid items-start gap-10 md:grid-cols-[45%_55%] lg:gap-14">
          {/* Text column */}
          <Reveal direction="left" className="space-y-5 text-[1.05rem] leading-relaxed text-muted-foreground">
            <p className="drop-cap">{bio.intro}
            </p>
            {bio.body1 && <p>{bio.body1}</p>}
            {bio.body2 && <p>{bio.body2}</p>}
            {bio.body3 && <p>{bio.body3}</p>}
            {bio.body4 && <p>{bio.body4}</p>}

            {/* Ornamental Timeline */}
            {timeline.length > 0 && (
              <div className="mt-10">
                <div className="relative grid grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: "var(--glass-border)" }}>
                  {/* horizontal gold connector */}
                  <div
                    className="absolute left-[16%] right-[16%] top-[3.05rem] h-px"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--gold) 20%, var(--gold) 80%, transparent)",
                      opacity: 0.5,
                    }}
                    aria-hidden="true"
                  />
                  {timeline.map((item) => (
                    <div key={item.id} className="relative flex flex-col items-center text-center">
                      {/* gold node */}
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
          </Reveal>

          {/* Image column — sticky on desktop so it accompanies the text scroll */}
          <Reveal direction="right" className="md:sticky md:top-24">
            <div className="gold-frame group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={bio.imageUrl || "/assets/images/bio.jpg"}
                alt="Mario Aravena, compositor chileno de música cubana, en sesión de grabación con guitarra acústica"
                fill
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.5), transparent 45%)",
                }}
              />
              {/* caption ribbon */}
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
