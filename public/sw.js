/* Vibe service worker
 * Caches the app shell, static assets, and artwork.
 * Does NOT cache audio streams, search, POST, or error responses.
 */
const VERSION = "v1";
const STATIC_CACHE = `vibe-static-${VERSION}`;
const PAGES_CACHE = `vibe-pages-${VERSION}`;
const RSC_CACHE = `vibe-rsc-${VERSION}`;
const ARTWORK_CACHE = `vibe-artwork-${VERSION}`;
const KNOWN_CACHES = new Set([STATIC_CACHE, PAGES_CACHE, RSC_CACHE, ARTWORK_CACHE]);

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
];

const ARTWORK_HOSTS = new Set(["c.saavncdn.com", "www.jiosaavn.com"]);
const ARTWORK_MAX_ENTRIES = 80;
const RSC_MAX_ENTRIES = 40;
const PAGES_MAX_ENTRIES = 30;

const IS_DEV =
  self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // First load can happen before those routes are reachable.
          }
        }),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("vibe-") && !KNOWN_CACHES.has(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  if (shouldBypass(url, request)) return;

  event.respondWith(handleRequest(request, url));
});

function shouldBypass(url, request) {
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  if (request.headers.get("accept")?.includes("text/event-stream")) return true;
  if (url.pathname.includes("__nextjs") || url.pathname.includes("webpack-hmr")) {
    return true;
  }
  if (url.pathname.startsWith("/api/")) return true;
  return false;
}

async function handleRequest(request, url) {
  if (ARTWORK_HOSTS.has(url.hostname)) {
    return cacheFirst(request, ARTWORK_CACHE, ARTWORK_MAX_ENTRIES, true);
  }

  if (url.origin !== self.location.origin) {
    return fetch(request);
  }

  if (url.pathname.startsWith("/_next/static/")) {
    if (IS_DEV) return networkFirst(request, STATIC_CACHE, 60, false);
    return cacheFirst(request, STATIC_CACHE, 80, false);
  }

  if (isDocumentRequest(request)) {
    return networkFirst(request, PAGES_CACHE, PAGES_MAX_ENTRIES, false, [
      "/offline",
      "/",
    ]);
  }

  if (isRscRequest(request, url)) {
    return networkFirst(request, RSC_CACHE, RSC_MAX_ENTRIES, false);
  }

  if (
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.startsWith("/icons/")
  ) {
    return cacheFirst(request, STATIC_CACHE, 20, false);
  }

  return fetch(request);
}

function isDocumentRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isRscRequest(request, url) {
  return url.searchParams.has("_rsc") || request.headers.get("RSC") === "1";
}

async function cacheFirst(request, cacheName, maxEntries, allowOpaque) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheableResponse(response, allowOpaque)) {
    await cache.put(request, response.clone());
    await trimCache(cache, maxEntries);
  }
  return response;
}

async function networkFirst(request, cacheName, maxEntries, allowOpaque, fallbacks = []) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response, allowOpaque)) {
      await cache.put(request, response.clone());
      await trimCache(cache, maxEntries);
    }
    if (response.ok || response.type === "opaqueredirect") return response;
    const cached = await cache.match(request);
    if (cached) return cached;
    return (await matchFallbacks(cache, fallbacks)) || response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await matchFallbacks(cache, fallbacks);
    if (fallback) return fallback;
    const staticCache = await caches.open(STATIC_CACHE);
    const offline = await matchFallbacks(staticCache, fallbacks);
    if (offline) return offline;
    throw error;
  }
}

async function matchFallbacks(cache, fallbacks) {
  for (const url of fallbacks) {
    const match = await cache.match(url);
    if (match) return match;
  }
  return null;
}

function isCacheableResponse(response, allowOpaque) {
  if (!response) return false;
  if (response.type === "opaque") return allowOpaque;
  if (!response.ok) return false;
  if (response.status === 206) return false;
  return true;
}

async function trimCache(cache, maxEntries) {
  if (!maxEntries) return;
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const extra = keys.length - maxEntries;
  await Promise.all(keys.slice(0, extra).map((key) => cache.delete(key)));
}
