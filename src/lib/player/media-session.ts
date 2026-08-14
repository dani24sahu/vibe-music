import { pickArtworkUrl } from "@/lib/format";
import type { ArtworkImage, Song } from "@/types/music";

export type MediaSessionArtwork = {
  src: string;
  sizes: string;
  type: string;
};

function imageType(url: string) {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export function toAbsoluteMediaUrl(url: string, origin?: string) {
  if (!url) return "";
  try {
    return new URL(url, origin ?? "https://localhost").href;
  } catch {
    return url;
  }
}

export function mediaSessionArtwork(
  images: ArtworkImage[] | null | undefined,
  origin?: string,
): MediaSessionArtwork[] {
  const large = pickArtworkUrl(images, ["500x500", "150x150", "50x50"]);
  const medium = pickArtworkUrl(images, ["150x150", "500x500", "50x50"]);
  const small = pickArtworkUrl(images, ["50x50", "150x150", "500x500"]);
  const entries: Array<[string, string | null]> = [
    ["96x96", small],
    ["256x256", medium],
    ["512x512", large],
  ];

  const seen = new Set<string>();
  const artwork: MediaSessionArtwork[] = [];
  for (const [sizes, url] of entries) {
    if (!url) continue;
    const src = toAbsoluteMediaUrl(url, origin);
    const key = `${src}:${sizes}`;
    if (seen.has(key)) continue;
    seen.add(key);
    artwork.push({ src, sizes, type: imageType(src) });
  }
  return artwork;
}

export function mediaSessionTitle(song: Pick<Song, "name" | "artists" | "album">, artist: string) {
  return {
    title: song.name,
    artist,
    album: song.album?.name?.trim() || "Vibe",
  };
}
