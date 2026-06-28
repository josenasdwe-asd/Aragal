/**
 * Client-safe shared constants for the ARAGAL site.
 *
 * These constants don't depend on any server-only code, so they can be
 * imported from both server and client components without leaking the
 * Supabase service role key.
 */

export const NAV_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#bio", label: "Biografía" },
  { href: "#musica", label: "Música" },
  { href: "#galeria", label: "Galería" },
  { href: "#noticias", label: "Noticias" },
  { href: "#contacto", label: "Contacto" },
] as const;

export type TrackGenre = "cubano" | "espiritual" | "salsa";

export const TRACK_GENRES: { value: TrackGenre; label: string }[] = [
  { value: "cubano", label: "Son Cubano" },
  { value: "espiritual", label: "Espiritual" },
  { value: "salsa", label: "Salsa" },
];
