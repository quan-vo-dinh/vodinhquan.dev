import "server-only";

import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { learningProgressSnapshotSchema } from "./learning-progress";
import type { InterviewLearningStateSnapshot } from "./learning-state-types";

export const emptyInterviewLearningState: InterviewLearningStateSnapshot = {
  learnedIds: [],
  bookmarkedIds: [],
  ignoredIds: [],
  pinnedCategories: [],
  isAuthenticated: false,
  remoteStatus: "not-applicable",
};

export async function getCurrentUserInterviewLearningState(): Promise<InterviewLearningStateSnapshot> {
  const user = await getOwnerAuthUser();

  if (!user) {
    return emptyInterviewLearningState;
  }

  const supabase = await createSupabaseServerClient();
  let progressRows: Array<{
    question_id: number;
    learned_at: string | null;
    bookmarked_at: string | null;
    ignored_at?: string | null;
  }> = [];
  let queryError: string | null = null;

  const fullResult = await supabase
    .from("interview_question_progress")
    .select("question_id, learned_at, bookmarked_at, ignored_at")
    .eq("user_id", user.id);

  if (fullResult.error) {
    if (fullResult.error.message.includes("ignored_at") || fullResult.error.code === "PGRST204") {
      const fallbackResult = await supabase
        .from("interview_question_progress")
        .select("question_id, learned_at, bookmarked_at")
        .eq("user_id", user.id);
      queryError = fallbackResult.error?.message ?? null;
      progressRows = fallbackResult.data ?? [];
    } else {
      queryError = fullResult.error.message;
    }
  } else {
    progressRows = fullResult.data ?? [];
  }

  const preferencesResult = await supabase
    .from("interview_user_preferences")
    .select("pinned_categories")
    .eq("user_id", user.id)
    .maybeSingle();

  if (queryError || preferencesResult.error) {
    return {
      ...emptyInterviewLearningState,
      isAuthenticated: true,
      remoteStatus: "unavailable",
    };
  }

  const snapshot = learningProgressSnapshotSchema.parse({
    learnedIds:
      progressRows
        .filter((row) => row.learned_at !== null)
        .map((row) => row.question_id),
    bookmarkedIds:
      progressRows
        .filter((row) => row.bookmarked_at !== null)
        .map((row) => row.question_id),
    ignoredIds:
      progressRows
        .filter((row) => Boolean(row.ignored_at))
        .map((row) => row.question_id),
    pinnedCategories: preferencesResult.data?.pinned_categories ?? [],
  });

  return {
    ...snapshot,
    isAuthenticated: true,
    remoteStatus: "available",
  };
}
