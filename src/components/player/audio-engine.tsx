"use client";

import { useEffect, useRef } from "react";
import { getSong } from "@/lib/api/music";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useMediaSession } from "@/hooks/use-media-session";
import { cacheSongMetadata } from "@/lib/offline/metadata-cache";
import { isBrowserOnline } from "@/lib/offline/cache-policy";
import {
  canPlayAudioSource,
  resolveAudioSource,
} from "@/lib/player/audio-source";
import { currentSong, usePlayerStore } from "@/stores/player-store";
import { useLibraryStore } from "@/stores/library-store";

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeRef = useRef(0);
  const songIdRef = useRef<string | undefined>(undefined);
  const song = usePlayerStore(currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const preferredQuality = usePlayerStore((state) => state.preferredQuality);
  const next = usePlayerStore((state) => state.next);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setBuffering = usePlayerStore((state) => state.setBuffering);
  const setError = usePlayerStore((state) => state.setError);
  const replaceCurrent = usePlayerStore((state) => state.replaceCurrent);
  const recordPlay = useLibraryStore((state) => state.recordPlay);
  const online = useOnlineStatus();
  const audioSource = resolveAudioSource(song, preferredQuality);
  const src = canPlayAudioSource(audioSource, online) ? audioSource.url : null;
  useMediaSession();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      timeRef.current = audio.currentTime;
      setCurrentTime(audio.currentTime);
    };
    const onDuration = () => {
      const nextDuration = audio.duration;
      setDuration(Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : 0);
    };
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onEnded = () => next();
    const onError = () =>
      setError("This track couldn’t be played. It may be unavailable.");

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [next, setBuffering, setCurrentTime, setDuration, setError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audio.readyState < 1) return;
    if (Math.abs(audio.currentTime - currentTime) > 1.25) {
      try {
        audio.currentTime = currentTime;
      } catch {
        // Some browsers throw if currentTime is set before the media is ready.
      }
    }
  }, [currentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    const songChanged = songIdRef.current !== song?.id;
    const resumeAt = songChanged ? 0 : timeRef.current;
    songIdRef.current = song?.id;

    const restore = () => {
      if (
        resumeAt > 0.4 &&
        Number.isFinite(audio.duration) &&
        resumeAt < audio.duration
      ) {
        audio.currentTime = resumeAt;
      }
    };

    if (audio.readyState >= 1) restore();
    audio.addEventListener("loadedmetadata", restore);
    return () => audio.removeEventListener("loadedmetadata", restore);
  }, [src, song?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (isPlaying) {
      void audio.play().catch(() => {
        setError("Playback was blocked. Press play to start audio.");
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, src, setError]);

  useEffect(() => {
    if (!song) return;
    recordPlay(song);
    void cacheSongMetadata(song);
  }, [recordPlay, song]);

  useEffect(() => {
    if (!song || online || audioSource.offlineAvailable) return;
    setError("You're offline — streaming needs a connection.");
  }, [audioSource.offlineAvailable, online, setError, song]);

  useEffect(() => {
    if (!song || (song.playbackSources?.length ?? 0) > 0) return;
    if (!isBrowserOnline()) return;
    void getSong(song.id)
      .then((full) => replaceCurrent(full))
      .catch(() => setError("Could not load a playable version of this track."));
  }, [replaceCurrent, setError, song]);

  return <audio ref={audioRef} src={src ?? undefined} preload="metadata" />;
}
