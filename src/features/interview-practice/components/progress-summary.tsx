"use client";

import { Bookmark, CheckCircle2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import type { InterviewQuestionView } from "../types";
import { useLocalLearningState } from "./local-learning-state";
import { getInterviewCategoryMeta } from "../lib/category-meta";
import { TechIcon } from "./tech-icon";

type ProgressSummaryProps = {
  questions: InterviewQuestionView[];
  category: string;
};

export function ProgressSummary({ questions, category }: ProgressSummaryProps) {
  const { bookmarkedIds, isReady, learnedIds } = useLocalLearningState();
  const meta = getInterviewCategoryMeta(category);

  const visibleIds = new Set(questions.map((q) => q.id));
  const learnedCount = isReady
    ? Array.from(learnedIds).filter((id) => visibleIds.has(id)).length
    : 0;
  const bookmarkedCount = isReady
    ? Array.from(bookmarkedIds).filter((id) => visibleIds.has(id)).length
    : 0;
  const progressValue =
    questions.length > 0
      ? Math.round((learnedCount / questions.length) * 100)
      : 0;

  return (
    <div className="grid gap-4 rounded-2xl border bg-background/90 dark:bg-background/95 backdrop-blur-md p-4 shadow-sm grid-cols-[1fr_auto] items-center">
      {/* Left Column: Progress Info */}
      <div className="grid gap-3 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Local progress</p>
            <p className="text-xs text-muted-foreground">
              Stored only in this browser for now.
            </p>
          </div>
          <span className="text-sm font-semibold">{progressValue}%</span>
        </div>
        <Progress value={progressValue} className="h-1.5" />
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            {learnedCount} learned
          </span>
          <span className="inline-flex items-center gap-1">
            <Bookmark className="size-3.5" />
            {bookmarkedCount} bookmarked
          </span>
          <span className="ml-auto text-muted-foreground/60">
            {questions.length} visible
          </span>
        </div>
      </div>

      {/* Right Column: Large Tech Logo */}
      <div className="flex shrink-0">
        <TechIcon
          iconKey={meta.iconKey}
          className="size-12 md:size-16"
          iconClassName="size-12 md:size-16 text-foreground"
        />
      </div>
    </div>
  );
}
