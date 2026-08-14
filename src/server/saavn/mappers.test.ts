import { describe, expect, it } from "vitest";
import { mapGlobalSearch, mapSong, mapSongs, pickPlaybackUrl } from "@/server/saavn/mappers";
import type { SaavnSong } from "@/server/saavn/types";

const sampleSong: SaavnSong = {
  id: "URItmq7h",
  name: "Believer",
  type: "song",
  year: "2022",
  releaseDate: "2022-12-02",
  duration: 144,
  label: "Ostereo",
  explicitContent: true,
  playCount: 31025,
  language: "english",
  hasLyrics: false,
  lyricsId: null,
  url: "https://www.jiosaavn.com/song/believer/JToiRRlBAFs",
  copyright: "© 2022 Imagine Dragons",
  album: {
    id: "77876934",
    name: "AiSh: The Covers Collection",
    url: "https://www.jiosaavn.com/album/aish-the-covers-collection/nft2Uzw4kbU_",
  },
  artists: {
    primary: [
      {
        id: "1538887",
        name: "Aish",
        role: "primary_artists",
        image: [{ quality: "50x50", url: "https://example.com/a.jpg" }],
        type: "artist",
        url: "https://www.jiosaavn.com/artist/aish-songs/XzBwgB5xWto_",
      },
    ],
    featured: [],
    all: [],
  },
  image: [
    { quality: "50x50", url: "https://example.com/50.jpg" },
    { quality: "150x150", url: "https://example.com/150.jpg" },
    { quality: "500x500", url: "https://example.com/500.jpg" },
  ],
  downloadUrl: [
    { quality: "12kbps", url: "https://aac.saavncdn.com/a_12.mp4" },
    { quality: "160kbps", url: "https://aac.saavncdn.com/a_160.mp4" },
    { quality: "320kbps", url: "https://aac.saavncdn.com/a_320.mp4" },
  ],
};

describe("mapSong", () => {
  it("maps downloadUrl to playbackSources and keeps metadata", () => {
    const song = mapSong(sampleSong);
    expect(song.id).toBe("URItmq7h");
    expect(song.name).toBe("Believer");
    expect(song.playbackSources).toHaveLength(3);
    expect(song.playbackSources.some((item) => item.quality === "160kbps")).toBe(true);
    expect(song.artists.primary[0]?.name).toBe("Aish");
    expect(song.album.id).toBe("77876934");
  });

  it("defaults to the highest available playback source", () => {
    const song = mapSong(sampleSong);
    expect(pickPlaybackUrl(song.playbackSources)).toBe(
      "https://aac.saavncdn.com/a_320.mp4",
    );
  });

  it("skips null songs and artist credits from malformed API payloads", () => {
    expect(mapSongs([null, sampleSong]).map((song) => song.id)).toEqual(["URItmq7h"]);
    const song = mapSong({
      ...sampleSong,
      artists: {
        primary: [null, sampleSong.artists!.primary![0]],
        featured: [],
        all: [],
      } as SaavnSong["artists"],
    });
    expect(song.artists.primary.map((artist) => artist.id)).toEqual(["1538887"]);
  });
});

describe("mapGlobalSearch", () => {
  it("normalizes title-based global search hits", () => {
    const mapped = mapGlobalSearch({
      songs: {
        position: 1,
        results: [
          {
            id: "1ZDlyUiL",
            title: "Believer (Imagine Dragons cover)",
            type: "song",
            primaryArtists: "Polina Cherkas",
            image: [{ quality: "50x50", url: "https://example.com/s.jpg" }],
          },
        ],
      },
      albums: { results: [], position: 4 },
      artists: {
        results: [{ id: "599452", title: "Imagine Dragons", type: "artist" }],
        position: 0,
      },
      playlists: { results: [], position: 1 },
      topQuery: { results: [], position: 0 },
    });

    expect(mapped.songs.results[0]?.title).toBe("Believer (Imagine Dragons cover)");
    expect(mapped.artists.results[0]?.title).toBe("Imagine Dragons");
  });
});
