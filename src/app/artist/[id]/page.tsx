"use client";

import { useParams } from "next/navigation";
import { CollectionHeader } from "@/components/media/collection-header";
import { MediaCard } from "@/components/media/media-card";
import { SongRow } from "@/components/media/song-row";
import { CardGridSkeleton, DetailHeaderSkeleton, SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState, ErrorState } from "@/components/states/status";
import { useArtist } from "@/hooks/use-music";
import { usePlayback } from "@/hooks/use-playback";
import { formatCount } from "@/lib/format";

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const artistQuery = useArtist(id);
  const { play } = usePlayback();
  const artist = artistQuery.data;

  if (artistQuery.isLoading) {
    return (
      <div className="space-y-8">
        <DetailHeaderSkeleton />
        <SongRowSkeleton />
        <CardGridSkeleton />
      </div>
    );
  }

  if (artistQuery.isError) {
    return (
      <ErrorState
        description={artistQuery.error.message}
        onRetry={() => void artistQuery.refetch()}
      />
    );
  }

  if (!artist) {
    return (
      <EmptyState title="Artist not found" description="This artist is unavailable." />
    );
  }

  return (
    <div className="space-y-10">
      <CollectionHeader
        eyebrow="Artist"
        title={artist.name}
        subtitle={[
          artist.dominantType,
          artist.followerCount ? `${formatCount(artist.followerCount)} followers` : null,
        ]
          .filter(Boolean)
          .join(" • ")}
        images={artist.image}
        onPlay={() => {
          if (artist.topSongs[0]) void play(artist.topSongs[0], artist.topSongs);
        }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Popular</h2>
        {artist.topSongs.length === 0 ? (
          <EmptyState
            title="No songs listed"
            description="The music service did not return songs for this artist."
          />
        ) : (
          artist.topSongs.map((song, index) => (
            <SongRow key={song.id} song={song} queue={artist.topSongs} index={index} />
          ))
        )}
      </section>

      {artist.topAlbums.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Albums</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {artist.topAlbums.map((album) => (
              <MediaCard
                key={album.id}
                href={`/album/${album.id}`}
                title={album.name}
                subtitle={album.year?.toString()}
                images={album.image}
              />
            ))}
          </div>
        </section>
      ) : null}

      {artist.similarArtists.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Fans also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {artist.similarArtists.map((similar) => (
              <MediaCard
                key={similar.id}
                href={`/artist/${similar.id}`}
                title={similar.name}
                images={similar.image}
                circular
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
