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

  if (input.enabled) {
    const now = new Date().toISOString();
    const { error } = await (supabase.from("interview_question_progress") as any).upsert({
      user_id: userId,
      question_id: input.questionId,
      learned_at: now,
      last_reviewed_at: now,
    });
    return { ok: !error, reason: error?.message ?? null };
  } else {
    // Delete row if it has no bookmark (to prevent violating the check constraint)
    const { error: deleteError } = await supabase
      .from("interview_question_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", input.questionId)
      .is("bookmarked_at", null);

    if (deleteError) {
      return { ok: false, reason: deleteError.message };
    }

    // Otherwise update learned fields to null if bookmark exists
    const { error: updateError } = await (supabase
      .from("interview_question_progress") as any)
      .update({
        learned_at: null,
        last_reviewed_at: null,
      })
      .eq("user_id", userId)
      .eq("question_id", input.questionId)
      .not("bookmarked_at", "is", null);

    return { ok: !updateError, reason: updateError?.message ?? null };
  }
}

export async function setQuestionBookmarked(input: ToggleQuestionStateInput) {
  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "unauthenticated" as const };
  }

  if (input.enabled) {
    const { error } = await (supabase.from("interview_question_progress") as any).upsert({
      user_id: userId,
      question_id: input.questionId,
      bookmarked_at: new Date().toISOString(),
    });
    return { ok: !error, reason: error?.message ?? null };
  } else {
    // Delete row if it has no learned state
    const { error: deleteError } = await supabase
      .from("interview_question_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", input.questionId)
      .is("learned_at", null);

    if (deleteError) {
      return { ok: false, reason: deleteError.message };
    }

    // Otherwise update bookmark field to null if learned state exists
    const { error: updateError } = await (supabase
      .from("interview_question_progress") as any)
      .update({
        bookmarked_at: null,
      })
      .eq("user_id", userId)
      .eq("question_id", input.questionId)
      .not("learned_at", "is", null);

    return { ok: !updateError, reason: updateError?.message ?? null };
  }
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
