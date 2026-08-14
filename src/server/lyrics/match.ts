import { artistsAreCompatible, titlesAreCompatible } from "@/lib/lyrics/title-match";

export type LrcLibRecord = {
  id: number;
  name?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
};

export type LyricsMatchQuery = {
  title?: string;
  artist?: string;
  duration?: number;
};

export function recordTitle(record: LrcLibRecord) {
  return record.trackName || record.name || "";
}

export function lyricsRecordMatchesQuery(record: LrcLibRecord, query: LyricsMatchQuery) {
  if (query.title && !titlesAreCompatible(query.title, recordTitle(record), query.artist)) {
    return false;
  }
  if (
    query.artist &&
    record.artistName &&
    !artistsAreCompatible(query.artist, record.artistName)
  ) {
    return false;
  }
  return true;
}

export function scoreLyricsRecord(record: LrcLibRecord, duration?: number) {
  const hasSynced = Boolean(record.syncedLyrics?.trim());
  const hasPlain = Boolean(record.plainLyrics?.trim());
  if (!record.instrumental && !hasSynced && !hasPlain) return -1;

  let score = 0;
  if (hasSynced) score += 200;
  else if (hasPlain) score += 50;
  if (record.instrumental) score += 15;
  if (duration && record.duration) {
    const delta = Math.abs(record.duration - duration);
    if (delta <= 2) score += 120;
    else if (delta <= 5) score += 50;
    else score += Math.max(0, 25 - delta);
  }
  return score;
}

export function pickBestLyricsRecord(
  records: LrcLibRecord[],
  duration?: number,
  query: LyricsMatchQuery = {},
): LrcLibRecord | null {
  let best: LrcLibRecord | null = null;
  let bestScore = -1;
  const matchQuery = { ...query, duration: query.duration ?? duration };
  for (const record of records) {
    if (!lyricsRecordMatchesQuery(record, matchQuery)) continue;
    const score = scoreLyricsRecord(record, matchQuery.duration);
    if (score > bestScore) {
      best = record;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}
