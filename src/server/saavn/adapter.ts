import { saavnFetch } from "./client";
import {
  ARTIST_CATALOG_MAX_SEARCH_PAGES,
  ARTIST_CATALOG_SEARCH_PAGE_SIZE,
  albumBelongsToArtist,
  collectCreditedItems,
  extractArtistAlbums,
  extractArtistSongs,
  pickSongsForArtist,
  songBelongsToArtist,
} from "./catalog";
import { SaavnNotFoundError, SaavnRateLimitedError } from "./errors";
import {
  mapAlbum,
  mapAlbumSearchItem,
  mapArtist,
  mapArtistSearchItem,
  mapGlobalSearch,
  mapPlaylist,
  mapPlaylistSearchItem,
  mapSong,
  mapSongs,
} from "./mappers";
import type {
  SaavnAlbum,
  SaavnArtist,
  SaavnArtistAlbums,
  SaavnArtistSearchItem,
  SaavnArtistSongs,
  SaavnGlobalSearch,
  SaavnPaginated,
  SaavnPlaylist,
  SaavnPlaylistSearchItem,
  SaavnSong,
} from "./types";
import type {
  Album,
  AlbumSearchItem,
  Artist,
  ArtistAlbumsPage,
  ArtistSearchItem,
  ArtistSongsPage,
  GlobalSearch,
  Paginated,
  Playlist,
  PlaylistSearchItem,
  Song,
} from "@/types/music";

export type SearchPaging = {
  page?: number;
  limit?: number;
};

export type ArtistSort = {
  page?: number;
  sortBy?: "popularity" | "latest" | "alphabetical";
  sortOrder?: "asc" | "desc";
  artistName?: string;
  limit?: number;
};

export async function searchAll(query: string): Promise<GlobalSearch> {
  const data = await saavnFetch<SaavnGlobalSearch>("/api/search", { query });
  return mapGlobalSearch(data);
}

export async function searchSongs(
  query: string,
  paging: SearchPaging = {},
): Promise<Paginated<Song>> {
  const data = await saavnFetch<SaavnPaginated<SaavnSong>>("/api/search/songs", {
    query,
    page: paging.page ?? 0,
    limit: paging.limit ?? 20,
  });
  return {
    total: data.total ?? 0,
    start: data.start ?? 0,
    results: mapSongs(data.results),
  };
}

export async function searchAlbums(
  query: string,
  paging: SearchPaging = {},
): Promise<Paginated<AlbumSearchItem>> {
  const data = await saavnFetch<SaavnPaginated<SaavnAlbum>>("/api/search/albums", {
    query,
    page: paging.page ?? 0,
    limit: paging.limit ?? 20,
  });
  return {
    total: data.total ?? 0,
    start: data.start ?? 0,
    results: (data.results ?? [])
      .filter((album): album is SaavnAlbum => Boolean(album?.id && album?.name))
      .map(mapAlbumSearchItem),
  };
}

export async function searchArtists(
  query: string,
  paging: SearchPaging = {},
): Promise<Paginated<ArtistSearchItem>> {
  const data = await saavnFetch<SaavnPaginated<SaavnArtistSearchItem>>(
    "/api/search/artists",
    {
      query,
      page: paging.page ?? 0,
      limit: paging.limit ?? 20,
    },
  );
  return {
    total: data.total ?? 0,
    start: data.start ?? 0,
    results: (data.results ?? [])
      .filter((artist): artist is SaavnArtistSearchItem => Boolean(artist?.id && artist?.name))
      .map(mapArtistSearchItem),
  };
}

export async function searchPlaylists(
  query: string,
  paging: SearchPaging = {},
): Promise<Paginated<PlaylistSearchItem>> {
  const data = await saavnFetch<SaavnPaginated<SaavnPlaylistSearchItem>>(
    "/api/search/playlists",
    {
      query,
      page: paging.page ?? 0,
      limit: paging.limit ?? 20,
    },
  );
  return {
    total: data.total ?? 0,
    start: data.start ?? 0,
    results: (data.results ?? [])
      .filter((playlist): playlist is SaavnPlaylistSearchItem => Boolean(playlist?.id && playlist?.name))
      .map(mapPlaylistSearchItem),
  };
}

