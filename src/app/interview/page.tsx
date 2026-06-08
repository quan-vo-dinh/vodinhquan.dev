import type { Metadata } from "next";

import { InterviewPracticePage } from "@/features/interview-practice/components/interview-practice-page";
import { withResolvedTaxonomy } from "@/features/interview-practice/lib/question-filters";
import {
  getFilteredInterviewQuestions,
  getInterviewCategories,
  getInterviewQuestionTotal,
  getInterviewSubcategories,
} from "@/features/interview-practice/lib/question-repository";
import { parseInterviewSearchParams } from "@/features/interview-practice/lib/question-url-state";

export const metadata: Metadata = {
  title: "Interview Practice",
  description:
    "A personal interview practice question bank for software engineering topics.",
  openGraph: {
    title: "Interview Practice",
    description:
      "A personal interview practice question bank for software engineering topics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Practice",
    description:
      "A personal interview practice question bank for software engineering topics.",
  },
};

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawState = parseInterviewSearchParams(await searchParams);
  const categories = getInterviewCategories();
  const initialSubcategories = getInterviewSubcategories(rawState.category);
  const state = withResolvedTaxonomy(rawState, categories, initialSubcategories);
  const subcategories = getInterviewSubcategories(state.category);
  const questions = getFilteredInterviewQuestions(state);

  return (
    <InterviewPracticePage
      categories={categories}
      filterState={state}
      questions={questions}
      subcategories={subcategories}
      totalQuestions={getInterviewQuestionTotal()}
    />
  );
}
