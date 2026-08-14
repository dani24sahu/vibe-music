"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Artwork } from "@/components/media/artwork";
import { Equalizer } from "@/components/media/equalizer";
import { AudioQualitySelector } from "@/components/player/audio-quality-selector";
import { QueueSheet } from "@/components/player/queue-sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime, primaryArtistName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/stores/library-store";
import { currentSong, usePlayerStore } from "@/stores/player-store";

export function PlayerBar() {
  const song = usePlayerStore(currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeat = usePlayerStore((state) => state.repeat);
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const error = usePlayerStore((state) => state.error);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const seek = usePlayerStore((state) => state.seek);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);
  const isFavorite = useLibraryStore((state) =>
    song ? state.favorites.some((item) => item.id === song.id) : false,
  );
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const [queueOpen, setQueueOpen] = useState(false);

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-[var(--mobile-nav-offset)] z-50 px-3 lg:px-4 lg:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto glass-panel mx-auto max-w-6xl overflow-hidden rounded-2xl shadow-2xl lg:rounded-[1.8rem]">
        {error ? (
          <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-1 text-center text-xs text-destructive">
            {error}
          </p>
        ) : null}
        <div className="px-2 pt-1 lg:px-4 lg:pt-2">
          <div className="flex items-center gap-2">
            <span className="hidden w-10 text-right text-[11px] tabular-nums text-muted-foreground sm:block">
              {formatTime(currentTime)}
            </span>
            <Slider
              min={0}
              max={Math.max(duration || (song?.duration ?? 0), 1)}
              value={[currentTime]}
              onValueChange={(value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                seek(Number(nextValue ?? 0));
              }}
              disabled={!song}
              aria-label="Seek"
            />
            <span className="hidden w-10 text-[11px] tabular-nums text-muted-foreground sm:block">
              {formatTime(duration || song?.duration || 0)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 px-2 py-1.5 sm:gap-2 lg:grid-cols-[1.1fr_auto_1fr] lg:px-4 lg:py-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/now-playing"
              className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
              aria-label={song ? `Open now playing: ${song.name}` : "Open now playing"}
            >
              <div className={cn("relative shrink-0", isPlaying && "play-glow rounded-xl")}>
                <Artwork
                  images={song?.image ?? []}
                  alt={song?.name ?? "No track"}
                  size="sm"
                  rounded="rounded-xl"
                  className={cn(
                    "size-10 transition-transform duration-500 sm:size-12 lg:size-14",
                    isPlaying && "scale-[1.02]",
                  )}
                />
                {isPlaying ? (
                  <span className="absolute inset-0 flex items-end justify-end p-1">
                    <Equalizer className="rounded bg-black/40 p-1 text-white" />
                  </span>
                ) : null}
              </div>
              <div className="min-w-0">
                {song ? (
                  <>
                    <p className="truncate text-sm font-semibold">{song.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {primaryArtistName(song)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold">nothing playing</p>
                    <p className="text-xs text-muted-foreground">pick a track</p>
                  </>
                )}
              </div>
            </Link>
            {song ? (
              <Button
                size="icon-sm"
                variant="ghost"
                className="hidden rounded-full sm:inline-flex"
                aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                onClick={() => toggleFavorite(song)}
              >
                <Heart
                  className={cn(
                    "size-4 transition-transform",
                    isFavorite && "fill-hot text-hot scale-110",
                  )}
                />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-0.5 sm:justify-center sm:gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Shuffle"
              aria-pressed={shuffle}
              onClick={toggleShuffle}
              className={cn("hidden rounded-full sm:inline-flex", shuffle && "text-primary")}
            >
              <Shuffle className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hidden rounded-full sm:inline-flex"
              aria-label="Previous"
              onClick={previous}
              disabled={!song}
            >
              <SkipBack className="size-4 fill-current" />
            </Button>
            <Button
              size="icon"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              disabled={!song}
              className="size-9 rounded-full shadow-lg shadow-primary/25 sm:size-11 lg:size-12"
            >
              {isPlaying ? (
                <Pause className="size-4 fill-current sm:size-5" />
              ) : (
                <Play className="size-4 fill-current sm:size-5" />
              )}
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full sm:size-8"
              aria-label="Next"
              onClick={next}
              disabled={!song}
            >
              <SkipForward className="size-4 fill-current" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full lg:hidden"
              aria-label="Open queue"
              onClick={() => setQueueOpen(true)}
            >
              <ListMusic className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Repeat ${repeat}`}
              onClick={cycleRepeatMode}
              className={cn("hidden rounded-full sm:inline-flex", repeat !== "off" && "text-primary")}
            >
              <RepeatIcon className="size-4" />
            </Button>
            <div className="lg:hidden">
              <AudioQualitySelector compact sources={song?.playbackSources ?? []} />
            </div>
          </div>

          <div className="hidden items-center justify-end gap-2 lg:flex">
            {isBuffering ? (
              <span className="text-[11px] text-muted-foreground">loading…</span>
            ) : null}
            <AudioQualitySelector sources={song?.playbackSources ?? []} />
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label="Open queue"
              onClick={() => setQueueOpen(true)}
            >
              <ListMusic className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={toggleMute}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
            <Slider
              className="w-24"
              min={0}
              max={1}
              step={0.01}
              value={[muted ? 0 : volume]}
              onValueChange={(value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                setVolume(Number(nextValue ?? 0));
              }}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
      <QueueSheet open={queueOpen} onOpenChange={setQueueOpen} />
    </footer>
  );
}
