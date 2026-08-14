export class MusicApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 500, code = "ERROR") {
    super(message);
    this.name = "MusicApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
  options?: { cache?: RequestCache },
): Promise<T> {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: options?.cache,
    });
  } catch {
    throw new MusicApiError(
      "Could not reach the local music API.",
      503,
      "NETWORK_ERROR",
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { data: T; error?: { message: string; code: string } }
    | { error: { message: string; code: string } }
    | null;

  if (!response.ok || (payload && "error" in payload && payload.error)) {
    throw new MusicApiError(
      payload && "error" in payload && payload.error
        ? payload.error.message
        : "Request failed.",
      response.status,
      payload && "error" in payload && payload.error
        ? payload.error.code
        : "ERROR",
    );
  }

  if (!payload || !("data" in payload)) {
    throw new MusicApiError("Empty response from music API.", 502, "EMPTY");
  }

  return payload.data;
}
