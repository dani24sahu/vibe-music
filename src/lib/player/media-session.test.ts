import { describe, expect, it } from "vitest";
import { mediaSessionArtwork, mediaSessionTitle } from "@/lib/player/media-session";

const images = [
  { quality: "50x50", url: "https://c.saavncdn.com/cover_50.jpg" },
  { quality: "150x150", url: "https://c.saavncdn.com/cover_150.jpg" },
  { quality: "500x500", url: "https://c.saavncdn.com/cover_500.jpg" },
];

describe("media session metadata", () => {
  it("maps cover sizes for lock-screen artwork", () => {
    const artwork = mediaSessionArtwork(images);
    expect(artwork).toEqual([
      { src: "https://c.saavncdn.com/cover_50.jpg", sizes: "96x96", type: "image/jpeg" },
      { src: "https://c.saavncdn.com/cover_150.jpg", sizes: "256x256", type: "image/jpeg" },
      { src: "https://c.saavncdn.com/cover_500.jpg", sizes: "512x512", type: "image/jpeg" },
    ]);
  });

  it("uses the song name instead of the app title", () => {
    expect(
      mediaSessionTitle(
        {
          name: "Espresso",
          album: { id: "1", name: "Short n' Sweet", url: null },
          artists: { primary: [], featured: [], all: [] },
        },
        "Sabrina Carpenter",
      ),
    ).toEqual({
      title: "Espresso",
      artist: "Sabrina Carpenter",
      album: "Short n' Sweet",
    });
  });
});
