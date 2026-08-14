import { SaavnError, SaavnNotFoundError, SaavnUnavailableError } from "./errors";
import type { SaavnEnvelope } from "./types";

function getBaseUrl() {
  const fallback = "https://saavn.sumit.co";
  const raw = process.env.SAAVN_API_BASE_URL?.trim() || fallback;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function getTimeoutMs() {
  const parsed = Number(process.env.SAAVN_API_TIMEOUT_MS ?? 15000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
}

export type SaavnQuery = Record<string, string | number | boolean | undefined>;

export async function saavnFetch<T>(
  pathname: string,
  query: SaavnQuery = {},
): Promise<T> {
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
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 120 },
    });

    if (response.status === 404) {
      throw new SaavnNotFoundError();
    }

    let payload: SaavnEnvelope<T> | null = null;
    try {
      payload = (await response.json()) as SaavnEnvelope<T>;
    } catch {
      throw new SaavnUnavailableError(
        "The music service returned an unreadable response.",
      );
    }

    if (!response.ok || payload?.success === false) {
      const message = payload?.message ?? `Music service error (${response.status}).`;
      if (response.status >= 500) {
        throw new SaavnUnavailableError(message);
      }
      throw new SaavnError(message, response.status);
    }

    if (payload?.data === undefined) {
      throw new SaavnNotFoundError();
    }

    return payload.data;
  } catch (error) {
    if (error instanceof SaavnError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new SaavnUnavailableError("The music service timed out.");
    }
    throw new SaavnUnavailableError(
      "Could not reach the music service. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
