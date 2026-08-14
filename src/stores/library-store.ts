import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafePersistStorage, persistedSongs } from "@/lib/persist-storage";
import { displayNameFromStorage } from "@/lib/profile";
import type { Song } from "@/types/music";

export type LocalPlaylist = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  songs: Song[];
};

type LibraryState = {
  displayName: string | null;
  favorites: Song[];
  recentlyPlayed: Song[];
  playlists: LocalPlaylist[];
  hydrated: boolean;
};

type LibraryActions = {
  setHydrated: (value: boolean) => void;
  setDisplayName: (name: string) => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (id: string) => boolean;
  recordPlay: (song: Song) => void;
  createPlaylist: (name: string) => LocalPlaylist;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
};

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  persist(
    (set, get) => ({
      displayName: null,
      favorites: [],
      recentlyPlayed: [],
      playlists: [],
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setDisplayName: (name) => {
        const next = displayNameFromStorage(name);
        if (!next) return;
        set({ displayName: next });
      },
      toggleFavorite: (song) => {
        const exists = get().favorites.some((item) => item.id === song.id);
        set({
          favorites: exists
            ? get().favorites.filter((item) => item.id !== song.id)
            : [song, ...get().favorites],
        });
      },
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
      recordPlay: (song) => {
        set({
          recentlyPlayed: [
            song,
            ...get().recentlyPlayed.filter((item) => item.id !== song.id),
          ].slice(0, 50),
        });
      },
      createPlaylist: (name) => {
        const playlist: LocalPlaylist = {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `playlist-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: name.trim() || "New playlist",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          songs: [],
        };
        set({ playlists: [playlist, ...get().playlists] });
        return playlist;
      },
      renamePlaylist: (id, name) => {
        set({
          playlists: get().playlists.map((playlist) =>
            playlist.id === id
              ? { ...playlist, name: name.trim() || playlist.name, updatedAt: Date.now() }
              : playlist,
          ),
        });
      },
      deletePlaylist: (id) => {
        set({ playlists: get().playlists.filter((playlist) => playlist.id !== id) });
      },
      addToPlaylist: (playlistId, song) => {
        set({
          playlists: get().playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            if (playlist.songs.some((item) => item.id === song.id)) return playlist;
            return {
              ...playlist,
              songs: [...playlist.songs, song],
              updatedAt: Date.now(),
            };
          }),
        });
      },
      removeFromPlaylist: (playlistId, songId) => {
        set({
          playlists: get().playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  songs: playlist.songs.filter((song) => song.id !== songId),
                  updatedAt: Date.now(),
                }
              : playlist,
          ),
        });
      },
    }),
    {
      name: "vibe-library",
      skipHydration: true,
      storage: createSafePersistStorage(),
      version: 2,
      migrate: (persisted) => persisted as LibraryState,
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<LibraryState>;
        const playlists = Array.isArray(stored.playlists)
          ? stored.playlists.flatMap((playlist) => {
              if (!playlist?.id || !playlist.name) return [];
              return [
                {
                  ...playlist,
                  songs: persistedSongs(playlist.songs),
                },
              ];
            })
          : [];
        return {
          ...current,
          ...stored,
          displayName: displayNameFromStorage(stored.displayName),
          favorites: persistedSongs(stored.favorites),
          recentlyPlayed: persistedSongs(stored.recentlyPlayed),
          playlists,
          hydrated: false,
        };
      },
      partialize: (state) => ({
        displayName: state.displayName,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        playlists: state.playlists,
      }),
    },
  ),
);
