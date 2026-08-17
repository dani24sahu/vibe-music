"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MediaCard } from "@/components/media/media-card";
import { SongRow } from "@/components/media/song-row";
import { CardGridSkeleton, SongRowSkeleton } from "@/components/states/skeletons";
import { EmptyState, ErrorState } from "@/components/states/status";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { usePlayback } from "@/hooks/use-playback";
import {
  useAlbumSearch,
  useArtistSearch,
  useGlobalSearch,
  usePlaylistSearch,
  useSongSearch,
} from "@/hooks/use-music";
import { getSong } from "@/lib/api/music";

type SearchTab = "all" | "songs" | "albums" | "artists" | "playlists";

function SearchPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [tab, setTab] = useState<SearchTab>("all");
  const query = useDebouncedValue(value.trim(), 350);
  const { play } = usePlayback();

  useEffect(() => {
    const next = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
    router.replace(next, { scroll: false });
  }, [query, router]);

  const global = useGlobalSearch(query, tab === "all");
  const songs = useSongSearch(query, tab === "songs");
  const albums = useAlbumSearch(query, tab === "albums");
  const artists = useArtistSearch(query, tab === "artists");
  const playlists = usePlaylistSearch(query, tab === "playlists");

  const isEmpty = query.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">find a vibe</h1>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="a song, a mood, an artist..."
          className="mt-4 h-12 max-w-xl rounded-full bg-card/80"
          aria-label="Search catalog"
        />
      </div>

      {isEmpty ? (
        <EmptyState
          title="Find something to play"
          description="Search the catalog for songs, albums, artists, and playlists."
        />
      ) : (
        <Tabs value={tab} onValueChange={(next) => setTab(next as SearchTab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-8">
            {global.isLoading ? <SongRowSkeleton count={4} /> : null}
            {global.isError ? (
              <ErrorState
                description={global.error.message}
                onRetry={() => void global.refetch()}
              />
            ) : null}
            {global.data &&
            global.data.songs.results.length === 0 &&
            global.data.albums.results.length === 0 &&
            global.data.artists.results.length === 0 &&
            global.data.playlists.results.length === 0 ? (
              <EmptyState
                title="No matches"
                description={`Nothing turned up for “${query}”.`}
              />
            ) : null}
            {global.data?.songs.results.length ? (
              <section className="space-y-3">
                <h2 className="font-display text-xl font-bold">Songs</h2>
                {global.data.songs.results.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    onClick={() => {
                      void getSong(hit.id)
                        .then((song) => play(song))
                        .catch(() => undefined);
                    }}
                  >
                    <span className="font-medium">{hit.title}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {hit.primaryArtists || hit.description}
                    </span>
                  </button>
                ))}
              </section>
            ) : null}
            {global.data?.artists.results.length ? (
              <section className="space-y-3">
                <h2 className="font-display text-xl font-bold">Artists</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {global.data.artists.results.map((hit) => (
                    <MediaCard
                      key={hit.id}
                      href={`/artist/${hit.id}`}
                      title={hit.title}
                      subtitle={hit.description || "Artist"}
                      images={hit.image}
                      circular
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {global.data?.albums.results.length ? (
              <section className="space-y-3">
                <h2 className="font-display text-xl font-bold">Albums</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {global.data.albums.results.map((hit) => (
                    <MediaCard
                      key={hit.id}
                      href={`/album/${hit.id}`}
                      title={hit.title}
                      subtitle={hit.artist || hit.year}
                      images={hit.image}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {global.data?.playlists.results.length ? (
              <section className="space-y-3">
                <h2 className="font-display text-xl font-bold">Playlists</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {global.data.playlists.results.map((hit) => (
                    <MediaCard
                      key={hit.id}
                      href={`/playlist/${hit.id}`}
                      title={hit.title}
                      subtitle={hit.description || hit.language}
                      images={hit.image}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </TabsContent>

          <TabsContent value="songs" className="mt-6">
            {songs.isLoading ? <SongRowSkeleton /> : null}
            {songs.isError ? (
              <ErrorState
                description={songs.error.message}
                onRetry={() => void songs.refetch()}
              />
            ) : null}
            {songs.data?.results.length === 0 ? (
              <EmptyState title="No songs" description={`No songs matched “${query}”.`} />
            ) : null}
            {songs.data?.results.map((song) => (
              <SongRow key={song.id} song={song} queue={songs.data.results} />
            ))}
          </TabsContent>

          <TabsContent value="albums" className="mt-6">
            {albums.isLoading ? <CardGridSkeleton /> : null}
            {albums.isError ? (
              <ErrorState
                description={albums.error.message}
                onRetry={() => void albums.refetch()}
              />
            ) : null}
            {albums.data?.results.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {albums.data.results.map((album) => (
                  <MediaCard
                    key={album.id}
                    href={`/album/${album.id}`}
                    title={album.name}
                    subtitle={album.artists.primary[0]?.name || album.year?.toString()}
                    images={album.image}
                  />
                ))}
              </div>
            ) : albums.data ? (
              <EmptyState title="No albums" description={`No albums matched “${query}”.`} />
            ) : null}
          </TabsContent>

          <TabsContent value="artists" className="mt-6">
            {artists.isLoading ? <CardGridSkeleton /> : null}
            {artists.isError ? (
              <ErrorState
                description={artists.error.message}
                onRetry={() => void artists.refetch()}
              />
            ) : null}
            {artists.data?.results.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {artists.data.results.map((artist) => (
                  <MediaCard
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    title={artist.name}
                    subtitle={artist.role}
                    images={artist.image}
                    circular
                  />
                ))}
              </div>
            ) : artists.data ? (
              <EmptyState title="No artists" description={`No artists matched “${query}”.`} />
            ) : null}
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            {playlists.isLoading ? <CardGridSkeleton /> : null}
            {playlists.isError ? (
              <ErrorState
                description={playlists.error.message}
                onRetry={() => void playlists.refetch()}
              />
            ) : null}
            {playlists.data?.results.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {playlists.data.results.map((playlist) => (
                  <MediaCard
                    key={playlist.id}
                    href={`/playlist/${playlist.id}`}
                    title={playlist.name}
                    subtitle={playlist.language || "Playlist"}
                    images={playlist.image}
                  />
                ))}
              </div>
            ) : playlists.data ? (
              <EmptyState
                title="No playlists"
                description={`No playlists matched “${query}”.`}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SongRowSkeleton />}>
      <SearchPageInner />
    </Suspense>
  );
}
