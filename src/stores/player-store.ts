import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveAudioSource } from "@/lib/player/audio-source";
import { createSafePersistStorage, persistedSongs } from "@/lib/persist-storage";
import {
  cycleRepeat,
  nextIndex,
  previousIndex,
  shuffledWithCurrentFirst,
} from "@/lib/player/queue";
import type { RepeatMode, Song } from "@/types/music";

type PlayerState = {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  error: string | null;
  preferredQuality: string | null;
  hydrated: boolean;
};

type PlayerActions = {
  setHydrated: (value: boolean) => void;
  playSong: (song: Song, queue?: Song[]) => void;
  playAt: (index: number) => void;
  togglePlay: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffering: (value: boolean) => void;
  setError: (message: string | null) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setPreferredQuality: (quality: string) => void;
  replaceCurrent: (song: Song) => void;
};

export type PlayerStore = PlayerState & PlayerActions;

const initialState: PlayerState = {
  queue: [],
  originalQueue: [],
  currentIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: "off",
  volume: 0.8,
  muted: false,
  currentTime: 0,
  duration: 0,
  isBuffering: false,
  error: null,
  preferredQuality: null,
  hydrated: false,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setHydrated: (value) => set({ hydrated: value }),
      playSong: (song, queue) => {
        const nextQueue = queue && queue.length > 0 ? queue : [song];
        const index = Math.max(
          0,
          nextQueue.findIndex((item) => item.id === song.id),
        );
        const ordered = get().shuffle
          ? shuffledWithCurrentFirst(nextQueue, index)
          : nextQueue;
        set({
          queue: ordered,
          originalQueue: nextQueue,
          currentIndex: get().shuffle ? 0 : index === -1 ? 0 : index,
          isPlaying: true,
          currentTime: 0,
          duration: song.duration ?? 0,
          error: null,
        });
      },
      playAt: (index) => {
        if (index < 0 || index >= get().queue.length) return;
        const nextSong = get().queue[index];
        set({
          currentIndex: index,
          isPlaying: true,
          currentTime: 0,
          duration: nextSong?.duration ?? 0,
          error: null,
        });
      },
      togglePlay: () => {
        if (get().queue.length === 0) return;
        set({ isPlaying: !get().isPlaying });
      },
      pause: () => set({ isPlaying: false }),
      next: () => {
        const { queue, currentIndex, repeat } = get();
        const upcoming = nextIndex(currentIndex, queue.length, repeat);
        if (upcoming === null) {
          set({ isPlaying: false });
          return;
        }
        set({
          currentIndex: upcoming,
          currentTime: 0,
          duration: queue[upcoming]?.duration ?? 0,
          isPlaying: true,
          error: null,
        });
      },
      previous: () => {
        const { queue, currentIndex, currentTime } = get();
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        const previous = previousIndex(currentIndex, queue.length);
        if (previous === null) return;
        set({
          currentIndex: previous,
          currentTime: 0,
          duration: get().queue[previous]?.duration ?? 0,
          isPlaying: true,
          error: null,
        });
      },
      seek: (time) => set({ currentTime: time }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setBuffering: (value) => set({ isBuffering: value }),
      setError: (message) => set({ error: message, isPlaying: message ? false : get().isPlaying }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)), muted: volume === 0 }),
      toggleMute: () => set({ muted: !get().muted }),
      toggleShuffle: () => {
        const { shuffle, queue, currentIndex, originalQueue } = get();
        if (!shuffle) {
          const source = originalQueue.length > 0 ? originalQueue : queue;
          const currentId = queue[currentIndex]?.id;
          const sourceIndex = Math.max(
            0,
            source.findIndex((song) => song.id === currentId),
          );
          set({
            shuffle: true,
            originalQueue: source,
            queue: shuffledWithCurrentFirst(source, sourceIndex),
            currentIndex: 0,
          });
          return;
        }
        const currentId = queue[currentIndex]?.id;
        const restored = originalQueue.length > 0 ? originalQueue : queue;
        const restoredIndex = Math.max(
          0,
          restored.findIndex((song) => song.id === currentId),
        );
        set({
          shuffle: false,
          queue: restored,
          currentIndex: restoredIndex,
        });
      },
      cycleRepeatMode: () => set({ repeat: cycleRepeat(get().repeat) }),
      addToQueue: (song) => {
        const exists = get().queue.some((item) => item.id === song.id);
        if (exists) return;
        set({
          queue: [...get().queue, song],
          originalQueue: [...get().originalQueue, song],
        });
      },
      removeFromQueue: (index) => {
        const queue = get().queue.filter((_, itemIndex) => itemIndex !== index);
        const currentIndex =
          index < get().currentIndex
            ? get().currentIndex - 1
            : index === get().currentIndex
              ? Math.min(get().currentIndex, Math.max(queue.length - 1, 0))
              : get().currentIndex;
        set({
          queue,
          originalQueue: queue,
          currentIndex,
          isPlaying: queue.length > 0 ? get().isPlaying : false,
        });
      },
      clearQueue: () =>
        set({
          queue: [],
          originalQueue: [],
          currentIndex: 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        }),
      replaceCurrent: (song) => {
        const queue = [...get().queue];
        queue[get().currentIndex] = song;
        set({ queue, error: null });
      },
      setPreferredQuality: (quality) => set({ preferredQuality: quality }),
    }),
    {
      name: "vibe-player",
      skipHydration: true,
      storage: createSafePersistStorage(),
      version: 1,
      migrate: (persisted) => persisted as PlayerState,
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PlayerState>;
        const queue = persistedSongs(stored.queue);
        const originalQueue = persistedSongs(stored.originalQueue);
        const currentIndex = Math.min(
          Math.max(0, stored.currentIndex ?? 0),
          Math.max(queue.length - 1, 0),
        );
        return {
          ...current,
          ...stored,
          queue,
          originalQueue,
          currentIndex,
          hydrated: false,
        };
      },
      partialize: (state) => ({
        queue: state.queue,
        originalQueue: state.originalQueue,
        currentIndex: state.currentIndex,
        shuffle: state.shuffle,
        repeat: state.repeat,
        volume: state.volume,
        muted: state.muted,
        preferredQuality: state.preferredQuality,
      }),
    },
  ),
);

export function currentSong(state: PlayerState) {
  return state.queue[state.currentIndex] ?? null;
}

export function currentStreamSrc(song: Song | null, preferredQuality?: string | null) {
  return resolveAudioSource(song, preferredQuality).url;
}
