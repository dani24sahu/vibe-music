import type { LyricLine } from "@/types/lyrics";

const TIMESTAMP = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
const ENHANCED_WORD = /<\d{1,2}:\d{2}(?:\.\d{1,3})?>/g;

export function parseTimecode(minutes: string, seconds: string, fraction?: string) {
  const mins = Number.parseInt(minutes, 10);
  const secs = Number.parseInt(seconds, 10);
  let extra = 0;
  if (fraction) {
    const padded =
      fraction.length === 1 ? `${fraction}00` : fraction.length === 2 ? `${fraction}0` : fraction;
    extra = Number.parseInt(padded.slice(0, 3), 10) / 1000;
  }
  return mins * 60 + secs + extra;
}

export function parseOffsetMs(raw: string) {
  const match = raw.match(/\[offset:([+-]?\d+)\]/i);
  if (!match) return 0;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : 0;
}

export function parseLrc(raw: string | null | undefined): LyricLine[] {
  if (!raw?.trim()) return [];
  const offsetSec = parseOffsetMs(raw) / 1000;
  const lines: LyricLine[] = [];

  for (const original of raw.split(/\r?\n/)) {
    const row = original.trim();
    if (!row || /^\[[a-z]+:/i.test(row)) continue;

    const stamps: number[] = [];
    TIMESTAMP.lastIndex = 0;
    let match = TIMESTAMP.exec(row);
    while (match) {
      stamps.push(parseTimecode(match[1], match[2], match[3]) + offsetSec);
      match = TIMESTAMP.exec(row);
    }
    if (stamps.length === 0) continue;

    const text = row
      .replace(TIMESTAMP, "")
      .replace(ENHANCED_WORD, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;

    for (const time of stamps) {
      lines.push({ time: Math.max(0, time), text });
    }
  }

  return lines.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
}

export function plainLyricsToLines(raw: string | null | undefined): LyricLine[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ time: null, text }));
}

export function activeLyricIndex(lines: LyricLine[], currentTime: number) {
  let index = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const time = lines[i]?.time;
    if (time === null || time === undefined) return -1;
    if (currentTime + 0.12 >= time) index = i;
    else break;
  }
  return index;
}

export function activeLyricText(lines: LyricLine[], currentTime: number) {
  const index = activeLyricIndex(lines, currentTime);
  if (index < 0) return null;
  const text = lines[index]?.text?.replace(/\s+/g, " ").trim();
  return text || null;
}
