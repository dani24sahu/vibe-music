export function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const next = value?.trim();
    if (!next) continue;
    const key = next.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(next);
  }
  return result;
}

export function firstArtistName(artist: string) {
  return artist.split(/,|&| feat\.? | ft\.? /i)[0]?.trim() ?? artist.trim();
}

export function cleanTrackTitle(title: string) {
  return (
    title
      .replace(/\s*\([^)]*(from|official|lyric|video|audio|remaster|cover|live)[^)]*\)/gi, "")
      .replace(/\s*-\s*(from|official|lyric|video).*$/i, "")
      .replace(/\s+/g, " ")
      .trim() || title.trim()
  );
}

export function roundDuration(duration?: number | null) {
  if (duration === null || duration === undefined || !Number.isFinite(duration)) {
    return undefined;
  }
  const rounded = Math.round(duration);
  if (rounded < 1 || rounded > 3600) return undefined;
  return rounded;
}
