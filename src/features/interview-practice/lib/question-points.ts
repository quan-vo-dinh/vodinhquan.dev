import type { InterviewQuestionProgressMeta } from "../types";

export const QUESTION_LEVEL_POINTS = {
  beginner: 10,
  intermediate: 25,
  advanced: 45,
} as const;

export function getQuestionPoints(
  level: "beginner" | "intermediate" | "advanced"
): number {
  return QUESTION_LEVEL_POINTS[level] ?? 10;
}

export type CategoryScoreResult = {
  totalPossibleScore: number;
  currentScore: number;
  progressPercentage: number;
  activeCount: number;
  counts: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  learnedCounts: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
};

export function calculateCategoryScore(
  questions: InterviewQuestionProgressMeta[],
  learnedIds: Set<number>,
  ignoredIds: Set<number>
): CategoryScoreResult {
  const activeQuestions = questions.filter((q) => !ignoredIds.has(q.id));

  let totalPossibleScore = 0;
  let currentScore = 0;
  let beginnerCount = 0;
  let intermediateCount = 0;
  let advancedCount = 0;
  let learnedBeginnerCount = 0;
  let learnedIntermediateCount = 0;
  let learnedAdvancedCount = 0;

  for (const q of activeQuestions) {
    const pts = getQuestionPoints(q.level);
    totalPossibleScore += pts;

    if (q.level === "beginner") beginnerCount++;
    else if (q.level === "intermediate") intermediateCount++;
    else if (q.level === "advanced") advancedCount++;

    if (learnedIds.has(q.id)) {
      currentScore += pts;
      if (q.level === "beginner") learnedBeginnerCount++;
      else if (q.level === "intermediate") learnedIntermediateCount++;
      else if (q.level === "advanced") learnedAdvancedCount++;
    }
  }

  const progressPercentage =
    totalPossibleScore > 0
      ? Math.min(100, Math.round((currentScore / totalPossibleScore) * 100))
      : 0;

  return {
    totalPossibleScore,
    currentScore,
    progressPercentage,
    activeCount: activeQuestions.length,
    counts: {
      beginner: beginnerCount,
      intermediate: intermediateCount,
      advanced: advancedCount,
    },
    learnedCounts: {
      beginner: learnedBeginnerCount,
      intermediate: learnedIntermediateCount,
      advanced: learnedAdvancedCount,
    },
  };
}
