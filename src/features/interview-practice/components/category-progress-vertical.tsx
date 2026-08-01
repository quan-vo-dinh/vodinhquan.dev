"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { getInterviewCategoryMeta } from "../lib/category-meta";
import { createInterviewHref } from "../lib/question-url-state";
import { getRankTier } from "../lib/rank-meta";
import type { InterviewCategorySummary, InterviewFilterState, InterviewQuestionView } from "../types";
import { useInterviewLearningState } from "./interview-learning-state-provider";
import { RankImage } from "./rank-image";
import { TechIcon } from "./tech-icon";
import { useI18n } from "@/i18n/locale-provider";
import { calculateCategoryScore } from "../lib/question-points";

type CategoryProgressVerticalProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionIds: Record<string, number[]>;
  allQuestions?: InterviewQuestionView[];
  filterState: InterviewFilterState;
  onNavigate?: (href: string) => void;
};

export function CategoryProgressVertical({
  categories,
  categoryQuestionIds,
  allQuestions = [],
  filterState,
  onNavigate,
}: CategoryProgressVerticalProps) {
  const { dictionary } = useI18n();
  const { isReady, learnedIds, ignoredIds } = useInterviewLearningState();

  const radius = 21;
  const circumference = 2 * Math.PI * radius;

  const questionsByCategory = useMemo(() => {
    const map: Record<string, InterviewQuestionView[]> = {};
    for (const q of allQuestions) {
      if (!map[q.category]) {
        map[q.category] = [];
      }
      map[q.category].push(q);
    }
    return map;
  }, [allQuestions]);

  if (!isReady) {
    return null;
  }

  const activeCategories = categories.filter((category) => {
    const ids = categoryQuestionIds[category.name] || [];
    const learnedCount = ids.filter((id) => learnedIds.has(id)).length;
    return learnedCount > 0;
  });

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-[calc(100%+16px)] top-[165px] bottom-6 z-50 hidden 2xl:block w-[72px]">
      <aside className="sticky top-24 flex flex-col items-center rounded-2xl border bg-card/70 p-2.5 text-sm w-[72px] max-h-[80vh] overflow-y-auto scrollbar-none shadow-sm backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          {activeCategories.map((category) => {
            const meta = getInterviewCategoryMeta(category.name);
            const isActive = category.name === filterState.category;
            const ids = categoryQuestionIds[category.name] || [];
            const catQuestions = questionsByCategory[category.name] || [];

            const scoreResult = catQuestions.length > 0
              ? calculateCategoryScore(catQuestions, learnedIds, ignoredIds)
              : null;

            const percentage = scoreResult
              ? scoreResult.progressPercentage
              : ids.length === 0
                ? 0
                : Math.round((ids.filter((id) => learnedIds.has(id)).length / ids.length) * 100);

            const learnedCount = ids.filter((id) => learnedIds.has(id)).length;
            const strokeDashoffset =
              circumference - (percentage / 100) * circumference;
            const tier = getRankTier(percentage);

            return (
              <Tooltip key={category.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={createInterviewHref(
                      { category: category.name, subcategory: "all" },
                      filterState
                    )}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(
                          createInterviewHref(
                            { category: category.name, subcategory: "all" },
                            filterState
                          )
                        );
                      }
                    }}
                    prefetch={false}
                    className="group flex flex-col items-center gap-1.5 focus-visible:outline-none"
                  >
                    {/* Circle icon with progress ring + rank badge */}
                    <div className="relative">
                      <div
                        className={cn(
                          "relative flex size-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isActive && "bg-muted scale-105 ring-1 ring-ring/10"
                        )}
                      >
                        {/* SVG circular progress ring — matches size-12 (48px), center at 24,24 */}
                        <svg className="absolute inset-0 size-full -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            className="stroke-muted/40 fill-transparent dark:stroke-muted/20"
                            strokeWidth="2.5"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            className={cn(
                              "stroke-primary fill-transparent transition-all duration-300",
                              percentage === 100
                                ? "stroke-emerald-500"
                                : percentage > 0
                                  ? "stroke-blue-500 dark:stroke-blue-400"
                                  : "stroke-transparent"
                            )}
                            strokeWidth="2.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <TechIcon
                          iconKey={meta.iconKey}
                          className="size-6"
                          iconClassName={cn(
                            "size-5 transition-transform duration-200",
                            isActive ? "scale-110" : "group-hover:scale-110"
                          )}
                        />
                      </div>

                      {/* Mini rank logo badge — bottom-right corner, only when progress > 0 */}
                      {percentage > 0 && (
                        <div className="absolute -bottom-1.5 -right-1.5 size-7 rounded-full bg-card/90 border border-border/50 shadow-sm flex items-center justify-center overflow-hidden pointer-events-none">
                          <div
                            style={{ transform: `scale(${tier.logoScale * 0.9})` }}
                            className="size-full flex items-center justify-center"
                          >
                            <RankImage
                              src={tier.logoSvg}
                              alt={tier.name}
                              width={28}
                              height={28}
                              className="size-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="font-mono text-[9px] font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors select-none">
                      {percentage}%
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left" className="flex flex-col gap-0.5">
                  <span className="font-semibold text-xs text-foreground">
                    {category.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {scoreResult ? `${scoreResult.currentScore} / ${scoreResult.totalPossibleScore} PTS` : `${learnedCount} / ${ids.length}`} ({percentage}%)
                  </span>
                  {percentage > 0 && (
                    <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-400">
                      🏅 {tier.name}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
