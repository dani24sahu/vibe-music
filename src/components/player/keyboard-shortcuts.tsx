"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";

export function KeyboardShortcuts() {
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const seek = usePlayerStore((state) => state.seek);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const volume = usePlayerStore((state) => state.volume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.code === "ArrowRight" && event.shiftKey) {
        event.preventDefault();
        next();
      } else if (event.code === "ArrowLeft" && event.shiftKey) {
        event.preventDefault();
        previous();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        seek(Math.min(duration, currentTime + 5));
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        seek(Math.max(0, currentTime - 5));
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        setVolume(volume + 0.05);
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        setVolume(volume - 0.05);
      } else if (event.key.toLowerCase() === "m") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    currentTime,
    duration,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    togglePlay,
    volume,
  ]);

  return null;
}
