"use client";

import { Bookmark, CheckCircle2, EyeOff } from "lucide-react";
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
import { useI18n } from "@/i18n/locale-provider";

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
  const { dictionary } = useI18n();
  const {
    bookmarkedIds,
    ignoredIds,
    isAuthenticated,
    isReady,
    isRemoteAvailable,
    learnedIds,
  } = useInterviewLearningState();
  const meta = getInterviewCategoryMeta(category);

  const activeQuestions = questions.filter((q) => !ignoredIds.has(q.id));
  const activeIds = new Set(activeQuestions.map((q) => q.id));

  const learnedCount = isReady
    ? Array.from(learnedIds).filter((id) => activeIds.has(id)).length
    : 0;
  const bookmarkedCount = isReady
    ? Array.from(bookmarkedIds).filter((id) => activeIds.has(id)).length
    : 0;
  const ignoredCount = isReady
    ? questions.filter((q) => ignoredIds.has(q.id)).length
    : 0;

  const progressValue =
    activeQuestions.length > 0
      ? Math.round((learnedCount / activeQuestions.length) * 100)
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
    { value: 10, label: "Bronze (10%)", logoSvg: "/ranked/bronze-logo.svg" },
    { value: 20, label: "Silver (20%)", logoSvg: "/ranked/sliver-logo.svg" },
    { value: 30, label: "Gold (30%)", logoSvg: "/ranked/gold-logo.svg" },
    { value: 40, label: "Platinum (40%)", logoSvg: "/ranked/platinum-logo.svg" },
    { value: 50, label: "Emerald (50%)", logoSvg: "/ranked/emerald-logo.svg" },
    { value: 60, label: "Diamond (60%)", logoSvg: "/ranked/diamond-logo.svg" },
    { value: 70, label: "Master (70%)", logoSvg: "/ranked/master-logo.svg" },
    { value: 80, label: "Grandmaster (80%)", logoSvg: "/ranked/grandmaster-logo.svg" },
    { value: 90, label: "Challenger (90%)", logoSvg: "/ranked/challenger-logo.svg" },
  ];

  return (
    <div className="relative rounded-xl border bg-background/95 px-2 py-1.5 shadow-sm backdrop-blur-md dark:bg-background/95 sm:rounded-2xl sm:px-3 sm:py-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        {/* Left: Progress Title */}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium truncate">
            {isAuthenticated && isRemoteAvailable
              ? dictionary.interview.syncedProgress
              : dictionary.interview.localProgress}
          </p>
        </div>

        {/* Right: Rank Title + % + Tech Icon */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border bg-muted/50 text-foreground truncate">
            {rank.title}
          </span>
          <span className="text-xs sm:text-sm font-bold shrink-0">{progressValue}%</span>
          <div className="flex shrink-0 items-center justify-center size-5 sm:size-6">
            <TechIcon
              iconKey={meta.iconKey}
              className="size-full"
              iconClassName="size-full"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar with Milestone Rank SVGs */}
      <div className="relative w-full my-1.5 pt-1 pb-0.5">
        <Progress value={progressValue} className={cn("h-1.5 rounded-full", rank.barColorClass)} />
        <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
          {milestones.map((m) => {
            const isReached = progressValue >= m.value;
            return (
              <Tooltip key={m.value}>
                <TooltipTrigger asChild>
                  <div
                    style={{ left: `${m.value}%` }}
                    className="absolute -translate-x-1/2 flex items-center justify-center pointer-events-auto cursor-pointer select-none group"
                  >
                    <div
                      className={cn(
                        "relative size-6 sm:size-7 flex items-center justify-center transition-all duration-300 transform group-hover:scale-125",
                        isReached
                          ? "opacity-100 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] scale-110"
                          : "opacity-30 grayscale contrast-75 hover:opacity-80 hover:grayscale-0"
                      )}
                    >
                      <RankImage
                        src={m.logoSvg}
                        alt={m.label}
                        width={28}
                        height={28}
                        className="size-full object-contain pointer-events-none"
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] py-1 px-2 font-semibold">
                  <span>{m.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="size-3 sm:size-3.5 text-emerald-500" />
          <span className="font-medium text-foreground">{learnedCount}</span>
          <span className="hidden sm:inline">{dictionary.interview.learnedCount}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Bookmark className="size-3 sm:size-3.5 text-amber-500" />
          <span className="font-medium text-foreground">{bookmarkedCount}</span>
          <span className="hidden sm:inline">{dictionary.interview.bookmarkedCount}</span>
        </span>
        {ignoredCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <EyeOff className="size-3 sm:size-3.5 text-zinc-400" />
            <span className="font-medium text-foreground">{ignoredCount}</span>
            <span className="hidden sm:inline">{dictionary.interview.ignoredCount}</span>
          </span>
        )}
        <span className="hidden sm:inline-flex ml-auto text-muted-foreground/60">
          {activeQuestions.length} {dictionary.interview.visibleCount}
        </span>
      </div>
    </div>
  );
}
