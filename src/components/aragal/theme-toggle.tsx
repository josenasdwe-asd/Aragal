"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      onClick={() => {
        // Read the current theme from the DOM at click time so the render
        // itself never depends on the (SSR-undefined) resolved theme.
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "light" : "dark");
      }}
      className="focus-gold fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-110"
      style={{
        borderColor: "var(--gold)",
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
      }}
    >
      <span
        className="absolute inset-0 rounded-full dark:block hidden"
        style={{
          boxShadow: "0 0 0 0 color-mix(in srgb, var(--gold) 50%, transparent)",
          animation: "pulse-ring 2.5s ease-out infinite",
        }}
      />
      {/* Both icons rendered; CSS toggles based on .dark so there is no
          hydration flash and no dependency on resolvedTheme during render. */}
      <Sun
        className="hidden h-5 w-5 dark:block"
        style={{ color: "var(--gold)" }}
        strokeWidth={1.8}
      />
      <Moon
        className="block h-5 w-5 dark:hidden"
        style={{ color: "var(--gold)" }}
        strokeWidth={1.8}
      />
    </button>
  );
}
