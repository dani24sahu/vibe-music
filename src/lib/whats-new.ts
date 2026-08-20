export const APP_VERSION = "0.3.0";
export const LAST_SEEN_VERSION_KEY = "vibe-last-seen-version";

export type WhatsNewRelease = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
};

/** Newest first. Bump APP_VERSION and package.json together when adding a release. */

export const WHATS_NEW: WhatsNewRelease[] = [
  {
    version: "0.3.0",
    date: "20 Aug 2026",
    title: "tune it, spin it, feel it",
    highlights: [
      "10-band EQ with presets — shape the sound from the player.",
      "Tonight’s vibe picks a station from your likes and recents.",
      "Now Playing gets cue-card artwork and a smooth wave seek bar.",
    ],
  },
  {
    version: "0.2.1",
    date: "17 Aug 2026",
    title: "the right words, for the right song",
    highlights: [
      "Lyrics now follow the track that's playing, instead of sticking on another song.",
      "Search is a bit lighter — tabs load when you open them.",
    ],
  },
  {
    version: "0.2.0",
    date: "14 Aug 2026",
    title: "install it, play it, read it",
    highlights: [
      "Install Vibe as an app. Your liked tracks, recents, and mixes stay available offline.",
      "Phone notifications now show the song name, artist, and cover art.",
      "Now Playing shows one synced lyric above the title — tap it for the full view.",
    ],
  },
];

export function compareSemver(a: string, b: string) {
  const left = a.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const delta = (left[i] ?? 0) - (right[i] ?? 0);
    if (delta > 0) return 1;
    if (delta < 0) return -1;
  }
  return 0;
}

export function unseenReleases(
  seenVersion: string | null,
  releases: WhatsNewRelease[] = WHATS_NEW,
  currentVersion = APP_VERSION,
) {
  if (!seenVersion) {
    return releases.filter((release) => release.version === currentVersion);
  }
  return releases.filter((release) => compareSemver(release.version, seenVersion) > 0);
}

export function readSeenVersion() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_SEEN_VERSION_KEY);
  } catch {
    return null;
  }
}

export function writeSeenVersion(version: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
  } catch {
    // Private mode / quota should not block the app.
  }
}

export function markCurrentVersionSeen() {
  writeSeenVersion(APP_VERSION);
}