export async function getSong(id: string): Promise<Song> {
  try {
    const data = await saavnFetch<SaavnSong[] | SaavnSong>(`/api/songs/${id}`);
    const song = Array.isArray(data) ? data[0] : data;
    if (!song?.id) {
      throw new SaavnNotFoundError("Song not found.");
    }
    return mapSong(song);
  } catch (error) {
    if (error instanceof SaavnRateLimitedError) throw error;
    const data = await saavnFetch<SaavnSong[] | SaavnSong>("/api/songs", { ids: id });
    const song = Array.isArray(data) ? data[0] : data;
    if (!song?.id) {
      throw new SaavnNotFoundError("Song not found.");
    }
    return mapSong(song);
  }
}

export async function getSongsByIds(ids: string[]): Promise<Song[]> {
  if (ids.length === 0) return [];
  const data = await saavnFetch<SaavnSong[]>("/api/songs", {
    ids: ids.join(","),
  });
  return mapSongs(Array.isArray(data) ? data : []);
}

export async function getAlbum(id: string): Promise<Album> {
  const data = await saavnFetch<SaavnAlbum>("/api/albums", { id });
  if (!data?.id) {
    throw new SaavnNotFoundError("Album not found.");
  }
  return mapAlbum(data);
}

async function resolveArtistName(id: string, artistName?: string) {
  const provided = artistName?.trim();
  if (provided) return provided;
  return (await saavnFetch<SaavnArtist>(`/api/artists/${id}`)).name?.trim() ?? "";
}

export async function getArtistSongs(
  id: string,
  options: ArtistSort = {},
): Promise<ArtistSongsPage> {
  const limit = options.limit ?? 20;
  const artistName = options.artistName?.trim();
  let dedicated: Song[] = [];
  let dedicatedTotal = 0;
  try {
    const data = await saavnFetch<SaavnArtistSongs>(`/api/artists/${id}/songs`, {
      page: options.page ?? 0,
      sortBy: options.sortBy ?? "popularity",
      sortOrder: options.sortOrder ?? "desc",
    });
    dedicated = mapSongs(extractArtistSongs(data));
    dedicatedTotal = data.total ?? dedicated.length;
  } catch (error) {
    if (error instanceof SaavnRateLimitedError) throw error;
    dedicated = [];
  }

  const creditedDedicated = pickSongsForArtist(dedicated, id, limit, artistName);
  if (creditedDedicated.length > 0) {
    return {
      total: dedicatedTotal,
      songs: creditedDedicated,
    };
  }

  // Live discrepancy: `/api/artists/{id}/songs` currently returns `{ total: 0, songs: [] }`
  // for many Western artists on the public instance. Fall back to documented song search
  // (`data.results[]`) and keep only tracks that actually credit this artist.
  const name = await resolveArtistName(id, artistName);
  if (!name) {
    return { total: 0, songs: [] };
  }

  const songs: Song[] = [];
  const seen = new Set<string>();
  let page = options.page ?? 0;
  let fetched = 0;
  let reportedTotal = 0;

  for (let i = 0; i < ARTIST_CATALOG_MAX_SEARCH_PAGES && songs.length < limit; i += 1) {
    const searched = await searchSongs(name, {
      page,
      limit: ARTIST_CATALOG_SEARCH_PAGE_SIZE,
    });
    reportedTotal = searched.total;
    const batch = searched.results;
    if (batch.length === 0) break;
    fetched += batch.length;
    collectCreditedItems(
      batch,
      songs,
      seen,
      (song) => songBelongsToArtist(song, id, name),
      limit,
    );
    if (reportedTotal > 0 && fetched >= reportedTotal) break;
    if (reportedTotal <= 0 && batch.length < ARTIST_CATALOG_SEARCH_PAGE_SIZE) break;
    page += 1;
  }

  return {
    total: songs.length,
    songs,
  };
}

