"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2, Clipboard, LinkIcon, Check } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { InterviewQuestionView } from "../types";
import { InterviewMarkdown } from "./interview-markdown";
import { useLocalLearningState } from "./local-learning-state";

type QuestionListProps = {
  questions: InterviewQuestionView[];
};

function levelLabel(level: InterviewQuestionView["level"]) {
  const labels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  } satisfies Record<InterviewQuestionView["level"], string>;

  return labels[level];
}

function levelClassName(level: InterviewQuestionView["level"]) {
  const classNames = {
    beginner:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    intermediate:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    advanced:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  } satisfies Record<InterviewQuestionView["level"], string>;

  return classNames[level];
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Silently fail
  }
}

function createQuestionShareUrl(questionId: number) {
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = `question-${questionId}`;
  return shareUrl.toString();
}

export function QuestionList({ questions }: QuestionListProps) {
  const { bookmarkedIds, isReady, learnedIds, toggleBookmark, toggleLearned } =
    useLocalLearningState();

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [linkedId, setLinkedId] = useState<number | null>(null);

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground sm:rounded-2xl sm:p-8">
        No questions match the current filters.{" "}
        <span className="block mt-1 text-xs">
          Try adjusting the category, topic, or level filter.
        </span>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="grid gap-2 sm:gap-3">
      {questions.map((question, index) => {
        const isLearned = isReady && learnedIds.has(question.id);
        const isBookmarked = isReady && bookmarkedIds.has(question.id);

        return (
          <AccordionItem
            key={question.id}
            id={`question-${question.id}`}
            value={String(question.id)}
            className={cn(
              "rounded-none border-x-0 border-t bg-background/70 px-2.5 transition-all duration-200 first:border-t-0 sm:rounded-2xl sm:border-x sm:px-4",
              isLearned && "border-primary/20 bg-primary/[0.02]",
              isBookmarked && "border-amber-500/50 bg-amber-500/[0.02] dark:border-amber-500/30 shadow-md"
            )}
          >
            <AccordionTrigger className="gap-2 py-3 hover:no-underline sm:gap-3 sm:py-4 [&>svg]:hidden">
              <div className="flex w-full min-w-0 flex-col gap-2 text-left sm:gap-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <Badge
                    variant="outline"
                    className={levelClassName(question.level)}
                  >
                    {levelLabel(question.level)}
                  </Badge>
                  <Badge variant="outline">{question.subcategory}</Badge>
                  {isLearned && isReady ? (
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/10 text-primary text-[10px]"
                    >
                      <CheckCircle2 className="mr-1 size-3" />
                      Learned
                    </Badge>
                  ) : null}
                  {isBookmarked && isReady ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]"
                    >
                      <Bookmark className="mr-1 size-3 fill-current" />
                      Saved
                    </Badge>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "break-words text-[15px] font-bold leading-snug text-zinc-950 dark:text-zinc-50 sm:text-base md:text-lg",
                    isLearned &&
                      "text-muted-foreground line-through decoration-muted-foreground/50"
                  )}
                >
                  {question.question}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-3 sm:space-y-4 sm:pb-4">
              <InterviewMarkdown className="[&_.group]:-mx-1 [&_.group]:rounded-lg sm:[&_.group]:mx-0 sm:[&_.group]:rounded-xl">
                {question.answer}
              </InterviewMarkdown>
              <div className="flex flex-wrap gap-1.5 border-t pt-3 sm:gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={isLearned ? "default" : "outline"}
                      onClick={() => toggleLearned(question.id)}
                      aria-label={
                        isLearned ? "Mark as not learned" : "Mark as learned"
                      }
                    >
                      <CheckCircle2 className="mr-2 size-4" />
                      {isLearned ? "Learned" : "Mark learned"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Track your local progress</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={isBookmarked ? "default" : "outline"}
                      onClick={() => toggleBookmark(question.id)}
                      aria-label={
                        isBookmarked
                          ? "Remove bookmark"
                          : "Bookmark question"
                      }
                    >
                      <Bookmark className={cn("mr-2 size-4", isBookmarked && "fill-current")} />
                      {isBookmarked ? "Saved" : "Bookmark"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save this question locally</TooltipContent>
                </Tooltip>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyText(question.question);
                    setCopiedId(question.id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  aria-label="Copy question text"
                  className="w-[4.75rem] transition-all sm:w-20"
                >
                  {copiedId === question.id ? (
                    <>
                      <Check className="mr-2 size-4 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-2 size-4" />
                      Copy
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyText(createQuestionShareUrl(question.id));
                    setLinkedId(question.id);
                    setTimeout(() => setLinkedId(null), 2000);
                  }}
                  aria-label="Copy share link"
                  className="w-[4.75rem] transition-all sm:w-20"
                >
                  {linkedId === question.id ? (
                    <>
                      <Check className="mr-2 size-4 text-emerald-500" />
                      Linked
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 size-4" />
                      Link
                    </>
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
