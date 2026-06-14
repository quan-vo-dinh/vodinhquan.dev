import { z } from "zod";

const MAX_SYNC_QUESTION_IDS = 2_500;
const MAX_PINNED_CATEGORIES = 100;

const questionIdSchema = z.number().int().positive();

const questionIdListSchema = z
  .array(questionIdSchema)
  .max(MAX_SYNC_QUESTION_IDS)
  .transform((values) =>
    Array.from(new Set(values)).sort((left, right) => left - right)
  );

const pinnedCategoryListSchema = z
  .array(z.string().trim().min(1).max(100))
  .max(MAX_PINNED_CATEGORIES)
  .transform((values) =>
    Array.from(new Set(values)).sort((left, right) =>
      left.localeCompare(right)
    )
  );

export const learningProgressSnapshotSchema = z.object({
  learnedIds: questionIdListSchema,
  bookmarkedIds: questionIdListSchema,
  pinnedCategories: pinnedCategoryListSchema,
});

export const toggleQuestionStateInputSchema = z.object({
  questionId: questionIdSchema,
  enabled: z.boolean(),
});

export const pinnedCategoriesInputSchema = pinnedCategoryListSchema;

export const syncLocalLearningStateInputSchema = z.object({
  learnedIds: questionIdListSchema,
  bookmarkedIds: questionIdListSchema,
  pinnedCategories: pinnedCategoryListSchema,
});

export type LearningProgressSnapshot = z.infer<
  typeof learningProgressSnapshotSchema
>;

export type ToggleQuestionStateInput = z.infer<
  typeof toggleQuestionStateInputSchema
>;

export type SyncLocalLearningStateInput = z.infer<
  typeof syncLocalLearningStateInputSchema
>;

type LearningProgressReferenceValidation =
  | { ok: true }
  | { ok: false; reason: "unknown-reference" };

export function mergeLearningStateSnapshots(
  remote: LearningProgressSnapshot,
  local: LearningProgressSnapshot
): LearningProgressSnapshot {
  return {
    learnedIds: mergeNumbers(remote.learnedIds, local.learnedIds),
    bookmarkedIds: mergeNumbers(remote.bookmarkedIds, local.bookmarkedIds),
    pinnedCategories: mergeStrings(
      remote.pinnedCategories,
      local.pinnedCategories
    ),
  };
}

export function validateLearningProgressReferences(
  snapshot: LearningProgressSnapshot,
  knownQuestionIds: ReadonlySet<number>,
  knownCategories: ReadonlySet<string>
): LearningProgressReferenceValidation {
  const hasUnknownQuestionId = [
    ...snapshot.learnedIds,
    ...snapshot.bookmarkedIds,
  ].some((questionId) => !knownQuestionIds.has(questionId));
  const hasUnknownCategory = snapshot.pinnedCategories.some(
    (category) => !knownCategories.has(category)
  );

  return hasUnknownQuestionId || hasUnknownCategory
    ? { ok: false, reason: "unknown-reference" }
    : { ok: true };
}

export function toggleNumberSet(current: ReadonlySet<number>, value: number) {
  const next = new Set(current);
  const enabled = !next.has(value);

  if (enabled) {
    next.add(value);
  } else {
    next.delete(value);
  }

  return { enabled, next };
}

export function isLatestMutation(
  currentVersion: number,
  responseVersion: number
) {
  return currentVersion === responseVersion;
}

function mergeNumbers(left: number[], right: number[]) {
  return Array.from(new Set([...left, ...right])).sort(
    (first, second) => first - second
  );
}

function mergeStrings(left: string[], right: string[]) {
  return Array.from(new Set([...left, ...right])).sort((first, second) =>
    first.localeCompare(second)
  );
}
