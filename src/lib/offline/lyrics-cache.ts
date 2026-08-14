import { IDB_STORES, idbGet, idbPut, idbTrim } from "@/lib/offline/idb";
import {
  isCacheFresh,
  LYRICS_MAX_ENTRIES,
  lyricsTtlMs,
} from "@/lib/offline/cache-policy";
import type { LyricsResult } from "@/types/lyrics";

function isLyricsResult(value: unknown): value is LyricsResult {
  if (!value || typeof value !== "object") return false;
  const lyrics = value as Partial<LyricsResult>;
  return (
    typeof lyrics.found === "boolean" &&
    typeof lyrics.synced === "boolean" &&
    Array.isArray(lyrics.lines)
  );
}

export async function getCachedLyrics(songId: string): Promise<{
  result: LyricsResult;
  cachedAt: number;
} | null> {
  const record = await idbGet<LyricsResult>(IDB_STORES.lyrics, songId);
  if (!record || !isLyricsResult(record.data)) return null;
  return { result: record.data, cachedAt: record.cachedAt };
}

export async function cacheLyrics(songId: string, result: LyricsResult) {
  if (!songId || !isLyricsResult(result)) return;
  await idbPut(IDB_STORES.lyrics, {
    id: songId,
    data: result,
    cachedAt: Date.now(),
  });
  await idbTrim(IDB_STORES.lyrics, LYRICS_MAX_ENTRIES);
}

export function shouldReuseCachedLyrics(
  cachedAt: number,
  found: boolean,
  online: boolean,
  now = Date.now(),
) {
  if (!online) return true;
  return isCacheFresh(cachedAt, lyricsTtlMs(found), now);
}
