import { ParticlesCanvas } from "@/components/aragal/particles-canvas";
import { ScrollProgress } from "@/components/aragal/scroll-progress";
import { Navbar } from "@/components/aragal/navbar";
import { Hero } from "@/components/aragal/hero";
import { Stats } from "@/components/aragal/stats";
import { Bio } from "@/components/aragal/bio";
import { Manifiesto } from "@/components/aragal/manifiesto";
import { Collaborations } from "@/components/aragal/collaborations";
import { Highlights } from "@/components/aragal/highlights";
import { Music } from "@/components/aragal/music";
import { Videos } from "@/components/aragal/videos";
import { Gallery } from "@/components/aragal/gallery";
import { News } from "@/components/aragal/news";
import { Prensa } from "@/components/aragal/prensa";
import { Contact } from "@/components/aragal/contact";
import { Footer } from "@/components/aragal/footer";
import { ThemeToggle } from "@/components/aragal/theme-toggle";
import { SectionDivider } from "@/components/aragal/ornament";
import { AdminPanelLazy } from "@/components/admin/admin-panel-lazy";
import { CustomCursor } from "@/components/aragal/custom-cursor";
import { PremiumLoader } from "@/components/aragal/premium-loader";

// ISR: cache the page for 60 seconds, then revalidate with fresh Supabase data.
// This is much better than force-dynamic (no caching) for performance.
export const revalidate = 60;

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <PremiumLoader />
      <CustomCursor />
      <ParticlesCanvas />
      <ScrollProgress />

      {/* Skip link for accessibility */}
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[80] focus:-translate-x-1/2 focus:rounded-md focus:px-4 focus:py-2 focus:font-bold"
        style={{ background: "var(--gold)", color: "#0a0a0a" }}
      >
        Saltar al contenido principal
      </a>

      <Navbar />

      <main className="flex-1">
        <Hero />
        <Stats />
        <Bio />
        <Manifiesto />
        <SectionDivider variant="staff" className="my-2" />
        <Collaborations />
        <Highlights />
        <SectionDivider variant="diamond" className="my-2" />
        <Music />
        <Videos />
        <SectionDivider variant="staff" className="my-2" />
        <Gallery />
        <News />
        <SectionDivider variant="lucero" className="my-2" />
        <Prensa />
        <SectionDivider variant="diamond" className="my-2" />
        <Contact />
      </main>

      <Footer />

      {/* Floating controls */}
      <ThemeToggle />

      {/* Inline admin panel (floating button + edit mode + sheet) */}
      <AdminPanelLazy />
    </div>
  );
}
