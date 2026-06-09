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

import type { InterviewQuestionView } from "../types";
import { InterviewMarkdown } from "./interview-markdown";
import { useLocalLearningState } from "./local-learning-state";

type FlashcardDeckProps = {
  questions: InterviewQuestionView[];
};

export function FlashcardDeck({ questions }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const { bookmarkedIds, learnedIds, toggleBookmark, toggleLearned } =
    useLocalLearningState();

  const currentQuestion = questions[index];

  const progressLabel = useMemo(() => {
    if (questions.length === 0) {
      return "0 / 0";
    }

    return `${index + 1} / ${questions.length}`;
  }, [index, questions.length]);

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground sm:rounded-2xl sm:p-8">
        No flashcards match the current filters.
        <span className="block mt-1 text-xs">
          Try adjusting the category, topic, or level filter.
        </span>
      </div>
    );
  }

  const isLearned = learnedIds.has(currentQuestion.id);
  const isBookmarked = bookmarkedIds.has(currentQuestion.id);

  function goToPrevious() {
    setIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    setIsAnswerVisible(false);
  }

  function goToNext() {
    setIndex((currentIndex) =>
      Math.min(currentIndex + 1, questions.length - 1)
    );
    setIsAnswerVisible(false);
  }

  return (
    <Card
      className={cn(
        "rounded-xl border bg-background/70 transition-all duration-200 sm:rounded-2xl",
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
        <CardTitle className="text-lg font-bold leading-snug text-zinc-950 dark:text-zinc-50 sm:text-2xl">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0 sm:space-y-5 sm:p-5 sm:pt-0">
        <div className="min-h-36 rounded-xl border bg-card p-3 transition-all sm:min-h-40 sm:rounded-2xl sm:p-5">
          {isAnswerVisible ? (
            <InterviewMarkdown>{currentQuestion.answer}</InterviewMarkdown>
          ) : (
            <p className="text-base text-muted-foreground/80">
              Think through your answer, then reveal it when ready.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevious}
            disabled={index === 0}
            aria-label="Previous flashcard"
          >
            <ChevronLeft className="mr-2 size-4" />
            Previous
          </Button>
          <Button
            type="button"
            onClick={() => setIsAnswerVisible((v) => !v)}
            aria-label={isAnswerVisible ? "Hide answer" : "Reveal answer"}
          >
            <RotateCw className="mr-2 size-4" />
            {isAnswerVisible ? "Hide answer" : "Reveal answer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goToNext}
            disabled={index === questions.length - 1}
            aria-label="Next flashcard"
          >
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
          <Button
            type="button"
            variant={isLearned ? "default" : "outline"}
            onClick={() => toggleLearned(currentQuestion.id)}
            aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
          >
            <CheckCircle2 className="mr-2 size-4" />
            {isLearned ? "Learned" : "Mark learned"}
          </Button>
          <Button
            type="button"
            variant={isBookmarked ? "default" : "outline"}
            onClick={() => toggleBookmark(currentQuestion.id)}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark className={cn("mr-2 size-4", isBookmarked && "fill-current")} />
            {isBookmarked ? "Saved" : "Bookmark"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
