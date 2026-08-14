# Vibe

A personal music player. Search the catalog, queue tracks, and play them in the browser. The UI never talks to third-party APIs — Next.js route handlers fetch JioSaavn metadata and LRCLIB lyrics on the server, and audio is proxied through `/api/stream`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment variables are optional. Defaults match `.env.example`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SAAVN_API_BASE_URL` | `https://saavn.sumit.co` | Catalog API (server only) |
| `SAAVN_API_TIMEOUT_MS` | `15000` | Upstream catalog timeout |
| `LRCLIB_API_BASE_URL` | `https://lrclib.net` | Synced lyrics (server only) |
| `LRCLIB_API_TIMEOUT_MS` | `12000` | Lyrics timeout |

None of these are `NEXT_PUBLIC_*`. The browser only calls this app’s `/api/*` routes.

## Scripts

```bash
npm run dev      # development
npm test         # vitest
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```

## What it does

- Search songs, albums, artists, and playlists
- Persistent player: play/pause, seek, volume, queue, shuffle, repeat, quality
- Synced lyrics on the now-playing screen (when LRCLIB has a match)
- Favorites, recently played, and local playlists stored in `localStorage` on this device
- Light / dark theme

Artist **Popular** lists only tracks that credit that artist as a performer (primary or featured). Generic song search is unchanged, so searching an artist name can still return karaoke or covers.

## Architecture

```
Browser  →  Next.js App Router  →  saavn.sumit.co (catalog)
                                →  lrclib.net (lyrics)
                                →  aac.saavncdn.com via /api/stream (audio)
```

Playback URLs from the catalog’s `downloadUrl` field are mapped to in-app `playbackSources` and played through the stream proxy. There is no download UI.

This uses unofficial public APIs. Some Western artist pages return no original recordings from JioSaavn; Popular stays empty rather than showing unrelated covers.

## Production

```bash
npm run build
npm start
```

Works with `next start` or a Node host. On short-lived serverless platforms, artist pages can be slower when the dedicated artist-songs endpoint is empty and search has to be paged.
