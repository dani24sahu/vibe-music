"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CollectionHeader } from "@/components/media/collection-header";
import { SongRow } from "@/components/media/song-row";
import { EmptyState } from "@/components/states/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayback } from "@/hooks/use-playback";
import { useLibraryStore } from "@/stores/library-store";

export default function LocalPlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useLibraryStore((state) => state.hydrated);
  const playlist = useLibraryStore((state) =>
    state.playlists.find((item) => item.id === id),
  );
  const renamePlaylist = useLibraryStore((state) => state.renamePlaylist);
  const deletePlaylist = useLibraryStore((state) => state.deletePlaylist);
  const removeFromPlaylist = useLibraryStore((state) => state.removeFromPlaylist);
  const { play } = usePlayback();
  const [name, setName] = useState("");
  const nameValue = name || playlist?.name || "";

  if (!hydrated) {
    return null;
  }

  if (!playlist) {
    return (
      <EmptyState
        title="Playlist not found"
        description="This local playlist may have been deleted."
        actionHref="/library"
        actionLabel="Back to playlists"
      />
    );
  }

  return (
    <div className="space-y-8">
      <CollectionHeader
        eyebrow="Local playlist"
        title={playlist.name}
        subtitle={`${playlist.songs.length} songs • saved on this device`}
        images={playlist.songs[0]?.image ?? []}
        onPlay={() => {
          if (playlist.songs[0]) void play(playlist.songs[0], playlist.songs);
        }}
      />
      <form
        className="flex max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          renamePlaylist(playlist.id, nameValue);
        }}
      >
          <Input
            value={nameValue}
            onChange={(event) => setName(event.target.value)}
          />
        <Button type="submit">Rename</Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            deletePlaylist(playlist.id);
            router.push("/library");
          }}
        >
          Delete
        </Button>
      </form>
      {playlist.songs.length === 0 ? (
        <EmptyState
          title="Empty playlist"
          description="Add songs from search or any track menu."
          actionHref="/search"
          actionLabel="Search songs"
        />
      ) : (
        playlist.songs.map((song, index) => (
          <div key={song.id} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SongRow song={song} queue={playlist.songs} index={index} />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeFromPlaylist(playlist.id, song.id)}
            >
              Remove
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
