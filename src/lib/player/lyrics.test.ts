import { describe, expect, it } from "vitest";
import {
  activeLyricIndex,
  activeLyricText,
  lyricsForSong,
  parseLrc,
  parseTimecode,
  plainLyricsToLines,
} from "@/lib/player/lyrics";
import { pickBestLyricsRecord } from "@/server/lyrics/match";
import { cleanTrackTitle, firstArtistName } from "@/server/lyrics/normalize";

const sampleLrc = `[ti:About You]
[ar:The 1975]
[offset:0]
[00:17.12] I feel your breath upon my neck
[00:21.00][01:02.50] With nothing to do
[01:10.4] I could lay and just look in your eyes
[01:18] `;

describe("lrc parser", () => {
  it("parses timed lines and skips metadata/empty stamps", () => {
    const lines = parseLrc(sampleLrc);
    expect(parseTimecode("00", "17", "12")).toBeCloseTo(17.12);
    expect(lines.map((line) => line.text)).toEqual([
      "I feel your breath upon my neck",
      "With nothing to do",
      "With nothing to do",
      "I could lay and just look in your eyes",
    ]);
    expect(lines[0]?.time).toBeCloseTo(17.12);
    expect(lines[1]?.time).toBeCloseTo(21);
    expect(lines[2]?.time).toBeCloseTo(62.5);
  });

  it("selects the current line from playback time", () => {
    const lines = parseLrc(sampleLrc);
    expect(activeLyricIndex(lines, 10)).toBe(-1);
    expect(activeLyricIndex(lines, 17.12)).toBe(0);
    expect(activeLyricIndex(lines, 30)).toBe(1);
    expect(activeLyricIndex(lines, 70)).toBe(2);
    expect(activeLyricIndex(lines, 71)).toBe(3);
    expect(activeLyricText(lines, 10)).toBeNull();
    expect(activeLyricText(lines, 18)).toBe("I feel your breath upon my neck");
    expect(activeLyricText(lines, 30)).toBe("With nothing to do");
  });

  it("ignores lyrics tagged for a different song", () => {
    const lyrics = {
      found: true,
      instrumental: false,
      synced: true,
      source: "lrclib" as const,
      title: "About You",
      artist: "The 1975",
      lines: [{ time: 17.12, text: "I feel your breath upon my neck" }],
      songId: "song-a",
    };
    expect(lyricsForSong(lyrics, "song-a")?.title).toBe("About You");
    expect(lyricsForSong(lyrics, "song-b")).toBeUndefined();
    expect(lyricsForSong({ ...lyrics, songId: undefined }, "song-b")?.title).toBe(
      "About You",
    );
  });

  it("keeps unsynced lyrics as plain lines", () => {
    expect(plainLyricsToLines("one\n\ntwo")).toEqual([
      { time: null, text: "one" },
      { time: null, text: "two" },
    ]);
  });
});

describe("lyrics matching helpers", () => {
  it("prefers duration-matched synced lyrics", () => {
    const best = pickBestLyricsRecord(
      [
        {
          id: 1,
          duration: 200,
          plainLyrics: "plain",
          syncedLyrics: null,
        },
        {
          id: 2,
          duration: 144,
          syncedLyrics: "[00:01.00] hello",
        },
      ],
      144,
    );
    expect(best?.id).toBe(2);
  });

  it("cleans catalog titles and featured artist lists", () => {
    expect(cleanTrackTitle(`Kesariya (From "Brahmastra")`)).toBe("Kesariya");
    expect(firstArtistName("Arijit Singh, Amitabh Bhattacharya")).toBe("Arijit Singh");
  });
});
