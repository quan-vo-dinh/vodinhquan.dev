import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { InterviewLearningStateSnapshot } from "./learning-state-types";

export const emptyInterviewLearningState: InterviewLearningStateSnapshot = {
  learnedIds: [],
  bookmarkedIds: [],
  pinnedCategories: [],
  isAuthenticated: false,
};

export async function getCurrentUserInterviewLearningState(): Promise<InterviewLearningStateSnapshot> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyInterviewLearningState;
  }

  const [{ data: rawProgress }, { data: rawPreferences }] = await Promise.all([
    supabase
      .from("interview_question_progress")
      .select("question_id, learned_at, bookmarked_at")
      .eq("user_id", user.id),
    supabase
      .from("interview_user_preferences")
      .select("pinned_categories")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const progressRows = rawProgress as {
    question_id: number;
    learned_at: string | null;
    bookmarked_at: string | null;
  }[] | null;

  const preferences = rawPreferences as {
    pinned_categories: string[];
  } | null;

  return {
    learnedIds:
      progressRows
        ?.filter((row) => row.learned_at !== null)
        .map((row) => row.question_id) ?? [],
    bookmarkedIds:
      progressRows
        ?.filter((row) => row.bookmarked_at !== null)
        .map((row) => row.question_id) ?? [],
    pinnedCategories: preferences?.pinned_categories ?? [],
    isAuthenticated: true,
  };
}
