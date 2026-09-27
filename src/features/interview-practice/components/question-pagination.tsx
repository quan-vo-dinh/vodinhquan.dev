"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/locale-provider";

import { createInterviewHref } from "../lib/question-url-state";
import type {
  InterviewFilterState,
  InterviewQuestionPage,
} from "../types";

type QuestionPaginationProps = {
  filterState: InterviewFilterState;
  onNavigate?: (href: string) => void;
  pagination: InterviewQuestionPage["pagination"];
};

export function QuestionPagination({
  filterState,
  onNavigate,
  pagination,
}: QuestionPaginationProps) {
  const { dictionary } = useI18n();

  if (pagination.totalPages <= 1) {
    return null;
  }

  const previousHref = createInterviewHref(
    { page: pagination.page - 1 },
    filterState
  );
  const nextHref = createInterviewHref(
    { page: pagination.page + 1 },
    filterState
  );

  const getLinkProps = (href: string) => ({
    href,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (!onNavigate) {
        return;
      }

      event.preventDefault();
      onNavigate(href);
    },
    prefetch: false,
  });

  return (
    <nav
      aria-label={dictionary.interview.questionPagination}
      className="flex flex-wrap items-center justify-between gap-2 border-t pt-3"
    >
      {pagination.hasPreviousPage ? (
        <Button asChild size="sm" variant="outline">
          <Link {...getLinkProps(previousHref)}>
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            {dictionary.interview.previousPage}
          </Link>
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled>
          <ChevronLeft className="mr-1 size-4" aria-hidden />
          {dictionary.interview.previousPage}
        </Button>
      )}

      <p aria-live="polite" className="text-xs font-medium text-muted-foreground">
        {dictionary.interview.page} {pagination.page} {dictionary.interview.pageOf}{" "}
        {pagination.totalPages}
      </p>

      {pagination.hasNextPage ? (
        <Button asChild size="sm" variant="outline">
          <Link {...getLinkProps(nextHref)}>
            {dictionary.interview.nextPage}
            <ChevronRight className="ml-1 size-4" aria-hidden />
          </Link>
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled>
          {dictionary.interview.nextPage}
          <ChevronRight className="ml-1 size-4" aria-hidden />
        </Button>
      )}
    </nav>
  );
}
