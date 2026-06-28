import { getTracks } from "@/lib/data";
import { MusicClient } from "./music-client";

export async function Music() {
  const tracks = await getTracks();
  return <MusicClient tracks={tracks} />;
}
