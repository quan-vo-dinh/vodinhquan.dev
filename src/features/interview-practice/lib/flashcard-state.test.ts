import { describe, expect, it } from "vitest";

import { normalizeFlashcardIndex } from "./flashcard-state";

describe("normalizeFlashcardIndex", () => {
  it("clamps a stale index to the last available flashcard", () => {
    expect(normalizeFlashcardIndex(8, 3)).toBe(2);
  });

  it("returns zero for an empty deck", () => {
    expect(normalizeFlashcardIndex(4, 0)).toBe(0);
  });
});
