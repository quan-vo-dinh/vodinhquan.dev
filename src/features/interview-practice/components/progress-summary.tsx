"use client";

import { Bookmark, CheckCircle2, EyeOff, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NumberTicker } from "@/components/ui/number-ticker";

import type { InterviewQuestionView } from "../types";
import { useInterviewLearningState } from "./interview-learning-state-provider";
import { getInterviewCategoryMeta } from "../lib/category-meta";
import { TechIcon } from "./tech-icon";
import { triggerConfetti } from "../lib/celebrate";
import { getRankTier, RANK_TIERS } from "../lib/rank-meta";
import { RankImage } from "./rank-image";
import { useI18n } from "@/i18n/locale-provider";
import { calculateCategoryScore } from "../lib/question-points";

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
      return { title: "Challenger", barColorClass: "bg-amber-400" };
    default:
      return { title: "Iron", barColorClass: "bg-zinc-500" };
  }
}

export function ProgressSummary({ questions, category }: ProgressSummaryProps) {
  const { dictionary } = useI18n();
  const {
    learnedIds,
    bookmarkedIds,
    ignoredIds,
    isReady,
    isAuthenticated,
    isRemoteAvailable,
  } = useInterviewLearningState();

  const scoreResult = calculateCategoryScore(questions, learnedIds, ignoredIds);
  const { currentScore, totalPossibleScore, progressPercentage } = scoreResult;

  const activeQuestions = questions.filter((q) => !ignoredIds.has(q.id));

  const learnedCount = questions.filter(
    (q) => learnedIds.has(q.id) && !ignoredIds.has(q.id)
  ).length;

  const bookmarkedCount = questions.filter(
    (q) => bookmarkedIds.has(q.id) && !ignoredIds.has(q.id)
  ).length;

  const ignoredCount = questions.filter((q) => ignoredIds.has(q.id)).length;

  const meta = getInterviewCategoryMeta(category);

  // Trigger celebration confetti when crossing a milestone threshold
  const prevProgressRef = useRef(progressPercentage);
  useEffect(() => {
    if (!isReady) return;
    const prev = prevProgressRef.current;
    const curr = progressPercentage;
    if (curr > prev) {
      const thresholds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const crossed = thresholds.find((t) => prev < t && curr >= t);
      if (crossed) {
        triggerConfetti(crossed);
      }
    }
    prevProgressRef.current = curr;
  }, [progressPercentage, category, isReady]);

  const rank = getDeveloperRank(progressPercentage);

  const milestones = RANK_TIERS.filter((t) => t.minPercent > 0).map((t) => ({
    value: t.minPercent,
    label: `${t.name} (${t.minPercent}%)`,
    logoSvg: t.logoSvg,
    logoScale: t.logoScale,
  }));

  return (
    <div className="relative rounded-xl border bg-background/95 px-2 py-1.5 shadow-sm backdrop-blur-md dark:bg-background/95 sm:rounded-2xl sm:px-3 sm:py-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        {/* Left: Progress Title + Animated Score Counter */}
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium truncate">
            {isAuthenticated && isRemoteAvailable
              ? dictionary.interview.syncedProgress
              : dictionary.interview.localProgress}
          </p>
          <span className="hidden xs:inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Sparkles className="size-3 fill-current text-amber-500" />
            <NumberTicker value={currentScore} />
            <span className="text-muted-foreground font-normal">/ {totalPossibleScore.toLocaleString()} PTS</span>
          </span>
        </div>

        {/* Right: Rank Title + % + Tech Icon */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border bg-muted/50 text-foreground truncate">
            {rank.title}
          </span>
          <span className="text-xs sm:text-sm font-bold shrink-0">{progressPercentage}%</span>
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
      <div className="relative w-full px-3 my-1.5 pt-1 pb-0.5">
        <Progress
          value={progressPercentage}
          className={cn(
            "h-1.5 rounded-full [&>div]:transition-all [&>div]:duration-700 [&>div]:ease-out",
            rank.barColorClass
          )}
        />
        <div className="absolute inset-y-0 left-3 right-3 flex items-center pointer-events-none">
          {milestones.map((m) => {
            const isReached = progressPercentage >= m.value;
            const targetScore = Math.ceil((m.value / 100) * totalPossibleScore);
            const remainingPts = Math.max(0, targetScore - currentScore);

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
                      <div
                        style={{ transform: `scale(${m.logoScale})` }}
                        className="size-full flex items-center justify-center pointer-events-none"
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
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] py-1.5 px-2.5 font-semibold space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span>{m.label}</span>
                    {isReached && <CheckCircle2 className="size-3 text-emerald-400 fill-emerald-500/20" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Target: <span className="font-bold text-amber-500">{targetScore.toLocaleString()} PTS</span>
                    {!isReached && remainingPts > 0 && (
                      <span className="block text-[9px] text-zinc-400">(cần thêm {remainingPts.toLocaleString()} PTS)</span>
                    )}
                  </div>
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
        <div className="hidden md:inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/70 font-mono ml-auto">
          <span className="text-emerald-600 dark:text-emerald-400">Beg: +10</span>
          <span>•</span>
          <span className="text-sky-600 dark:text-sky-400">Int: +25</span>
          <span>•</span>
          <span className="text-purple-600 dark:text-purple-400">Adv: +45</span>
        </div>
        <span className="inline-flex md:hidden ml-auto text-muted-foreground/60">
          {activeQuestions.length} {dictionary.interview.visibleCount}
        </span>
      </div>
    </div>
  );
}

