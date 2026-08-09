import { describe, expect, it } from "vitest";

import { calculateCategoryScore } from "./question-points";

describe("calculateCategoryScore", () => {
  it("calculates scores from progress metadata without question content", () => {
    const result = calculateCategoryScore(
      [
        { id: 1, level: "beginner" },
        { id: 2, level: "intermediate" },
        { id: 3, level: "advanced" },
      ],
      new Set([1, 3]),
      new Set([2])
    );

    expect(result).toMatchObject({
      activeCount: 2,
      currentScore: 55,
      totalPossibleScore: 55,
      progressPercentage: 100,
      counts: {
        beginner: 1,
        intermediate: 0,
        advanced: 1,
      },
    });
  });
});
