import Link from "next/link";
import { useState } from "react";
import { Search, Pin } from "lucide-react";

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
  pinnedCategories: string[];
  onTogglePin: (categoryName: string) => void;
  onCategorySelect?: () => void;
};

export function CategoryNav({
  categories,
  filterState,
  pinnedCategories,
  onTogglePin,
  onCategorySelect,
}: CategoryNavProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedList = categories.filter((c) => pinnedCategories.includes(c.name));
  const filteredPinned = pinnedList.filter((category) =>
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

  const renderCategoryRow = (category: InterviewCategorySummary, keyPrefix = "") => {
    const meta = getInterviewCategoryMeta(category.name);
    const isActive = category.name === filterState.category;
    const isPinned = pinnedCategories.includes(category.name);

    return (
      <div
        key={`${keyPrefix}${category.name}`}
        className={cn(
          "group relative flex items-center rounded-lg transition-all w-full min-w-0",
          isActive
            ? "bg-accent text-foreground font-semibold"
            : "text-muted-foreground/80 font-medium hover:bg-muted/40 hover:text-foreground"
        )}
      >
        <Link
          href={createInterviewHref(
            { category: category.name, subcategory: "all" },
            filterState
          )}
          onClick={onCategorySelect}
          className="flex flex-1 items-center gap-3 pl-3 pr-9 py-2 text-sm transition-all select-none min-w-0"
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
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePin(category.name);
          }}
          className={cn(
            "absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring shrink-0 z-10",
            isPinned
              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
              : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/60"
          )}
          title={isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
          aria-label={isPinned ? `Bỏ ghim ${category.name}` : `Ghim ${category.name} lên đầu`}
        >
          <Pin className={cn("size-3.5", isPinned && "fill-current")} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 w-full">
      {/* Category search input */}
      <div className="relative px-1 shrink-0 w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Lọc danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-9 pr-3 rounded-lg border bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-1 w-full">
        <nav aria-label="Interview categories" className="flex flex-col gap-4 px-1 py-1 w-full min-w-0">
          {/* Pinned categories section */}
          {filteredPinned.length > 0 && (
            <section className="space-y-1 w-full min-w-0">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400 select-none">
                <Pin className="size-3 fill-current rotate-45" />
                <span>Đã ghim</span>
                <div className="h-[1px] flex-1 bg-amber-500/20" />
              </div>
              <div className="grid gap-0.5 w-full min-w-0">
                {filteredPinned.map((category) => renderCategoryRow(category, "pinned-"))}
              </div>
            </section>
          )}

          {/* Grouped categories */}
          {INTERVIEW_CATEGORY_GROUP_ORDER.map((groupName) => {
            const groupCategories = groupedCategories.get(groupName);

            if (!groupCategories?.length) {
              return null;
            }

            return (
              <section key={groupName} className="space-y-1 w-full min-w-0">
                <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 select-none">
                  <span>—</span>
                  <span>{groupName}</span>
                  <div className="h-[1px] flex-1 bg-border/40" />
                </div>
                <div className="grid gap-0.5 w-full min-w-0">
                  {groupCategories.map((category) => renderCategoryRow(category))}
                </div>
              </section>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
