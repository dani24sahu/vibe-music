import { useLibraryStore } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";
import type { Song } from "@/types/music";

export function findLocalSong(id: string): Song | null {
  const library = useLibraryStore.getState();
  const player = usePlayerStore.getState();
  const pools: Song[] = [
    ...library.favorites,
    ...library.recentlyPlayed,
    ...library.playlists.flatMap((playlist) => playlist.songs),
    ...player.queue,
    ...player.originalQueue,
  ];
  return pools.find((song) => song.id === id) ?? null;
}

export function localLibrarySongs(): Song[] {
  const library = useLibraryStore.getState();
  const player = usePlayerStore.getState();
  return [
    ...library.favorites,
    ...library.recentlyPlayed,
    ...library.playlists.flatMap((playlist) => playlist.songs),
    ...player.queue,
    ...player.originalQueue,
  ];
}
