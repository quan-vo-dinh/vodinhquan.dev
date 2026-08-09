import "server-only";

import rawQuestions from "../data/questions.json";
import type {
  InterviewCategoryQuestionProgress,
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewLocale,
  InterviewQuestionProgressMeta,
  InterviewQuestionRaw,
  InterviewQuestionView,
  InterviewSubcategorySummary,
  InterviewTargetLevel,
} from "../types";
import { interviewQuestionRawListSchema } from "./question-schema";

const questions = interviewQuestionRawListSchema.parse(
  rawQuestions
) satisfies InterviewQuestionRaw[];
const questionIds = new Set(questions.map((question) => question.id));
const categoryNames = new Set(
  questions.map((question) => question.category)
);

export function filterByTargetLevel(
  question: InterviewQuestionRaw,
  target: InterviewTargetLevel = "senior"
): boolean {
  if (target === "junior") {
    return question.level === "beginner" || question.level === "intermediate";
  }
  return true; // senior
}

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function toQuestionView(
  question: InterviewQuestionRaw,
  locale: InterviewLocale
): InterviewQuestionView {
  return {
    id: question.id,
    category: question.category,
    subcategory: question.subcategory,
    level: question.level,
    question: locale === "en" ? question.q_en : question.q,
    answer: locale === "en" ? question.a_en : question.a,
  };
}

function toQuestionProgressMeta(
  question: InterviewQuestionRaw
): InterviewQuestionProgressMeta {
  return {
    id: question.id,
    level: question.level,
  };
}

export function getInterviewQuestionTotal(target: InterviewTargetLevel = "senior") {
  return questions.filter((q) => filterByTargetLevel(q, target)).length;
}

export function getInterviewQuestionIds(target: InterviewTargetLevel = "senior") {
  const filtered = questions.filter((q) => filterByTargetLevel(q, target));
  return new Set(filtered.map((question) => question.id));
}

export function getInterviewCategoryNames() {
  return categoryNames;
}

export function getInterviewCategories(target: InterviewTargetLevel = "senior"): InterviewCategorySummary[] {
  const counts = new Map<string, number>();

  for (const question of questions) {
    if (!filterByTargetLevel(question, target)) {
      continue;
    }
    counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
  }

  return sortByName(
    Array.from(counts, ([name, count]) => ({
      name,
      count,
    }))
  );
}

export function getInterviewSubcategories(
  category: string,
  target: InterviewTargetLevel = "senior"
): InterviewSubcategorySummary[] {
  const counts = new Map<string, number>();

  for (const question of questions) {
    if (question.category !== category) {
      continue;
    }
    if (!filterByTargetLevel(question, target)) {
      continue;
    }

    counts.set(
      question.subcategory,
      (counts.get(question.subcategory) ?? 0) + 1
    );
  }

  return sortByName(
    Array.from(counts, ([name, count]) => ({
      name,
      count,
    }))
  );
}

export function getFilteredInterviewQuestions(state: InterviewFilterState) {
  const normalizedQuery = state.query.toLowerCase();

  return questions
    .filter((question) => filterByTargetLevel(question, state.target))
    .filter((question) => question.category === state.category)
    .filter((question) =>
      state.subcategory === "all"
        ? true
        : question.subcategory === state.subcategory
    )
    .filter((question) =>
      state.level === "all" ? true : question.level === state.level
    )
    .filter((question) => {
      if (!normalizedQuery) {
        return true;
      }

      const localizedQuestion =
        state.locale === "en" ? question.q_en : question.q;
      const localizedAnswer = state.locale === "en" ? question.a_en : question.a;

      return `${localizedQuestion} ${localizedAnswer}`
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .map((question) => toQuestionView(question, state.locale));
}

export function getInterviewCategoryQuestionProgress(
  target: InterviewTargetLevel = "senior"
): InterviewCategoryQuestionProgress {
  const mapping: InterviewCategoryQuestionProgress = {};

  for (const question of questions) {
    if (!filterByTargetLevel(question, target)) {
      continue;
    }
    if (!mapping[question.category]) {
      mapping[question.category] = [];
    }
    mapping[question.category].push(toQuestionProgressMeta(question));
  }

  return mapping;
}
