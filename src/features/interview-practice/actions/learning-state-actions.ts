"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ToggleQuestionStateInput = {
  questionId: number;
  enabled: boolean;
};

type SyncLocalStateInput = {
  learnedIds: number[];
  bookmarkedIds: number[];
  pinnedCategories: string[];
};

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function setQuestionLearned(input: ToggleQuestionStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const now = new Date().toISOString();
  const { error } = await (supabase.from("interview_question_progress") as any).upsert({
    user_id: userId,
    question_id: input.questionId,
    learned_at: input.enabled ? now : null,
    last_reviewed_at: input.enabled ? now : null,
  });

  return { ok: !error, reason: error?.message ?? null };
}

export async function setQuestionBookmarked(input: ToggleQuestionStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const { error } = await (supabase.from("interview_question_progress") as any).upsert({
    user_id: userId,
    question_id: input.questionId,
    bookmarked_at: input.enabled ? new Date().toISOString() : null,
  });

  return { ok: !error, reason: error?.message ?? null };
}

export async function setPinnedCategories(pinnedCategories: string[]) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const { error } = await (supabase.from("interview_user_preferences") as any).upsert({
    user_id: userId,
    pinned_categories: pinnedCategories,
  });

  return { ok: !error, reason: error?.message ?? null };
}

export async function syncLocalLearningState(input: SyncLocalStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  const now = new Date().toISOString();
  const questionIds = Array.from(
    new Set([...input.learnedIds, ...input.bookmarkedIds])
  );

  const progressRows = questionIds.map((questionId) => ({
    user_id: userId,
    question_id: questionId,
    learned_at: input.learnedIds.includes(questionId) ? now : null,
    bookmarked_at: input.bookmarkedIds.includes(questionId) ? now : null,
    last_reviewed_at: input.learnedIds.includes(questionId) ? now : null,
  }));

  const progressResult =
    progressRows.length > 0
      ? await (supabase.from("interview_question_progress") as any).upsert(progressRows)
      : { error: null };

  const preferencesResult = await (supabase
    .from("interview_user_preferences") as any)
    .upsert({
      user_id: userId,
      pinned_categories: input.pinnedCategories,
    });

  const error = progressResult.error ?? preferencesResult.error;

  return { ok: !error, reason: error?.message ?? null };
}
