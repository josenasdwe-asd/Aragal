"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  withWordmark?: boolean;
  animated?: boolean;
};

/**
 * The ARAGAL quill logo — faithful port of the original Vite SVG.
 *
 * The drip lives INSIDE the rotated <g> so it falls along the quill's angle
 * (a diagonal drip, not a vertical one) — that diagonal motion is the
 * elegant detail from the original. Animation is driven by requestAnimationFrame
 * writing SMIL-equivalent attributes directly (cy / r / opacity) because SMIL
 * <animate> children are not reliably activated by React hydration in Chromium.
 *
 * Original cycle (preserved): 3s, cy 48→70, opacity 0→1→1→0, r 1.5→2→1.
 */
export function QuillLogo({
  className,
  withWordmark = true,
  animated = true,
}: Props) {
  const dropRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!animated) return;
    const drop = dropRef.current;
    if (!drop) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      // Static pose: a hanging drop midway.
      drop.setAttribute("cy", "58");
      drop.setAttribute("r", "1.8");
      drop.style.opacity = "1";
      return;
    }

    // Drip cycle — faithful to the original Vite character (single drop,
    // diagonal fall along the quill's angle, appear/fade) but with a larger
    // drop and longer fall so the motion clearly reads as dripping at small
    // nav sizes.
    const CYCLE = 2800;
    const CY_START = 48;
    const CY_END = 78;

    const opacityAt = (p: number) => {
      // 0→0.08 ramp 0→1 (appear at tip), 0.08→0.72 hold 1, 0.72→1 ramp 1→0 (fade mid-fall)
      if (p < 0.08) return p / 0.08;
      if (p < 0.72) return 1;
      return 1 - (p - 0.72) / 0.28;
    };
    const radiusAt = (p: number) => {
      // 0→0.35: 3→4 (swell), 0.35→1: 4→2 (shrink as it falls)
      if (p < 0.35) return 3 + (4 - 3) * (p / 0.35);
      return 4 + (2 - 4) * ((p - 0.35) / 0.65);
    };

    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = (now - start) % CYCLE;
      const p = elapsed / CYCLE;
      const cy = CY_START + (CY_END - CY_START) * p;
      const r = radiusAt(p);
      const op = opacityAt(p);
      drop.setAttribute("cy", cy.toFixed(2));
      drop.setAttribute("r", r.toFixed(2));
      drop.style.opacity = op.toFixed(3);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  return (
    <svg
      className={cn("h-12 w-auto select-none", className)}
      viewBox="0 0 280 80"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ARAGAL"
    >
      <defs>
        <linearGradient id="gold-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#fcfaf0" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <filter id="drop-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="0.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Elegant Writing Quill — identical geometry to the original Vite SVG.
          The drip is INSIDE this rotated group so it falls along the angle. */}
      <g transform="translate(15, 15) rotate(-15)">
        {/* Spine */}
        <path
          d="M15,45 Q25,10 50,5"
          fill="none"
          stroke="url(#gold-brand)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Feathering (Detailed Layering) */}
        <path d="M16,42 Q38,38 52,5 Q40,12 28,38 Z" fill="url(#gold-brand)" opacity="1" />
        <path d="M20,38 Q38,32 46,12 Q34,18 24,32 Z" fill="url(#gold-brand)" opacity="0.7" />
        {/* Texture lines */}
        <path
          d="M18,35 Q30,32 35,25"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.3"
          fill="none"
        />
        {/* Ink Tip */}
        <path
          d="M14,48 L16,42"
          stroke="url(#gold-brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Animated Ink Drip — driven by RAF via ref. Single drop that appears
            at the tip, swells, falls diagonally along the quill's angle, and
            fades. Larger than the original so the motion reads clearly at nav
            size. */}
        <circle
          ref={dropRef}
          cx="14"
          cy="48"
          r="3"
          fill="url(#gold-brand)"
          filter="url(#drop-glow)"
          style={{ opacity: 0 }}
        />
      </g>

      {withWordmark && (
        <text
          x="80"
          y="48"
          fontFamily="'Syncopate', sans-serif"
          fontSize="28"
          fontWeight="700"
          fill="url(#gold-brand)"
          letterSpacing="2"
        >
          ARAGAL
        </text>
      )}
    </svg>
  );
}
