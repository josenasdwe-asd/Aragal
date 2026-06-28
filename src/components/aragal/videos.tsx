import { getVideos } from "@/lib/data";

export async function Videos() {
  const videos = await getVideos();
  if (videos.length === 0) return null;

  return (
    <section id="videos" className="border-t py-20 sm:py-28">
      <div className="aragal-container">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">Audiovisual</span>
          <h2 className="section-title">Videos</h2>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {videos.map((video) => (
            <article key={video.id} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                {video.title}
              </h3>
              <div
                className="relative w-full overflow-hidden rounded-lg"
                style={{ background: "#000" }}
              >
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    className="h-full w-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    style={{ background: "#000" }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
