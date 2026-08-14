/** Raw upstream response shapes, verified against live https://saavn.sumit.co responses. */

export type SaavnLink = {
  quality: string;
  url: string;
};

export type SaavnArtistMap = {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image?: SaavnLink[];
  url?: string;
};

export type SaavnSong = {
  id: string;
  name: string;
  type?: string;
  year?: string | null;
  releaseDate?: string | null;
  duration?: number | null;
  label?: string | null;
  explicitContent?: boolean;
  playCount?: number | null;
  language?: string;
  hasLyrics?: boolean;
  lyricsId?: string | null;
  url?: string;
  copyright?: string | null;
  album?: {
    id?: string | null;
    name?: string | null;
    url?: string | null;
  };
  artists?: {
    primary?: SaavnArtistMap[];
    featured?: SaavnArtistMap[];
    all?: SaavnArtistMap[];
  };
  image?: SaavnLink[];
  downloadUrl?: SaavnLink[];
};

export type SaavnAlbum = {
  id: string;
  name: string;
  description?: string;
  year?: number | null;
  type?: string;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  songCount?: number | null;
  url?: string;
  artists?: SaavnSong["artists"];
  image?: SaavnLink[];
  songs?: SaavnSong[] | null;
};

export type SaavnSimilarArtist = {
  id: string;
  name: string;
  url?: string;
  image?: SaavnLink[];
  type?: string;
  dominantType?: string | null;
};

export type SaavnArtist = {
  id: string;
  name: string;
  url?: string;
  type?: string;
  image?: SaavnLink[];
  followerCount?: number | null;
  fanCount?: string | null;
  isVerified?: boolean | null;
  dominantLanguage?: string | null;
  dominantType?: string | null;
  wiki?: string | null;
  availableLanguages?: string[];
  isRadioPresent?: boolean | null;
  topSongs?: SaavnSong[] | null;
  topAlbums?: SaavnAlbum[] | null;
  singles?: SaavnSong[] | null;
  similarArtists?: SaavnSimilarArtist[] | null;
};

export type SaavnPlaylist = {
  id: string;
  name: string;
  description?: string | null;
  year?: number | null;
  type?: string;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  songCount?: number | null;
  url?: string;
  image?: SaavnLink[];
  artists?: SaavnArtistMap[] | null;
  songs?: SaavnSong[] | null;
};

export type SaavnPaginated<T> = {
  total?: number;
  start?: number;
  results?: T[];
};

export type SaavnEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type SaavnGlobalHit = {
  id: string;
  title?: string;
  name?: string;
  type?: string;
  image?: SaavnLink[];
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

export type SaavnGlobalSearch = {
  topQuery?: { results?: SaavnGlobalHit[]; position?: number };
  songs?: { results?: SaavnGlobalHit[]; position?: number };
  albums?: { results?: SaavnGlobalHit[]; position?: number };
  artists?: { results?: SaavnGlobalHit[]; position?: number };
  playlists?: { results?: SaavnGlobalHit[]; position?: number };
};

export type SaavnArtistSongs = {
  total?: number;
  songs?: SaavnSong[];
  results?: SaavnSong[];
};

export type SaavnArtistAlbums = {
  total?: number;
  albums?: SaavnAlbum[];
  results?: SaavnAlbum[];
};

export type SaavnArtistSearchItem = {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image?: SaavnLink[];
  url?: string;
};

export type SaavnPlaylistSearchItem = {
  id: string;
  name: string;
  type?: string;
  image?: SaavnLink[];
  url?: string;
  songCount?: number | null;
  language?: string;
  explicitContent?: boolean;
};
