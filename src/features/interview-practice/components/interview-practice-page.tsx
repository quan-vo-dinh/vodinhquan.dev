"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import BlurFade from "@/components/magicui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { getRankTier, RankTier } from "../lib/rank-meta";
import { RankUpModal } from "./rank-up-modal";
import { InterviewProfileCard } from "./interview-profile-card";
import { LearningSyncBanner } from "./learning-sync-banner";

import type { CurrentViewer } from "@/features/auth/types";
import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewQuestionView,
  InterviewSubcategorySummary,
} from "../types";
import { CategoryNav } from "./category-nav";
import { CategoryProgressVertical } from "./category-progress-vertical";
import { FlashcardDeck } from "./flashcard-deck";
import { ProgressSummary } from "./progress-summary";
import { QuestionFilters } from "./question-filters";
import { QuestionList } from "./question-list";
import type { InterviewLearningStateSnapshot } from "../lib/learning-state-types";
import {
  InterviewLearningStateProvider,
  useInterviewLearningState,
} from "./interview-learning-state-provider";

type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionIds: Record<string, number[]>;
  filterState: InterviewFilterState;
  initialLearningState: InterviewLearningStateSnapshot;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
  viewer: CurrentViewer | null;
};

export function InterviewPracticePage({
  categories,
  categoryQuestionIds,
  filterState,
  initialLearningState,
  questions,
  subcategories,
  totalQuestions,
  viewer,
}: InterviewPracticePageProps) {
  return (
    <InterviewLearningStateProvider initialState={initialLearningState}>
      <InterviewPracticePageContent
        categories={categories}
        categoryQuestionIds={categoryQuestionIds}
        filterState={filterState}
        questions={questions}
        subcategories={subcategories}
        totalQuestions={totalQuestions}
        viewer={viewer}
      />
    </InterviewLearningStateProvider>
  );
}

type InterviewPracticePageContentProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionIds: Record<string, number[]>;
  filterState: InterviewFilterState;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
  viewer: CurrentViewer | null;
};

const BLUR_FADE_DELAY = 0.04;
const RANK_MILESTONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

function getCategoryProgressPercent(learnedCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((learnedCount / total) * 100);
}


