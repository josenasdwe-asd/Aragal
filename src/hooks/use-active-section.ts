"use client";

import { useEffect, useState } from "react";

/** Tracks which section is currently in view to highlight the active nav link. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visible = new Map<string, number>();

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              visible.set(id, entry.intersectionRatio);
            } else {
              visible.delete(id);
            }
          }
          // pick the most-visible section
          let best = active;
          let bestRatio = 0;
          visible.forEach((ratio, key) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = key;
            }
          });
          if (bestRatio > 0) setActive(best);
        },
        {
          rootMargin: "-45% 0px -50% 0px",
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids.join(",")]);

  return active;
}
