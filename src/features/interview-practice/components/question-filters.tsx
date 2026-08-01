import Link from "next/link";
import { Search, List, SquareStack, Languages } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/locale-provider";

import { createInterviewHref } from "../lib/question-url-state";
import type {
  InterviewFilterState,
  InterviewLevelFilter,
  InterviewSubcategorySummary,
} from "../types";

type QuestionFiltersProps = {
  filterState: InterviewFilterState;
  resultCount: number;
  subcategories: InterviewSubcategorySummary[];
  variant?: "all" | "topics-only" | "filters-only";
  onNavigate?: (href: string) => void;
};

export function QuestionFilters({
  filterState,
  resultCount,
  subcategories,
  variant = "all",
  onNavigate,
}: QuestionFiltersProps) {
  const { dictionary } = useI18n();
  const levelOptions: {
    label: string;
    value: InterviewLevelFilter;
  }[] = [
    { label: dictionary.interview.all, value: "all" },
    { label: dictionary.interview.beginner, value: "beginner" },
    { label: dictionary.interview.intermediate, value: "intermediate" },
    ...(filterState.target === "senior"
      ? [
          {
            label: dictionary.interview.advanced,
            value: "advanced" as InterviewLevelFilter,
          },
        ]
      : []),
  ];
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string) || "";
    const href = createInterviewHref({ query: q }, filterState);
    if (onNavigate) {
      onNavigate(href);
    }
  };
  const showTopics = variant === "all" || variant === "topics-only";
  const showFilters = variant === "all" || variant === "filters-only";

  return (
    <div className="flex flex-col gap-4 w-full max-w-full min-w-0">

      {/* Subcategory chips */}
      {showTopics && (
        <div className="flex flex-wrap gap-2 w-full max-w-full min-w-0">
          <Link
            href={createInterviewHref({ subcategory: "all" }, filterState)}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate(createInterviewHref({ subcategory: "all" }, filterState));
              }
            }}
            prefetch={false}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
              filterState.subcategory === "all"
                ? "border-primary/30 bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {dictionary.interview.all}
            <Badge variant="secondary">{resultCount}</Badge>
          </Link>
          {subcategories.map((subcategory) => {
            const isActive = filterState.subcategory === subcategory.name;
            const subcategoryHref = createInterviewHref(
              { subcategory: subcategory.name },
              filterState
            );

            return (
              <Link
                key={subcategory.name}
                href={subcategoryHref}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(subcategoryHref);
                  }
                }}
                prefetch={false}
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
          <form onSubmit={handleSubmit} action="/interview" className="relative flex-1 min-w-[150px] w-full">
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
            {filterState.target !== "senior" ? (
              <input type="hidden" name="target" value={filterState.target} />
            ) : null}
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              aria-label={dictionary.interview.searchAria}
              className="h-8 rounded-xl pl-9 text-xs"
              defaultValue={filterState.query}
              name="q"
              placeholder={dictionary.interview.search}
            />
          </form>

          {/* Level filter */}
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            {levelOptions.map((level) => {
              const isActive = filterState.level === level.value;
              const levelHref = createInterviewHref(
                { level: level.value },
                filterState
              );

              return (
                <Button
                  key={level.value}
                  asChild
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className="h-8 px-2.5 text-xs font-medium"
                >
                  <Link
                    href={levelHref}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(levelHref);
                      }
                    }}
                    prefetch={false}
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
              <Link
                href={createInterviewHref({ mode: "list" }, filterState)}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(createInterviewHref({ mode: "list" }, filterState));
                  }
                }}
                prefetch={false}
                className="inline-flex items-center gap-1.5"
              >
                <List className="size-3.5" />
                <span>{dictionary.interview.list}</span>
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
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(createInterviewHref({ mode: "flashcards" }, filterState));
                  }
                }}
                prefetch={false}
                className="inline-flex items-center gap-1.5"
              >
                <SquareStack className="size-3.5" />
                <span>{dictionary.interview.flashcards}</span>
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
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(
                      createInterviewHref(
                        { locale: filterState.locale === "vi" ? "en" : "vi" },
                        filterState
                      )
                    );
                  }
                }}
                prefetch={false}
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
