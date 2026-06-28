"use client";

import { useMemo } from "react";

type Props = {
  name: string;
  className?: string;
};

/**
 * Elegant avatar with gold initials for collaborators who don't have a real
 * photo. The initials are derived from the name and rendered over an ornate
 * gold radial backdrop so the card still reads as premium and consistent
 * with the rest of the design system.
 */
export function ArtistAvatar({ name, className }: Props) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--gold) 22%, transparent), rgba(10,10,10,0.85) 70%)",
      }}
      aria-hidden="true"
    >
      {/* ornamental ring */}
      <div
        className="absolute inset-[18%] rounded-full border"
        style={{
          borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
          boxShadow:
            "inset 0 0 30px color-mix(in srgb, var(--gold) 15%, transparent)",
        }}
      />
      <div
        className="absolute inset-[28%] rounded-full border"
        style={{
          borderColor: "color-mix(in srgb, var(--gold) 18%, transparent)",
        }}
      />
      {/* corner flourishes */}
      <svg
        className="absolute left-2 top-2 h-4 w-4 opacity-40"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M1 1 L1 6 M1 1 L6 1" stroke="var(--gold)" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute right-2 top-2 -scale-x-100 h-4 w-4 opacity-40"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M1 1 L1 6 M1 1 L6 1" stroke="var(--gold)" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute bottom-2 left-2 -scale-y-100 h-4 w-4 opacity-40"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M1 1 L1 6 M1 1 L6 1" stroke="var(--gold)" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute bottom-2 right-2 -scale-100 h-4 w-4 opacity-40"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M1 1 L1 6 M1 1 L6 1" stroke="var(--gold)" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      {/* the initials */}
      <span
        className="relative z-10 font-bold"
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          background:
            "linear-gradient(135deg, var(--gold) 0%, #fcfaf0 50%, var(--gold-soft) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.05em",
          textShadow: "0 2px 16px color-mix(in srgb, var(--gold) 35%, transparent)",
        }}
      >
        {initials}
      </span>
    </div>
  );
}
