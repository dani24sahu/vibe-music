"use client";

import { activeLyricText, lyricsForSong } from "@/lib/player/lyrics";
import type { LyricsResult } from "@/types/lyrics";

export function NowPlayingLyricLine({
  lyrics,
  songId,
  currentTime,
  onOpen,
}: {
  lyrics?: LyricsResult;
  songId?: string;
  currentTime: number;
  onOpen: () => void;
}) {
  const current = lyricsForSong(lyrics, songId);
  if (!current?.found || current.instrumental || !current.synced) return null;
  const text = activeLyricText(current.lines, currentTime);
  if (!text) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mb-4 w-full px-1 text-center"
      aria-live="polite"
      aria-label="Open full lyrics"
    >
      <span
        key={`${songId}:${text}`}
        className="lyric-swap font-display block text-pretty text-lg font-semibold leading-snug text-white sm:text-xl"
      >
        {text}
      </span>
    </button>
  );
}
