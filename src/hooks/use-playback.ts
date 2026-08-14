"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getSong } from "@/lib/api/music";
import { queryKeys } from "@/lib/query-keys";
import { useLibraryStore } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";
import type { Song } from "@/types/music";

async function ensurePlayable(song: Song, queryClient: ReturnType<typeof useQueryClient>) {
  if ((song.playbackSources?.length ?? 0) > 0) return song;
  try {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.song(song.id),
      queryFn: () => getSong(song.id),
    });
  } catch {
    return song;
  }
}

export function usePlayback() {
  const queryClient = useQueryClient();
  const playSong = usePlayerStore((state) => state.playSong);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const recordPlay = useLibraryStore((state) => state.recordPlay);

  return {
    play: async (song: Song, queue?: Song[]) => {
      const playable = await ensurePlayable(song, queryClient);
      const playableQueue = queue
        ? await Promise.all(queue.map((item) => ensurePlayable(item, queryClient)))
        : [playable];
      playSong(playable, playableQueue);
      recordPlay(playable);
    },
    queueSong: async (song: Song) => {
      const playable = await ensurePlayable(song, queryClient);
      addToQueue(playable);
    },
  };
}
