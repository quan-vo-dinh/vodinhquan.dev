import {
  INTERVIEW_LEVELS,
  INTERVIEW_LOCALES,
  INTERVIEW_MODES,
  type InterviewFilterState,
  type InterviewLevelFilter,
  type InterviewLocale,
  type InterviewMode,
  type InterviewSubcategoryFilter,
} from "../types";

export const DEFAULT_INTERVIEW_CATEGORY = "Next.js";
export const DEFAULT_INTERVIEW_LOCALE: InterviewLocale = "vi";
export const DEFAULT_INTERVIEW_MODE: InterviewMode = "list";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeLevel(value: string | undefined): InterviewLevelFilter {
  if (value === "all" || !value) {
    return "all";
  }

  return INTERVIEW_LEVELS.includes(value as (typeof INTERVIEW_LEVELS)[number])
    ? (value as InterviewLevelFilter)
    : "all";
}

function normalizeLocale(value: string | undefined): InterviewLocale {
  return INTERVIEW_LOCALES.includes(value as InterviewLocale)
    ? (value as InterviewLocale)
    : DEFAULT_INTERVIEW_LOCALE;
}

function normalizeMode(value: string | undefined): InterviewMode {
  return INTERVIEW_MODES.includes(value as InterviewMode)
    ? (value as InterviewMode)
    : DEFAULT_INTERVIEW_MODE;
}

function normalizeSubcategory(
  value: string | undefined
): InterviewSubcategoryFilter {
  return value && value.trim().length > 0 ? value.trim() : "all";
}

export function parseInterviewSearchParams(
  searchParams: RawSearchParams
): InterviewFilterState {
  return {
    category:
      firstParam(searchParams.category)?.trim() || DEFAULT_INTERVIEW_CATEGORY,
    subcategory: normalizeSubcategory(firstParam(searchParams.subcategory)),
    level: normalizeLevel(firstParam(searchParams.level)),
    query: firstParam(searchParams.q)?.trim() || "",
    locale: normalizeLocale(firstParam(searchParams.lang)),
    mode: normalizeMode(firstParam(searchParams.mode)),
  };
}

export function createInterviewHref(
  nextState: Partial<InterviewFilterState>,
  currentState: InterviewFilterState
) {
  const state = { ...currentState, ...nextState };
  const params = new URLSearchParams();

  params.set("category", state.category);

  if (state.subcategory !== "all") {
    params.set("subcategory", state.subcategory);
  }

  if (state.level !== "all") {
    params.set("level", state.level);
  }

  if (state.query) {
    params.set("q", state.query);
  }

  if (state.locale !== DEFAULT_INTERVIEW_LOCALE) {
    params.set("lang", state.locale);
  }

  if (state.mode !== DEFAULT_INTERVIEW_MODE) {
    params.set("mode", state.mode);
  }

  return `/interview?${params.toString()}`;
}
