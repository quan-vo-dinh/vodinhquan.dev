export const INTERVIEW_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const INTERVIEW_LOCALES = ["vi", "en"] as const;
export const INTERVIEW_MODES = ["list", "flashcards"] as const;

export type InterviewLevel = (typeof INTERVIEW_LEVELS)[number];
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
};
