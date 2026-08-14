import { createJSONStorage, type StateStorage } from "zustand/middleware";
import type { Song } from "@/types/music";

function browserStorage(): StateStorage {
  return {
    getItem: (name) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        // Private mode and quota errors must not crash playback or library writes.
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}

export function createSafePersistStorage() {
  return createJSONStorage(browserStorage);
}

export function isPersistedSong(value: unknown): value is Song {
  if (!value || typeof value !== "object") return false;
  const song = value as Partial<Song>;
  return Boolean(
    song.id &&
      song.name &&
      song.artists &&
      Array.isArray(song.artists.primary) &&
      Array.isArray(song.image) &&
      Array.isArray(song.playbackSources) &&
      song.album &&
      typeof song.album === "object",
  );
}

export function persistedSongs(value: unknown): Song[] {
  return Array.isArray(value) ? value.filter(isPersistedSong) : [];
}
