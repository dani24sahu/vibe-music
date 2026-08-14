import { describe, expect, it } from "vitest";
import { compareSemver, unseenReleases, type WhatsNewRelease } from "@/lib/whats-new";

const releases: WhatsNewRelease[] = [
  {
    version: "0.1.0",
    date: "1 Aug 2026",
    title: "start",
    highlights: ["player"],
  },
  {
    version: "0.2.0",
    date: "14 Aug 2026",
    title: "next",
    highlights: ["pwa"],
  },
];

describe("whats new versioning", () => {
  it("compares semver strings", () => {
    expect(compareSemver("0.2.0", "0.1.0")).toBe(1);
    expect(compareSemver("0.1.0", "0.2.0")).toBe(-1);
    expect(compareSemver("0.2.0", "0.2.0")).toBe(0);
  });

  it("shows the current release the first time", () => {
    expect(unseenReleases(null, releases, "0.2.0").map((item) => item.version)).toEqual([
      "0.2.0",
    ]);
  });

  it("returns only releases newer than the last seen version", () => {
    expect(unseenReleases("0.1.0", releases).map((item) => item.version)).toEqual([
      "0.2.0",
    ]);
    expect(unseenReleases("0.2.0", releases)).toEqual([]);
  });
});
