import { MusicApiError } from "@/lib/api/client";

export const LYRICS_FRESH_MS = 7 * 24 * 60 * 60 * 1000;
export const LYRICS_NOT_FOUND_MS = 24 * 60 * 60 * 1000;
export const METADATA_MAX_SONGS = 200;
export const METADATA_MAX_ALBUMS = 40;
export const METADATA_MAX_ARTISTS = 40;
export const METADATA_MAX_PLAYLISTS = 40;
export const LYRICS_MAX_ENTRIES = 100;

export function isBrowserOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export function offlineError(message: string) {
  return new MusicApiError(message, 503, "OFFLINE");
}

export function shouldUseCacheFallback(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code: unknown }).code) : "";
  if (code === "NETWORK_ERROR" || code === "OFFLINE") return true;
  const status = "status" in error ? Number((error as { status: unknown }).status) : 0;
  return Number.isFinite(status) && status >= 500;
}

export function lyricsTtlMs(found: boolean) {
  return found ? LYRICS_FRESH_MS : LYRICS_NOT_FOUND_MS;
}

export function isCacheFresh(cachedAt: number, ttlMs: number, now = Date.now()) {
  return now - cachedAt < ttlMs;
}
