import { describe, expect, it } from "vitest";

import {
  createInterviewHref,
  parseInterviewSearchParams,
} from "./question-url-state";

describe("Interview URL state", () => {
  it("normalizes an invalid page and keeps a positive page", () => {
    expect(parseInterviewSearchParams({ page: "invalid" }).page).toBe(1);
    expect(parseInterviewSearchParams({ page: "3" }).page).toBe(3);
  });

  it("returns to the first page when a result-set filter changes", () => {
    const state = parseInterviewSearchParams({
      category: "React",
      page: "4",
    });

    expect(createInterviewHref({ level: "advanced" }, state)).not.toContain(
      "page="
    );
    expect(createInterviewHref({ page: 3 }, state)).toContain("page=3");
  });
});
