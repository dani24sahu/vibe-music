import type {
  Album,
  AlbumSearchItem,
  Artist,
  ArtistRef,
  ArtistSearchItem,
  ArtworkImage,
  GlobalSearch,
  GlobalSearchHit,
  PlaybackSource,
  Playlist,
  PlaylistSearchItem,
  SimilarArtist,
  Song,
  SongArtists,
} from "@/types/music";
import type {
  SaavnAlbum,
  SaavnArtist,
  SaavnArtistMap,
  SaavnArtistSearchItem,
  SaavnGlobalHit,
  SaavnGlobalSearch,
  SaavnLink,
  SaavnPlaylist,
  SaavnPlaylistSearchItem,
  SaavnSimilarArtist,
  SaavnSong,
} from "./types";

export function mapLinks(links?: SaavnLink[] | null): ArtworkImage[] {
  return (links ?? []).filter((item) => item?.url).map((item) => ({
    quality: item.quality ?? "",
    url: item.url,
  }));
}

export function mapPlaybackSources(links?: SaavnLink[] | null): PlaybackSource[] {
  return mapLinks(links);
}

export function pickArtworkUrl(
  images: ArtworkImage[],
  preferred: Array<"500x500" | "150x150" | "50x50"> = [
    "500x500",
    "150x150",
    "50x50",
  ],
): string | null {
  for (const quality of preferred) {
    const match = images.find((image) => image.quality === quality);
    if (match?.url) return match.url;
  }
  return images.at(-1)?.url ?? images[0]?.url ?? null;
}

export { pickPlaybackSource } from "@/lib/player/quality";
export { pickPlaybackUrl } from "@/lib/player/quality";

function mapArtistRef(artist: SaavnArtistMap): ArtistRef {
  return {
    id: artist.id,
    name: artist.name,
    role: artist.role,
    type: artist.type,
    image: mapLinks(artist.image),
    url: artist.url,
  };
}

function mapArtistRefs(artists?: Array<SaavnArtistMap | null | undefined> | null): ArtistRef[] {
  return (artists ?? [])
    .filter((artist): artist is SaavnArtistMap => Boolean(artist?.id && artist?.name))
    .map(mapArtistRef);
}

function mapArtists(artists?: SaavnSong["artists"]): SongArtists {
  return {
    primary: mapArtistRefs(artists?.primary),
    featured: mapArtistRefs(artists?.featured),
    all: mapArtistRefs(artists?.all),
  };
}

export function mapSong(song: SaavnSong): Song {
  return {
    id: song.id,
    name: song.name,
    type: song.type ?? "song",
    year: song.year ?? null,
    releaseDate: song.releaseDate ?? null,
    duration: song.duration ?? null,
    label: song.label ?? null,
    explicitContent: Boolean(song.explicitContent),
    playCount: song.playCount ?? null,
    language: song.language ?? "",
    hasLyrics: Boolean(song.hasLyrics),
    lyricsId: song.lyricsId ?? null,
    url: song.url ?? "",
    copyright: song.copyright ?? null,
    album: {
      id: song.album?.id ?? null,
      name: song.album?.name ?? null,
      url: song.album?.url ?? null,
    },
    artists: mapArtists(song.artists),
    image: mapLinks(song.image),
    // Upstream field is `downloadUrl`; we expose it only as in-browser playback sources.
    playbackSources: mapPlaybackSources(song.downloadUrl),
  };
}

export function mapSongs(songs?: Array<SaavnSong | null | undefined> | null): Song[] {
  return (songs ?? [])
    .filter((song): song is SaavnSong => Boolean(song?.id && song?.name))
    .map(mapSong);
}

export function mapAlbum(album: SaavnAlbum): Album {
  return {
    id: album.id,
    name: album.name,
    description: album.description ?? "",
    year: album.year ?? null,
    type: album.type ?? "album",
    playCount: album.playCount ?? null,
    language: album.language ?? "",
    explicitContent: Boolean(album.explicitContent),
    songCount: album.songCount ?? album.songs?.length ?? null,
    url: album.url ?? "",
    artists: mapArtists(album.artists),
    image: mapLinks(album.image),
    songs: mapSongs(album.songs),
  };
}

export function mapAlbumSearchItem(album: SaavnAlbum): AlbumSearchItem {
  const mapped = mapAlbum(album);
  return {
    id: mapped.id,
    name: mapped.name,
    description: mapped.description,
    year: mapped.year,
    type: mapped.type,
    playCount: mapped.playCount,
    language: mapped.language,
    explicitContent: mapped.explicitContent,
    url: mapped.url,
    artists: mapped.artists,
    image: mapped.image,
  };
}

