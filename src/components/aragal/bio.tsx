import { getBio, getTimeline } from "@/lib/data";
import { BioClient } from "./bio-client";

/**
 * Bio — server component that fetches data and passes it to the interactive
 * client component (which handles parallax + stagger reveal).
 */
export async function Bio() {
  const [bio, timeline] = await Promise.all([getBio(), getTimeline()]);
  return <BioClient bio={bio} timeline={timeline} />;
}
