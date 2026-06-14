import { describe, expect, it } from "vitest";

import {
  isLatestMutation,
  learningProgressSnapshotSchema,
  mergeLearningStateSnapshots,
  toggleNumberSet,
  syncLocalLearningStateInputSchema,
  toggleQuestionStateInputSchema,
  validateLearningProgressReferences,
} from "./learning-progress";

describe("mergeLearningStateSnapshots", () => {
  it("normalizes a canonical snapshot returned by persistence", () => {
    expect(
      learningProgressSnapshotSchema.parse({
        bookmarkedIds: [3, 3, 1],
        learnedIds: [2, 2],
        pinnedCategories: ["TypeScript", "React", "React"],
      })
    ).toEqual({
      bookmarkedIds: [1, 3],
      learnedIds: [2],
      pinnedCategories: ["React", "TypeScript"],
    });
  });

  it("preserves a remote bookmark when local state only marks the question learned", () => {
    const merged = mergeLearningStateSnapshots(
      {
        bookmarkedIds: [42],
        learnedIds: [],
        pinnedCategories: [],
      },
      {
        bookmarkedIds: [],
        learnedIds: [42],
        pinnedCategories: [],
      }
    );

    expect(merged).toEqual({
      bookmarkedIds: [42],
      learnedIds: [42],
      pinnedCategories: [],
    });
  });

  it("preserves remote learned state when local state only bookmarks the question", () => {
    const merged = mergeLearningStateSnapshots(
      {
        bookmarkedIds: [],
        learnedIds: [7],
        pinnedCategories: [],
      },
      {
        bookmarkedIds: [7],
        learnedIds: [],
        pinnedCategories: [],
      }
    );

    expect(merged).toEqual({
      bookmarkedIds: [7],
      learnedIds: [7],
      pinnedCategories: [],
    });
  });

  it("merges pinned categories deterministically and without duplicates", () => {
    const merged = mergeLearningStateSnapshots(
      {
        bookmarkedIds: [],
        learnedIds: [],
        pinnedCategories: ["React", "Next.js"],
      },
      {
        bookmarkedIds: [],
        learnedIds: [],
        pinnedCategories: ["Next.js", "TypeScript"],
      }
    );

    expect(merged.pinnedCategories).toEqual([
      "Next.js",
      "React",
      "TypeScript",
    ]);
  });
});

describe("learning progress command validation", () => {
  it("rejects invalid question identifiers", () => {
    expect(
      toggleQuestionStateInputSchema.safeParse({
        enabled: true,
        questionId: 0,
      }).success
    ).toBe(false);
  });

  it("deduplicates sync input and rejects oversized payloads", () => {
    const parsed = syncLocalLearningStateInputSchema.parse({
      bookmarkedIds: [3, 3],
      learnedIds: [2, 2],
      pinnedCategories: ["React", "React"],
    });

    expect(parsed).toEqual({
      bookmarkedIds: [3],
      learnedIds: [2],
      pinnedCategories: ["React"],
    });

    expect(
      syncLocalLearningStateInputSchema.safeParse({
        bookmarkedIds: [],
        learnedIds: Array.from({ length: 2_501 }, (_, index) => index + 1),
        pinnedCategories: [],
      }).success
    ).toBe(false);
  });

  it("rejects question IDs and categories outside the canonical catalog", () => {
    expect(
      validateLearningProgressReferences(
        {
          bookmarkedIds: [3],
          learnedIds: [2, 999],
          pinnedCategories: ["React", "Unknown"],
        },
        new Set([2, 3]),
        new Set(["React"])
      )
    ).toEqual({
      ok: false,
      reason: "unknown-reference",
    });
  });
});

describe("optimistic learning progress helpers", () => {
  it("returns a new set and the next enabled state", () => {
    const current = new Set([1]);
    const result = toggleNumberSet(current, 1);

    expect(result.enabled).toBe(false);
    expect(Array.from(result.next)).toEqual([]);
    expect(Array.from(current)).toEqual([1]);
  });

  it("only permits the latest mutation response to change optimistic state", () => {
    expect(isLatestMutation(3, 3)).toBe(true);
    expect(isLatestMutation(3, 2)).toBe(false);
  });
});
