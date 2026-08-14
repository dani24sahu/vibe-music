import { describe, expect, it } from "vitest";
import {
  extractArtistSongs,
  pickSongsForArtist,
  songBelongsToArtist,
} from "@/server/saavn/catalog";
import { mapSong } from "@/server/saavn/mappers";
import type { SaavnArtistMap, SaavnSong } from "@/server/saavn/types";

const artist = (
  id: string,
  name: string,
  role?: string,
): SaavnArtistMap => ({
  id,
  name,
  role,
});

const sampleSong = (
  id: string,
  name: string,
  credits: {
    primary?: SaavnArtistMap[];
    featured?: SaavnArtistMap[];
    all?: SaavnArtistMap[];
  },
): SaavnSong => ({
  id,
  name,
  duration: 180,
  album: { id: "a1", name: "Album", url: null },
  artists: {
    primary: credits.primary ?? [],
    featured: credits.featured ?? [],
    all: credits.all ?? [],
  },
  image: [],
  downloadUrl: [{ quality: "160kbps", url: "https://aac.saavncdn.com/x_160.mp4" }],
});

describe("artist catalog extraction", () => {
  it("reads documented results[] as well as songs[]", () => {
    expect(extractArtistSongs({ total: 0, songs: [] })).toEqual([]);
    expect(
      extractArtistSongs({
        total: 1,
        results: [
          sampleSong("s1", "Believer", {
            primary: [artist("599452", "Imagine Dragons")],
          }),
        ],
      }).map((song) => song.name),
    ).toEqual(["Believer"]);
    expect(
      extractArtistSongs({
        songs: [
          sampleSong("s2", "Thunder", {
            primary: [artist("599452", "Imagine Dragons")],
          }),
        ],
      }).map((song) => song.id),
    ).toEqual(["s2"]);
  });

  it("keeps songs where the requested artist is a primary credit", () => {
    const songs = [
      mapSong(
        sampleSong("cover", "Cover", {
          primary: [artist("other", "Tribute Band")],
        }),
      ),
      mapSong(
        sampleSong("hit", "Radioactive", {
          primary: [artist("599452", "Imagine Dragons", "primary_artists")],
          all: [artist("599452", "Imagine Dragons", "singer")],
        }),
      ),
    ];
    expect(pickSongsForArtist(songs, "599452", 10).map((song) => song.id)).toEqual([
      "hit",
    ]);
  });

  it("keeps collaborations where the requested artist is featured as a performer", () => {
    const song = mapSong(
      sampleSong("duet", "On My Own", {
        primary: [artist("111", "Other Star", "primary_artists")],
        featured: [artist("603814", "Sabrina Carpenter", "featured_artists")],
        all: [artist("603814", "Sabrina Carpenter", "singer")],
      }),
    );
    expect(songBelongsToArtist(song, "603814")).toBe(true);
    expect(pickSongsForArtist([song], "603814", 10)).toHaveLength(1);
  });

  it("rejects remixes that list the original artist as featured songwriter only", () => {
    const remix = mapSong(
      sampleSong("r1", "Hard 2 Face Reality (HYPERTECHNO)", {
        primary: [artist("15702852", "HYPERAVE", "primary_artists")],
        featured: [artist("568565", "Justin Bieber", "featured_artists")],
        all: [
          artist("568565", "Justin Bieber", "music"),
          artist("568565", "Justin Bieber", "lyricist"),
        ],
      }),
    );
    expect(songBelongsToArtist(remix, "568565")).toBe(false);
  });

  it("rejects karaoke/cover tracks that only mention the artist in all[] as music", () => {
    const karaoke = mapSong(
      sampleSong(
        "k1",
        "Taste (By Sabrina Carpenter) (Instrumental Karaoke Version)",
        {
          primary: [artist("999", "ZZang KARAOKE", "primary_artists")],
          featured: [],
          all: [
            artist("999", "ZZang KARAOKE", "primary_artists"),
            artist("603814", "Sabrina Carpenter", "music"),
            artist("603814", "Sabrina Carpenter", "lyricist"),
          ],
        },
      ),
    );
    expect(songBelongsToArtist(karaoke, "603814")).toBe(false);
    expect(pickSongsForArtist([karaoke], "603814", 10)).toEqual([]);
  });

  it("does not treat a title that contains the artist name as a catalog match", () => {
    const song = mapSong(
      sampleSong("t1", "Feather (Originally Performed by Sabrina Carpenter)", {
        primary: [artist("888", "Backing Business", "primary_artists")],
        all: [],
      }),
    );
    expect(songBelongsToArtist(song, "603814", "Sabrina Carpenter")).toBe(false);
  });

  it("returns an empty catalog when no search hit credits the artist", () => {
    const songs = [
      mapSong(
        sampleSong("cover", "Cover", {
          primary: [artist("other", "Someone Else")],
        }),
      ),
    ];
    expect(pickSongsForArtist(songs, "599452", 10)).toEqual([]);
  });

  it("keeps singer credits that only appear in artists.all", () => {
    const song = mapSong(
      sampleSong("s1", "Film Song", {
        primary: [artist("composer", "Composer", "primary_artists")],
        all: [
          artist("composer", "Composer", "music"),
          artist("459320", "Arijit Singh", "singer"),
        ],
      }),
    );
    expect(songBelongsToArtist(song, "459320")).toBe(true);
  });
});
