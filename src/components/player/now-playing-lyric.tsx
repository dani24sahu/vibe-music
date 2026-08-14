"use client";

import { activeLyricText } from "@/lib/player/lyrics";
import type { LyricsResult } from "@/types/lyrics";

export function NowPlayingLyricLine({
  lyrics,
  currentTime,
  onOpen,
}: {
  lyrics?: LyricsResult;
  currentTime: number;
  onOpen: () => void;
}) {
  if (!lyrics?.found || lyrics.instrumental || !lyrics.synced) return null;
  const text = activeLyricText(lyrics.lines, currentTime);
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
        key={text}
        className="lyric-swap font-display block text-pretty text-lg font-semibold leading-snug text-white sm:text-xl"
      >
        {text}
      </span>
    </button>
  );
}
