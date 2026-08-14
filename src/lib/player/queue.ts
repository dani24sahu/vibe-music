export function fisherYatesShuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffledWithCurrentFirst<T>(items: T[], currentIndex: number): T[] {
  if (items.length === 0) return [];
  const safeIndex = Math.min(Math.max(currentIndex, 0), items.length - 1);
  const current = items[safeIndex];
  const rest = items.filter((_, index) => index !== safeIndex);
  return [current, ...fisherYatesShuffle(rest)];
}

export function nextIndex(
  currentIndex: number,
  length: number,
  repeat: "off" | "all" | "one",
): number | null {
  if (length === 0) return null;
  if (repeat === "one") return currentIndex;
  if (currentIndex + 1 < length) return currentIndex + 1;
  if (repeat === "all") return 0;
  return null;
}

export function previousIndex(currentIndex: number, length: number): number | null {
  if (length === 0) return null;
  if (currentIndex <= 0) return length - 1;
  return currentIndex - 1;
}

export function cycleRepeat(mode: "off" | "all" | "one"): "off" | "all" | "one" {
  if (mode === "off") return "all";
  if (mode === "all") return "one";
  return "off";
}
