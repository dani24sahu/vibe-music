"use client";

import { useEffect } from "react";
import { bestArtwork, primaryArtistName } from "@/lib/format";
import {
  mediaSessionArtwork,
  mediaSessionTitle,
} from "@/lib/player/media-session";
import { currentSong, usePlayerStore } from "@/stores/player-store";

const APP_TITLE = "Vibe | personal music player";

export function useMediaSession() {
  const song = usePlayerStore(currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const seek = usePlayerStore((state) => state.seek);
  const pause = usePlayerStore((state) => state.pause);
  const reportedTime = Math.floor(currentTime);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (!song) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      document.title = APP_TITLE;
      return;
    }

    const artist = primaryArtistName(song);
    const info = mediaSessionTitle(song, artist);
    const origin = window.location.origin;
    const artwork = mediaSessionArtwork(song.image, origin);
    const fallback = bestArtwork(song.image, "lg");
    if (fallback && artwork.length === 0) {
      artwork.push({
        src: fallback,
        sizes: "512x512",
        type: "image/jpeg",
      });
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: info.title,
      artist: info.artist,
      album: info.album,
      artwork,
    });
    document.title = `${info.title} · ${info.artist}`;
  }, [song]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = song
      ? isPlaying
        ? "playing"
        : "paused"
      : "none";
  }, [isPlaying, song]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !song) return;
    const total =
      Number.isFinite(duration) && duration > 0 ? duration : (song.duration ?? 0);
    if (!Number.isFinite(total) || total <= 0) return;
    const position = Math.min(Math.max(reportedTime, 0), total);
    try {
      navigator.mediaSession.setPositionState({
        duration: total,
        playbackRate: 1,
        position,
      });
    } catch {
      // Some browsers throw if position is out of range during track changes.
    }
  }, [duration, isPlaying, reportedTime, song]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      if (!usePlayerStore.getState().isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const offset = details.seekOffset ?? 10;
      const { currentTime: time } = usePlayerStore.getState();
      seek(Math.max(0, time - offset));
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const offset = details.seekOffset ?? 10;
      const state = usePlayerStore.getState();
      const nextTime = state.currentTime + offset;
      const total = state.duration;
      seek(Number.isFinite(total) && total > 0 ? Math.min(nextTime, total) : nextTime);
    });
    navigator.mediaSession.setActionHandler("stop", () => pause());

    return () => {
      for (const action of [
        "play",
        "pause",
        "previoustrack",
        "nexttrack",
        "seekto",
        "seekbackward",
        "seekforward",
        "stop",
      ] as const) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // ignore unsupported actions
        }
      }
    };
  }, [next, pause, previous, seek, togglePlay]);
}
