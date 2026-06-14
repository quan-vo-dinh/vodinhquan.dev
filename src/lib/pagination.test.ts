import { describe, expect, it } from "vitest";

import { normalizePage } from "./pagination";

describe("normalizePage", () => {
  it("keeps the first page for an empty collection", () => {
    expect(normalizePage("3", 0)).toBe(1);
    expect(normalizePage(3, 0)).toBe(1);
  });
});
