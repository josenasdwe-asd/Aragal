"use client";

import { useEffect, useState } from "react";

/**
 * PremiumLoader — an elegant loading screen with the ARAGAL wordmark and a
 * gold ink drop animation. Shows on first load, fades out when the page is
 * ready.
 *
 * SSR-safe: always renders the same HTML on server and client. The
 * prefers-reduced-motion handling is done purely in CSS (globals.css) so
 * there's no conditional rendering that could cause a hydration mismatch.
 */
export function PremiumLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Use a fixed delay (no window.matchMedia check here — that would cause
    // a hydration mismatch because the server doesn't have window).
    // Reduced-motion users still see the loader, just without the drop
    // animation (handled by CSS @media prefers-reduced-motion).
    const fadeTimer = setTimeout(() => setFading(true), 1400);
    const hideTimer = setTimeout(() => setVisible(false), 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black transition-opacity duration-600"
      style={{ opacity: fading ? 0 : 1 }}
      aria-hidden="true"
    >
      {/* ARAGAL wordmark with gold gradient */}
      <h1
        className="font-display gold-text"
        style={{
          fontFamily: "var(--font-display), serif",
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          animation: "loader-fade-in 0.8s ease-out",
        }}
      >
        ARAGAL
      </h1>

      {/* Ink drop animation — always rendered. CSS hides it for
          prefers-reduced-motion users via the @media rule in globals.css. */}
      <div className="mt-6 flex items-center gap-1.5 loader-drops">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: "6px",
              height: "6px",
              background: "var(--gold)",
              boxShadow: "0 0 6px var(--gold)",
              animation: `loader-drop 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
