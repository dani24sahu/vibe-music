"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  ListMusic,
  ListPlus,
  MicVocal,
  MoreHorizontal,
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
import { AddToPlaylistDialog } from "@/components/library/add-to-playlist-dialog";
import { Artwork } from "@/components/media/artwork";
import { AudioQualitySelector } from "@/components/player/audio-quality-selector";
import { NowPlayingLyricLine } from "@/components/player/now-playing-lyric";
import { QueueSheet } from "@/components/player/queue-sheet";
import { SyncedLyrics } from "@/components/player/synced-lyrics";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { bestArtwork, formatTime, primaryArtistName } from "@/lib/format";
import { lyricsForSong } from "@/lib/player/lyrics";
import { cn } from "@/lib/utils";
import { useLyrics } from "@/hooks/use-music";
import { useLibraryStore } from "@/stores/library-store";
import { currentSong, usePlayerStore } from "@/stores/player-store";

export function NowPlayingScreen() {
  const router = useRouter();
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
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  const artist = song ? primaryArtistName(song) : null;
  const artistId = song?.artists.primary[0]?.id;
  const albumId = song?.album.id;
  const backdrop = song ? bestArtwork(song.image, "lg") : null;
  const maxTime = Math.max(duration || (song?.duration ?? 0), 1);
  const lyrics = useLyrics(
    song
      ? {
          id: song.id,
          name: song.name,
          artist: song.artists.primary[0]?.name ?? artist ?? "",
          album: song.album.name,
          duration: song.duration,
        }
      : null,
  );
  const currentLyrics =
    lyrics.isPlaceholderData
      ? undefined
      : lyricsForSong(lyrics.data, song?.id, song?.name);
  const lyricsPending = Boolean(song) && !currentLyrics && (lyrics.isLoading || lyrics.isFetching);

  function dismiss() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
      router.push("/");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      {backdrop ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt=""
          className="absolute inset-0 size-full scale-125 object-cover opacity-45 blur-3xl"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/90" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-xl sm:px-8">
        <header className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-white hover:bg-white/10 hover:text-white"
            aria-label="Close now playing"
            onClick={dismiss}
          >
            <ChevronDown className="size-6" />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
              Now playing
            </p>
            <p className="truncate text-sm font-semibold">
              {song?.album.name || song?.name || "Vibe"}
            </p>
          </div>
          {song ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full text-white hover:bg-white/10 hover:text-white"
                    aria-label="More actions"
                  />
                }
              >
                <MoreHorizontal className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/song/${song.id}`)}>
                  Song details
                </DropdownMenuItem>
                {albumId ? (
                  <DropdownMenuItem onClick={() => router.push(`/album/${albumId}`)}>
                    Go to album
                  </DropdownMenuItem>
                ) : null}
                {artistId ? (
                  <DropdownMenuItem onClick={() => router.push(`/artist/${artistId}`)}>
                    Go to artist
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => setPlaylistOpen(true)}>
                  <ListPlus className="size-4" />
                  Add to playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="size-8" />
          )}
        </header>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            showLyrics ? "py-3" : "justify-center py-6",
          )}
        >
          {showLyrics ? (
            <SyncedLyrics
              key={song?.id ?? "none"}
              lyrics={currentLyrics}
              currentTime={currentTime}
              onSeek={seek}
              follow={isPlaying}
              isLoading={lyricsPending}
              isError={lyrics.isError && !currentLyrics}
              onRetry={() => void lyrics.refetch()}
            />
          ) : (
            <Artwork
              images={song?.image ?? []}
              alt={song?.name ?? "No track"}
              size="lg"
              rounded="rounded-2xl"
              className="mx-auto block aspect-square w-full max-w-[min(100%,28rem)] shadow-2xl shadow-black/50"
            />
          )}
        </div>

        {error ? (
          <p className="mb-3 text-center text-sm text-red-300">{error}</p>
        ) : null}

        {song ? (
          <>
            {!showLyrics ? (
              <NowPlayingLyricLine
                key={song.id}
                lyrics={currentLyrics}
                songId={song.id}
                currentTime={currentTime}
                onOpen={() => setShowLyrics(true)}
              />
            ) : null}
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="font-display truncate text-2xl font-bold tracking-tight sm:text-3xl">
                  {song.name}
                </h1>
                {artistId ? (
                  <Link
                    href={`/artist/${artistId}`}
                    className="truncate text-sm text-white/70 hover:underline"
                  >
                    {artist}
                  </Link>
                ) : (
                  <p className="truncate text-sm text-white/70">{artist}</p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
                aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                onClick={() => toggleFavorite(song)}
              >
                <Heart
                  className={cn(
                    "size-6",
                    isFavorite && "fill-hot text-hot",
                  )}
                />
              </Button>
            </div>

            <div className="mt-6">
              <Slider
                min={0}
                max={maxTime}
                value={[currentTime]}
                onValueChange={(value) => {
                  const nextValue = Array.isArray(value) ? value[0] : value;
                  seek(Number(nextValue ?? 0));
                }}
                aria-label="Seek"
                className="[&_[data-slot=slider-track]]:bg-white/25 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-3.5"
              />
              <div className="mt-2 flex justify-between text-xs tabular-nums text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || song.duration || 0)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Shuffle"
                aria-pressed={shuffle}
                onClick={toggleShuffle}
                className={cn(
                  "rounded-full text-white hover:bg-white/10 hover:text-white",
                  shuffle && "text-primary hover:text-primary",
                )}
              >
                <Shuffle className="size-5" />
              </Button>
              <Button
                size="icon-lg"
                variant="ghost"
                aria-label="Previous"
                onClick={previous}
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
              >
                <SkipBack className="size-7 fill-current" />
              </Button>
              <Button
                size="icon"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlay}
                className="size-16 rounded-full bg-white text-black shadow-lg hover:bg-white/90 hover:text-black"
              >
                {isPlaying ? (
                  <Pause className="size-7 fill-current" />
                ) : (
                  <Play className="size-7 fill-current" />
                )}
              </Button>
              <Button
                size="icon-lg"
                variant="ghost"
                aria-label="Next"
                onClick={next}
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
              >
                <SkipForward className="size-7 fill-current" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Repeat ${repeat}`}
                onClick={cycleRepeatMode}
                className={cn(
                  "rounded-full text-white hover:bg-white/10 hover:text-white",
                  repeat !== "off" && "text-primary hover:text-primary",
                )}
              >
                <RepeatIcon className="size-5" />
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {isBuffering ? (
                <span className="text-xs text-white/70">loading…</span>
              ) : null}
              <div className="min-w-0 [&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:hover:text-white">
                <AudioQualitySelector sources={song.playbackSources} />
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={showLyrics ? "Show artwork" : "Show lyrics"}
                aria-pressed={showLyrics}
                onClick={() => setShowLyrics((value) => !value)}
                className={cn(
                  "rounded-full text-white hover:bg-white/10 hover:text-white",
                  showLyrics && "text-primary hover:text-primary",
                )}
              >
                <MicVocal className="size-5" />
              </Button>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="hidden rounded-full text-white hover:bg-white/10 hover:text-white sm:inline-flex"
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
                  className="hidden w-24 sm:block [&_[data-slot=slider-track]]:bg-white/25 [&_[data-slot=slider-range]]:bg-white"
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full text-white hover:bg-white/10 hover:text-white"
                  aria-label="Open queue"
                  onClick={() => setQueueOpen(true)}
                >
                  <ListMusic className="size-5" />
                </Button>
              </div>
            </div>

            {!showLyrics && (song.album.name || song.year || song.copyright) ? (
              <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/60 uppercase">
                  About the song
                </p>
                <p className="mt-1 truncate text-sm font-medium">
                  {[song.album.name, song.year].filter(Boolean).join(" · ")}
                </p>
                {song.copyright ? (
                  <p className="mt-1 line-clamp-2 text-xs text-white/55">{song.copyright}</p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="pb-8 text-center">
            <h1 className="font-display text-2xl font-bold">Nothing playing</h1>
            <p className="mt-2 text-sm text-white/70">Pick a track and this stage lights up.</p>
            <Link
              href="/search"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black"
            >
              Find a vibe
            </Link>
          </div>
        )}
      </div>

      <QueueSheet open={queueOpen} onOpenChange={setQueueOpen} />
      {song ? (
        <AddToPlaylistDialog
          song={song}
          open={playlistOpen}
          onOpenChange={setPlaylistOpen}
        />
      ) : null}
    </div>
  );
}
