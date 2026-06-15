import { describe, expect, it } from "vitest";

import { getDictionary } from "./dictionaries";

function collectKeys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return typeof nestedValue === "string"
      ? [path]
      : collectKeys(nestedValue as object, path);
  });
}

describe("website dictionaries", () => {
  it("keeps Vietnamese and English message structures aligned", () => {
    expect(collectKeys(getDictionary("en")).sort()).toEqual(
      collectKeys(getDictionary("vi")).sort(),
    );
  });

  it("uses visitor-friendly Vietnamese copy for the main surfaces", () => {
    const dictionary = getDictionary("vi");

    expect(dictionary.home.greeting).toContain("tui");
    expect(dictionary.blog.description).toContain("tui");
    expect(dictionary.moments.description).toContain("Nhật ký");
    expect(dictionary.studio.privateTitle).toContain("riêng tư");
  });
});
