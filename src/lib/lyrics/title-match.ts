import { cleanTrackTitle, firstArtistName } from "@/server/lyrics/normalize";

export function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0900-\u097f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coreTitle(value: string) {
  return normalizeForMatch(
    cleanTrackTitle(value)
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*\[[^\]]*\]/g, ""),
  );
}

function withoutArtistTokens(title: string, artist?: string | null) {
  const artistTokens = new Set(
    normalizeForMatch(firstArtistName(artist ?? ""))
      .split(" ")
      .filter((token) => token.length > 1),
  );
  if (artistTokens.size === 0) return title;
  return title
    .split(" ")
    .filter((token) => !artistTokens.has(token))
    .join(" ")
    .trim();
}

export function titlesAreCompatible(
  queryTitle: string | null | undefined,
  recordTitle: string | null | undefined,
  queryArtist?: string | null,
) {
  if (!queryTitle?.trim() || !recordTitle?.trim()) return false;
  const query = coreTitle(queryTitle);
  const record = coreTitle(recordTitle);
  if (!query || !record) return false;
  if (query === record) return true;

  const queryCore = withoutArtistTokens(query, queryArtist);
  const recordCore = withoutArtistTokens(record, queryArtist);
  return Boolean(queryCore && recordCore && queryCore === recordCore);
}

export function artistsAreCompatible(
  queryArtist: string | null | undefined,
  recordArtist: string | null | undefined,
) {
  if (!queryArtist?.trim() || !recordArtist?.trim()) return false;
  const query = normalizeForMatch(firstArtistName(queryArtist));
  const record = normalizeForMatch(recordArtist);
  if (!query || !record) return false;
  return record.includes(query) || query.includes(record);
}
