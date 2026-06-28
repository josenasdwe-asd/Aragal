"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";
import { TitleFlourish } from "./ornament";
import type { GalleryItem } from "@/lib/data";

type Props = {
  items: GalleryItem[];
};

export function GalleryClient({ items }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

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

  return (
    <section id="galeria" className="py-20 sm:py-28">
      <div className="aragal-container">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-eyebrow">Momentos</span>
          <div className="flex items-center justify-center gap-3">
            <TitleFlourish flip />
            <h2 className="section-title">Galería de Colaboraciones</h2>
            <TitleFlourish />
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.id} direction="scale" delay={(i % 4) * 0.08}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Abrir imagen: ${item.caption}`}
                className="focus-gold group relative block aspect-[3/4] w-full overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div
                  className="absolute inset-0 flex items-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)",
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
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
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
            onClick={(e) => {
              e.stopPropagation();
              next(-1);
            }}
            className="focus-gold absolute left-4 flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={(e) => {
              e.stopPropagation();
              next(1);
            }}
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
