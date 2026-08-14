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
): LrcLibRecord | null {
  let best: LrcLibRecord | null = null;
  let bestScore = -1;
  for (const record of records) {
    const score = scoreLyricsRecord(record, duration);
    if (score > bestScore) {
      best = record;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}
