import { MusicApiError } from "@/lib/api/client";

const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 429]);
const NO_RETRY_CODES = new Set([
  "LYRICS_RATE_LIMITED",
  "SAAVN_RATE_LIMITED",
  "SAAVN_NOT_FOUND",
  "NOT_FOUND",
  "BAD_REQUEST",
]);

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function shouldRetryQuery(failureCount: number, error: Error) {
  if (isAbortError(error)) return false;
  const status = error instanceof MusicApiError ? error.status : 0;
  const code = "code" in error ? String((error as { code: unknown }).code) : "";
  if (NO_RETRY_STATUSES.has(status) || NO_RETRY_CODES.has(code)) return false;
  return failureCount < 1;
}