function InterviewPracticePageContent({
  categories,
  categoryQuestionIds,
  filterState,
  questions,
  subcategories,
  totalQuestions,
  viewer,
}: InterviewPracticePageContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleNavigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  const {
    isReady,
    learnedIds,
    pinnedCategories,
    togglePinCategory,
  } = useInterviewLearningState();

  const [rankUpData, setRankUpData] = useState<{ oldRank: RankTier; newRank: RankTier; category: string } | null>(null);
  const prevCategoryLearnedCountRef = useRef<Record<string, number>>({});
  const hasHydratedCategoryProgressRef = useRef<Record<string, boolean>>({});

  const currentCategoryQuestionIds = categoryQuestionIds[filterState.category] || [];
  const categoryLearnedCount = isReady
    ? currentCategoryQuestionIds.filter((id) => learnedIds.has(id)).length
    : 0;
  const categoryProgress = currentCategoryQuestionIds.length > 0
    ? Math.round((categoryLearnedCount / currentCategoryQuestionIds.length) * 100)
    : 0;



  useEffect(() => {
    if (!isReady) return;

    const currentCategoryName = filterState.category;
    const currentCount = categoryLearnedCount;
    const totalInCategory = currentCategoryQuestionIds.length;

    if (!hasHydratedCategoryProgressRef.current[currentCategoryName]) {
      hasHydratedCategoryProgressRef.current[currentCategoryName] = true;
      prevCategoryLearnedCountRef.current[currentCategoryName] = currentCount;
      return;
    }

    const prevCount = prevCategoryLearnedCountRef.current[currentCategoryName] ?? currentCount;

    if (currentCount > prevCount && totalInCategory > 0) {
      const prevProgress = getCategoryProgressPercent(prevCount, totalInCategory);
      const newProgress = getCategoryProgressPercent(currentCount, totalInCategory);
      const crossedMilestone = RANK_MILESTONES.find(
        (milestone) => prevProgress < milestone && newProgress >= milestone
      );

      if (crossedMilestone) {
        queueMicrotask(() => {
          setRankUpData({
            oldRank: getRankTier(prevProgress),
            newRank: getRankTier(newProgress),
            category: currentCategoryName,
          });
        });
      }
    }

    prevCategoryLearnedCountRef.current[currentCategoryName] = currentCount;
  }, [categoryLearnedCount, filterState.category, currentCategoryQuestionIds.length, isReady]);

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
      {isPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/10 backdrop-blur-[0.5px] pointer-events-none">
          <div className="rounded-xl border bg-background/90 p-3 shadow-md flex items-center justify-center pointer-events-auto">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        </div>
      )}
      <BlurFade delay={BLUR_FADE_DELAY}>
        <section className="relative rounded-2xl border bg-card/80 p-4 shadow-[0_0_10px_3px] shadow-primary/5 backdrop-blur sm:rounded-3xl sm:p-5">
          {/* Background Grid Wrapper to clip the grid pattern without clipping the profile card */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none z-0">
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
          </div>
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Personal Interview Practice
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  <DiaTextReveal text="Interview Practice" />
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
              <InterviewProfileCard
                categoryProgress={categoryProgress}
                learnedCount={categoryLearnedCount}
                viewer={viewer}
              />
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
          <aside className={cn(
            "flex h-[calc(100vh-120px)] max-h-[85vh] flex-col rounded-2xl border bg-card/70 p-4 text-sm lg:sticky lg:top-6 transition-all duration-300",
            isPending && "opacity-60 pointer-events-none cursor-wait"
          )}>
            <CategoryNav
              categories={categories}
              filterState={filterState}
              pinnedCategories={pinnedCategories}
              onTogglePin={togglePinCategory}
              onNavigate={handleNavigate}
            />
          </aside>
        </BlurFade>

        <div className={cn(
          "flex min-w-0 flex-col gap-3 rounded-xl border bg-card/70 p-2 sm:gap-4 sm:rounded-2xl sm:p-4 transition-all duration-300",
          isPending && "opacity-60 pointer-events-none cursor-wait"
        )}>
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
              onNavigate={handleNavigate}
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
                    onNavigate={handleNavigate}
                  />
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Sticky Progress Summary Wrapper */}
          <BlurFade
            delay={BLUR_FADE_DELAY * 7}
            yOffset={10}
            className="sticky-progress-summary sticky top-0 z-40 -mx-2 px-2 py-2 bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm sm:-mx-4 sm:px-4 lg:top-6 lg:z-20 lg:-mx-0 lg:px-0 lg:border-none lg:shadow-none lg:pb-0 lg:pt-0 lg:bg-transparent lg:backdrop-blur-none transition-all duration-200"
          >
            <div className="flex flex-col gap-3">
              <LearningSyncBanner />
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

      {/* Floating Category Progress Vertical Sidebar */}
      <CategoryProgressVertical
        categories={categories}
        categoryQuestionIds={categoryQuestionIds}
        filterState={filterState}
        onNavigate={handleNavigate}
      />
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
            pinnedCategories={pinnedCategories}
            onTogglePin={togglePinCategory}
            onCategorySelect={() => setIsMobileCategoryOpen(false)}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainContent}
      {mounted && typeof document !== "undefined" && createPortal(drawerContent, document.body)}
      {mounted && rankUpData && typeof document !== "undefined" &&
        createPortal(
          <RankUpModal
            oldRank={rankUpData.oldRank}
            newRank={rankUpData.newRank}
            category={rankUpData.category}
            onClose={() => setRankUpData(null)}
          />,
          document.body
        )}
    </>
  );
}
