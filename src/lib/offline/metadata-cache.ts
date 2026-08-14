import {
  IDB_STORES,
  idbGet,
  idbPut,
  idbTrim,
} from "@/lib/offline/idb";
import {
  METADATA_MAX_ALBUMS,
  METADATA_MAX_ARTISTS,
  METADATA_MAX_PLAYLISTS,
  METADATA_MAX_SONGS,
} from "@/lib/offline/cache-policy";
import { isPersistedSong } from "@/lib/persist-storage";
import type { Album, Artist, Playlist, Song } from "@/types/music";

function isNamedRecord(value: unknown): value is { id: string; name: string } {
  if (!value || typeof value !== "object") return false;
  const record = value as { id?: unknown; name?: unknown };
  return typeof record.id === "string" && typeof record.name === "string";
}

export async function cacheSongMetadata(song: Song) {
  if (!isPersistedSong(song)) return;
  await idbPut(IDB_STORES.songs, { id: song.id, data: song, cachedAt: Date.now() });
  await idbTrim(IDB_STORES.songs, METADATA_MAX_SONGS);
}

export async function cacheSongsMetadata(songs: Song[]) {
  for (const song of songs) {
    if (!isPersistedSong(song)) continue;
    await idbPut(IDB_STORES.songs, { id: song.id, data: song, cachedAt: Date.now() });
  }
  await idbTrim(IDB_STORES.songs, METADATA_MAX_SONGS);
}

export async function getCachedSong(id: string): Promise<Song | null> {
  const record = await idbGet<Song>(IDB_STORES.songs, id);
  return record && isPersistedSong(record.data) ? record.data : null;
}

export async function cacheAlbumMetadata(album: Album) {
  if (!isNamedRecord(album)) return;
  await idbPut(IDB_STORES.albums, { id: album.id, data: album, cachedAt: Date.now() });
  await idbTrim(IDB_STORES.albums, METADATA_MAX_ALBUMS);
  if (Array.isArray(album.songs)) await cacheSongsMetadata(album.songs);
}

export async function getCachedAlbum(id: string): Promise<Album | null> {
  const record = await idbGet<Album>(IDB_STORES.albums, id);
  return record && isNamedRecord(record.data) ? record.data : null;
}

export async function cacheArtistMetadata(artist: Artist) {
  if (!isNamedRecord(artist)) return;
  await idbPut(IDB_STORES.artists, { id: artist.id, data: artist, cachedAt: Date.now() });
  await idbTrim(IDB_STORES.artists, METADATA_MAX_ARTISTS);
  const songs = [...(artist.topSongs ?? []), ...(artist.singles ?? [])];
  if (songs.length) await cacheSongsMetadata(songs);
}

export async function getCachedArtist(id: string): Promise<Artist | null> {
  const record = await idbGet<Artist>(IDB_STORES.artists, id);
  return record && isNamedRecord(record.data) ? record.data : null;
}

export async function cachePlaylistMetadata(playlist: Playlist) {
  if (!isNamedRecord(playlist)) return;
  await idbPut(IDB_STORES.playlists, {
    id: playlist.id,
    data: playlist,
    cachedAt: Date.now(),
  });
  await idbTrim(IDB_STORES.playlists, METADATA_MAX_PLAYLISTS);
  if (Array.isArray(playlist.songs)) await cacheSongsMetadata(playlist.songs);
}

export async function getCachedPlaylist(id: string): Promise<Playlist | null> {
  const record = await idbGet<Playlist>(IDB_STORES.playlists, id);
  return record && isNamedRecord(record.data) ? record.data : null;
}
