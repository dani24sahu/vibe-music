"use client";

import { useParams } from "next/navigation";
import { CollectionHeader } from "@/components/media/collection-header";
import { SongRow } from "@/components/media/song-row";
import { DetailHeaderSkeleton, SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState, ErrorState } from "@/components/states/status";
import { useSong, useSuggestions, useLyrics } from "@/hooks/use-music";
import { usePlayback } from "@/hooks/use-playback";
import { formatQualityLabel, playableSources } from "@/lib/player/quality";
import { primaryArtistName } from "@/lib/format";
import { SyncedLyrics } from "@/components/player/synced-lyrics";
import { currentSong, usePlayerStore } from "@/stores/player-store";

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const songQuery = useSong(id);
  const suggestions = useSuggestions(id);
  const { play } = usePlayback();
  const song = songQuery.data;
  const playing = usePlayerStore(currentSong);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const seek = usePlayerStore((state) => state.seek);
  const lyrics = useLyrics(
    song
      ? {
          id: song.id,
          name: song.name,
          artist: song.artists.primary[0]?.name ?? primaryArtistName(song),
          album: song.album.name,
          duration: song.duration,
        }
      : null,
  );

  if (songQuery.isLoading) {
    return (
      <div className="space-y-8">
        <DetailHeaderSkeleton />
        <SongRowSkeleton count={4} />
      </div>
    );
  }

  if (songQuery.isError) {
    return (
      <ErrorState
        description={songQuery.error.message}
        onRetry={() => void songQuery.refetch()}
      />
    );
  }

  if (!song) {
    return <EmptyState title="Song not found" description="This song is unavailable." />;
  }

  const related = [song, ...(suggestions.data ?? [])];

  return (
    <div className="space-y-8">
      <CollectionHeader
        eyebrow="Song"
        title={song.name}
        subtitle={[primaryArtistName(song), song.album.name, song.year]
          .filter(Boolean)
          .join(" • ")}
        images={song.image}
        onPlay={() => void play(song, related)}
        playLabel="Play"
      />
      {song.playbackSources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          A playable stream was not included on this song. Playback may still work after
          opening it in the player.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Available audio:{" "}
          {playableSources(song.playbackSources)
            .map((source) => formatQualityLabel(source.quality))
            .join(" · ")}
        </p>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Lyrics</h2>
          <p className="text-sm text-muted-foreground">
            {playing?.id === song.id
              ? "Synced to the current playback."
              : "Play this track to follow the lyrics live."}
          </p>
        </div>
        <div className="overflow-hidden rounded-[1.4rem] border border-border/60 bg-card/70">
          <SyncedLyrics
            lyrics={lyrics.data}
            currentTime={playing?.id === song.id ? currentTime : 0}
            onSeek={playing?.id === song.id ? seek : undefined}
            follow={playing?.id === song.id}
            tone="light"
            isLoading={lyrics.isLoading}
            isError={lyrics.isError}
            onRetry={() => void lyrics.refetch()}
            className="max-h-[28rem] px-4"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Suggested</h2>
        {suggestions.isLoading ? <SongRowSkeleton count={4} /> : null}
        {suggestions.isError ? (
          <ErrorState
            description="Suggested tracks could not be loaded."
            onRetry={() => void suggestions.refetch()}
          />
        ) : null}
        {suggestions.data?.length === 0 ? (
          <EmptyState
            title="No suggestions"
            description="The service did not return related tracks for this song."
          />
        ) : null}
        {suggestions.data?.map((item) => (
          <SongRow key={item.id} song={item} queue={related} />
        ))}
      </section>
    </div>
  );
}
