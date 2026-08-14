import type { ArtworkImage, PlaybackSource, Song } from "@/types/music";
import { pickPlaybackSource } from "@/lib/player/quality";

export function pickArtworkUrl(
  images: ArtworkImage[] | null | undefined,
  preferred: Array<"500x500" | "150x150" | "50x50"> = [
    "500x500",
    "150x150",
    "50x50",
  ],
): string | null {
  if (!images?.length) return null;
  for (const quality of preferred) {
    const match = images.find((image) => image.quality === quality);
    if (match?.url) return match.url;
  }
  return images.at(-1)?.url ?? images[0]?.url ?? null;
}

export function pickPlaybackUrl(
  sources: PlaybackSource[] | null | undefined,
  preferredQuality?: string | null,
): string | null {
  return pickPlaybackSource(sources, preferredQuality)?.url ?? null;
}

export function formatTime(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return "0:00";
  }
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function primaryArtistName(song: Pick<Song, "artists">) {
  return (
    song.artists?.primary?.map((artist) => artist.name).filter(Boolean).join(", ") ||
    song.artists?.all?.[0]?.name ||
    "Unknown artist"
  );
}

export function albumArtistName(artists: Song["artists"]) {
  return artists?.primary?.map((artist) => artist.name).filter(Boolean).join(", ") || "Various artists";
}

export function artworkAlt(title: string) {
  return `${title} artwork`;
}

export function bestArtwork(images: ArtworkImage[], size: "sm" | "md" | "lg" = "md") {
  if (size === "sm") return pickArtworkUrl(images, ["50x50", "150x150", "500x500"]);
  if (size === "lg") return pickArtworkUrl(images, ["500x500", "150x150", "50x50"]);
  return pickArtworkUrl(images, ["150x150", "500x500", "50x50"]);
}
