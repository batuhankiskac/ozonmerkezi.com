export function extractYoutubeId(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    // notyoutube.com gibi benzer alan adları reddedilir; m., music. vb. kabul edilir.
    const isYoutube = host === "youtube.com" || host.endsWith(".youtube.com");
    const id =
      host === "youtu.be" || host === "www.youtu.be"
        ? url.pathname.slice(1).split("/")[0]
        : isYoutube
          ? url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
          : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function youtubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

// Kayıtlı YouTube görselleri (ör. maxresdefault.jpg) birçok videoda 404
// döndüğü için YouTube adresleri her zaman id'den türetilir.
export function videoThumbnail(video: {
  youtubeId: string;
  imageUrl: string | null;
}): string {
  if (!video.imageUrl) return youtubeThumbnail(video.youtubeId);
  try {
    const host = new URL(video.imageUrl).hostname;
    if (host === "img.youtube.com" || host === "i.ytimg.com") {
      return youtubeThumbnail(video.youtubeId);
    }
  } catch {
    return youtubeThumbnail(video.youtubeId);
  }
  return video.imageUrl;
}
