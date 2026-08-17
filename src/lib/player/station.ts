import type { Song } from "@/types/music";

export const STATION_SEED_COUNT = 8;
export const STATION_MAX_TRACKS = 30;
export const STATION_SUGGESTION_SEEDS = 3;
export const STATION_SUGGESTION_LIMIT = 6;

export type StationSource = "likes" | "recents" | "mixes" | "library";
export type StationPeriod =
  | "late-night"
  | "morning"
  | "afternoon"
  | "evening"
  | "late-evening";

export type StationLibrary = {
  recentlyPlayed: Song[];
  favorites: Song[];
  playlists: Array<{ songs: Song[] }>;
};

export type StationPlan = {
  canPlay: boolean;
  seeds: Song[];
  language: string | null;
  source: StationSource;
  period: StationPeriod;
  caption: string;
  playLabel: string;
};

export function normalizeLanguage(value: string | null | undefined) {
  const language = value?.trim().toLowerCase();
  if (!language || language === "unknown") return null;
  return language;
}

export function formatLanguageLabel(language: string) {
  return language.charAt(0).toUpperCase() + language.slice(1);
}

export function stationPeriod(hour: number): StationPeriod {
  if (hour < 5) return "late-night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "late-evening";
}

export function stationPlayLabel(period: StationPeriod) {
  if (period === "morning") return "Play this morning's vibe";
  if (period === "afternoon") return "Play this afternoon's vibe";
  return "Play tonight's vibe";
}

export function collectLibrarySongs(library: StationLibrary): Song[] {
  const seen = new Set<string>();
  const songs: Song[] = [];
  const playlistSongs = library.playlists.flatMap((playlist) => playlist.songs);
  for (const song of [...library.recentlyPlayed, ...library.favorites, ...playlistSongs]) {
    if (!song?.id || seen.has(song.id)) continue;
    seen.add(song.id);
    songs.push(song);
  }
  return songs;
}

export function dominantLanguage(songs: Song[]): string | null {
  const counts = new Map<string, number>();
  for (const song of songs) {
    const language = normalizeLanguage(song.language);
    if (!language) continue;
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [language, count] of counts) {
    if (count > bestCount) {
      best = language;
      bestCount = count;
    }
  }
  return best;
}

export function pickStationSeeds(
  songs: Song[],
  language: string | null,
  count = STATION_SEED_COUNT,
): Song[] {
  if (count <= 0) return [];
  const preferred = language
    ? songs.filter((song) => normalizeLanguage(song.language) === language)
    : songs;
  const rest = language
    ? songs.filter((song) => normalizeLanguage(song.language) !== language)
    : [];
  return [...preferred, ...rest].slice(0, count);
}

export function stationSource(seeds: Song[], library: StationLibrary): StationSource {
  const favoriteIds = new Set(library.favorites.map((song) => song.id));
  const recentIds = new Set(library.recentlyPlayed.map((song) => song.id));
  const mixIds = new Set(
    library.playlists.flatMap((playlist) => playlist.songs).map((song) => song.id),
  );
  let likes = 0;
  let recents = 0;
  let mixes = 0;
  for (const seed of seeds) {
    if (favoriteIds.has(seed.id)) likes += 1;
    else if (recentIds.has(seed.id)) recents += 1;
    else if (mixIds.has(seed.id)) mixes += 1;
  }
  const highest = Math.max(likes, recents, mixes);
  if (highest === 0) return "library";
  if (likes === highest) return "likes";
  if (recents === highest) return "recents";
  return "mixes";
}

export function describeStation(input: {
  language: string | null;
  source: StationSource;
  period: StationPeriod;
  expanded?: boolean;
}) {
  const parts: string[] = [];
  if (input.language) parts.push(formatLanguageLabel(input.language));
  const sourceLabel =
    input.source === "likes"
      ? "from your likes"
      : input.source === "recents"
        ? "from your recents"
        : input.source === "mixes"
          ? "from your mixes"
          : "from your library";
  parts.push(input.expanded ? `${sourceLabel}, plus nearby tracks` : sourceLabel);
  const periodLabel =
    input.period === "late-night"
      ? "late night"
      : input.period === "morning"
        ? "this morning"
        : input.period === "afternoon"
          ? "this afternoon"
          : input.period === "evening"
            ? "this evening"
            : "late evening";
  parts.push(periodLabel);
  return `${parts.join(", ")}.`;
}

export function mergeStationQueue(
  seeds: Song[],
  related: Song[][],
  options?: { language?: string | null; max?: number },
): Song[] {
  const max = options?.max ?? STATION_MAX_TRACKS;
  const language = options?.language ?? null;
  const seen = new Set<string>();
  const queue: Song[] = [];

  function take(song: Song | undefined, requireLanguage: boolean) {
    if (!song?.id || queue.length >= max || seen.has(song.id)) return false;
    if (requireLanguage && language && normalizeLanguage(song.language) !== language) {
      return false;
    }
    seen.add(song.id);
    queue.push(song);
    return true;
  }

  for (const seed of seeds) take(seed, false);

  const buckets = related.map((songs) => [...songs]);
  let progressed = true;
  while (queue.length < max && progressed) {
    progressed = false;
    for (const bucket of buckets) {
      while (bucket.length > 0) {
        const next = bucket.shift();
        if (take(next, true)) {
          progressed = true;
          break;
        }
      }
    }
  }

  if (queue.length < max) {
    for (const songs of related) {
      for (const song of songs) {
        if (!take(song, false)) continue;
        if (queue.length >= max) break;
      }
      if (queue.length >= max) break;
    }
  }

  return queue;
}

export function buildStationPlan(library: StationLibrary, now = new Date()): StationPlan {
  const songs = collectLibrarySongs(library);
  const language = dominantLanguage(songs);
  const seeds = pickStationSeeds(songs, language);
  const period = stationPeriod(now.getHours());
  const source = stationSource(seeds, library);
  const canPlay = seeds.length > 0;
  return {
    canPlay,
    seeds,
    language,
    source,
    period,
    caption: canPlay
      ? describeStation({ language, source, period })
      : "Search it. Queue it. Loop it. Your player, your night.",
    playLabel: stationPlayLabel(period),
  };
}
