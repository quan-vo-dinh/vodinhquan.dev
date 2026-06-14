"use client";

import { Bookmark, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { InterviewQuestionView } from "../types";
import { useInterviewLearningState } from "./interview-learning-state-provider";
import { getInterviewCategoryMeta } from "../lib/category-meta";
import { TechIcon } from "./tech-icon";
import { triggerConfetti } from "../lib/celebrate";
import { getRankTier } from "../lib/rank-meta";
import { RankImage } from "./rank-image";

type ProgressSummaryProps = {
  questions: InterviewQuestionView[];
  category: string;
};

function getDeveloperRank(percentage: number) {
  const tier = getRankTier(percentage);
  switch (tier.colorTheme) {
    case "iron":
      return {
        title: "Iron IV",
        className: "border-zinc-500/30 text-zinc-500 bg-zinc-500/5",
        barColorClass: "[&>div]:bg-zinc-500",
      };
    case "bronze":
      return {
        title: "Bronze IV",
        className: "border-amber-800/30 text-amber-700 bg-amber-700/5",
        barColorClass: "[&>div]:bg-amber-800",
      };
    case "silver":
      return {
        title: "Silver IV",
        className: "border-slate-400/30 text-slate-500 bg-slate-500/5",
        barColorClass: "[&>div]:bg-slate-400",
      };
    case "gold":
      return {
        title: "Gold IV",
        className: "border-yellow-500/30 text-yellow-600 bg-yellow-500/5",
        barColorClass: "[&>div]:bg-yellow-500",
      };
    case "platinum":
      return {
        title: "Platinum IV",
        className: "border-teal-500/30 text-teal-600 bg-teal-500/5",
        barColorClass: "[&>div]:bg-teal-500",
      };
    case "emerald":
      return {
        title: "Emerald IV",
        className: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
        barColorClass: "[&>div]:bg-emerald-500",
      };
    case "diamond":
      return {
        title: "Diamond IV",
        className: "border-blue-500/30 text-blue-500 bg-blue-500/5",
        barColorClass: "[&>div]:bg-blue-500",
      };
    case "master":
      return {
        title: "Master",
        className: "border-purple-500/30 text-purple-600 bg-purple-500/5",
        barColorClass: "[&>div]:bg-purple-600",
      };
    case "grandmaster":
      return {
        title: "Grandmaster",
        className: "border-rose-500/30 text-rose-600 bg-rose-500/5",
        barColorClass: "[&>div]:bg-rose-500",
      };
    case "challenger":
    default:
      return {
        title: "Challenger 👑",
        className: "border-amber-500/30 text-amber-500 bg-amber-500/10 shadow-[0_0_12px_rgba(234,179,8,0.2)] animate-pulse font-bold",
        barColorClass: "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500 [&>div]:animate-pulse",
      };
  }
}

export function ProgressSummary({ questions, category }: ProgressSummaryProps) {
  const {
    bookmarkedIds,
    isAuthenticated,
    isReady,
    isRemoteAvailable,
    learnedIds,
  } = useInterviewLearningState();
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

  const prevProgressRef = useRef(progressValue);
  const lastCategoryRef = useRef(category);
  const hasHydratedProgressRef = useRef(false);

  useEffect(() => {
    if (!isReady) return;

    if (lastCategoryRef.current !== category) {
      lastCategoryRef.current = category;
      prevProgressRef.current = progressValue;
      hasHydratedProgressRef.current = true;
      return;
    }

    if (!hasHydratedProgressRef.current) {
      hasHydratedProgressRef.current = true;
      prevProgressRef.current = progressValue;
      return;
    }

    const prev = prevProgressRef.current;
    const curr = progressValue;

    if (curr > prev) {
      const milestoneValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const crossed = milestoneValues.find((m) => prev < m && curr >= m);
      if (crossed) {
        triggerConfetti(crossed);
      }
    }
    prevProgressRef.current = curr;
  }, [progressValue, category, isReady]);

  const rank = getDeveloperRank(progressValue);
  const tier = getRankTier(progressValue);

  const milestones = [
    { value: 10, label: "Bronze (10%)", color: "bg-amber-800 border-amber-800/40" },
    { value: 20, label: "Silver (20%)", color: "bg-slate-400 border-slate-400/40" },
    { value: 30, label: "Gold (30%)", color: "bg-yellow-500 border-yellow-500/40" },
    { value: 40, label: "Platinum (40%)", color: "bg-teal-500 border-teal-500/40" },
    { value: 50, label: "Emerald (50%)", color: "bg-emerald-500 border-emerald-500/40" },
    { value: 60, label: "Diamond (60%)", color: "bg-blue-500 border-blue-500/40" },
    { value: 70, label: "Master (70%)", color: "bg-purple-500 border-purple-500/40" },
    { value: 80, label: "Grandmaster (80%)", color: "bg-rose-500 border-rose-500/40" },
    { value: 90, label: "Challenger (90%)", color: "bg-amber-500 border-amber-500/40" },
  ];

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border bg-background/95 p-2.5 shadow-sm backdrop-blur-md dark:bg-background/95 sm:gap-4 sm:rounded-2xl sm:p-4">
      {/* Left Column: Progress Info */}
      <div className="grid min-w-0 gap-2 sm:gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">
                {isAuthenticated && isRemoteAvailable
                  ? "Synced progress"
                  : "Local progress"}
              </p>
              <div className="relative size-8 flex items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RankImage
                      src={tier.logoSvg}
                      alt={tier.name}
                      width={48}
                      height={48}
                      className="absolute size-[48px] max-w-none object-contain cursor-help hover:scale-115 transition-transform select-none"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="font-semibold text-xs">{rank.title}</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAuthenticated && isRemoteAvailable
                ? "Saved to your GitHub-backed account."
                : isAuthenticated
                  ? "Remote unavailable; saved in this browser."
                  : "Stored only in this browser until you sign in."}
            </p>
          </div>
          <span className="text-sm font-semibold">{progressValue}%</span>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative w-full my-2">
          <Progress value={progressValue} className={cn("h-1.5", rank.barColorClass)} />
          <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
            {milestones.map((m) => {
              const isReached = progressValue >= m.value;
              return (
                <Tooltip key={m.value}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      style={{ left: `${m.value}%` }}
                      className={cn(
                        "absolute -translate-x-1/2 size-2.5 rounded-full border bg-background transition-all duration-300 flex items-center justify-center shadow-sm hover:scale-125 focus:outline-none pointer-events-auto cursor-pointer",
                        isReached
                          ? `${m.color} scale-105`
                          : "border-muted-foreground/30 hover:border-muted-foreground/60"
                      )}
                      aria-label={`Milestone: ${m.label}`}
                    >
                      <div className={cn(
                        "size-1 rounded-full transition-all duration-300",
                        isReached ? "bg-white scale-100" : "bg-transparent scale-0"
                      )} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px] py-1 px-2">
                    <span className="font-semibold text-xs">{m.label}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

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

      {/* Right Column: Tech Logo */}
      <div className="flex shrink-0 items-center justify-center size-12 sm:size-14 md:size-16">
        <TechIcon
          iconKey={meta.iconKey}
          className="size-full"
          iconClassName="size-full"
        />
      </div>
    </div>
  );
}
