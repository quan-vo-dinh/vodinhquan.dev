"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2, Clipboard, LinkIcon, Check, EyeOff, Eye } from "lucide-react";

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
import { useI18n } from "@/i18n/locale-provider";

import type { InterviewQuestionView } from "../types";
import { InterviewMarkdown } from "./interview-markdown";
import { useInterviewLearningState } from "./interview-learning-state-provider";

type QuestionListProps = {
  questions: InterviewQuestionView[];
};

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
    return true;
  } catch {
    return false;
  }
}

function createQuestionShareUrl(questionId: number) {
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = `question-${questionId}`;
  return shareUrl.toString();
}

export function QuestionList({ questions }: QuestionListProps) {
  const { dictionary } = useI18n();
  const levelLabels = {
    advanced: dictionary.interview.advanced,
    beginner: dictionary.interview.beginner,
    intermediate: dictionary.interview.intermediate,
  } satisfies Record<InterviewQuestionView["level"], string>;
  const { bookmarkedIds, ignoredIds, isReady, learnedIds, toggleBookmark, toggleIgnored, toggleLearned } =
    useInterviewLearningState();

  const [copyStatus, setCopyStatus] = useState<{
    id: number;
    kind: "answer" | "link";
    status: "error" | "success";
  } | null>(null);
  const [openValue, setOpenValue] = useState<string>("");
  const [viewMode, setViewMode] = useState<"active" | "ignored">("active");

  const showCopyStatus = (nextStatus: NonNullable<typeof copyStatus>) => {
    setCopyStatus(nextStatus);
    window.setTimeout(() => {
      setCopyStatus((currentStatus) =>
        currentStatus === nextStatus ? null : currentStatus
      );
    }, 2000);
  };

  const activeQuestions = questions.filter((q) => !ignoredIds.has(q.id));
  const ignoredQuestions = questions.filter((q) => ignoredIds.has(q.id));
  const displayedQuestions = viewMode === "ignored" ? ignoredQuestions : activeQuestions;

  if (questions.length === 0 || displayedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground sm:rounded-2xl sm:p-8">
        <p>
          {viewMode === "ignored"
            ? dictionary.interview.noQuestions
            : activeQuestions.length === 0 && ignoredQuestions.length > 0
            ? `${dictionary.interview.ignoredCount}: ${ignoredQuestions.length}`
            : dictionary.interview.noQuestions}
        </p>
        <span className="block text-xs">
          {dictionary.interview.noQuestionsHint}
        </span>
        {isReady && ignoredQuestions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-7 px-3 text-xs"
            onClick={() => setViewMode(viewMode === "active" ? "ignored" : "active")}
          >
            {viewMode === "active"
              ? `${dictionary.interview.ignoredFilter} (${ignoredQuestions.length})`
              : dictionary.interview.all}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isReady && ignoredQuestions.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5">
            <EyeOff className="size-3.5 text-muted-foreground" />
            <span>
              {viewMode === "ignored"
                ? `${dictionary.interview.ignoredFilter}: ${ignoredQuestions.length}`
                : `${dictionary.interview.ignoredCount}: ${ignoredQuestions.length}`}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] font-medium hover:bg-muted"
            onClick={() => setViewMode(viewMode === "active" ? "ignored" : "active")}
          >
            {viewMode === "active"
              ? `Xem ${ignoredQuestions.length} câu đã ẩn`
              : "Quay lại danh sách chính"}
          </Button>
        </div>
      )}

      <Accordion
        type="single"
        collapsible
        value={openValue}
        onValueChange={setOpenValue}
        className="grid w-full min-w-0 max-w-full gap-2 sm:gap-3"
      >
        {displayedQuestions.map((question, index) => {
          const isLearned = isReady && learnedIds.has(question.id);
          const isBookmarked = isReady && bookmarkedIds.has(question.id);
          const isIgnored = isReady && ignoredIds.has(question.id);
        const answerCopyStatus =
          copyStatus?.id === question.id && copyStatus.kind === "answer"
            ? copyStatus.status
            : null;
        const linkCopyStatus =
          copyStatus?.id === question.id && copyStatus.kind === "link"
            ? copyStatus.status
            : null;

        return (
          <AccordionItem
            key={question.id}
            id={`question-${question.id}`}
            value={String(question.id)}
            className={cn(
              "w-full min-w-0 max-w-full rounded-none border-x-0 border-t bg-background/70 px-2.5 transition-all duration-200 first:border-t-0 sm:rounded-2xl sm:border-x sm:px-4",
              isLearned && "border-emerald-500/30 bg-emerald-500/[0.02] dark:border-emerald-500/20",
              isBookmarked && "border-amber-500/50 bg-amber-500/[0.02] dark:border-amber-500/30 shadow-md"
            )}
          >
            <AccordionTrigger className="gap-2 py-3 hover:no-underline sm:gap-3 sm:py-4 [&>svg]:hidden">
              <div className="flex w-full min-w-0 flex-col gap-2 text-left sm:gap-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground/80">
                    ID: {question.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={levelClassName(question.level)}
                  >
                    {levelLabels[question.level]}
                  </Badge>
                  <Badge variant="outline">{question.subcategory}</Badge>
                  {isLearned && isReady ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                    >
                      <CheckCircle2 className="mr-1 size-3" />
                      {dictionary.interview.learned}
                    </Badge>
                  ) : null}
                  {isBookmarked && isReady ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]"
                    >
                      <Bookmark className="mr-1 size-3 fill-current" />
                      {dictionary.interview.saved}
                    </Badge>
                  ) : null}
                  {isIgnored && isReady ? (
                    <Badge
                      variant="outline"
                      className="border-zinc-500/30 bg-zinc-500/10 text-zinc-500 text-[10px]"
                    >
                      <EyeOff className="mr-1 size-3" />
                      {dictionary.interview.ignoredFilter}
                    </Badge>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "break-words text-[15px] font-bold leading-snug text-zinc-950 dark:text-zinc-50 sm:text-base md:text-lg",
                    isLearned &&
                      "text-muted-foreground line-through decoration-muted-foreground decoration-[1.5px]",
                    isIgnored && "text-muted-foreground/80 font-medium"
                  )}
                >
                  {question.question}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-3 sm:space-y-4 sm:pb-4 w-full max-w-full min-w-0 overflow-hidden">
              {openValue === String(question.id) && (
                <InterviewMarkdown className="w-full min-w-0 overflow-hidden [&_.group]:-mx-1 [&_.group]:rounded-lg sm:[&_.group]:mx-0 sm:[&_.group]:rounded-xl">
                  {question.answer}
                </InterviewMarkdown>
              )}
              <div className="flex flex-wrap gap-1.5 border-t pt-3 sm:gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={isLearned ? "default" : "outline"}
                      onClick={() => {
                        toggleLearned(question.id);
                        const willBeLearned = !learnedIds.has(question.id);
                        if (willBeLearned) {
                          setOpenValue("");
                          // Smoothly scroll back to the collapsed item's header after collapse animation completes
                          setTimeout(() => {
                            const el = document.getElementById(`question-${question.id}`);
                            if (el) {
                              const stickyHeader = document.querySelector(".sticky-progress-summary");
                              let offset = 80; // Fallback offset
                              if (stickyHeader) {
                                const rect = stickyHeader.getBoundingClientRect();
                                const isMobile = window.innerWidth < 1024;
                                const stickyTopOffset = isMobile ? 0 : 24; // top-0 on mobile, top-6 (24px) on desktop
                                offset = stickyTopOffset + rect.height + 12; // 12px extra spacing buffer
                              }
                              
                              const elementRect = el.getBoundingClientRect();
                              const absoluteElementTop = elementRect.top + window.pageYOffset;
                              
                              window.scrollTo({
                                top: absoluteElementTop - offset,
                                behavior: "smooth",
                              });
                            }
                          }, 250);
                        }
                      }}
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
                  </TooltipTrigger>
                  <TooltipContent>
                    {dictionary.interview.trackProgress}
                  </TooltipContent>
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
                          ? dictionary.interview.removeBookmark
                          : dictionary.interview.bookmark
                      }
                    >
                      <Bookmark className={cn("mr-2 size-4", isBookmarked && "fill-current")} />
                      {isBookmarked
                        ? dictionary.interview.saved
                        : dictionary.interview.bookmark}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {dictionary.interview.saveQuestion}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={isIgnored ? "secondary" : "outline"}
                      onClick={() => toggleIgnored(question.id)}
                      aria-label={
                        isIgnored
                          ? dictionary.interview.unignoreQuestion
                          : dictionary.interview.ignoreQuestion
                      }
                      className={cn(isIgnored && "text-muted-foreground")}
                    >
                      {isIgnored ? (
                        <>
                          <Eye className="mr-2 size-4 text-zinc-500" />
                          {dictionary.interview.unignoreQuestion}
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-2 size-4 text-muted-foreground" />
                          {dictionary.interview.ignoreQuestion}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isIgnored
                      ? dictionary.interview.unignoreQuestion
                      : dictionary.interview.ignoreQuestion}
                  </TooltipContent>
                </Tooltip>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const copyContent = `Q: ${question.question}\n\nA:\n${question.answer}`;
                    const status = (await copyText(copyContent))
                      ? "success"
                      : "error";

                    showCopyStatus({
                      id: question.id,
                      kind: "answer",
                      status,
                    });
                  }}
                  aria-label={dictionary.interview.copyQuestionAria}
                  className="w-[5.5rem] transition-all sm:w-24"
                >
                  {answerCopyStatus === "success" ? (
                    <>
                      <Check className="mr-2 size-4 text-emerald-500" />
                      {dictionary.interview.copied}
                    </>
                  ) : answerCopyStatus === "error" ? (
                    <>
                      <Clipboard className="mr-2 size-4 text-destructive" />
                      {dictionary.interview.failed}
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-2 size-4" />
                      {dictionary.interview.copy}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const status = (await copyText(
                      createQuestionShareUrl(question.id)
                    ))
                      ? "success"
                      : "error";

                    showCopyStatus({
                      id: question.id,
                      kind: "link",
                      status,
                    });
                  }}
                  aria-label={dictionary.interview.copyLinkAria}
                  className="w-[5.5rem] transition-all sm:w-24"
                >
                  {linkCopyStatus === "success" ? (
                    <>
                      <Check className="mr-2 size-4 text-emerald-500" />
                      {dictionary.interview.linked}
                    </>
                  ) : linkCopyStatus === "error" ? (
                    <>
                      <LinkIcon className="mr-2 size-4 text-destructive" />
                      {dictionary.interview.failed}
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 size-4" />
                      {dictionary.interview.link}
                    </>
                  )}
                </Button>
              </div>
              <div className="sr-only" role="status" aria-live="polite">
                {answerCopyStatus === "success"
                  ? dictionary.interview.copiedStatus
                  : answerCopyStatus === "error"
                    ? dictionary.interview.copyFailedStatus
                    : linkCopyStatus === "success"
                      ? dictionary.interview.linkCopiedStatus
                      : linkCopyStatus === "error"
                        ? dictionary.interview.linkFailedStatus
                        : ""}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
    </div>
  );
}
