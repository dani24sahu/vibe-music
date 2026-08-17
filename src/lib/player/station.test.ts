import { describe, expect, it } from "vitest";
import type { Song } from "@/types/music";
import {
  buildStationPlan,
  collectLibrarySongs,
  describeStation,
  dominantLanguage,
  mergeStationQueue,
  pickStationSeeds,
  stationPeriod,
  stationPlayLabel,
} from "@/lib/player/station";

function song(id: string, language = "hindi"): Song {
  return {
    id,
    name: id,
    type: "song",
    year: "2024",
    releaseDate: null,
    duration: 180,
    label: null,
    explicitContent: false,
    playCount: null,
    language,
    hasLyrics: false,
    lyricsId: null,
    url: "",
    copyright: null,
    album: { id: "a", name: "Album", url: null },
    artists: { primary: [], featured: [], all: [] },
    image: [],
    playbackSources: [],
  };
}

describe("tonight's station", () => {
  it("collects unique songs with recents first, then likes, then mixes", () => {
    const recent = song("r1");
    const liked = song("f1");
    const mixOnly = song("m1");
    const overlap = song("r1");
    expect(
      collectLibrarySongs({
        recentlyPlayed: [recent],
        favorites: [liked, overlap],
        playlists: [{ songs: [mixOnly, liked] }],
      }).map((item) => item.id),
    ).toEqual(["r1", "f1", "m1"]);
  });

  it("picks the dominant language and prefers it for seeds", () => {
    const songs = [
      song("h1", "hindi"),
      song("e1", "english"),
      song("h2", "hindi"),
      song("h3", "hindi"),
    ];
    expect(dominantLanguage(songs)).toBe("hindi");
    expect(pickStationSeeds(songs, "hindi", 2).map((item) => item.id)).toEqual(["h1", "h2"]);
  });

  it("merges nearby tracks without duplicates and prefers the station language", () => {
    const seeds = [song("s1"), song("s2")];
    const related = [
      [song("s1"), song("n1"), song("e1", "english")],
      [song("n2"), song("n3")],
    ];
    expect(
      mergeStationQueue(seeds, related, { language: "hindi", max: 5 }).map((item) => item.id),
    ).toEqual(["s1", "s2", "n1", "n2", "n3"]);
  });

  it("describes a local mix and names the play action by time of day", () => {
    expect(
      describeStation({ language: "hindi", source: "likes", period: "late-evening" }),
    ).toBe("Hindi, from your likes, late evening.");
    expect(
      describeStation({
        language: "english",
        source: "recents",
        period: "morning",
        expanded: true,
      }),
    ).toBe("English, from your recents, plus nearby tracks, this morning.");
    expect(stationPeriod(22)).toBe("late-evening");
    expect(stationPlayLabel("morning")).toBe("Play this morning's vibe");
    expect(stationPlayLabel("evening")).toBe("Play tonight's vibe");
  });

  it("does not invent a station from an empty library", () => {
    const plan = buildStationPlan(
      { recentlyPlayed: [], favorites: [], playlists: [] },
      new Date("2026-08-17T21:30:00"),
    );
    expect(plan.canPlay).toBe(false);
    expect(plan.seeds).toEqual([]);
  });
});
