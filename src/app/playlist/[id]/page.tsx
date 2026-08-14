"use client";

import { useParams } from "next/navigation";
import { CollectionHeader } from "@/components/media/collection-header";
import { SongRow } from "@/components/media/song-row";
import { DetailHeaderSkeleton, SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState, ErrorState } from "@/components/states/status";
import { usePlaylist } from "@/hooks/use-music";
import { usePlayback } from "@/hooks/use-playback";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playlistQuery = usePlaylist(id);
  const { play } = usePlayback();
  const playlist = playlistQuery.data;

  if (playlistQuery.isLoading) {
    return (
      <div className="space-y-8">
        <DetailHeaderSkeleton />
        <SongRowSkeleton />
      </div>
    );
  }

  if (playlistQuery.isError) {
    return (
      <ErrorState
        description={playlistQuery.error.message}
        onRetry={() => void playlistQuery.refetch()}
      />
    );
  }

  if (!playlist) {
    return (
      <EmptyState
        title="Playlist not found"
        description="This playlist is unavailable."
      />
    );
  }

  return (
    <div className="space-y-8">
      <CollectionHeader
        eyebrow="Playlist"
        title={playlist.name}
        subtitle={[playlist.description, playlist.language, playlist.songCount ? `${playlist.songCount} songs` : null]
          .filter(Boolean)
          .join(" • ")}
        images={playlist.image}
        onPlay={() => {
          if (playlist.songs[0]) void play(playlist.songs[0], playlist.songs);
        }}
      />
      {playlist.songs.length === 0 ? (
        <EmptyState
          title="No tracks"
          description="This playlist did not include playable songs."
        />
      ) : (
        playlist.songs.map((song, index) => (
          <SongRow key={song.id} song={song} queue={playlist.songs} index={index} />
        ))
      )}
    </div>
  );
}
