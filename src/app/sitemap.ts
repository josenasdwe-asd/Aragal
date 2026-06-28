import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://aragal.vercel.app";
  const sections = ["", "#bio", "#musica", "#videos", "#galeria", "#noticias", "#contacto"];
  return sections.map((s) => ({
    url: `${base}/${s}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: s === "" ? 1 : 0.8,
  }));
}
