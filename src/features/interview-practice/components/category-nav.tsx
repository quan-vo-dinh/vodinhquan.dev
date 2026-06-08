"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getInterviewCategoryMeta,
  INTERVIEW_CATEGORY_GROUP_ORDER,
  type InterviewCategoryGroup,
} from "../lib/category-meta";
import { createInterviewHref } from "../lib/question-url-state";
import type {
  InterviewCategorySummary,
  InterviewFilterState,
} from "../types";
import { TechIcon } from "./tech-icon";

type CategoryNavProps = {
  categories: InterviewCategorySummary[];
  filterState: InterviewFilterState;
};

export function CategoryNav({ categories, filterState }: CategoryNavProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCategories = filteredCategories.reduce(
    (groups, category) => {
      const meta = getInterviewCategoryMeta(category.name);
      const group = groups.get(meta.group) ?? [];
      group.push(category);
      groups.set(meta.group, group);
      return groups;
    },
    new Map<InterviewCategoryGroup, InterviewCategorySummary[]>()
  );

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* Category search input */}
      <div className="relative px-1 shrink-0">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Lọc danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-9 pr-3 rounded-lg border bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-1">
        <nav aria-label="Interview categories" className="flex flex-col gap-4 px-1 py-1">
          {INTERVIEW_CATEGORY_GROUP_ORDER.map((groupName) => {
            const groupCategories = groupedCategories.get(groupName);

            if (!groupCategories?.length) {
              return null;
            }

            return (
              <section key={groupName} className="space-y-1">
                <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 select-none">
                  <span>—</span>
                  <span>{groupName}</span>
                  <div className="h-[1px] flex-1 bg-border/40" />
                </div>
                <div className="grid gap-0.5">
                  {groupCategories.map((category) => {
                    const meta = getInterviewCategoryMeta(category.name);
                    const isActive = category.name === filterState.category;

                    return (
                      <Link
                        key={category.name}
                        href={createInterviewHref(
                          { category: category.name, subcategory: "all" },
                          filterState
                        )}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all select-none",
                          isActive
                            ? "bg-accent text-foreground font-semibold"
                            : "text-muted-foreground/80 font-medium hover:bg-muted/40 hover:text-foreground"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <TechIcon iconKey={meta.iconKey} className="size-6" iconClassName="size-5" />
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="truncate">{category.name}</span>
                          {meta.isNew ? (
                            <span
                              className={cn(
                                "shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase",
                                isActive
                                  ? "bg-foreground/20 text-foreground"
                                  : "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
                              )}
                            >
                              NEW
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
