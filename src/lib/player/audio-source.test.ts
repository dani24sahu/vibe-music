import { describe, expect, it } from "vitest";
import { canPlayAudioSource, resolveAudioSource } from "@/lib/player/audio-source";
import type { Song } from "@/types/music";

const song: Song = {
  id: "song-1",
  name: "Test track",
  type: "song",
  year: "2024",
  releaseDate: null,
  duration: 180,
  label: null,
  explicitContent: false,
  playCount: null,
  language: "english",
  hasLyrics: true,
  lyricsId: null,
  url: "https://example.invalid/song",
  copyright: null,
  album: { id: "album-1", name: "Album", url: null },
  artists: {
    primary: [
      { id: "a1", name: "Artist", image: [] },
    ],
    featured: [],
    all: [],
  },
  image: [],
  playbackSources: [
    { quality: "320kbps", url: "https://aac.saavncdn.com/track.mp4" },
  ],
};

describe("resolveAudioSource", () => {
  it("keeps JioSaavn audio as an online stream and never marks it offline-available", () => {
    const source = resolveAudioSource(song, "320kbps");
    expect(source.source).toBe("saavn-stream");
    expect(source.offlineAvailable).toBe(false);
    expect(source.duration).toBe(180);
    expect(source.url).toBe(
      `/api/stream?url=${encodeURIComponent("https://aac.saavncdn.com/track.mp4")}`,
    );
    expect(canPlayAudioSource(source, true)).toBe(true);
    expect(canPlayAudioSource(source, false)).toBe(false);
  });

  it("returns no url when the song has no playable sources", () => {
    const source = resolveAudioSource({ ...song, playbackSources: [] });
    expect(source.url).toBeNull();
    expect(source.offlineAvailable).toBe(false);
    expect(canPlayAudioSource(source, true)).toBe(false);
  });
});