export async function getArtistAlbums(
  id: string,
  options: ArtistSort = {},
): Promise<ArtistAlbumsPage> {
  const limit = options.limit ?? 20;
  const artistName = options.artistName?.trim();
  let dedicated: Album[] = [];
  let dedicatedTotal = 0;
  try {
    const data = await saavnFetch<SaavnArtistAlbums>(`/api/artists/${id}/albums`, {
      page: options.page ?? 0,
      sortBy: options.sortBy ?? "popularity",
      sortOrder: options.sortOrder ?? "desc",
    });
    dedicated = extractArtistAlbums(data).map(mapAlbum);
    dedicatedTotal = data.total ?? dedicated.length;
  } catch (error) {
    if (error instanceof SaavnRateLimitedError) throw error;
    dedicated = [];
  }

  const creditedDedicated = dedicated
    .filter((album) => albumBelongsToArtist(album, id, artistName))
    .slice(0, limit);
  if (creditedDedicated.length > 0) {
    return {
      total: dedicatedTotal,
      albums: creditedDedicated,
    };
  }

  const name = await resolveArtistName(id, artistName);
  if (!name) {
    return { total: 0, albums: [] };
  }

  const albums: Album[] = [];
  const seen = new Set<string>();
  let page = options.page ?? 0;
  let fetched = 0;
  let reportedTotal = 0;

  for (let i = 0; i < ARTIST_CATALOG_MAX_SEARCH_PAGES && albums.length < limit; i += 1) {
    const searched = await searchAlbums(name, {
      page,
      limit: ARTIST_CATALOG_SEARCH_PAGE_SIZE,
    });
    reportedTotal = searched.total;
    const batch = searched.results;
    if (batch.length === 0) break;
    fetched += batch.length;
    const credited = collectCreditedItems(
      batch,
      [],
      seen,
      (album) => albumBelongsToArtist(album, id, name),
      limit - albums.length,
    );
    for (const album of credited) {
      albums.push({
        ...album,
        songCount: null,
        songs: [],
      });
    }
    if (reportedTotal > 0 && fetched >= reportedTotal) break;
    if (reportedTotal <= 0 && batch.length < ARTIST_CATALOG_SEARCH_PAGE_SIZE) break;
    page += 1;
  }

  return {
    total: albums.length,
    albums,
  };
}

export async function getArtist(
  id: string,
  options: {
    page?: number;
    songCount?: number;
    albumCount?: number;
    sortBy?: ArtistSort["sortBy"];
    sortOrder?: ArtistSort["sortOrder"];
  } = {},
): Promise<Artist> {
  const data = await saavnFetch<SaavnArtist>(`/api/artists/${id}`, {
    page: options.page ?? 0,
    songCount: options.songCount ?? 10,
    albumCount: options.albumCount ?? 10,
    sortBy: options.sortBy ?? "popularity",
    sortOrder: options.sortOrder ?? "desc",
  });
  if (!data?.id) {
    throw new SaavnNotFoundError("Artist not found.");
  }

  const artist = mapArtist(data);
  const songCount = options.songCount ?? 10;
  const albumCount = options.albumCount ?? 10;
  const fallbackOptions = {
    page: options.page ?? 0,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    artistName: artist.name,
  };

  artist.topSongs = pickSongsForArtist(artist.topSongs, id, songCount, artist.name);
  artist.topAlbums = artist.topAlbums
    .filter((album) => albumBelongsToArtist(album, id, artist.name))
    .slice(0, albumCount);

  // Live discrepancy: `/api/artists/{id}` often returns empty topSongs/topAlbums
  // even when songCount/albumCount are set. Dedicated song/album endpoints currently
  // return `{ total: 0, songs: [] }` for many Western artists, so fall back to
  // documented search plus artist-credit filtering.
  const [songs, albums] = await Promise.all([
    artist.topSongs.length === 0
      ? getArtistSongs(id, { ...fallbackOptions, limit: songCount })
      : Promise.resolve({ songs: artist.topSongs }),
    artist.topAlbums.length === 0
      ? getArtistAlbums(id, { ...fallbackOptions, limit: albumCount })
      : Promise.resolve({ albums: artist.topAlbums }),
  ]);
  artist.topSongs = songs.songs;
  artist.topAlbums = albums.albums;

  return artist;
}

export async function getPlaylist(
  id: string,
  paging: SearchPaging = {},
): Promise<Playlist> {
  const data = await saavnFetch<SaavnPlaylist>("/api/playlists", {
    id,
    page: paging.page ?? 0,
    limit: paging.limit ?? 50,
  });
  if (!data?.id) {
    throw new SaavnNotFoundError("Playlist not found.");
  }
  return mapPlaylist(data);
}

export async function getSuggestions(
  id: string,
  limit = 10,
): Promise<Song[]> {
  try {
    const data = await saavnFetch<SaavnSong[]>(`/api/songs/${id}/suggestions`, {
      limit,
    });
    return mapSongs(Array.isArray(data) ? data : []);
  } catch (error) {
    if (error instanceof SaavnRateLimitedError) throw error;
    // Live discrepancy: `/api/songs/{id}/suggestions` currently fails on the
    // public instance with "Cannot read properties of undefined (reading 'id')".
    // Fall back to songs from the same primary artist.
    const song = await getSong(id);
    const artistName = song.artists.primary[0]?.name;
    if (!artistName) return [];
    const related = await searchSongs(artistName, { limit: limit + 5 });
    return related.results.filter((item) => item.id !== id).slice(0, limit);
  }
}
