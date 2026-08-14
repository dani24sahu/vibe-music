export const queryKeys = {
  searchAll: (query: string) => ["search", "all", query] as const,
  searchSongs: (query: string) => ["search", "songs", query] as const,
  searchAlbums: (query: string) => ["search", "albums", query] as const,
  searchArtists: (query: string) => ["search", "artists", query] as const,
  searchPlaylists: (query: string) => ["search", "playlists", query] as const,
  song: (id: string) => ["song", id] as const,
  suggestions: (id: string) => ["suggestions", id] as const,
  album: (id: string) => ["album", id] as const,
  artist: (id: string) => ["artist", id] as const,
  playlist: (id: string) => ["playlist", id] as const,
  lyrics: (id: string) => ["lyrics", id] as const,
};
