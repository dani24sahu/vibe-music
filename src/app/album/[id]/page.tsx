"use client";

import { useParams } from "next/navigation";
import { CollectionHeader } from "@/components/media/collection-header";
import { MediaCard } from "@/components/media/media-card";
import { SongRow } from "@/components/media/song-row";
import { DetailHeaderSkeleton, SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState, ErrorState } from "@/components/states/status";
import { useAlbum } from "@/hooks/use-music";
import { usePlayback } from "@/hooks/use-playback";
import { albumArtistName } from "@/lib/format";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const albumQuery = useAlbum(id);
  const { play } = usePlayback();
  const album = albumQuery.data;

  if (albumQuery.isLoading) {
    return (
      <div className="space-y-8">
        <DetailHeaderSkeleton />
        <SongRowSkeleton />
      </div>
    );
  }

  if (albumQuery.isError) {
    return (
      <ErrorState
        description={albumQuery.error.message}
        onRetry={() => void albumQuery.refetch()}
      />
    );
  }

  if (!album) {
    return (
      <EmptyState title="Album not found" description="This album is unavailable." />
    );
  }

  return (
    <div className="space-y-8">
      <CollectionHeader
        eyebrow="Album"
        title={album.name}
        subtitle={[albumArtistName(album.artists), album.year, album.language]
          .filter(Boolean)
          .join(" • ")}
        images={album.image}
        onPlay={() => {
          if (album.songs[0]) void play(album.songs[0], album.songs);
        }}
      />
      {album.songs.length === 0 ? (
        <EmptyState
          title="No tracks"
          description="This album did not include playable songs."
        />
      ) : (
        <div>
          {album.songs.map((song, index) => (
            <SongRow key={song.id} song={song} queue={album.songs} index={index} />
          ))}
        </div>
      )}
      {album.artists.primary.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Artists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {album.artists.primary.map((artist) => (
              <MediaCard
                key={artist.id}
                href={`/artist/${artist.id}`}
                title={artist.name}
                images={artist.image}
                circular
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
