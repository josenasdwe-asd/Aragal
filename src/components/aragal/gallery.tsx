import { getGallery } from "@/lib/data";
import { GalleryClient } from "./gallery-client";

export async function Gallery() {
  const items = await getGallery();
  return <GalleryClient items={items} />;
}
