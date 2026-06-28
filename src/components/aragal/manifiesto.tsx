import { getBio } from "@/lib/data";
import { ManifiestoClient } from "./manifiesto-client";

/**
 * Manifiesto — server component that fetches the bio data and passes it to
 * the client-side horizontal slider. (The slider needs client state for scroll
 * tracking, but the data fetch must happen server-side because the Supabase
 * client is server-only.)
 */
export async function Manifiesto() {
  const bio = await getBio();
  if (!bio.manifesto) return null;
  return <ManifiestoClient bio={bio} />;
}
