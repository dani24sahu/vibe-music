import { apiGet, MusicApiError } from "./client";
import { isBrowserOnline, offlineError, shouldUseCacheFallback } from "@/lib/offline/cache-policy";
import {
  cacheAlbumMetadata,
  cacheArtistMetadata,
  cachePlaylistMetadata,
  cacheSongMetadata,
  getCachedAlbum,
  getCachedArtist,
  getCachedPlaylist,
  getCachedSong,
} from "@/lib/offline/metadata-cache";
import { titlesAreCompatible } from "@/lib/lyrics/title-match";
import {
  cacheLyrics,
  getCachedLyrics,
  shouldReuseCachedLyrics,
} from "@/lib/offline/lyrics-cache";
import type {
  Album,
  AlbumSearchItem,
  Artist,
  ArtistAlbumsPage,
  ArtistSearchItem,
  ArtistSongsPage,
  GlobalSearch,
  Paginated,
  Playlist,
  PlaylistSearchItem,
  Song,
} from "@/types/music";
import type { LyricsQuery, LyricsResult } from "@/types/lyrics";

type FetchOptions = { signal?: AbortSignal; cache?: RequestCache };

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

async function catalogSearch<T>(request: () => Promise<T>): Promise<T> {
  if (!isBrowserOnline()) {
    throw offlineError("You're offline. Connect to search the catalog.");
  }
  try {
    return await request();
  } catch (error) {
    if (isAbortError(error)) throw error;
    if (error instanceof MusicApiError && error.code === "NETWORK_ERROR") {
      throw offlineError("You're offline. Connect to search the catalog.");
    }
    throw error;
  }
}

async function networkFirst<T>(
  request: () => Promise<T>,
  fallback: () => Promise<T | null>,
  remember?: (value: T) => Promise<void> | void,
): Promise<T> {
  try {
    const value = await request();
    if (remember) void remember(value);
    return value;
  } catch (error) {
    if (shouldUseCacheFallback(error)) {
      const cached = await fallback();
      if (cached) return cached;
    }
    throw error;
  }
}

export function searchAll(query: string, options?: FetchOptions) {
  return catalogSearch(() => apiGet<GlobalSearch>("/api/search", { query }, options));
}

export function searchSongs(query: string, page = 0, limit = 20, options?: FetchOptions) {
  return catalogSearch(() =>
    apiGet<Paginated<Song>>("/api/search/songs", { query, page, limit }, options),
  );
}

export function searchAlbums(query: string, page = 0, limit = 20, options?: FetchOptions) {
  return catalogSearch(() =>
    apiGet<Paginated<AlbumSearchItem>>("/api/search/albums", {
      query,
      page,
      limit,
    }, options),
  );
}

export function searchArtists(query: string, page = 0, limit = 20, options?: FetchOptions) {
  return catalogSearch(() =>
    apiGet<Paginated<ArtistSearchItem>>("/api/search/artists", {
      query,
      page,
      limit,
    }, options),
  );
}

export function searchPlaylists(query: string, page = 0, limit = 20, options?: FetchOptions) {
  return catalogSearch(() =>
    apiGet<Paginated<PlaylistSearchItem>>("/api/search/playlists", {
      query,
      page,
      limit,
    }, options),
  );
}

export function getSong(id: string, options?: FetchOptions) {
  return networkFirst(
    () => apiGet<Song>(`/api/songs/${id}`, {}, options),
    () => getCachedSong(id),
    (song) => cacheSongMetadata(song),
  );
}

export function getSuggestions(id: string, limit = 10, options?: FetchOptions) {
  return apiGet<Song[]>(`/api/songs/${id}/suggestions`, { limit }, options);
}

export function getAlbum(id: string, options?: FetchOptions) {
  return networkFirst(
    () => apiGet<Album>(`/api/albums/${id}`, {}, options),
    () => getCachedAlbum(id),
    (album) => cacheAlbumMetadata(album),
  );
}

export function getArtist(id: string, options?: FetchOptions) {
  return networkFirst(
    () => apiGet<Artist>(`/api/artists/${id}`, {}, options),
    () => getCachedArtist(id),
    (artist) => cacheArtistMetadata(artist),
  );
}

export function getArtistSongs(id: string, page = 0, options?: FetchOptions) {
  return apiGet<ArtistSongsPage>(`/api/artists/${id}/songs`, { page }, options);
}

export function getArtistAlbums(id: string, page = 0, options?: FetchOptions) {
  return apiGet<ArtistAlbumsPage>(`/api/artists/${id}/albums`, { page }, options);
}

export function getPlaylist(id: string, options?: FetchOptions) {
  return networkFirst(
    () => apiGet<Playlist>(`/api/playlists/${id}`, {}, options),
    () => getCachedPlaylist(id),
    (playlist) => cachePlaylistMetadata(playlist),
  );
}

export async function getLyrics(query: LyricsQuery, songId?: string, options?: FetchOptions) {
  const cacheKey = songId?.trim() || `${query.title}|${query.artist}`.toLowerCase();
  const cached = await getCachedLyrics(cacheKey);
  const cachedMatchesQuery = Boolean(
    cached &&
      (!cached.result.found ||
        (cached.result.title &&
          titlesAreCompatible(query.title, cached.result.title, query.artist))),
  );
  if (
    cached &&
    cachedMatchesQuery &&
    shouldReuseCachedLyrics(cached.cachedAt, cached.result.found, isBrowserOnline())
  ) {
    return { ...cached.result, songId: cacheKey };
  }

  try {
    const result = await apiGet<LyricsResult>(
      "/api/lyrics",
      {
        title: query.title,
        artist: query.artist,
        album: query.album ?? undefined,
        duration: query.duration ?? undefined,
      },
      { cache: "no-store", signal: options?.signal },
    );
    const matches =
      !result.found ||
      (result.title && titlesAreCompatible(query.title, result.title, query.artist));
    const tagged = matches
      ? { ...result, songId: cacheKey }
      : {
          found: false,
          instrumental: false,
          synced: false,
          source: "lrclib" as const,
          title: null,
          artist: null,
          lines: [],
          songId: cacheKey,
        };
    void cacheLyrics(cacheKey, tagged);
    return tagged;
  } catch (error) {
    if (isAbortError(error)) throw error;
    if (cached && cachedMatchesQuery && shouldUseCacheFallback(error)) {
      return { ...cached.result, songId: cacheKey };
    }
    if (!isBrowserOnline()) {
      throw offlineError("You're offline. Lyrics for this track haven't been cached yet.");
    }
    throw error;
  }
}

export function streamUrl(sourceUrl: string) {
  return `/api/stream?url=${encodeURIComponent(sourceUrl)}`;
}
