import { LyricsError } from "./errors";
import { pickBestLyricsRecord, type LrcLibRecord } from "./match";
import {
  cleanTrackTitle,
  firstArtistName,
  roundDuration,
  uniqueStrings,
} from "./normalize";
import { parseLrc, plainLyricsToLines } from "@/lib/player/lyrics";
import type { LyricsQuery, LyricsResult } from "@/types/lyrics";

const CLIENT_ID = "Vibe/0.1.0 (personal music player)";

function getBaseUrl() {
  const fallback = "https://lrclib.net";
  const raw = process.env.LRCLIB_API_BASE_URL?.trim() || fallback;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function getTimeoutMs() {
  const parsed = Number(process.env.LRCLIB_API_TIMEOUT_MS ?? 12000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 12000;
}

function emptyResult(): LyricsResult {
  return {
    found: false,
    instrumental: false,
    synced: false,
    source: "lrclib",
    title: null,
    artist: null,
    lines: [],
  };
}

function mapRecord(record: LrcLibRecord): LyricsResult {
  const synced = parseLrc(record.syncedLyrics);
  const plain = plainLyricsToLines(record.plainLyrics);
  const instrumental = Boolean(record.instrumental) && synced.length === 0 && plain.length === 0;
  return {
    found: instrumental || synced.length > 0 || plain.length > 0,
    instrumental,
    synced: synced.length > 0,
    source: "lrclib",
    title: record.trackName ?? record.name ?? null,
    artist: record.artistName ?? null,
    lines: synced.length > 0 ? synced : plain,
  };
}

async function lrclibFetch(pathname: string, query: Record<string, string | number | undefined>) {
  const url = new URL(pathname, `${getBaseUrl()}/`);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": CLIENT_ID,
        "Lrclib-Client": CLIENT_ID,
        "X-User-Agent": CLIENT_ID,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (response.status === 429) {
      throw new LyricsError(
        "Lyrics are rate-limited right now. Try again in a moment.",
        429,
        "LYRICS_RATE_LIMITED",
      );
    }

    if (!response.ok) {
      throw new LyricsError(
        `Lyrics service error (${response.status}).`,
        response.status >= 500 ? 503 : response.status,
        "LYRICS_UNAVAILABLE",
      );
    }

    try {
      return (await response.json()) as LrcLibRecord | LrcLibRecord[];
    } catch {
      throw new LyricsError(
        "The lyrics service returned an unreadable response.",
        503,
        "LYRICS_UNAVAILABLE",
      );
    }
  } catch (error) {
    if (error instanceof LyricsError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new LyricsError("The lyrics service timed out.", 503, "LYRICS_TIMEOUT");
    }
    throw new LyricsError(
      "Could not reach the lyrics service.",
      503,
      "LYRICS_UNAVAILABLE",
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function getExact(query: {
  track_name: string;
  artist_name: string;
  album_name?: string;
  duration?: number;
}) {
  const payload = await lrclibFetch("/api/get", query);
  if (!payload || Array.isArray(payload)) return null;
  return payload;
}

async function searchRecords(query: {
  q?: string;
  track_name?: string;
  artist_name?: string;
}) {
  const payload = await lrclibFetch("/api/search", query);
  return Array.isArray(payload) ? payload : [];
}

export async function getLyrics(query: LyricsQuery): Promise<LyricsResult> {
  const titles = uniqueStrings([cleanTrackTitle(query.title), query.title]);
  const artists = uniqueStrings([firstArtistName(query.artist), query.artist]);
  const album = query.album?.trim() || undefined;
  const duration = roundDuration(query.duration);

  for (const title of titles) {
    for (const artist of artists) {
      const exact = await getExact({
        track_name: title,
        artist_name: artist,
        album_name: album,
        duration,
      });
      if (exact) {
        const mapped = mapRecord(exact);
        if (mapped.found) return mapped;
      }
    }
  }

  for (const title of titles) {
    for (const artist of artists) {
      const best = pickBestLyricsRecord(
        await searchRecords({ track_name: title, artist_name: artist }),
        duration,
      );
      if (best) {
        const mapped = mapRecord(best);
        if (mapped.found) return mapped;
      }
    }
  }

  const fallback = pickBestLyricsRecord(
    await searchRecords({
      q: `${titles[0] ?? query.title} ${artists[0] ?? query.artist}`.trim(),
    }),
    duration,
  );
  if (fallback) {
    const mapped = mapRecord(fallback);
    if (mapped.found) return mapped;
  }

  return emptyResult();
}
