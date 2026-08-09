import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getInterviewCategoryQuestionProgress,
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
