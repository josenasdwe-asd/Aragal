import "server-only";
import { supabaseAdmin } from "@/lib/supabase";
import type { TrackGenre } from "@/lib/site";

// Re-export client-safe constants so existing imports keep working.
export { NAV_LINKS, TRACK_GENRES } from "@/lib/site";
export type { TrackGenre } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Types — match the Supabase table schemas (camelCased for TS use).   */
/* ------------------------------------------------------------------ */

export type Bio = {
  id: number;
  intro: string;
  body1: string;
  body2: string;
  body3: string;
  body4: string;
  /** Manifesto lines separated by "\n". */
  manifesto: string;
  quote: string;
  imageUrl: string;
  updatedAt: string;
};

export type Stat = {
  id: number;
  number: string;
  label: string;
  sortOrder: number;
};

export type TimelineItem = {
  id: number;
  year: string;
  text: string;
  sortOrder: number;
};

export type Track = {
  id: string;
  title: string;
  category: string;
  genre: TrackGenre;
  badge: string | null;
  coverUrl: string;
  spotifyUrl: string;
};

export type Collaboration = {
  id: number;
  role: string;
  name: string;
  subtitle: string;
  imageUrl: string | null;
  works: string[];
  impact: string;
  sortOrder: number;
};

export type GalleryItem = {
  id: number;
  src: string;
  caption: string;
  alt: string;
  sortOrder: number;
};

export type NewsItem = {
  id: number;
  date: string;
  title: string;
  description: string;
  url: string | null;
  urlLabel: string | null;
  sortOrder: number;
};

export type Video = {
  id: number;
  title: string;
  youtubeId: string;
  sortOrder: number;
};

export type Press = {
  id: number;
  type: string;
  source: string;
  title: string;
  quote: string | null;
  url: string | null;
  date: string;
  sortOrder: number;
};

/* ------------------------------------------------------------------ */
/* Empty-state fallbacks (used when Supabase returns nothing, e.g.    */
/* during a fresh DB or a transient error).                            */
/* ------------------------------------------------------------------ */

const VALID_GENRES: TrackGenre[] = ["cubano", "espiritual", "salsa"];
function isValidGenre(v: unknown): v is TrackGenre {
  return typeof v === "string" && (VALID_GENRES as string[]).includes(v);
}

const EMPTY_BIO: Bio = {
  id: 1,
  intro: "",
  body1: "",
  body2: "",
  body3: "",
  body4: "",
  manifesto: "",
  quote: "",
  imageUrl: "/assets/images/bio.jpg",
  updatedAt: "",
};

/* ------------------------------------------------------------------ */
/* Fetch functions — server-only, use supabaseAdmin (bypasses RLS).    */
/* ------------------------------------------------------------------ */

export async function getBio(): Promise<Bio> {
  const { data, error } = await supabaseAdmin
    .from("bio")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    console.warn("[data] getBio error:", error?.message ?? "no row");
    return EMPTY_BIO;
  }

  return {
    id: data.id,
    intro: data.intro ?? "",
    body1: data.body1 ?? "",
    body2: data.body2 ?? "",
    body3: data.body3 ?? "",
    body4: data.body4 ?? "",
    manifesto: data.manifesto ?? "",
    quote: data.quote ?? "",
    imageUrl: data.image_url ?? "/assets/images/bio.jpg",
    updatedAt: data.updated_at ?? "",
  };
}

export async function getStats(): Promise<Stat[]> {
  const { data, error } = await supabaseAdmin
    .from("stats")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getStats error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: StatsRow) => ({
    id: d.id,
    number: d.number ?? "",
    label: d.label ?? "",
    sortOrder: d.sort_order ?? 0,
  }));
}

export async function getTimeline(): Promise<TimelineItem[]> {
  const { data, error } = await supabaseAdmin
    .from("timeline")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getTimeline error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: TimelineRow) => ({
    id: d.id,
    year: d.year ?? "",
    text: d.text ?? "",
    sortOrder: d.sort_order ?? 0,
  }));
}

