"use client";

import { useMemo, useRef, useState } from "react";
import { getSuggestions } from "@/lib/api/music";
import { isBrowserOnline } from "@/lib/offline/cache-policy";
import { fisherYatesShuffle } from "@/lib/player/queue";
import {
  STATION_MAX_TRACKS,
  STATION_SUGGESTION_LIMIT,
  STATION_SUGGESTION_SEEDS,
  buildStationPlan,
  mergeStationQueue,
} from "@/lib/player/station";
import { usePlayback } from "@/hooks/use-playback";
import { useLibraryStore } from "@/stores/library-store";
import type { Song } from "@/types/music";

async function nearbyTracks(seeds: Song[]): Promise<Song[][]> {
  const results = await Promise.allSettled(
    seeds
      .slice(0, STATION_SUGGESTION_SEEDS)
      .map((seed) => getSuggestions(seed.id, STATION_SUGGESTION_LIMIT)),
  );
  return results.map((result) => (result.status === "fulfilled" ? result.value : []));
}

function queueWithFamiliarStart(songs: Song[]) {
  const first = songs[0];
  if (!first || songs.length === 1) return songs;
  return [first, ...fisherYatesShuffle(songs.slice(1))];
}

export function useTonightStation() {
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);
  const favorites = useLibraryStore((state) => state.favorites);
  const playlists = useLibraryStore((state) => state.playlists);
  const { play } = usePlayback();
  const [starting, setStarting] = useState(false);
  const playGeneration = useRef(0);

  const plan = useMemo(
    () => buildStationPlan({ recentlyPlayed, favorites, playlists }),
    [favorites, playlists, recentlyPlayed],
  );

  async function playStation() {
    if (!plan.canPlay || plan.seeds.length === 0) return;
    const generation = playGeneration.current + 1;
    playGeneration.current = generation;
    setStarting(true);
    try {
      const related = isBrowserOnline() ? await nearbyTracks(plan.seeds) : [];
      if (generation !== playGeneration.current) return;
      const queue = queueWithFamiliarStart(
        mergeStationQueue(plan.seeds, related, {
          language: plan.language,
          max: STATION_MAX_TRACKS,
        }),
      );
      const first = queue[0];
      if (!first) return;
      await play(first, queue);
    } finally {
      if (generation === playGeneration.current) setStarting(false);
    }
  }

  return { plan, playStation, starting };
}
