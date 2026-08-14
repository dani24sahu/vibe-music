"use client";

import Link from "next/link";
import { Heart, ListPlus, MoreHorizontal, Play } from "lucide-react";
import { Artwork } from "@/components/media/artwork";
import { Equalizer } from "@/components/media/equalizer";
import { AddToPlaylistDialog } from "@/components/library/add-to-playlist-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime, primaryArtistName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlayback } from "@/hooks/use-playback";
import { useLibraryStore } from "@/stores/library-store";
import { currentSong, usePlayerStore } from "@/stores/player-store";
import type { Song } from "@/types/music";
import { useState } from "react";

export function SongRow({
  song,
  queue,
  index,
}: {
  song: Song;
  queue?: Song[];
  index?: number;
}) {
  const { play, queueSong } = usePlayback();
  const playingSong = usePlayerStore(currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const isFavorite = useLibraryStore((state) =>
    state.favorites.some((item) => item.id === song.id),
  );
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const active = playingSong?.id === song.id;

  return (
    <div
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl px-2 py-2 transition-all duration-200 hover:bg-accent/70 sm:grid-cols-[auto_1fr_minmax(0,1fr)_auto_auto]",
        active && "bg-primary/10 ring-1 ring-primary/20",
      )}
    >
      <button
        type="button"
        className="relative size-12 shrink-0 overflow-hidden rounded-xl sm:size-12"
        aria-label={active && isPlaying ? `Pause ${song.name}` : `Play ${song.name}`}
        onClick={() => {
          if (active) {
            togglePlay();
            return;
          }
          void play(song, queue);
        }}
      >
        <Artwork
          images={song.image}
          alt={song.name}
          size="sm"
          rounded="rounded-xl"
          className="size-12"
        />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/45 text-white transition-opacity",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          {active && isPlaying ? (
            <Equalizer className="text-white" />
          ) : (
            <Play className="size-4 fill-white text-white" />
          )}
        </span>
        {typeof index === "number" ? (
          <span className="sr-only">Track {index + 1}</span>
        ) : null}
      </button>
      <div className="min-w-0">
        <Link
          href={`/song/${song.id}`}
          className={cn(
            "block truncate font-semibold hover:underline",
            active && "text-primary",
          )}
        >
          {song.name}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          {song.artists.primary.slice(0, 2).map((artist, artistIndex) => (
            <span key={artist.id}>
              {artistIndex > 0 ? ", " : null}
              <Link href={`/artist/${artist.id}`} className="hover:underline">
                {artist.name}
              </Link>
            </span>
          ))}
          {song.artists.primary.length === 0 ? primaryArtistName(song) : null}
        </p>
      </div>
      <div className="hidden min-w-0 sm:block">
        {song.album.id ? (
          <Link
            href={`/album/${song.album.id}`}
            className="truncate text-sm text-muted-foreground hover:underline"
          >
            {song.album.name}
          </Link>
        ) : (
          <span className="truncate text-sm text-muted-foreground">
            {song.album.name}
          </span>
        )}
      </div>
      <span className="hidden w-12 text-right text-sm tabular-nums text-muted-foreground sm:block">
        {formatTime(song.duration)}
      </span>
      <div className="flex items-center gap-0.5">
        <Button
          size="icon-sm"
          variant="ghost"
          className="rounded-full"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={() => toggleFavorite(song)}
        >
          <Heart
            className={cn(
              "size-4 transition-transform",
              isFavorite && "fill-hot text-hot scale-110",
            )}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-full"
                aria-label="More actions"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void queueSong(song)}>
              Add to queue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPlaylistOpen(true)}>
              <ListPlus className="size-4" />
              Add to playlist
            </DropdownMenuItem>
            {song.album.id ? (
              <DropdownMenuItem render={<Link href={`/album/${song.album.id}`} />}>
                Go to album
              </DropdownMenuItem>
            ) : null}
            {song.artists.primary[0] ? (
              <DropdownMenuItem
                render={<Link href={`/artist/${song.artists.primary[0].id}`} />}
              >
                Go to artist
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AddToPlaylistDialog
        song={song}
        open={playlistOpen}
        onOpenChange={setPlaylistOpen}
      />
    </div>
  );
}
