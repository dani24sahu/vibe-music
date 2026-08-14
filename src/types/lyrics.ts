export type LyricLine = {
  time: number | null;
  text: string;
};

export type LyricsResult = {
  found: boolean;
  instrumental: boolean;
  synced: boolean;
  source: "lrclib";
  title: string | null;
  artist: string | null;
  lines: LyricLine[];
  songId?: string;
};

export type LyricsQuery = {
  title: string;
  artist: string;
  album?: string | null;
  duration?: number | null;
};
