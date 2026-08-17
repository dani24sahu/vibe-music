import { describe, expect, it } from "vitest";
import {
  EQ_BAND_HZ,
  EQ_PRESETS,
  clampEqDb,
  formatEqHz,
  gainsForPreset,
  isEqPresetId,
  normalizeEqGains,
} from "@/lib/player/eq";

describe("equalizer", () => {
  it("keeps ten ISO-style bands and a silent flat preset", () => {
    expect(EQ_BAND_HZ).toHaveLength(10);
    expect(EQ_PRESETS.flat.every((db) => db === 0)).toBe(true);
    expect(formatEqHz(31)).toBe("31");
    expect(formatEqHz(1000)).toBe("1k");
  });

  it("clamps and fills incomplete custom gains", () => {
    expect(clampEqDb(40)).toBe(12);
    expect(clampEqDb(-40)).toBe(-12);
    expect(normalizeEqGains([3, 99])).toEqual([3, 12, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(gainsForPreset("custom", [1, 2])).toHaveLength(10);
    expect(gainsForPreset("rock")[0]).toBe(4);
    expect(isEqPresetId("metal")).toBe(true);
    expect(isEqPresetId("jazz")).toBe(false);
  });
});
