import { describe, expect, it } from "vitest";
import { titlesAreCompatible } from "@/lib/lyrics/title-match";

describe("lyrics title matching", () => {
  it("accepts parenthetical catalog titles for the same song", () => {
    expect(
      titlesAreCompatible("Jaan Nisaar (Arijit)", "Jaan Nisaar", "Arijit Singh"),
    ).toBe(true);
  });

  it("rejects a different song by the same artist", () => {
    expect(
      titlesAreCompatible("Jaan Nisaar (Arijit)", "Apna Bana Le", "Arijit Singh"),
    ).toBe(false);
  });
});
