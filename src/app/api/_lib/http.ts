import { NextResponse } from "next/server";
import { LyricsError } from "@/server/lyrics";
import { SaavnError } from "@/server/saavn";

function isCodedError(
  error: unknown,
): error is Error & { status: number; code: string } {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
  "Netlify-Vary": "query",
};

export function jsonCacheHeaders(cacheSeconds: number) {
  if (cacheSeconds <= 0) return { ...NO_STORE_HEADERS };
  return {
    "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`,
    "Netlify-Vary": "query",
  };
}

export function jsonOk<T>(data: T, cacheSeconds = 120) {
  return NextResponse.json(
    { data },
    {
      status: 200,
      headers: jsonCacheHeaders(cacheSeconds),
    },
  );
}

export function jsonError(error: unknown) {
  if (error instanceof SaavnError || error instanceof LyricsError || isCodedError(error)) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.status, headers: NO_STORE_HEADERS },
    );
  }

  return NextResponse.json(
    {
      error: {
        message: "Something went wrong while loading music data.",
        code: "INTERNAL_ERROR",
      },
    },
    { status: 500, headers: NO_STORE_HEADERS },
  );
}

export function requiredQuery(url: URL, key: string) {
  const value = url.searchParams.get(key)?.trim();
  if (!value) {
    throw new SaavnError(`Missing required parameter: ${key}`, 400, "BAD_REQUEST");
  }
  return value;
}

export function optionalInt(url: URL, key: string, fallback?: number) {
  const raw = url.searchParams.get(key);
  if (raw === null || raw === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
