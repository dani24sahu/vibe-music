import { describe, expect, it } from "vitest";
import { jsonCacheHeaders } from "@/app/api/_lib/http";

describe("API cache headers", () => {
  it("does not let CDNs store lyrics-style no-store responses", () => {
    const headers = jsonCacheHeaders(0);
    expect(headers["Cache-Control"]).toContain("no-store");
    expect(headers["CDN-Cache-Control"]).toBe("no-store");
    expect(headers["Netlify-CDN-Cache-Control"]).toBe("no-store");
    expect(headers["Netlify-Vary"]).toBe("query");
  });

  it("varies public catalog cache keys on query strings", () => {
    const headers = jsonCacheHeaders(60);
    expect(headers["Cache-Control"]).toContain("s-maxage=60");
    expect(headers["Netlify-Vary"]).toBe("query");
  });
});
