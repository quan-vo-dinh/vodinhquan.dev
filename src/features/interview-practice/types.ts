export const INTERVIEW_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const INTERVIEW_TARGET_LEVELS = ["junior", "senior"] as const;
export const INTERVIEW_LOCALES = ["vi", "en"] as const;
export const INTERVIEW_MODES = ["list", "flashcards"] as const;
export const INTERVIEW_QUESTION_PAGE_SIZE = 24;

export type InterviewLevel = (typeof INTERVIEW_LEVELS)[number];
export type InterviewTargetLevel = (typeof INTERVIEW_TARGET_LEVELS)[number];
export type InterviewLocale = (typeof INTERVIEW_LOCALES)[number];
export type InterviewMode = (typeof INTERVIEW_MODES)[number];

export type InterviewLevelFilter = InterviewLevel | "all";
export type InterviewSubcategoryFilter = string | "all";

export type InterviewQuestionRaw = {
  id: number;
  category: string;
  subcategory: string;
  level: InterviewLevel;
  q: string;
  a: string;
  q_en: string;
  a_en: string;
};

export type InterviewQuestionView = {
  id: number;
  category: string;
  subcategory: string;
  level: InterviewLevel;
  question: string;
  answer: string;
};

export type InterviewQuestionPage = {
  questions: InterviewQuestionView[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

/**
 * The only question fields needed to calculate learning progress. The category
 * is represented by the key in `InterviewCategoryQuestionProgress`.
 */
export type InterviewQuestionProgressMeta = Pick<
  InterviewQuestionView,
  "id" | "level"
>;

export type InterviewCategoryQuestionProgress = Record<
  string,
  InterviewQuestionProgressMeta[]
>;

export type InterviewCategorySummary = {
  name: string;
  count: number;
};

export type InterviewSubcategorySummary = {
  name: string;
  count: number;
};

export type InterviewFilterState = {
  category: string;
  subcategory: InterviewSubcategoryFilter;
  level: InterviewLevelFilter;
  query: string;
  locale: InterviewLocale;
  mode: InterviewMode;
  page: number;
  target: InterviewTargetLevel;
};
