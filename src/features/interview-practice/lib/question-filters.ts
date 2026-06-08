import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewSubcategorySummary,
} from "../types";

export function resolveExistingCategory(
  categories: InterviewCategorySummary[],
  requestedCategory: string
) {
  return (
    categories.find((category) => category.name === requestedCategory)?.name ??
    categories[0]?.name ??
    requestedCategory
  );
}

export function resolveExistingSubcategory(
  subcategories: InterviewSubcategorySummary[],
  requestedSubcategory: InterviewFilterState["subcategory"]
) {
  if (requestedSubcategory === "all") {
    return "all";
  }

  return subcategories.some(
    (subcategory) => subcategory.name === requestedSubcategory
  )
    ? requestedSubcategory
    : "all";
}

export function withResolvedTaxonomy(
  state: InterviewFilterState,
  categories: InterviewCategorySummary[],
  subcategories: InterviewSubcategorySummary[]
): InterviewFilterState {
  return {
    ...state,
    category: resolveExistingCategory(categories, state.category),
    subcategory: resolveExistingSubcategory(
      subcategories,
      state.subcategory
    ),
  };
}
