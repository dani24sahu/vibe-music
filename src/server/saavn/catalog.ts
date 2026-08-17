import type { SaavnAlbum, SaavnArtistAlbums, SaavnArtistSongs, SaavnPaginated, SaavnSong } from "./types";
import type { AlbumSearchItem, ArtistRef, Song } from "@/types/music";

export const ARTIST_CATALOG_SEARCH_PAGE_SIZE = 20;
export const ARTIST_CATALOG_MAX_SEARCH_PAGES = 3;

const NON_PERFORMING_ROLES = new Set([
  "music",
  "lyricist",
  "lyrist",
  "composer",
  "starring",
  "director",
  "producer",
  "writer",
  "author",
  "arranger",
]);

type ArtistCreditGroups = {
  primary?: ArtistRef[];
  featured?: ArtistRef[];
  all?: ArtistRef[];
};

export function extractArtistSongs(
  data: SaavnArtistSongs | SaavnPaginated<SaavnSong> | SaavnSong[] | null | undefined,
): SaavnSong[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter((song): song is SaavnSong => Boolean(song?.id && song?.name));
  }
  const fromSongs = "songs" in data ? (data.songs ?? []) : [];
  const fromResults = data.results ?? [];
  const list = fromSongs.length > 0 ? fromSongs : fromResults;
  return list.filter((song): song is SaavnSong => Boolean(song?.id && song?.name));
}

export function extractArtistAlbums(
  data: SaavnArtistAlbums | SaavnPaginated<SaavnAlbum> | SaavnAlbum[] | null | undefined,
): SaavnAlbum[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter((album): album is SaavnAlbum => Boolean(album?.id && album?.name));
  }
  const fromAlbums = "albums" in data ? (data.albums ?? []) : [];
  const fromResults = data.results ?? [];
  const list = fromAlbums.length > 0 ? fromAlbums : fromResults;
  return list.filter((album): album is SaavnAlbum => Boolean(album?.id && album?.name));
}

function normalizeArtistName(value: string | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function artistRefMatches(
  ref: ArtistRef | undefined,
  artistId: string,
  artistName?: string,
) {
  if (!ref) return false;
  if (ref.id != null && String(ref.id).length > 0 && artistId) {
    return String(ref.id) === String(artistId);
  }
  const wanted = normalizeArtistName(artistName);
  const got = normalizeArtistName(ref.name);
  return wanted.length > 0 && got === wanted;
}

function isPerformingRole(role: string | undefined) {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/[\s-]+/g, "_");
  if (NON_PERFORMING_ROLES.has(normalized)) return false;
  return (
    normalized.includes("singer") ||
    normalized.includes("primary") ||
    normalized.includes("featured") ||
    normalized === "artist" ||
    normalized === "performer"
  );
}

function matchingRefs(
  refs: ArtistRef[] | undefined,
  artistId: string,
  artistName?: string,
) {
  return (refs ?? []).filter((ref) => artistRefMatches(ref, artistId, artistName));
}

function featuredIsActualPerformer(
  artists: ArtistCreditGroups,
  artistId: string,
  artistName?: string,
) {
  if (matchingRefs(artists.featured, artistId, artistName).length === 0) return false;
  const allCredits = matchingRefs(artists.all, artistId, artistName);
  // Featured with no `all[]` detail is treated as a real collaboration.
  if (allCredits.length === 0) return true;
  // Remix/cover payloads often list the original artist as featured while `all[]`
  // only has music/lyricist credits. That is not a performing credit.
  return allCredits.some((ref) => isPerformingRole(ref.role));
}

/**
 * A track belongs on an artist's main/popular catalog only when that artist is
 * actually credited as a performer (preferably primary). Composer/lyricist
 * credits in `artists.all` are not enough — karaoke/cover versions use those
 * to name the original artist while another act is the primary performer.
 */
export function songBelongsToArtist(
  song: Pick<Song, "artists">,
  artistId: string,
  artistName?: string,
) {
  return itemBelongsToArtist(song.artists, artistId, artistName);
}

export function albumBelongsToArtist(
  album: Pick<AlbumSearchItem, "artists">,
  artistId: string,
  artistName?: string,
) {
  return itemBelongsToArtist(album.artists, artistId, artistName);
}

function itemBelongsToArtist(
  artists: ArtistCreditGroups | undefined,
  artistId: string,
  artistName?: string,
) {
  if (!artists) return false;
  if (matchingRefs(artists.primary, artistId, artistName).length > 0) return true;
  if (featuredIsActualPerformer(artists, artistId, artistName)) return true;
  return (artists.all ?? []).some(
    (ref) => artistRefMatches(ref, artistId, artistName) && isPerformingRole(ref.role),
  );
}

export function pickSongsForArtist(
  songs: Song[],
  artistId: string,
  limit: number,
  artistName?: string,
) {
  return songs
    .filter((song) => songBelongsToArtist(song, artistId, artistName))
    .slice(0, limit);
}

export function pickAlbumsForArtist(
  albums: AlbumSearchItem[],
  artistId: string,
  limit: number,
  artistName?: string,
) {
  return albums
    .filter((album) => albumBelongsToArtist(album, artistId, artistName))
    .slice(0, limit);
}

export function collectCreditedItems<T extends { id: string }>(
  items: T[],
  collected: T[],
  seen: Set<string>,
  belongs: (item: T) => boolean,
  limit: number,
) {
  for (const item of items) {
    if (collected.length >= limit) break;
    if (!item.id || seen.has(item.id)) continue;
    if (!belongs(item)) continue;
    seen.add(item.id);
    collected.push(item);
  }
  return collected;
}
