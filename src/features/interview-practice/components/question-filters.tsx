import Link from "next/link";
import { Search, List, SquareStack, Languages } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { createInterviewHref } from "../lib/question-url-state";
import type {
  InterviewFilterState,
  InterviewLevelFilter,
  InterviewSubcategorySummary,
} from "../types";

const levelOptions: { label: string; value: InterviewLevelFilter }[] = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

type QuestionFiltersProps = {
  filterState: InterviewFilterState;
  resultCount: number;
  subcategories: InterviewSubcategorySummary[];
  variant?: "all" | "topics-only" | "filters-only";
};

export function QuestionFilters({
  filterState,
  resultCount,
  subcategories,
  variant = "all",
}: QuestionFiltersProps) {
  const showTopics = variant === "all" || variant === "topics-only";
  const showFilters = variant === "all" || variant === "filters-only";

  return (
    <div className="flex flex-col gap-4">
      {/* Subcategory chips */}
      {showTopics && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={createInterviewHref({ subcategory: "all" }, filterState)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
              filterState.subcategory === "all"
                ? "border-primary/30 bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            All
            <Badge variant="secondary">{resultCount}</Badge>
          </Link>
          {subcategories.map((subcategory) => {
            const isActive = filterState.subcategory === subcategory.name;

            return (
              <Link
                key={subcategory.name}
                href={createInterviewHref(
                  { subcategory: subcategory.name },
                  filterState
                )}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {subcategory.name}
                <Badge variant="secondary">{subcategory.count}</Badge>
              </Link>
            );
          })}
        </div>
      )}

      {/* Search + level + mode + lang row */}
      {showFilters && (
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
          {/* Scoped search — GET form so it works without JS */}
          <form action="/interview" className="relative flex-1 min-w-[150px] w-full">
            <input type="hidden" name="category" value={filterState.category} />
            {filterState.subcategory !== "all" ? (
              <input
                type="hidden"
                name="subcategory"
                value={filterState.subcategory}
              />
            ) : null}
            {filterState.level !== "all" ? (
              <input type="hidden" name="level" value={filterState.level} />
            ) : null}
            {filterState.locale !== "vi" ? (
              <input type="hidden" name="lang" value={filterState.locale} />
            ) : null}
            {filterState.mode !== "list" ? (
              <input type="hidden" name="mode" value={filterState.mode} />
            ) : null}
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              aria-label="Search interview questions"
              className="h-8 rounded-xl pl-9 text-xs"
              defaultValue={filterState.query}
              name="q"
              placeholder="Search questions..."
            />
          </form>

          {/* Level filter */}
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            {levelOptions.map((level) => {
              const isActive = filterState.level === level.value;

              return (
                <Button
                  key={level.value}
                  asChild
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className="h-8 px-2.5 text-xs font-medium"
                >
                  <Link
                    href={createInterviewHref(
                      { level: level.value },
                      filterState
                    )}
                  >
                    {level.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mode + language */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              asChild
              size="sm"
              variant={filterState.mode === "list" ? "default" : "outline"}
              className="h-8 px-2.5 text-xs font-medium"
            >
              <Link href={createInterviewHref({ mode: "list" }, filterState)} className="inline-flex items-center gap-1.5">
                <List className="size-3.5" />
                <span>List</span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={
                filterState.mode === "flashcards" ? "default" : "outline"
              }
              className="h-8 px-2.5 text-xs font-medium"
            >
              <Link
                href={createInterviewHref({ mode: "flashcards" }, filterState)}
                className="inline-flex items-center gap-1.5"
              >
                <SquareStack className="size-3.5" />
                <span>Flashcards</span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs font-medium"
            >
              <Link
                href={createInterviewHref(
                  { locale: filterState.locale === "vi" ? "en" : "vi" },
                  filterState
                )}
                className="inline-flex items-center gap-1.5"
              >
                <Languages className="size-3.5" />
                <span>{filterState.locale === "vi" ? "EN" : "VI"}</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
