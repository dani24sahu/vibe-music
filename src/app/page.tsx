"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MediaCard } from "@/components/media/media-card";
import { SongRow } from "@/components/media/song-row";
import { CardGridSkeleton, SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState, ErrorState } from "@/components/states/status";
import { usePlayback } from "@/hooks/use-playback";
import { searchPlaylists, searchSongs } from "@/lib/api/music";
import { useLibraryStore } from "@/stores/library-store";

const DISCOVER_SONGS_QUERY = "bollywood hits";
const DISCOVER_PLAYLISTS_QUERY = "indie english";

export default function HomePage() {
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);
  const favorites = useLibraryStore((state) => state.favorites);
  const playlists = useLibraryStore((state) => state.playlists);
  const { play } = usePlayback();

  const discoverSongs = useQuery({
    queryKey: ["discover", "songs", DISCOVER_SONGS_QUERY],
    queryFn: () => searchSongs(DISCOVER_SONGS_QUERY, 0, 10),
    staleTime: 5 * 60_000,
  });
  const discoverPlaylists = useQuery({
    queryKey: ["discover", "playlists", DISCOVER_PLAYLISTS_QUERY],
    queryFn: () => searchPlaylists(DISCOVER_PLAYLISTS_QUERY, 0, 8),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[1.8rem] px-5 py-8 sm:px-8 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-hot/10 to-transparent" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            tonight's energy
          </p>
          <h1 className="font-display mt-3 max-w-xl text-4xl leading-[0.95] font-bold tracking-tight sm:text-6xl">
            what’s the <span className="text-gradient">vibe</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            Search it. Queue it. Loop it. Your player, your night.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.03]"
          >
            start searching
          </Link>
        </div>
      </section>

      {recentlyPlayed.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle href="/recent" title="on repeat" />
          <div className="stagger-in space-y-1">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <SongRow key={song.id} song={song} queue={recentlyPlayed} />
            ))}
          </div>
        </section>
      ) : null}

      {favorites.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle href="/favorites" title="liked rn" />
          <div className="stagger-in grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {favorites.slice(0, 5).map((song) => (
              <MediaCard
                key={song.id}
                href={`/song/${song.id}`}
                title={song.name}
                subtitle={song.artists.primary[0]?.name}
                images={song.image}
                onPlay={() => void play(song, favorites)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {playlists.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle href="/library" title="your mixes" />
          <div className="stagger-in grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {playlists.slice(0, 5).map((playlist) => (
              <MediaCard
                key={playlist.id}
                href={`/library/${playlist.id}`}
                title={playlist.name}
                subtitle={`${playlist.songs.length} songs`}
                images={playlist.songs[0]?.image ?? []}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">discover</h2>
        {discoverSongs.isLoading ? <SongRowSkeleton /> : null}
        {discoverSongs.isError ? (
          <ErrorState
            description="Discover songs could not be loaded from the music service."
            onRetry={() => void discoverSongs.refetch()}
          />
        ) : null}
        {discoverSongs.data?.results.length === 0 ? (
          <EmptyState
            title="No discover results"
            description="The music service returned no songs for this browse query."
            actionHref="/search"
            actionLabel="Search instead"
          />
        ) : null}
        {discoverSongs.data?.results.length ? (
          <div className="stagger-in space-y-1">
            {discoverSongs.data.results.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                queue={discoverSongs.data.results}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">featured mixes</h2>
        {discoverPlaylists.isLoading ? <CardGridSkeleton /> : null}
        {discoverPlaylists.isError ? (
          <ErrorState
            description="Playlists could not be loaded from the music service."
            onRetry={() => void discoverPlaylists.refetch()}
          />
        ) : null}
        {discoverPlaylists.data?.results.length ? (
          <div className="stagger-in grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {discoverPlaylists.data.results.map((playlist) => (
              <MediaCard
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                title={playlist.name}
                subtitle={playlist.language || "Playlist"}
                images={playlist.image}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SectionTitle({ href, title }: { href: string; title: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <Link
        href={href}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        see all
      </Link>
    </div>
  );
}
