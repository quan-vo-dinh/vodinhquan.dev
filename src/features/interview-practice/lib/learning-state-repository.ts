import "server-only";

import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { learningProgressSnapshotSchema } from "./learning-progress";
import type { InterviewLearningStateSnapshot } from "./learning-state-types";

export const emptyInterviewLearningState: InterviewLearningStateSnapshot = {
  learnedIds: [],
  bookmarkedIds: [],
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
  const [progressResult, preferencesResult] = await Promise.all([
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

  if (progressResult.error || preferencesResult.error) {
    return {
      ...emptyInterviewLearningState,
      isAuthenticated: true,
      remoteStatus: "unavailable",
    };
  }

  const snapshot = learningProgressSnapshotSchema.parse({
    learnedIds:
      progressResult.data
        ?.filter((row) => row.learned_at !== null)
        .map((row) => row.question_id) ?? [],
    bookmarkedIds:
      progressResult.data
        ?.filter((row) => row.bookmarked_at !== null)
        .map((row) => row.question_id) ?? [],
    pinnedCategories: preferencesResult.data?.pinned_categories ?? [],
  });

  return {
    ...snapshot,
    isAuthenticated: true,
    remoteStatus: "available",
  };
}
