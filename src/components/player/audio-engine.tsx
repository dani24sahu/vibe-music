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
import { applyEqGains, createEqFilters, type EqGains } from "@/lib/player/eq";
import { currentSong, usePlayerStore } from "@/stores/player-store";
import { useLibraryStore } from "@/stores/library-store";

type EqGraph = {
  ctx: AudioContext;
  filters: BiquadFilterNode[];
  gain: GainNode;
};

const eqGraphs = new WeakMap<HTMLAudioElement, EqGraph>();

function audioContextCtor() {
  const scoped = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? scoped.webkitAudioContext;
}

function connectEqGraph(audio: HTMLAudioElement): EqGraph | null {
  const existing = eqGraphs.get(audio);
  if (existing && existing.ctx.state !== "closed") return existing;

  const Ctx = audioContextCtor();
  if (!Ctx) return null;

  try {
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(audio);
    const filters = createEqFilters(ctx);
    const gain = ctx.createGain();
    const first = filters[0];
    const last = filters[filters.length - 1];
    if (!first || !last) {
      void ctx.close();
      return null;
    }
    source.connect(first);
    for (let index = 0; index < filters.length - 1; index += 1) {
      filters[index]?.connect(filters[index + 1]!);
    }
    last.connect(gain);
    gain.connect(ctx.destination);
    const graph = { ctx, filters, gain };
    eqGraphs.set(audio, graph);
    return graph;
  } catch {
    return existing ?? null;
  }
}

function applyGraphVolume(graph: EqGraph | null, volume: number, muted: boolean) {
  if (!graph) return;
  graph.gain.gain.value = muted ? 0 : volume;
}

function applyGraphEq(graph: EqGraph | null, gains: EqGains) {
  if (!graph) return;
  applyEqGains(graph.filters, gains, graph.ctx);
}

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeRef = useRef(0);
  const songIdRef = useRef<string | undefined>(undefined);
  const playingIdRef = useRef<string | undefined>(undefined);
  const song = usePlayerStore(currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const eqGains = usePlayerStore((state) => state.eqGains);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const graphRef = useRef<EqGraph | null>(null);
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
  playingIdRef.current = song?.id;
  useMediaSession();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (songIdRef.current !== playingIdRef.current) return;
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
    if (songIdRef.current !== playingIdRef.current) return;
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
    const graph = connectEqGraph(audio);
    graphRef.current = graph;
    if (!graph) return;
    audio.volume = 1;
    audio.muted = false;
    const state = usePlayerStore.getState();
    applyGraphVolume(graph, state.volume, state.muted);
    applyGraphEq(graph, state.eqGains);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const graph = graphRef.current;
    if (!audio) return;
    if (graph) {
      audio.volume = 1;
      audio.muted = false;
      applyGraphVolume(graph, volume, muted);
      return;
    }
    audio.volume = volume;
    audio.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    applyGraphEq(graphRef.current, eqGains);
  }, [eqGains]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    const songChanged = songIdRef.current !== song?.id;
    const resumeAt = songChanged ? 0 : timeRef.current;
    if (songChanged) timeRef.current = 0;
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
      void graphRef.current?.ctx.resume();
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
