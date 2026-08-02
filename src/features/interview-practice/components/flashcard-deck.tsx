"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/locale-provider";

import type { InterviewQuestionView } from "../types";
import { normalizeFlashcardIndex } from "../lib/flashcard-state";
import { InterviewMarkdown } from "./interview-markdown";
import { useInterviewLearningState } from "./interview-learning-state-provider";

type FlashcardDeckProps = {
  questions: InterviewQuestionView[];
};

export function FlashcardDeck({ questions: rawQuestions }: FlashcardDeckProps) {
  const { dictionary } = useI18n();
  const [index, setIndex] = useState(0);
  const [revealedQuestionId, setRevealedQuestionId] = useState<number | null>(
    null
  );
  const { bookmarkedIds, ignoredIds, learnedIds, toggleBookmark, toggleLearned } =
    useInterviewLearningState();

  const questions = useMemo(
    () => rawQuestions.filter((q) => !ignoredIds.has(q.id)),
    [rawQuestions, ignoredIds]
  );

  const normalizedIndex = normalizeFlashcardIndex(index, questions.length);
  const currentQuestion = questions[normalizedIndex];
  const isAnswerVisible = revealedQuestionId === currentQuestion?.id;

  const progressLabel = useMemo(() => {
    if (questions.length === 0) {
      return "0 / 0";
    }

    return `${normalizedIndex + 1} / ${questions.length}`;
  }, [normalizedIndex, questions.length]);

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground sm:rounded-2xl sm:p-8">
        {dictionary.interview.noFlashcards}
        <span className="block mt-1 text-xs">
          {dictionary.interview.noQuestionsHint}
        </span>
      </div>
    );
  }

  const isLearned = learnedIds.has(currentQuestion.id);
  const isBookmarked = bookmarkedIds.has(currentQuestion.id);

  function goToPrevious() {
    setIndex(Math.max(normalizedIndex - 1, 0));
    setRevealedQuestionId(null);
  }

  function goToNext() {
    setIndex(Math.min(normalizedIndex + 1, questions.length - 1));
    setRevealedQuestionId(null);
  }

  return (
    <Card
      className={cn(
        "rounded-xl border bg-background/70 transition-all duration-200 sm:rounded-2xl",
        isLearned && "border-emerald-500/30 bg-emerald-500/[0.02] dark:border-emerald-500/20",
        isBookmarked && "border-amber-500/50 bg-amber-500/[0.02] dark:border-amber-500/30 shadow-md"
      )}
    >
      <CardHeader className="gap-3 p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{progressLabel}</span>
          <span className="capitalize">
            ID: {currentQuestion.id} · {currentQuestion.category} · {currentQuestion.subcategory} ·{" "}
            {currentQuestion.level}
          </span>
        </div>
        <CardTitle className="text-xl font-extrabold leading-relaxed text-zinc-950 dark:text-zinc-50 sm:text-xl md:text-2xl sm:font-bold sm:leading-snug">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0 sm:space-y-5 sm:p-5 sm:pt-0">
        <div className="min-h-36 rounded-xl border bg-card p-3 transition-all sm:min-h-40 sm:rounded-2xl sm:p-5">
          {isAnswerVisible ? (
            <InterviewMarkdown>{currentQuestion.answer}</InterviewMarkdown>
          ) : (
            <p className="text-base text-muted-foreground/80">
              {dictionary.interview.thinkFirst}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevious}
            disabled={normalizedIndex === 0}
            aria-label={dictionary.interview.previousFlashcard}
          >
            <ChevronLeft className="mr-2 size-4" />
            {dictionary.common.previous}
          </Button>
          <Button
            type="button"
            onClick={() =>
              setRevealedQuestionId((currentId) =>
                currentId === currentQuestion.id ? null : currentQuestion.id
              )
            }
            aria-label={
              isAnswerVisible
                ? dictionary.interview.hideAnswer
                : dictionary.interview.revealAnswer
            }
          >
            <RotateCw className="mr-2 size-4" />
            {isAnswerVisible
              ? dictionary.interview.hideAnswer
              : dictionary.interview.revealAnswer}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goToNext}
            disabled={normalizedIndex === questions.length - 1}
            aria-label={dictionary.interview.nextFlashcard}
          >
            {dictionary.common.next}
            <ChevronRight className="ml-2 size-4" />
          </Button>
          <Button
            type="button"
            variant={isLearned ? "default" : "outline"}
            onClick={() => toggleLearned(currentQuestion.id)}
            aria-label={
              isLearned
                ? dictionary.interview.markNotLearned
                : dictionary.interview.markLearned
            }
            className={cn(
              isLearned && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 dark:border-emerald-700"
            )}
          >
            <CheckCircle2 className="mr-2 size-4" />
            {isLearned
              ? dictionary.interview.learned
              : dictionary.interview.markLearned}
          </Button>
          <Button
            type="button"
            variant={isBookmarked ? "default" : "outline"}
            onClick={() => toggleBookmark(currentQuestion.id)}
            aria-label={
              isBookmarked
                ? dictionary.interview.removeBookmark
                : dictionary.interview.bookmark
            }
          >
            <Bookmark className={cn("mr-2 size-4", isBookmarked && "fill-current")} />
            {isBookmarked
              ? dictionary.interview.saved
              : dictionary.interview.bookmark}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
