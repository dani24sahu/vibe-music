import type { PlaybackSource } from "@/types/music";

export function parseBitrate(quality: string): number {
  const match = quality.match(/(\d+)/);
  if (!match) return 0;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : 0;
}

export function playableSources(sources: PlaybackSource[] | null | undefined): PlaybackSource[] {
  const seen = new Set<string>();
  const unique: PlaybackSource[] = [];
  for (const source of sources ?? []) {
    const quality = source.quality?.trim();
    const url = source.url?.trim();
    if (!quality || !url || seen.has(quality)) continue;
    seen.add(quality);
    unique.push({ quality, url });
  }
  return unique.sort((a, b) => parseBitrate(b.quality) - parseBitrate(a.quality));
}

export function formatQualityLabel(quality: string): string {
  const bitrate = parseBitrate(quality);
  if (bitrate > 0) return `${bitrate} kbps`;
  return quality;
}

export function pickPlaybackSource(
  sources: PlaybackSource[] | null | undefined,
  preferredQuality?: string | null,
): PlaybackSource | null {
  const available = playableSources(sources);
  if (available.length === 0) return null;

  if (preferredQuality) {
    const exact = available.find((source) => source.quality === preferredQuality);
    if (exact) return exact;

    const preferredBitrate = parseBitrate(preferredQuality);
    return available.reduce((closest, source) => {
      const closestDelta = Math.abs(parseBitrate(closest.quality) - preferredBitrate);
      const nextDelta = Math.abs(parseBitrate(source.quality) - preferredBitrate);
      return nextDelta < closestDelta ? source : closest;
    });
  }

  return available[0] ?? null;
}

export function pickPlaybackUrl(
  sources: PlaybackSource[] | null | undefined,
  preferredQuality?: string | null,
): string | null {
  return pickPlaybackSource(sources, preferredQuality)?.url ?? null;
}
