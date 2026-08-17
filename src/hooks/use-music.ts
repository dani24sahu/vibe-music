"use client";

import { useQuery } from "@tanstack/react-query";
import * as musicApi from "@/lib/api/music";
import { shouldUseCacheFallback } from "@/lib/offline/cache-policy";
import { findLocalSong } from "@/lib/offline/local-library";
import { shouldRetryQuery } from "@/lib/api/retry";
import { queryKeys } from "@/lib/query-keys";

export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchAll(query),
    queryFn: ({ signal }) => musicApi.searchAll(query, { signal }),
    enabled: enabled && query.length > 0,
    staleTime: 60_000,
    retry: shouldRetryQuery,
  });
}

export function useSongSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchSongs(query),
    queryFn: ({ signal }) => musicApi.searchSongs(query, 0, 20, { signal }),
    enabled: enabled && query.length > 0,
    staleTime: 60_000,
    retry: shouldRetryQuery,
  });
}

export function useAlbumSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchAlbums(query),
    queryFn: ({ signal }) => musicApi.searchAlbums(query, 0, 20, { signal }),
    enabled: enabled && query.length > 0,
    staleTime: 60_000,
    retry: shouldRetryQuery,
  });
}

export function useArtistSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchArtists(query),
    queryFn: ({ signal }) => musicApi.searchArtists(query, 0, 20, { signal }),
    enabled: enabled && query.length > 0,
    staleTime: 60_000,
    retry: shouldRetryQuery,
  });
}

export function usePlaylistSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchPlaylists(query),
    queryFn: ({ signal }) => musicApi.searchPlaylists(query, 0, 20, { signal }),
    enabled: enabled && query.length > 0,
    staleTime: 60_000,
    retry: shouldRetryQuery,
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: queryKeys.song(id),
    queryFn: async ({ signal }) => {
      try {
        return await musicApi.getSong(id, { signal });
      } catch (error) {
        if (shouldUseCacheFallback(error)) {
          const local = findLocalSong(id);
          if (local) return local;
        }
        throw error;
      }
    },
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: shouldRetryQuery,
  });
}

export function useSuggestions(id: string) {
  return useQuery({
    queryKey: queryKeys.suggestions(id),
    queryFn: ({ signal }) => musicApi.getSuggestions(id, 10, { signal }),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: 0,
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: queryKeys.album(id),
    queryFn: ({ signal }) => musicApi.getAlbum(id, { signal }),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: shouldRetryQuery,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: queryKeys.artist(id),
    queryFn: ({ signal }) => musicApi.getArtist(id, { signal }),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: shouldRetryQuery,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: queryKeys.playlist(id),
    queryFn: ({ signal }) => musicApi.getPlaylist(id, { signal }),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: shouldRetryQuery,
  });
}

export function useLyrics(song: {
  id: string;
  name: string;
  artist: string;
  album?: string | null;
  duration?: number | null;
} | null) {
  return useQuery({
    queryKey: queryKeys.lyrics(
      song ?? { id: "__idle__", name: "", artist: "" },
    ),
    queryFn: ({ queryKey, signal }) => {
      const [, id, name, artist, album, duration] = queryKey;
      return musicApi.getLyrics(
        {
          title: name,
          artist,
          album: album || null,
          duration: typeof duration === "number" ? duration : null,
        },
        id,
        { signal },
      );
    },
    enabled: Boolean(song?.id && song.name && song.artist),
    staleTime: 30 * 60_000,
    retry: shouldRetryQuery,
    placeholderData: undefined,
  });
}