export function mapArtistSearchItem(artist: SaavnArtistSearchItem): ArtistSearchItem {
  return {
    id: artist.id,
    name: artist.name,
    role: artist.role ?? "Artist",
    type: artist.type ?? "artist",
    image: mapLinks(artist.image),
    url: artist.url ?? "",
  };
}

export function mapPlaylistSearchItem(
  playlist: SaavnPlaylistSearchItem,
): PlaylistSearchItem {
  return {
    id: playlist.id,
    name: playlist.name,
    type: playlist.type ?? "playlist",
    image: mapLinks(playlist.image),
    url: playlist.url ?? "",
    songCount: playlist.songCount ?? null,
    language: playlist.language ?? "",
    explicitContent: Boolean(playlist.explicitContent),
  };
}

function mapSimilarArtist(artist: SaavnSimilarArtist): SimilarArtist {
  return {
    id: artist.id,
    name: artist.name,
    url: artist.url ?? "",
    image: mapLinks(artist.image),
    type: artist.type ?? "artist",
    dominantType: artist.dominantType ?? null,
  };
}

export function mapArtist(artist: SaavnArtist): Artist {
  return {
    id: artist.id,
    name: artist.name,
    url: artist.url ?? "",
    type: artist.type ?? "artist",
    image: mapLinks(artist.image),
    followerCount: artist.followerCount ?? null,
    fanCount: artist.fanCount ?? null,
    isVerified: artist.isVerified ?? null,
    dominantLanguage: artist.dominantLanguage ?? null,
    dominantType: artist.dominantType ?? null,
    wiki: artist.wiki ?? null,
    availableLanguages: artist.availableLanguages ?? [],
    isRadioPresent: artist.isRadioPresent ?? null,
    topSongs: mapSongs(artist.topSongs),
    topAlbums: (artist.topAlbums ?? [])
      .filter((album): album is SaavnAlbum => Boolean(album?.id && album?.name))
      .map(mapAlbum),
    singles: mapSongs(artist.singles),
    similarArtists: (artist.similarArtists ?? [])
      .filter((similar): similar is SaavnSimilarArtist => Boolean(similar?.id && similar?.name))
      .map(mapSimilarArtist),
  };
}

export function mapPlaylist(playlist: SaavnPlaylist): Playlist {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? null,
    year: playlist.year ?? null,
    type: playlist.type ?? "playlist",
    playCount: playlist.playCount ?? null,
    language: playlist.language ?? "",
    explicitContent: Boolean(playlist.explicitContent),
    songCount: playlist.songCount ?? playlist.songs?.length ?? null,
    url: playlist.url ?? "",
    image: mapLinks(playlist.image),
    artists: mapArtistRefs(playlist.artists),
    songs: mapSongs(playlist.songs),
  };
}

function mapGlobalHit(hit: SaavnGlobalHit): GlobalSearchHit {
  return {
    id: hit.id,
    title: hit.title ?? hit.name ?? "",
    type: hit.type ?? "",
    image: mapLinks(hit.image),
    description: hit.description,
    url: hit.url,
    album: hit.album,
    primaryArtists: hit.primaryArtists,
    singers: hit.singers,
    language: hit.language,
    artist: hit.artist,
    year: hit.year,
    songIds: hit.songIds,
    position: hit.position,
  };
}

function mapGlobalGroup(group?: {
  results?: SaavnGlobalHit[];
  position?: number;
}) {
  return {
    results: (group?.results ?? [])
      .filter((hit): hit is SaavnGlobalHit => Boolean(hit?.id))
      .map(mapGlobalHit),
    position: group?.position ?? 0,
  };
}

export function mapGlobalSearch(data: SaavnGlobalSearch): GlobalSearch {
  return {
    topQuery: mapGlobalGroup(data.topQuery),
    songs: mapGlobalGroup(data.songs),
    albums: mapGlobalGroup(data.albums),
    artists: mapGlobalGroup(data.artists),
    playlists: mapGlobalGroup(data.playlists),
  };
}

export function primaryArtistName(song: Song): string {
  return (
    song.artists.primary.map((artist) => artist.name).join(", ") ||
    song.artists.all[0]?.name ||
    "Unknown artist"
  );
}
