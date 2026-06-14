import { describe, expect, it } from "vitest";

import { createMomentSlug } from "./moment-slug";

describe("moment slug", () => {
  it("normalizes title text into stable URL slugs", () => {
    expect(createMomentSlug("Một buổi chiều ở Sài Gòn")).toBe(
      "mot-buoi-chieu-o-sai-gon"
    );
  });

  it("falls back to a timestamp when the title has no slug-safe text", () => {
    expect(
      createMomentSlug("!!!", new Date("2026-06-14T00:00:00.000Z"))
    ).toBe("moment-2026-06-14");
  });
});
