import { describe, expect, it } from "vitest";
import {
  isCacheFresh,
  lyricsTtlMs,
  LYRICS_FRESH_MS,
  LYRICS_NOT_FOUND_MS,
  shouldUseCacheFallback,
} from "@/lib/offline/cache-policy";
import { shouldReuseCachedLyrics } from "@/lib/offline/lyrics-cache";
import { MusicApiError } from "@/lib/api/client";

describe("offline cache policy", () => {
  it("uses cache for network and offline failures, not 404s", () => {
    expect(shouldUseCacheFallback(new MusicApiError("offline", 503, "OFFLINE"))).toBe(
      true,
    );
    expect(
      shouldUseCacheFallback(new MusicApiError("network", 503, "NETWORK_ERROR")),
    ).toBe(true);
    expect(shouldUseCacheFallback(new MusicApiError("upstream", 502, "ERROR"))).toBe(
      true,
    );
    expect(shouldUseCacheFallback(new MusicApiError("missing", 404, "NOT_FOUND"))).toBe(
      false,
    );
  });

  it("keeps found lyrics longer than missing lyrics", () => {
    expect(lyricsTtlMs(true)).toBe(LYRICS_FRESH_MS);
    expect(lyricsTtlMs(false)).toBe(LYRICS_NOT_FOUND_MS);
    expect(isCacheFresh(Date.now() - 1000, 5000)).toBe(true);
    expect(isCacheFresh(Date.now() - 6000, 5000)).toBe(false);
  });

  it("reuses lyrics while offline even if they are stale", () => {
    const stale = Date.now() - LYRICS_FRESH_MS - 1000;
    expect(shouldReuseCachedLyrics(stale, true, false)).toBe(true);
    expect(shouldReuseCachedLyrics(stale, true, true)).toBe(false);
    expect(shouldReuseCachedLyrics(Date.now(), true, true)).toBe(true);
  });
});
