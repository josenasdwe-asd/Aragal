"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — an elegant gold dot + trailing ring that follows the mouse.
 * Desktop only (hidden on touch devices). Respects prefers-reduced-motion.
 *
 * The dot is small (6px) and tracks the mouse instantly.
 * The ring (32px) lags slightly behind for a sophisticated feel.
 * On hover over interactive elements (a, button), the ring grows.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    // Skip if reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;

      // Check if hovering an interactive element
      const target = e.target as Element;
      const interactive = target.closest("a, button, input, textarea, select, [role='button']");
      hovering = !!interactive;
    };

    const render = () => {
      // Ring lags behind with easing
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      const size = hovering ? 48 : 28;
      ring.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px)`;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.opacity = hovering ? "0.9" : "0.5";
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full"
        style={{
          background: "var(--gold)",
          boxShadow: "0 0 8px var(--gold)",
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border"
        style={{
          borderColor: "var(--gold)",
          willChange: "transform, width, height, opacity",
          transition: "border-color 0.2s ease",
        }}
      />
    </>
  );
}
