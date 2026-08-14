import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["aac.saavncdn.com"]);

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("url");
  if (!source) {
    return NextResponse.json(
      { error: { message: "Missing stream url.", code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid stream url.", code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json(
      { error: { message: "Stream host is not allowed.", code: "FORBIDDEN" } },
      { status: 403 },
    );
  }

  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);

  let upstream: Response;
  try {
    upstream = await fetch(parsed, { headers, redirect: "follow" });
  } catch {
    return NextResponse.json(
      { error: { message: "Could not reach the audio stream.", code: "STREAM_UNAVAILABLE" } },
      { status: 502 },
    );
  }

  let finalHost = parsed.hostname;
  try {
    finalHost = new URL(upstream.url).hostname;
  } catch {
    finalHost = parsed.hostname;
  }
  if (!ALLOWED_HOSTS.has(finalHost)) {
    return NextResponse.json(
      { error: { message: "Stream host is not allowed.", code: "FORBIDDEN" } },
      { status: 403 },
    );
  }

  const responseHeaders = new Headers();
  const passthrough = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ];
  for (const name of passthrough) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  if (!responseHeaders.has("content-type")) {
    responseHeaders.set("Content-Type", "audio/mp4");
  }
  responseHeaders.set("Cache-Control", "private, max-age=3600");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
