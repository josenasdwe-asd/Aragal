"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/admin-panel";

/**
 * AdminPanelLazy — a tiny always-mounted wrapper that only renders the real
 * AdminPanel after the triple-click gesture fires (or if a token is already
 * in localStorage).
 *
 * The AdminPanel import is static (not dynamic/lazy) to avoid the
 * "Ecmascript file had an error" issue that next/dynamic and React.lazy
 * cause in Next.js 16 when used in a module imported by a server component.
 * The AdminPanel itself is lightweight enough (it dynamically imports
 * EntityEditor and ImagePicker only when an entity is selected) that the
 * initial bundle impact is minimal.
 */
export function AdminPanelLazy() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const handler = () => setShouldLoad(true);
    window.addEventListener("aragal:open-admin", handler);
    return () => window.removeEventListener("aragal:open-admin", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raf = requestAnimationFrame(() => {
      const token = window.localStorage.getItem("aragal_admin_token");
      if (token) setShouldLoad(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!shouldLoad) return null;
  return <AdminPanel />;
}
