"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient floating gold particles canvas — pure decorative, respects
 * prefers-reduced-motion (renders nothing if reduced motion is preferred).
 */
export function ParticlesCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf = 0;
    let visible = true;

    // Pause the animation when the canvas is not visible (saves CPU/GPU
    // when the user has scrolled past the hero).
    const visObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && !raf) {
          raf = requestAnimationFrame(render);
        } else if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    visObserver.observe(canvas);

    const COUNT = Math.min(60, Math.floor(width / 28));
    type P = {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      a: number;
      tw: number;
    };
    const parts: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.25 + 0.05,
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.5 + 0.1,
      tw: Math.random() * 0.02 + 0.005,
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const gold = () => {
      const m = getComputedStyle(document.documentElement)
        .getPropertyValue("--gold")
        .trim();
      return m || "#d4af37";
    };

    const render = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const g = gold();
      for (const p of parts) {
        p.y -= p.vy;
        p.x += p.vx;
        p.a += p.tw;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        const alpha = 0.15 + Math.abs(Math.sin(p.a)) * 0.45;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = g;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      visObserver.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 h-full w-full ${className ?? ""}`}
    />
  );
}
