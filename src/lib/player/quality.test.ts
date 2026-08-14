import { describe, expect, it } from "vitest";
import {
  formatQualityLabel,
  parseBitrate,
  pickPlaybackSource,
  playableSources,
} from "@/lib/player/quality";

const liveQualities = [
  { quality: "12kbps", url: "https://aac.saavncdn.com/a_12.mp4" },
  { quality: "48kbps", url: "https://aac.saavncdn.com/a_48.mp4" },
  { quality: "96kbps", url: "https://aac.saavncdn.com/a_96.mp4" },
  { quality: "160kbps", url: "https://aac.saavncdn.com/a_160.mp4" },
  { quality: "320kbps", url: "https://aac.saavncdn.com/a_320.mp4" },
];

describe("audio quality helpers", () => {
  it("parses bitrates from API quality labels", () => {
    expect(parseBitrate("320kbps")).toBe(320);
    expect(parseBitrate("96 kbps")).toBe(96);
    expect(parseBitrate("unknown")).toBe(0);
  });

  it("keeps only unique playable qualities returned by the API", () => {
    const available = playableSources([
      ...liveQualities,
      { quality: "160kbps", url: "https://aac.saavncdn.com/duplicate.mp4" },
      { quality: "", url: "https://aac.saavncdn.com/empty.mp4" },
      { quality: "48kbps", url: "" },
    ]);
    expect(available.map((item) => item.quality)).toEqual([
      "320kbps",
      "160kbps",
      "96kbps",
      "48kbps",
      "12kbps",
    ]);
  });

  it("defaults to the highest available quality", () => {
    expect(pickPlaybackSource(liveQualities)?.quality).toBe("320kbps");
  });

  it("uses an exact preferred quality when the song provides it", () => {
    expect(pickPlaybackSource(liveQualities, "96kbps")?.url).toBe(
      "https://aac.saavncdn.com/a_96.mp4",
    );
  });

  it("falls back to the closest available quality instead of a hardcoded list", () => {
    const limited = [
      { quality: "48kbps", url: "https://aac.saavncdn.com/a_48.mp4" },
      { quality: "96kbps", url: "https://aac.saavncdn.com/a_96.mp4" },
    ];
    expect(pickPlaybackSource(limited, "320kbps")?.quality).toBe("96kbps");
    expect(pickPlaybackSource(limited, "12kbps")?.quality).toBe("48kbps");
  });

  it("formats API quality labels without inventing extra options", () => {
    expect(formatQualityLabel("160kbps")).toBe("160 kbps");
    expect(formatQualityLabel("hi-res")).toBe("hi-res");
  });
});
