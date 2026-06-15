import { describe, expect, it } from "vitest";

import {
  findLocalizedPost,
  selectLocalizedPosts,
} from "./localized-posts";

const posts = [
  { locale: "en" as const, slug: "clean-code", title: "Clean Code" },
  { locale: "vi" as const, slug: "clean-code", title: "Code sạch" },
  { locale: "vi" as const, slug: "only-vi", title: "Chỉ có tiếng Việt" },
];

describe("localized blog posts", () => {
  it("returns one document per slug in the requested locale", () => {
    expect(selectLocalizedPosts(posts, "en")).toEqual([
      posts[0],
      posts[2],
    ]);
  });

  it("finds the requested translation and falls back to Vietnamese", () => {
    expect(findLocalizedPost(posts, "clean-code", "en")).toBe(posts[0]);
    expect(findLocalizedPost(posts, "only-vi", "en")).toBe(posts[2]);
  });
});
