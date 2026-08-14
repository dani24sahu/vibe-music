"use client";

import { useQuery } from "@tanstack/react-query";
import * as musicApi from "@/lib/api/music";
import { shouldUseCacheFallback } from "@/lib/offline/cache-policy";
import { findLocalSong } from "@/lib/offline/local-library";
import { queryKeys } from "@/lib/query-keys";

const searchOptions = {
  enabled: false as boolean,
  staleTime: 60_000,
  retry: 1,
};

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.searchAll(query),
    queryFn: () => musicApi.searchAll(query),
    enabled: query.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useSongSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.searchSongs(query),
    queryFn: () => musicApi.searchSongs(query),
    enabled: query.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAlbumSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.searchAlbums(query),
    queryFn: () => musicApi.searchAlbums(query),
    ...searchOptions,
    enabled: query.length > 0,
  });
}

export function useArtistSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.searchArtists(query),
    queryFn: () => musicApi.searchArtists(query),
    enabled: query.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function usePlaylistSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.searchPlaylists(query),
    queryFn: () => musicApi.searchPlaylists(query),
    enabled: query.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: queryKeys.song(id),
    queryFn: async () => {
      try {
        return await musicApi.getSong(id);
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
    retry: 1,
  });
}

export function useSuggestions(id: string) {
  return useQuery({
    queryKey: queryKeys.suggestions(id),
    queryFn: () => musicApi.getSuggestions(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: 0,
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: queryKeys.album(id),
    queryFn: () => musicApi.getAlbum(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: queryKeys.artist(id),
    queryFn: () => musicApi.getArtist(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: queryKeys.playlist(id),
    queryFn: () => musicApi.getPlaylist(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    retry: 1,
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
    queryFn: ({ queryKey }) => {
      const [, id, name, artist, album, duration] = queryKey;
      return musicApi.getLyrics(
        {
          title: name,
          artist,
          album: album || null,
          duration: typeof duration === "number" ? duration : null,
        },
        id,
      );
    },
    enabled: Boolean(song?.id && song.name && song.artist),
    staleTime: 30 * 60_000,
    retry: 1,
    placeholderData: undefined,
  });
}
