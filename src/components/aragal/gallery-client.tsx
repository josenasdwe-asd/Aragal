"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/data";

type Props = {
  items: GalleryItem[];
};

/**
 * Gallery — horizontal editorial carousel.
 *
 * Images scroll horizontally with snap-mandatory. Navigation via:
 *   - Horizontal scroll (trackpad/mouse)
 *   - Arrow buttons (desktop)
 *   - Swipe (mobile)
 *   - Keyboard arrows (when section is in view)
 *
 * Clicking an image opens the lightbox (preserved from the previous version).
 */
export function GalleryClient({ items }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setIndex(null);
    setZoomed(false);
  }, []);

  const next = useCallback(
    (dir: number) => {
      setIndex((cur) => {
        if (cur === null) return cur;
        const n = items.length;
        return (cur + dir + n) % n;
      });
      setZoomed(false);
    },
    [items.length]
  );

  const scrollBy = useCallback((dir: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth * 0.6;
    container.scrollBy({ left: dir * slideWidth, behavior: "smooth" });
  }, []);

  const onScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth * 0.4;
    const idx = Math.round(container.scrollLeft / slideWidth);
    setActiveIndex(Math.max(0, Math.min(idx, items.length - 1)));
  }, [items.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next(1);
      if (e.key === "ArrowLeft") next(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, next]);

  if (items.length === 0) return null;

  return (
    <section id="galeria" className="relative overflow-hidden py-20 sm:py-28">
      <div className="aragal-container">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">Momentos</span>
          <h2 className="section-title">Galería</h2>
        </div>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="relative">
        {/* Left arrow (desktop) */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          className="focus-gold absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-110 md:flex"
          style={{
            borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
            background: "rgba(10,10,10,0.5)",
            color: "var(--gold)",
          }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[5vw] pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="group relative flex-shrink-0 snap-center"
              style={{ width: "clamp(260px, 40vw, 420px)" }}
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Abrir imagen: ${item.caption}`}
                className="focus-gold relative block aspect-[3/4] w-full overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 40vw, 420px"
                />
                <div
                  className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9), transparent 60%)",
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {item.caption}
                    </span>
                    <ZoomIn className="h-4 w-4 text-white/80" />
                  </div>
                </div>
              </button>
              {/* Caption below image */}
              <p
                className="mt-2 text-center text-[0.7rem] uppercase tracking-[0.2em]"
                style={{ color: "var(--gold)", opacity: 0.6 }}
              >
                {item.caption}
              </p>
            </div>
          ))}

          {/* End spacer */}
          <div className="flex-shrink-0" style={{ width: "5vw" }} />
        </div>

        {/* Right arrow (desktop) */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Siguiente"
          className="focus-gold absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-110 md:flex"
          style={{
            borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
            background: "rgba(10,10,10,0.5)",
            color: "var(--gold)",
          }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              const container = scrollRef.current;
              if (!container) return;
              const slideWidth = container.clientWidth * 0.4;
              container.scrollTo({ left: i * slideWidth, behavior: "smooth" });
            }}
            aria-label={`Ir a imagen ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? "28px" : "8px",
              background:
                i === activeIndex
                  ? "var(--gold)"
                  : "color-mix(in srgb, var(--gold) 25%, transparent)",
            }}
          />
        ))}
      </div>

      {/* Lightbox (preserved) */}
      {index !== null && items[index] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imágenes"
          onClick={close}
          style={{ animation: "fadeIn 0.25s ease-out" }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            className="focus-gold absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white/80 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={(e) => { e.stopPropagation(); next(-1); }}
            className="focus-gold absolute left-4 flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={(e) => { e.stopPropagation(); next(1); }}
            className="focus-gold absolute right-4 flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <figure
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={items[index].src}
              alt={items[index].alt}
              width={900}
              height={1200}
              className={cn(
                "max-h-[80vh] w-auto rounded-lg border-2 object-contain transition-transform duration-300",
                zoomed && "scale-125 cursor-zoom-out"
              )}
              style={{ borderColor: "var(--gold)" }}
              onClick={() => setZoomed((z) => !z)}
            />
            <figcaption className="mt-4 text-center">
              <p className="text-lg font-semibold text-white">
                {items[index].caption}
              </p>
              <p className="mt-1 text-xs text-white/60">
                {index + 1} / {items.length} · Click para {zoomed ? "alejar" : "acercar"}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
