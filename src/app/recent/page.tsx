"use client";

import { SongRow } from "@/components/media/song-row";
import { SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState } from "@/components/states/status";
import { useLibraryStore } from "@/stores/library-store";

export default function RecentPage() {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);

  if (!hydrated) return <SongRowSkeleton />;

  if (recentlyPlayed.length === 0) {
    return (
      <EmptyState
        title="Nothing played yet"
        description="Tracks you play will show up here, stored locally in this browser."
        actionHref="/search"
        actionLabel="Search the catalog"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">recents</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last {recentlyPlayed.length} track{recentlyPlayed.length === 1 ? "" : "s"} on this device
        </p>
      </div>
      {recentlyPlayed.map((song, index) => (
        <SongRow key={song.id} song={song} queue={recentlyPlayed} index={index} />
      ))}
    </div>
  );
}
