import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { StructuredData } from "@/components/aragal/structured-data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aragal.vercel.app/"),
  alternates: {
    canonical: "https://aragal.vercel.app/",
  },
  title: "ARAGAL — Mario Aravena | Compositor y Productor Musical",
  description:
    "Sitio oficial de Mario Aravena (ARAGAL). Explora su música con sabor cubano, composiciones espirituales y colaboraciones con Buena Vista Social Club.",
  keywords: [
    "ARAGAL",
    "Mario Aravena",
    "compositor",
    "música cubana",
    "son cubano",
    "música espiritual",
    "Buena Vista Social Club",
  ],
  authors: [{ name: "Mario Aravena" }],
  icons: {
    icon: "/assets/images/logo-art.svg",
    apple: "/assets/images/logo-premium.png",
  },
  openGraph: {
    title: "ARAGAL — Mario Aravena | Compositor Musical",
    description:
      "Descubre la música de ARAGAL: composiciones con sabor cubano, música espiritual y colaboraciones internacionales.",
    url: "https://aragal.vercel.app/",
    siteName: "ARAGAL",
    locale: "es_ES",
    type: "website",
    images: [{ url: "/assets/images/bio.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARAGAL — Mario Aravena | Compositor Musical",
    description:
      "Descubre la música de ARAGAL: composiciones con sabor cubano y colaboraciones internacionales.",
    images: ["/assets/images/bio.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preload the hero video so it starts downloading immediately */}
        <link rel="preload" href="/assets/video/hero-loop.mp4" as="video" type="video/mp4" />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <StructuredData />
      </body>
    </html>
  );
}
