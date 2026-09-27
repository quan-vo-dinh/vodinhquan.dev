import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getInterviewCategoryQuestionProgress,
  getInterviewQuestionPage,
  getInterviewQuestionTotal,
} from "./question-repository";

describe("getInterviewCategoryQuestionProgress", () => {
  it.each(["junior", "senior"] as const)(
    "returns only the metadata needed for %s progress",
    (target) => {
      const categoryProgress = getInterviewCategoryQuestionProgress(target);
      const questions = Object.values(categoryProgress).flat();

      expect(questions).toHaveLength(getInterviewQuestionTotal(target));
      expect(questions.length).toBeGreaterThan(0);

      for (const question of questions) {
        expect(Object.keys(question).sort()).toEqual(["id", "level"]);
      }
    }
  );
});

describe("getInterviewQuestionPage", () => {
  it("returns a bounded DTO page instead of every matching answer", () => {
    const page = getInterviewQuestionPage(
      {
        category: "React",
        level: "all",
        locale: "en",
        mode: "list",
        page: 1,
        query: "",
        subcategory: "all",
        target: "senior",
      },
      24
    );

    expect(page.questions).toHaveLength(24);
    expect(page.pagination.totalItems).toBeGreaterThan(page.questions.length);
    expect(page.pagination.totalPages).toBeGreaterThan(1);
  });
});
