"use server";

import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  learningProgressSnapshotSchema,
  pinnedCategoriesInputSchema,
  syncLocalLearningStateInputSchema,
  toggleQuestionStateInputSchema,
  validateLearningProgressReferences,
  type LearningProgressSnapshot,
} from "../lib/learning-progress";
import {
  getInterviewCategoryNames,
  getInterviewQuestionIds,
} from "../lib/question-repository";

type ServerSupabaseClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export type LearningStateActionResult =
  | {
      ok: true;
      reason: null;
      snapshot: LearningProgressSnapshot;
    }
  | {
      ok: false;
      reason: string;
      snapshot: LearningProgressSnapshot | null;
    };

async function getOwnerPersistenceContext() {
  const user = await getOwnerAuthUser();

  if (!user) {
    return null;
  }

  return {
    supabase: await createSupabaseServerClient(),
    userId: user.id,
  };
}

async function readCanonicalSnapshot(
  supabase: ServerSupabaseClient,
  userId: string
) {
  const [progressResult, preferencesResult] = await Promise.all([
    supabase
      .from("interview_question_progress")
      .select("question_id, learned_at, bookmarked_at")
      .eq("user_id", userId),
    supabase
      .from("interview_user_preferences")
      .select("pinned_categories")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const error = progressResult.error ?? preferencesResult.error;

  if (error) {
    return { error: error.message, snapshot: null };
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

  return { error: null, snapshot };
}

async function finishMutation(
  supabase: ServerSupabaseClient,
  userId: string,
  mutationError: string | null
): Promise<LearningStateActionResult> {
  const canonicalResult = await readCanonicalSnapshot(supabase, userId);

  if (!canonicalResult.snapshot) {
    return {
      ok: false,
      reason: mutationError ?? canonicalResult.error ?? "persistence-unavailable",
      snapshot: null,
    };
  }

  return mutationError
    ? {
        ok: false,
        reason: mutationError,
        snapshot: canonicalResult.snapshot,
      }
    : {
        ok: true,
        reason: null,
        snapshot: canonicalResult.snapshot,
      };
}

export async function setQuestionLearned(
  input: unknown
): Promise<LearningStateActionResult> {
  const parsed = toggleQuestionStateInputSchema.safeParse(input);

  if (!parsed.success || !getInterviewQuestionIds().has(parsed.data.questionId)) {
    return { ok: false, reason: "invalid-question", snapshot: null };
  }

  const context = await getOwnerPersistenceContext();

  if (!context) {
    return { ok: false, reason: "unauthorized", snapshot: null };
  }

  const { enabled, questionId } = parsed.data;
  const { supabase, userId } = context;
  let mutationError: string | null = null;

  if (enabled) {
    const now = new Date().toISOString();
    const updateResult = await supabase
      .from("interview_question_progress")
      .update({
        learned_at: now,
        last_reviewed_at: now,
      })
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .select("question_id");

    if (updateResult.error) {
      mutationError = updateResult.error.message;
    } else if (updateResult.data.length === 0) {
      const { error: insertError } = await supabase
        .from("interview_question_progress")
        .insert({
          user_id: userId,
          question_id: questionId,
          learned_at: now,
          last_reviewed_at: now,
        });
      mutationError = insertError?.message ?? null;
    }
  } else {
    const { error: deleteError } = await supabase
      .from("interview_question_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .is("bookmarked_at", null);

    if (deleteError) {
      mutationError = deleteError.message;
    } else {
      const { error: updateError } = await supabase
        .from("interview_question_progress")
        .update({
          learned_at: null,
          last_reviewed_at: null,
        })
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .not("bookmarked_at", "is", null);
      mutationError = updateError?.message ?? null;
    }
  }

  return finishMutation(supabase, userId, mutationError);
}

export async function setQuestionBookmarked(
  input: unknown
): Promise<LearningStateActionResult> {
  const parsed = toggleQuestionStateInputSchema.safeParse(input);

  if (!parsed.success || !getInterviewQuestionIds().has(parsed.data.questionId)) {
    return { ok: false, reason: "invalid-question", snapshot: null };
  }

  const context = await getOwnerPersistenceContext();

  if (!context) {
    return { ok: false, reason: "unauthorized", snapshot: null };
  }

  const { enabled, questionId } = parsed.data;
  const { supabase, userId } = context;
  let mutationError: string | null = null;

  if (enabled) {
    const bookmarkedAt = new Date().toISOString();
    const updateResult = await supabase
      .from("interview_question_progress")
      .update({ bookmarked_at: bookmarkedAt })
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .select("question_id");

    if (updateResult.error) {
      mutationError = updateResult.error.message;
    } else if (updateResult.data.length === 0) {
      const { error: insertError } = await supabase
        .from("interview_question_progress")
        .insert({
          user_id: userId,
          question_id: questionId,
          bookmarked_at: bookmarkedAt,
        });
      mutationError = insertError?.message ?? null;
    }
  } else {
    const { error: deleteError } = await supabase
      .from("interview_question_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .is("learned_at", null);

    if (deleteError) {
      mutationError = deleteError.message;
    } else {
      const { error: updateError } = await supabase
        .from("interview_question_progress")
        .update({ bookmarked_at: null })
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .not("learned_at", "is", null);
      mutationError = updateError?.message ?? null;
    }
  }

  return finishMutation(supabase, userId, mutationError);
}

export async function setPinnedCategories(
  input: unknown
): Promise<LearningStateActionResult> {
  const parsed = pinnedCategoriesInputSchema.safeParse(input);

  if (
    !parsed.success ||
    parsed.data.some((category) => !getInterviewCategoryNames().has(category))
  ) {
    return { ok: false, reason: "invalid-category", snapshot: null };
  }

  const context = await getOwnerPersistenceContext();

  if (!context) {
    return { ok: false, reason: "unauthorized", snapshot: null };
  }

  const { supabase, userId } = context;
  const { error } = await supabase
    .from("interview_user_preferences")
    .upsert(
      {
        user_id: userId,
        pinned_categories: parsed.data,
      },
      { onConflict: "user_id" }
    );

  return finishMutation(supabase, userId, error?.message ?? null);
}

export async function syncLocalLearningState(
  input: unknown
): Promise<LearningStateActionResult> {
  const parsed = syncLocalLearningStateInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, reason: "invalid-payload", snapshot: null };
  }

  const referenceValidation = validateLearningProgressReferences(
    parsed.data,
    getInterviewQuestionIds(),
    getInterviewCategoryNames()
  );

  if (!referenceValidation.ok) {
    return { ok: false, reason: referenceValidation.reason, snapshot: null };
  }

  const context = await getOwnerPersistenceContext();

  if (!context) {
    return { ok: false, reason: "unauthorized", snapshot: null };
  }

  const { data, error } = await context.supabase.rpc(
    "merge_interview_learning_state",
    {
      p_learned_ids: parsed.data.learnedIds,
      p_bookmarked_ids: parsed.data.bookmarkedIds,
      p_pinned_categories: parsed.data.pinnedCategories,
    }
  );

  if (error) {
    return finishMutation(context.supabase, context.userId, error.message);
  }

  const snapshot = learningProgressSnapshotSchema.safeParse(data);

  return snapshot.success
    ? { ok: true, reason: null, snapshot: snapshot.data }
    : {
        ok: false,
        reason: "invalid-persistence-response",
        snapshot: null,
      };
}
