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

async function catalogSearch<T>(request: () => Promise<T>): Promise<T> {
  if (!isBrowserOnline()) {
    throw offlineError("You're offline. Connect to search the catalog.");
  }
  try {
    return await request();
  } catch (error) {
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

export function searchAll(query: string) {
  return catalogSearch(() => apiGet<GlobalSearch>("/api/search", { query }));
}

export function searchSongs(query: string, page = 0, limit = 20) {
  return catalogSearch(() =>
    apiGet<Paginated<Song>>("/api/search/songs", { query, page, limit }),
  );
}

export function searchAlbums(query: string, page = 0, limit = 20) {
  return catalogSearch(() =>
    apiGet<Paginated<AlbumSearchItem>>("/api/search/albums", {
      query,
      page,
      limit,
    }),
  );
}

export function searchArtists(query: string, page = 0, limit = 20) {
  return catalogSearch(() =>
    apiGet<Paginated<ArtistSearchItem>>("/api/search/artists", {
      query,
      page,
      limit,
    }),
  );
}

export function searchPlaylists(query: string, page = 0, limit = 20) {
  return catalogSearch(() =>
    apiGet<Paginated<PlaylistSearchItem>>("/api/search/playlists", {
      query,
      page,
      limit,
    }),
  );
}

export function getSong(id: string) {
  return networkFirst(
    () => apiGet<Song>(`/api/songs/${id}`),
    () => getCachedSong(id),
    (song) => cacheSongMetadata(song),
  );
}

export function getSuggestions(id: string, limit = 10) {
  return apiGet<Song[]>(`/api/songs/${id}/suggestions`, { limit });
}

export function getAlbum(id: string) {
  return networkFirst(
    () => apiGet<Album>(`/api/albums/${id}`),
    () => getCachedAlbum(id),
    (album) => cacheAlbumMetadata(album),
  );
}

export function getArtist(id: string) {
  return networkFirst(
    () => apiGet<Artist>(`/api/artists/${id}`),
    () => getCachedArtist(id),
    (artist) => cacheArtistMetadata(artist),
  );
}

export function getArtistSongs(id: string, page = 0) {
  return apiGet<ArtistSongsPage>(`/api/artists/${id}/songs`, { page });
}

export function getArtistAlbums(id: string, page = 0) {
  return apiGet<ArtistAlbumsPage>(`/api/artists/${id}/albums`, { page });
}

export function getPlaylist(id: string) {
  return networkFirst(
    () => apiGet<Playlist>(`/api/playlists/${id}`),
    () => getCachedPlaylist(id),
    (playlist) => cachePlaylistMetadata(playlist),
  );
}

export async function getLyrics(query: LyricsQuery, songId?: string) {
  const cacheKey = songId?.trim() || `${query.title}|${query.artist}`.toLowerCase();
  const cached = await getCachedLyrics(cacheKey);
  if (
    cached &&
    shouldReuseCachedLyrics(cached.cachedAt, cached.result.found, isBrowserOnline())
  ) {
    return cached.result;
  }

  try {
    const result = await apiGet<LyricsResult>("/api/lyrics", {
      title: query.title,
      artist: query.artist,
      album: query.album ?? undefined,
      duration: query.duration ?? undefined,
    });
    void cacheLyrics(cacheKey, result);
    return result;
  } catch (error) {
    if (cached && shouldUseCacheFallback(error)) return cached.result;
    if (!isBrowserOnline()) {
      throw offlineError("You're offline. Lyrics for this track haven't been cached yet.");
    }
    throw error;
  }
}

export function streamUrl(sourceUrl: string) {
  return `/api/stream?url=${encodeURIComponent(sourceUrl)}`;
}
