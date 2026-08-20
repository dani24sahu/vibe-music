import { describe, expect, it } from "vitest";
import {
  cycleRepeat,
  nextIndex,
  previousIndex,
  shuffledWithCurrentFirst,
  upcomingFromQueue,
} from "@/lib/player/queue";

describe("queue helpers", () => {
  it("advances sequentially and stops at the end when repeat is off", () => {
    expect(nextIndex(0, 3, "off")).toBe(1);
    expect(nextIndex(2, 3, "off")).toBeNull();
  });

  it("wraps when repeat is all and stays when repeat is one", () => {
    expect(nextIndex(2, 3, "all")).toBe(0);
    expect(nextIndex(1, 3, "one")).toBe(1);
  });

  it("goes to the previous track and wraps from the start", () => {
    expect(previousIndex(2, 3)).toBe(1);
    expect(previousIndex(0, 3)).toBe(2);
  });

  it("cycles repeat modes", () => {
    expect(cycleRepeat("off")).toBe("all");
    expect(cycleRepeat("all")).toBe("one");
    expect(cycleRepeat("one")).toBe("off");
  });

  it("keeps the current item first when shuffling", () => {
    const items = ["a", "b", "c", "d"];
    const shuffled = shuffledWithCurrentFirst(items, 2);
    expect(shuffled[0]).toBe("c");
    expect(shuffled).toHaveLength(4);
    expect(new Set(shuffled)).toEqual(new Set(items));
  });

  it("peeks upcoming tracks without wrapping", () => {
    expect(upcomingFromQueue(["a", "b", "c", "d"], 1, 2)).toEqual(["c", "d"]);
    expect(upcomingFromQueue(["a", "b"], 1, 2)).toEqual([]);
    expect(upcomingFromQueue(["a"], 0, 2)).toEqual([]);
  });
});
