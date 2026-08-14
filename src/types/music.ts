export type ArtworkImage = {
  quality: string;
  url: string;
};

export type PlaybackSource = {
  quality: string;
  url: string;
};

export type ArtistRef = {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image: ArtworkImage[];
  url?: string;
};

export type SongAlbumRef = {
  id: string | null;
  name: string | null;
  url: string | null;
};

export type SongArtists = {
  primary: ArtistRef[];
  featured: ArtistRef[];
  all: ArtistRef[];
};

export type Song = {
  id: string;
  name: string;
  type: string;
  year: string | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: SongAlbumRef;
  artists: SongArtists;
  image: ArtworkImage[];
  playbackSources: PlaybackSource[];
};

export type Album = {
  id: string;
  name: string;
  description: string;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  songCount: number | null;
  url: string;
  artists: SongArtists;
  image: ArtworkImage[];
  songs: Song[];
};

export type SimilarArtist = {
  id: string;
  name: string;
  url: string;
  image: ArtworkImage[];
  type: string;
  dominantType?: string | null;
};

export type Artist = {
  id: string;
  name: string;
  url: string;
  type: string;
  image: ArtworkImage[];
  followerCount: number | null;
  fanCount: string | null;
  isVerified: boolean | null;
  dominantLanguage: string | null;
  dominantType: string | null;
  wiki: string | null;
  availableLanguages: string[];
  isRadioPresent: boolean | null;
  topSongs: Song[];
  topAlbums: Album[];
  singles: Song[];
  similarArtists: SimilarArtist[];
};

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  songCount: number | null;
  url: string;
  image: ArtworkImage[];
  artists: ArtistRef[];
  songs: Song[];
};

export type Paginated<T> = {
  total: number;
  start: number;
  results: T[];
};

export type AlbumSearchItem = {
  id: string;
  name: string;
  description: string;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  url: string;
  artists: SongArtists;
  image: ArtworkImage[];
};

export type ArtistSearchItem = {
  id: string;
  name: string;
  role: string;
  type: string;
  image: ArtworkImage[];
  url: string;
};

export type PlaylistSearchItem = {
  id: string;
  name: string;
  type: string;
  image: ArtworkImage[];
  url: string;
  songCount: number | null;
  language: string;
  explicitContent: boolean;
};

export type GlobalSearchHit = {
  id: string;
  title: string;
  type: string;
  image: ArtworkImage[];
  description?: string;
  url?: string;
  album?: string;
  primaryArtists?: string;
  singers?: string;
  language?: string;
  artist?: string;
  year?: string;
  songIds?: string;
  position?: number;
};

export type GlobalSearch = {
  topQuery: { results: GlobalSearchHit[]; position: number };
  songs: { results: GlobalSearchHit[]; position: number };
  albums: { results: GlobalSearchHit[]; position: number };
  artists: { results: GlobalSearchHit[]; position: number };
  playlists: { results: GlobalSearchHit[]; position: number };
};

export type ArtistSongsPage = {
  total: number;
  songs: Song[];
};

export type ArtistAlbumsPage = {
  total: number;
  albums: Album[];
};

export type RepeatMode = "off" | "all" | "one";
