import { afterEach, describe, expect, it, vi } from "vitest";
import { getArtistSongs, searchSongs } from "@/server/saavn/adapter";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchSongs adapter", () => {
  it("calls the documented /api/search/songs endpoint and maps results", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          total: 1,
          start: 0,
          results: [
            {
              id: "song-1",
              name: "Test Track",
              type: "song",
              duration: 120,
              explicitContent: false,
              language: "english",
              hasLyrics: false,
              url: "https://example.com/song",
              album: { id: "a1", name: "Album", url: null },
              artists: { primary: [{ id: "ar1", name: "Artist" }], featured: [], all: [] },
              image: [],
              downloadUrl: [
                { quality: "160kbps", url: "https://aac.saavncdn.com/x_160.mp4" },
              ],
            },
          ],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchSongs("Believer", { limit: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("/api/search/songs");
    expect(calledUrl).toContain("query=Believer");
    expect(result.results[0]?.name).toBe("Test Track");
    expect(result.results[0]?.playbackSources[0]?.url).toContain("aac.saavncdn.com");
  });

  it("throws an unavailable error when the upstream API is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ success: false, message: "overloaded" }),
      }),
    );

    await expect(searchSongs("Believer")).rejects.toMatchObject({
      code: "SAAVN_UNAVAILABLE",
      status: 503,
    });
  });
});

describe("getArtistSongs catalog filtering", () => {
  it("paginates song search and keeps only tracks that credit the artist", async () => {
    const karaoke = {
      id: "k1",
      name: "Taste (By Sabrina Carpenter) (Instrumental Karaoke Version)",
      type: "song",
      duration: 180,
      album: { id: "a1", name: "Karaoke", url: null },
      artists: {
        primary: [{ id: "999", name: "ZZang KARAOKE", role: "primary_artists" }],
        featured: [],
        all: [
          { id: "999", name: "ZZang KARAOKE", role: "primary_artists" },
          { id: "603814", name: "Sabrina Carpenter", role: "music" },
        ],
      },
      image: [],
      downloadUrl: [{ quality: "160kbps", url: "https://aac.saavncdn.com/x_160.mp4" }],
    };
    const original = {
      id: "o1",
      name: "Espresso",
      type: "song",
      duration: 175,
      album: { id: "a2", name: "Short n' Sweet", url: null },
      artists: {
        primary: [{ id: "603814", name: "Sabrina Carpenter", role: "primary_artists" }],
        featured: [],
        all: [{ id: "603814", name: "Sabrina Carpenter", role: "singer" }],
      },
      image: [],
      downloadUrl: [{ quality: "160kbps", url: "https://aac.saavncdn.com/x_160.mp4" }],
    };

    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      const ok = (data: unknown) => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data }),
      });
      if (url.pathname.endsWith("/api/artists/603814/songs")) {
        return ok({ total: 0, songs: [] });
      }
      if (url.pathname.endsWith("/api/search/songs")) {
        const page = url.searchParams.get("page");
        if (page === "0") {
          return ok({ total: 80, start: 0, results: [karaoke] });
        }
        return ok({ total: 80, start: 1, results: [original] });
      }
      throw new Error(`Unexpected fetch: ${url.toString()}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getArtistSongs("603814", {
      artistName: "Sabrina Carpenter",
      limit: 10,
    });

    expect(result.songs.map((song) => song.id)).toEqual(["o1"]);
    expect(result.songs[0]?.artists.primary[0]?.name).toBe("Sabrina Carpenter");
    const searchCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/api/search/songs"),
    );
    expect(searchCalls.length).toBeGreaterThan(1);
  });
});
