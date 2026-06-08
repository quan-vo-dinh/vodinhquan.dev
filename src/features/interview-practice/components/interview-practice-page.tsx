"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurFade from "@/components/magicui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";

import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewQuestionView,
  InterviewSubcategorySummary,
} from "../types";
import { CategoryNav } from "./category-nav";
import { FlashcardDeck } from "./flashcard-deck";
import { ProgressSummary } from "./progress-summary";
import { QuestionFilters } from "./question-filters";
import { QuestionList } from "./question-list";

type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  filterState: InterviewFilterState;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
};

const BLUR_FADE_DELAY = 0.04;

export function InterviewPracticePage({
  categories,
  filterState,
  questions,
  subcategories,
  totalQuestions,
}: InterviewPracticePageProps) {
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMobileCategoryOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [isMobileCategoryOpen]);

  const mainContent = (
    <main className="relative left-1/2 flex w-screen max-w-7xl -translate-x-1/2 flex-col gap-4 px-2 sm:gap-6 sm:px-6">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <section className="relative overflow-hidden rounded-2xl border bg-card/80 p-4 shadow-[0_0_10px_3px] shadow-primary/5 backdrop-blur sm:rounded-3xl sm:p-5">
          <AnimatedGridPattern
            numSquares={28}
            maxOpacity={0.08}
            duration={3}
            repeatDelay={1}
            className={cn(
              "inset-x-0 inset-y-[-40%] h-[180%] skew-y-12",
              "[mask-image:radial-gradient(500px_circle_at_top_right,white,transparent)]"
            )}
          />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Personal Interview Practice
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Interview Practice
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  A focused question bank for reviewing software engineering
                  topics from your own data.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur sm:flex-col sm:items-start sm:gap-0">
                <span className="text-2xl font-semibold tracking-tight text-foreground sm:block">
                  <NumberTicker value={totalQuestions} />
                </span>
                <span>questions</span>
              </div>
            </div>

            <BlurFade delay={BLUR_FADE_DELAY * 2} yOffset={8}>
              <div className="flex items-center gap-3.5 rounded-2xl border bg-background/40 p-4 shadow-sm backdrop-blur-md md:w-[280px]">
                <Avatar className="size-12 border shadow-sm ring-2 ring-muted">
                  <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                  <AvatarFallback>{DATA.initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="truncate text-sm font-semibold leading-none tracking-tight text-foreground">
                    {DATA.name}
                  </h3>
                  <p className="mt-1.5 truncate text-xs leading-none text-muted-foreground">
                    Creator & Developer
                  </p>
                  <Link
                    href={DATA.contact.social.GitHub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Visit Vo Dinh Quan GitHub profile"
                  >
                    <Icons.github className="size-3.5" aria-hidden />
                    <span>GitHub Profile</span>
                  </Link>
                </div>
              </div>
            </BlurFade>
          </div>
          <BorderBeam duration={8} size={180} />
        </section>
      </BlurFade>


      <section className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <BlurFade
          delay={BLUR_FADE_DELAY * 3}
          yOffset={10}
          className="hidden lg:block"
        >
          <aside className="flex h-[calc(100vh-120px)] max-h-[85vh] flex-col rounded-2xl border bg-card/70 p-4 text-sm lg:sticky lg:top-6">
            <CategoryNav categories={categories} filterState={filterState} />
          </aside>
        </BlurFade>

        <div className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card/70 p-2 sm:gap-4 sm:rounded-2xl sm:p-4">
          <BlurFade delay={BLUR_FADE_DELAY * 4} yOffset={10}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {filterState.category}
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  {questions.length.toLocaleString()} visible questions
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden shrink-0 h-8 px-2.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                onClick={() => setIsMobileCategoryOpen(true)}
                aria-label="Open categories menu"
              >
                <Menu className="size-4" />
                <span>Categories</span>
              </Button>
            </div>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 5} yOffset={10}>
            <QuestionFilters
              filterState={filterState}
              resultCount={questions.length}
              subcategories={subcategories}
              variant="filters-only"
            />
          </BlurFade>

          {/* Collapsible Topics Container */}
          <BlurFade delay={BLUR_FADE_DELAY * 6} yOffset={10}>
            <div className="rounded-xl border bg-background/50 p-2.5 shadow-sm transition-colors duration-200">
              <button
                onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                className="flex items-center justify-between w-full text-left px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg cursor-pointer"
                aria-expanded={isTopicsOpen}
                aria-label="Toggle subcategories"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>Topic:</span>
                  <span className="text-foreground font-semibold bg-muted px-2 py-0.5 rounded-full">
                    {filterState.subcategory === "all" ? "All Topics" : filterState.subcategory}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>{isTopicsOpen ? "Hide Topics" : "Show Topics"}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isTopicsOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>

              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isTopicsOpen
                    ? "grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t"
                    : "grid-rows-[0fr] opacity-0 overflow-hidden"
                )}
              >
                <div className="overflow-hidden">
                  <QuestionFilters
                    filterState={filterState}
                    resultCount={questions.length}
                    subcategories={subcategories}
                    variant="topics-only"
                  />
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Sticky Progress Summary Wrapper */}
          <BlurFade
            delay={BLUR_FADE_DELAY * 7}
            yOffset={10}
            className="sticky top-0 z-40 -mx-2 px-2 py-2 bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm sm:-mx-4 sm:px-4 lg:top-6 lg:z-20 lg:-mx-0 lg:px-0 lg:border-none lg:shadow-none lg:pb-0 lg:pt-0 lg:bg-transparent lg:backdrop-blur-none transition-all duration-200"
          >
            <div>
              <ProgressSummary questions={questions} category={filterState.category} />
            </div>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 8} yOffset={10}>
            {filterState.mode === "flashcards" ? (
              <FlashcardDeck questions={questions} />
            ) : (
              <QuestionList questions={questions} />
            )}
          </BlurFade>
        </div>
      </section>
    </main>
  );

  const drawerContent = isMobileCategoryOpen && (
    <div className="fixed inset-0 z-[100] overflow-hidden overscroll-none lg:hidden">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 touch-none bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsMobileCategoryOpen(false)}
      />

      {/* Drawer Content Panel */}
      <div className="fixed inset-y-0 left-0 flex w-[300px] max-w-[85vw] touch-pan-y flex-col gap-4 overflow-hidden overscroll-contain border-r border-border/40 bg-card p-4 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-sm font-semibold text-foreground">Categories</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg cursor-pointer"
            onClick={() => setIsMobileCategoryOpen(false)}
            aria-label="Close categories menu"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <CategoryNav
            categories={categories}
            filterState={filterState}
            onCategorySelect={() => setIsMobileCategoryOpen(false)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainContent}
      {mounted && typeof document !== "undefined" && createPortal(drawerContent, document.body)}
    </>
  );
}
