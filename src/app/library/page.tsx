"use client";

import { FormEvent, useState } from "react";
import { MediaCard } from "@/components/media/media-card";
import { EmptyState } from "@/components/states/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { possessiveName } from "@/lib/profile";
import { useLibraryStore } from "@/stores/library-store";

export default function LibraryPage() {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const playlists = useLibraryStore((state) => state.playlists);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const displayName = useLibraryStore((state) => state.displayName);
  const [name, setName] = useState("");

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name);
    setName("");
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {displayName ? `${possessiveName(displayName)} mixes` : "your mixes"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Personal playlists stay in this browser. They are not uploaded anywhere.
        </p>
      </div>
      <form onSubmit={onCreate} className="flex max-w-md gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playlist name"
        />
        <Button type="submit" className="rounded-full" disabled={!name.trim()}>
          Create
        </Button>
      </form>
      {playlists.length === 0 ? (
        <EmptyState
          title="No playlists yet"
          description="Create one here or add a song from any track menu."
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {playlists.map((playlist) => (
            <MediaCard
              key={playlist.id}
              href={`/library/${playlist.id}`}
              title={playlist.name}
              subtitle={`${playlist.songs.length} songs`}
              images={playlist.songs[0]?.image ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
