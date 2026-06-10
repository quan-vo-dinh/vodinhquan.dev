"use client";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { getInterviewCategoryMeta } from "../lib/category-meta";
import { createInterviewHref } from "../lib/question-url-state";
import type { InterviewCategorySummary, InterviewFilterState } from "../types";
import { useLocalLearningState } from "./local-learning-state";
import { TechIcon } from "./tech-icon";

type CategoryProgressVerticalProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionIds: Record<string, number[]>;
  filterState: InterviewFilterState;
};

export function CategoryProgressVertical({
  categories,
  categoryQuestionIds,
  filterState,
}: CategoryProgressVerticalProps) {
  const { isReady, learnedIds } = useLocalLearningState();

  const radius = 18;
  const circumference = 2 * Math.PI * radius;

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
    <div className="flex flex-col items-center gap-3">
      {activeCategories.map((category) => {
        const meta = getInterviewCategoryMeta(category.name);
        const isActive = category.name === filterState.category;
        const ids = categoryQuestionIds[category.name] || [];
        
        const learnedCount = isReady
          ? ids.filter((id) => learnedIds.has(id)).length
          : 0;

        const percentage = ids.length === 0 ? 0 : Math.round((learnedCount / ids.length) * 100);
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
          <Tooltip key={category.name}>
            <TooltipTrigger asChild>
              <Link
                href={createInterviewHref(
                  { category: category.name, subcategory: "all" },
                  filterState
                )}
                className="group flex flex-col items-center gap-1 focus-visible:outline-none"
              >
                <div
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive && "bg-muted scale-105 ring-1 ring-ring/10"
                  )}
                >
                  {/* SVG circular progress ring */}
                  <svg className="absolute inset-0 size-full -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className="stroke-muted/40 fill-transparent dark:stroke-muted/20"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="20"
                      cy="20"
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
                    className="size-5"
                    iconClassName={cn(
                      "size-4 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )}
                  />
                </div>
                <span className="font-mono text-[9px] font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors select-none">
                  {percentage}%
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left" className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs text-foreground">{category.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {learnedCount} / {ids.length} learned ({percentage}%)
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
