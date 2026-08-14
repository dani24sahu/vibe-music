import { apiGet } from "./client";
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
import type { LyricsQuery, LyricsResult } from "@/types/lyrics";

export function searchAll(query: string) {
  return apiGet<GlobalSearch>("/api/search", { query });
}

export function searchSongs(query: string, page = 0, limit = 20) {
  return apiGet<Paginated<Song>>("/api/search/songs", { query, page, limit });
}

export function searchAlbums(query: string, page = 0, limit = 20) {
  return apiGet<Paginated<AlbumSearchItem>>("/api/search/albums", {
    query,
    page,
    limit,
  });
}

export function searchArtists(query: string, page = 0, limit = 20) {
  return apiGet<Paginated<ArtistSearchItem>>("/api/search/artists", {
    query,
    page,
    limit,
  });
}

export function searchPlaylists(query: string, page = 0, limit = 20) {
  return apiGet<Paginated<PlaylistSearchItem>>("/api/search/playlists", {
    query,
    page,
    limit,
  });
}

export function getSong(id: string) {
  return apiGet<Song>(`/api/songs/${id}`);
}

export function getSuggestions(id: string, limit = 10) {
  return apiGet<Song[]>(`/api/songs/${id}/suggestions`, { limit });
}

export function getAlbum(id: string) {
  return apiGet<Album>(`/api/albums/${id}`);
}

export function getArtist(id: string) {
  return apiGet<Artist>(`/api/artists/${id}`);
}

export function getArtistSongs(id: string, page = 0) {
  return apiGet<ArtistSongsPage>(`/api/artists/${id}/songs`, { page });
}

export function getArtistAlbums(id: string, page = 0) {
  return apiGet<ArtistAlbumsPage>(`/api/artists/${id}/albums`, { page });
}

export function getPlaylist(id: string) {
  return apiGet<Playlist>(`/api/playlists/${id}`);
}

export function getLyrics(query: LyricsQuery) {
  return apiGet<LyricsResult>("/api/lyrics", {
    title: query.title,
    artist: query.artist,
    album: query.album ?? undefined,
    duration: query.duration ?? undefined,
  });
}

export function streamUrl(sourceUrl: string) {
  return `/api/stream?url=${encodeURIComponent(sourceUrl)}`;
}
