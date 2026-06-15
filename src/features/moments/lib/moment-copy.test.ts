import { describe, expect, it } from "vitest";

import { getDictionary } from "@/i18n/dictionaries";

import { formatPhotoCount } from "./moment-copy";

describe("formatPhotoCount", () => {
  it("keeps Vietnamese photo counts natural", () => {
    const { common } = getDictionary("vi");

    expect(formatPhotoCount(1, common)).toBe("1 ảnh");
    expect(formatPhotoCount(2, common)).toBe("2 ảnh");
  });

  it("uses English singular and plural labels", () => {
    const { common } = getDictionary("en");

    expect(formatPhotoCount(1, common)).toBe("1 photo");
    expect(formatPhotoCount(2, common)).toBe("2 photos");
  });
});
