"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { QuillLogo } from "./quill-logo";
import { NAV_LINKS } from "@/lib/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

const SECTION_IDS = NAV_LINKS.map((l) => l.href.replace("#", ""));

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Triple-click on the logo opens the hidden admin panel.
  // Counts clicks on the logo anchor within a 700ms window. A single click
  // still navigates normally (we only intercept when count reaches 3).
  useEffect(() => {
    let count = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      // Only count clicks that land on the logo area (the anchor or its SVG)
      const logoAnchor = target.closest("nav a[aria-label='Ir al inicio']");
      if (!logoAnchor) return;
      count += 1;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        count = 0;
      }, 700);
      if (count >= 3) {
        e.preventDefault();
        e.stopPropagation();
        count = 0;
        window.dispatchEvent(new CustomEvent("aragal:open-admin"));
      }
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  return (
    <nav
      className={cn(
        "fixed left-1/2 top-4 z-50 flex h-16 w-[92%] max-w-6xl -translate-x-1/2 items-center justify-between rounded-2xl px-4 transition-all duration-500 sm:px-6",
        scrolled
          ? "border border-transparent backdrop-blur-sm"
          : "border border-transparent"
      )}
      aria-label="Navegación principal"
    >
      <a
        href="#inicio"
        className="focus-gold flex items-center"
        aria-label="Ir al inicio"
      >
        <QuillLogo className="h-12" />
      </a>

      {/* Desktop links */}
      <div className="hidden items-center gap-7 md:flex">
        {NAV_LINKS.map((link) => {
          const id = link.href.replace("#", "");
          const isActive = active === id;
          return (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "focus-gold relative py-1 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              <span
                className="absolute -bottom-0.5 left-0 h-[2px] transition-all duration-300"
                style={{
                  width: isActive ? "100%" : "0%",
                  background: "var(--gold)",
                }}
              />
            </a>
          );
        })}
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        className="focus-gold flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5" style={{ color: "var(--gold)" }} />
        ) : (
          <Menu className="h-5 w-5" style={{ color: "var(--gold)" }} />
        )}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="glass absolute left-0 right-0 top-[110%] rounded-2xl p-4 md:hidden"
          style={{ animation: "fadeIn 0.25s ease-out" }}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = active === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "focus-gold rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors",
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] text-foreground"
                      : "text-muted-foreground hover:bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] hover:text-foreground"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
