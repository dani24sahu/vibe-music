export const DISPLAY_NAME_MAX_LENGTH = 32;

export function normalizeDisplayName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, DISPLAY_NAME_MAX_LENGTH);
}

export function displayNameFromStorage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = normalizeDisplayName(value);
  return name.length > 0 ? name : null;
}

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function possessiveName(name: string) {
  return /s$/i.test(name.trim()) ? `${name.trim()}'` : `${name.trim()}'s`;
}

export function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "still up";
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  return "good evening";
}
