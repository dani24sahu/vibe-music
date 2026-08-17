import { describe, expect, it } from "vitest";
import { MusicApiError } from "@/lib/api/client";
import { shouldRetryQuery } from "@/lib/api/retry";

describe("shouldRetryQuery", () => {
  it("retries a single 5xx or network failure", () => {
    expect(shouldRetryQuery(0, new MusicApiError("down", 503, "NETWORK_ERROR"))).toBe(
      true,
    );
    expect(shouldRetryQuery(1, new MusicApiError("down", 503, "NETWORK_ERROR"))).toBe(
      false,
    );
  });

  it("does not retry rate limits, missing items, or aborted fetches", () => {
    expect(shouldRetryQuery(0, new MusicApiError("slow down", 429, "SAAVN_RATE_LIMITED"))).toBe(
      false,
    );
    expect(shouldRetryQuery(0, new MusicApiError("missing", 404, "NOT_FOUND"))).toBe(false);
    const abort = new Error("aborted");
    abort.name = "AbortError";
    expect(shouldRetryQuery(0, abort)).toBe(false);
  });
});
