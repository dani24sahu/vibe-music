import { streamUrl } from "@/lib/api/music";
import { pickPlaybackSource } from "@/lib/player/quality";
import type { Song } from "@/types/music";

export type AudioSourceKind = "saavn-stream";

export type ResolvedAudioSource = {
  url: string | null;
  offlineAvailable: boolean;
  source: AudioSourceKind;
  duration: number | null;
};

const SAAVN_STREAM: AudioSourceKind = "saavn-stream";

export function resolveAudioSource(
  song: Song | null,
  preferredQuality?: string | null,
): ResolvedAudioSource {
  if (!song) {
    return {
      url: null,
      offlineAvailable: false,
      source: SAAVN_STREAM,
      duration: null,
    };
  }

  const picked = pickPlaybackSource(song.playbackSources ?? [], preferredQuality);
  return {
    url: picked?.url ? streamUrl(picked.url) : null,
    // JioSaavn remains streaming-only. A future licensed source can set this true.
    offlineAvailable: false,
    source: SAAVN_STREAM,
    duration: song.duration,
  };
}

export function canPlayAudioSource(
  source: ResolvedAudioSource,
  online: boolean,
) {
  if (!source.url) return false;
  return online || source.offlineAvailable;
}
