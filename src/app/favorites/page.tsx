"use client";

import { SongRow } from "@/components/media/song-row";
import { SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState } from "@/components/states/status";
import { usePlayback } from "@/hooks/use-playback";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from "@/stores/library-store";

export default function FavoritesPage() {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const favorites = useLibraryStore((state) => state.favorites);
  const { play } = usePlayback();

  if (!hydrated) return <SongRowSkeleton />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No liked songs yet"
        description="Tap the heart on any track to save it locally in this browser."
        actionHref="/search"
        actionLabel="Find songs"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">liked</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {favorites.length} song{favorites.length === 1 ? "" : "s"} saved on this device
          </p>
        </div>
        <Button className="rounded-full" onClick={() => void play(favorites[0], favorites)}>
          Play all
        </Button>
      </div>
      {favorites.map((song, index) => (
        <SongRow key={song.id} song={song} queue={favorites} index={index} />
      ))}
    </div>
  );
}
