import type { Metadata } from "next";

import { InterviewPracticePage } from "@/features/interview-practice/components/interview-practice-page";
import { withResolvedTaxonomy } from "@/features/interview-practice/lib/question-filters";
import {
  getFilteredInterviewQuestions,
  getCategoryAllQuestions,
  getAllTargetInterviewQuestions,
  getInterviewCategories,
  getInterviewQuestionTotal,
  getInterviewSubcategories,
  getInterviewCategoryQuestionIds,
} from "@/features/interview-practice/lib/question-repository";
import { parseInterviewSearchParams } from "@/features/interview-practice/lib/question-url-state";

import { getCurrentViewer } from "@/features/auth/lib/get-current-viewer";
import { getCurrentUserInterviewLearningState } from "@/features/interview-practice/lib/learning-state-repository";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: dictionary.interview.title,
    description: dictionary.interview.description,
    openGraph: {
      title: dictionary.interview.title,
      description: dictionary.interview.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.interview.title,
      description: dictionary.interview.description,
    },
  };
}

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawState = parseInterviewSearchParams(await searchParams);
  const categories = getInterviewCategories(rawState.target);
  const initialSubcategories = getInterviewSubcategories(rawState.category, rawState.target);
  const state = withResolvedTaxonomy(rawState, categories, initialSubcategories);
  const subcategories = getInterviewSubcategories(state.category, state.target);
  const questions = getFilteredInterviewQuestions(state);
  const categoryQuestions = getCategoryAllQuestions(state.category, state.target, state.locale);
  const allQuestions = getAllTargetInterviewQuestions(state.target, state.locale);
  const categoryQuestionIds = getInterviewCategoryQuestionIds(state.target);

  const [viewer, learningState] = await Promise.all([
    getCurrentViewer(),
    getCurrentUserInterviewLearningState(),
  ]);

  return (
    <InterviewPracticePage
      categories={categories}
      categoryQuestionIds={categoryQuestionIds}
      filterState={state}
      initialLearningState={learningState}
      questions={questions}
      categoryQuestions={categoryQuestions}
      allQuestions={allQuestions}
      subcategories={subcategories}
      totalQuestions={getInterviewQuestionTotal(state.target)}
      viewer={viewer}
    />
  );
}