export async function getTracks(): Promise<Track[]> {
  // Tracks have no sort_order in the schema — order by title for a stable
  // ordering. (If the user wants a custom order later we can add a column.)
  const { data, error } = await supabaseAdmin
    .from("tracks")
    .select("*")
    .order("title", { ascending: true });

  if (error || !data) {
    console.warn("[data] getTracks error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: TrackRow) => ({
    id: d.id,
    title: d.title ?? "",
    category: d.category ?? "",
    genre: (isValidGenre(d.genre) ? d.genre : "cubano") as TrackGenre,
    badge: d.badge ?? null,
    coverUrl: d.cover_url ?? "",
    spotifyUrl: d.spotify_url ?? "",
  }));
}

export async function getCollaborations(): Promise<Collaboration[]> {
  const { data, error } = await supabaseAdmin
    .from("collaborations")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getCollaborations error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: CollabRow) => ({
    id: d.id,
    role: d.role ?? "",
    name: d.name ?? "",
    subtitle: d.subtitle ?? "",
    imageUrl: d.image_url ?? null,
    works: Array.isArray(d.works) ? d.works : [],
    impact: d.impact ?? "",
    sortOrder: d.sort_order ?? 0,
  }));
}

export async function getGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabaseAdmin
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getGallery error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: GalleryRow) => ({
    id: d.id,
    src: d.src ?? "",
    caption: d.caption ?? "",
    alt: d.alt ?? "",
    sortOrder: d.sort_order ?? 0,
  }));
}

export async function getNews(): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .from("news")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getNews error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: NewsRow) => ({
    id: d.id,
    date: d.date ?? "",
    title: d.title ?? "",
    description: d.description ?? "",
    url: d.url ?? null,
    urlLabel: d.url_label ?? null,
    sortOrder: d.sort_order ?? 0,
  }));
}

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabaseAdmin
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getVideos error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: VideoRow) => ({
    id: d.id,
    title: d.title ?? "",
    youtubeId: d.youtube_id ?? "",
    sortOrder: d.sort_order ?? 0,
  }));
}

export async function getPress(): Promise<Press[]> {
  const { data, error } = await supabaseAdmin
    .from("press")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[data] getPress error:", error?.message ?? "no data");
    return [];
  }

  return data.map((d: PressRow) => ({
    id: d.id,
    type: d.type ?? "media",
    source: d.source ?? "",
    title: d.title ?? "",
    quote: d.quote ?? null,
    url: d.url ?? null,
    date: d.date ?? "",
    sortOrder: d.sort_order ?? 0,
  }));
}

/* ------------------------------------------------------------------ */
/* Row shapes from Supabase (snake_case, as returned by the client).   */
/* ------------------------------------------------------------------ */

type StatsRow = {
  id: number;
  number: string | null;
  label: string | null;
  sort_order: number | null;
};

type TimelineRow = {
  id: number;
  year: string | null;
  text: string | null;
  sort_order: number | null;
};

type TrackRow = {
  id: string;
  title: string | null;
  category: string | null;
  genre: string | null;
  badge: string | null;
  cover_url: string | null;
  spotify_url: string | null;
};

type CollabRow = {
  id: number;
  role: string | null;
  name: string | null;
  subtitle: string | null;
  image_url: string | null;
  works: string[] | null;
  impact: string | null;
  sort_order: number | null;
};

type GalleryRow = {
  id: number;
  src: string | null;
  caption: string | null;
  alt: string | null;
  sort_order: number | null;
};

type NewsRow = {
  id: number;
  date: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  url_label: string | null;
  sort_order: number | null;
};

type VideoRow = {
  id: number;
  title: string | null;
  youtube_id: string | null;
  sort_order: number | null;
};

type PressRow = {
  id: number;
  type: string | null;
  source: string | null;
  title: string | null;
  quote: string | null;
  url: string | null;
  date: string | null;
  sort_order: number | null;
};
