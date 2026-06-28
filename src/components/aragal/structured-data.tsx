/**
 * Structured data (schema.org MusicGroup) for ARAGAL — improves SEO and
 * enables Google rich snippets (artist knowledge panel, album/track listings).
 * Ported and enriched from the original Vite index.html.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "ARAGAL",
    alternateName: "Mario Aravena",
    description:
      "Compositor y productor musical chileno especializado en música cubana y espiritual con más de 24 años de trayectoria",
    genre: [
      "Latin",
      "Cuban Music",
      "Son Cubano",
      "Spiritual Music",
      "Salsa",
    ],
    url: "https://marioaravena.cl",
    foundingDate: "2000",
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CL",
        addressRegion: "Santiago",
      },
    },
    sameAs: [
      "https://open.spotify.com/intl-es/artist/4bugRe9qz3z8As6rKmMc7r",
      "https://www.youtube.com/@ARAGAL-MarioAravena",
      "https://www.instagram.com/mario.aravena.oficial/",
      "https://www.facebook.com/profile.php/?id=61556996900962",
    ],
    member: {
      "@type": "Person",
      name: "Mario Aravena",
      jobTitle: "Compositor y Productor Musical",
      nationality: "Chilean",
    },
    album: [
      {
        "@type": "MusicAlbum",
        name: "Bienaventurados",
        genre: "Spiritual Music",
        url: "https://open.spotify.com/album/3r1BMhB3Kd2RvVcRPceuWl",
        datePublished: "2023",
        byArtist: { "@type": "MusicGroup", name: "ARAGAL" },
      },
      {
        "@type": "MusicAlbum",
        name: "Como Ha Pasado El Tiempo",
        genre: ["Son Cubano", "Traditional"],
        url: "https://open.spotify.com/album/0ZJqYT1urUqaL06XYAa8nV",
        datePublished: "2023",
        byArtist: { "@type": "MusicGroup", name: "ARAGAL" },
      },
    ],
    track: [
      {
        "@type": "MusicRecording",
        name: "OLIVIA",
        genre: "Son Cubano",
        url: "https://open.spotify.com/track/7j8OIcBe8VKwEZkFH0KS3d",
        datePublished: "2024",
        byArtist: { "@type": "MusicGroup", name: "ARAGAL" },
        contributor: {
          "@type": "Person",
          name: "Jesus Aguaje Ramos",
          roleName: "Arreglista",
        },
      },
      {
        "@type": "MusicRecording",
        name: "TU Y YO",
        genre: "Salsa",
        url: "https://open.spotify.com/track/27OVyFL7hRqeZFzifb1ynx",
        datePublished: "2023",
        byArtist: { "@type": "MusicGroup", name: "ARAGAL" },
        contributor: {
          "@type": "Person",
          name: "Jesus Aguaje Ramos",
          roleName: "Arreglista",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
