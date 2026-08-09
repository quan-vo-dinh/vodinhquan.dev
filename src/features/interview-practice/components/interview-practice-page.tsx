"use client";

import { useState, useEffect, useCallback, useRef, useTransition, useMemo } from "react";
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
import { RankImage } from "./rank-image";
import { RankUpModal } from "./rank-up-modal";
import { InterviewProfileCard } from "./interview-profile-card";
import { LearningSyncBanner } from "./learning-sync-banner";
import { createInterviewHref } from "../lib/question-url-state";
import { calculateCategoryScore } from "../lib/question-points";

import type { CurrentViewer } from "@/features/auth/types";
import type {
  InterviewCategoryQuestionProgress,
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
import { useI18n } from "@/i18n/locale-provider";

type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionProgress: InterviewCategoryQuestionProgress;
  filterState: InterviewFilterState;
  initialLearningState: InterviewLearningStateSnapshot;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
  viewer: CurrentViewer | null;
};

export function InterviewPracticePage({
  categories,
  categoryQuestionProgress,
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
        categoryQuestionProgress={categoryQuestionProgress}
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
  categoryQuestionProgress: InterviewCategoryQuestionProgress;
  filterState: InterviewFilterState;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
  viewer: CurrentViewer | null;
};

const BLUR_FADE_DELAY = 0.04;
const RANK_MILESTONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;


function InterviewPracticePageContent({
  categories,
  categoryQuestionProgress,
  filterState,
  questions,
  subcategories,
  totalQuestions,
  viewer,
}: InterviewPracticePageContentProps) {
  const { dictionary, locale } = useI18n();
  const targetOptions = [
    { label: dictionary.interview.junior, value: "junior" as const },
    { label: dictionary.interview.senior, value: "senior" as const },
  ];
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
    ignoredIds,
    isReady,
    learnedIds,
    pinnedCategories,
    togglePinCategory,
  } = useInterviewLearningState();

  const [rankUpData, setRankUpData] = useState<{ oldRank: RankTier; newRank: RankTier; category: string } | null>(null);
  const prevCategoryProgressRef = useRef<Record<string, number>>({});
  const hasHydratedCategoryProgressRef = useRef<Record<string, boolean>>({});
  const currentCategoryQuestionProgress = useMemo(
    () => categoryQuestionProgress[filterState.category] ?? [],
    [categoryQuestionProgress, filterState.category]
  );

  const scoreResult = useMemo(
    () =>
      calculateCategoryScore(
        currentCategoryQuestionProgress,
        learnedIds,
        ignoredIds
      ),
    [currentCategoryQuestionProgress, learnedIds, ignoredIds]
  );
  const categoryProgress = scoreResult.progressPercentage;
  const categoryLearnedCount = isReady
    ? currentCategoryQuestionProgress.filter(
        (question) =>
          learnedIds.has(question.id) && !ignoredIds.has(question.id)
      ).length
    : 0;

  useEffect(() => {
    if (!isReady) return;

    const currentCategoryName = filterState.category;
    const currentProgress = categoryProgress;

    if (!hasHydratedCategoryProgressRef.current[currentCategoryName]) {
      hasHydratedCategoryProgressRef.current[currentCategoryName] = true;
      prevCategoryProgressRef.current[currentCategoryName] = currentProgress;
      return;
    }

    const prevProgress = prevCategoryProgressRef.current[currentCategoryName] ?? currentProgress;

    if (currentProgress > prevProgress) {
      const crossedMilestone = RANK_MILESTONES.find(
        (milestone) => prevProgress < milestone && currentProgress >= milestone
      );

      if (crossedMilestone) {
        queueMicrotask(() => {
          setRankUpData({
            oldRank: getRankTier(prevProgress),
            newRank: getRankTier(currentProgress),
            category: currentCategoryName,
          });
        });
      }
    }

    prevCategoryProgressRef.current[currentCategoryName] = currentProgress;
  }, [categoryProgress, filterState.category, isReady]);

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

  const currentTier = getRankTier(categoryProgress);

  const mainContent = (
    <main className="relative w-full max-w-full min-w-0 flex flex-col gap-4 px-0 sm:gap-6 sm:px-6 sm:w-[calc(100vw-3rem)] sm:max-w-7xl sm:left-1/2 sm:-translate-x-1/2 sm:mx-0">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <section className="relative rounded-2xl border bg-card/80 p-2.5 pt-8 sm:p-4 sm:pt-10 mt-8 sm:mt-12 shadow-[0_0_10px_3px] shadow-primary/5 backdrop-blur sm:rounded-3xl">
          {/* Centered Top Rank Emblem SVG sitting absolute on the top rim */}
          <div className="absolute -top-12 sm:-top-16 md:-top-18 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex items-center justify-center">
            <RankImage
              src={currentTier.svg}
              alt={currentTier.name}
              width={280}
              height={280}
              priority
              className="h-24 sm:h-32 md:h-36 w-auto object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)] dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]"
            />
          </div>

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
          <div className="relative z-10 grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full min-w-0">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground truncate">
                  {dictionary.interview.eyebrow}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  <DiaTextReveal text={dictionary.interview.title} />
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                  {dictionary.interview.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Target Level Switcher */}
                <div className="flex items-center gap-2 rounded-2xl border bg-background/80 px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-sm backdrop-blur">
                  <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-0.5">
                    {dictionary.interview.targetLevel}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {targetOptions.map((opt) => {
                      const isActive = filterState.target === opt.value;
                      const targetHref = createInterviewHref(
                        { target: opt.value },
                        filterState
                      );

                      return (
                        <Button
                          key={opt.value}
                          asChild
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          className={cn(
                            "h-6 sm:h-7 px-2.5 sm:px-3 text-xs font-medium rounded-full cursor-pointer transition-colors",
                            !isActive && "bg-background/50 hover:bg-background/80"
                          )}
                        >
                          <Link
                            href={targetHref}
                            onClick={(e) => {
                              if (handleNavigate) {
                                e.preventDefault();
                                handleNavigate(targetHref);
                              }
                            }}
                            prefetch={false}
                          >
                            {opt.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Total Questions Box */}
                <div className="flex items-center gap-2 rounded-2xl border bg-background/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                    <NumberTicker value={totalQuestions} />
                  </span>
                  <span>{dictionary.interview.questions}</span>
                </div>
              </div>
            </div>

            <BlurFade delay={BLUR_FADE_DELAY * 2} yOffset={8} className="shrink-0 w-full lg:w-auto">
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
                  {questions.length.toLocaleString(
                    locale === "vi" ? "vi-VN" : "en-US",
                  )}{" "}
                  {dictionary.interview.visibleQuestions}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden shrink-0 h-8 px-2.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                onClick={() => setIsMobileCategoryOpen(true)}
                aria-label={dictionary.interview.openCategories}
              >
                <Menu className="size-4" />
                <span>{dictionary.interview.categories}</span>
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
                aria-label={dictionary.interview.toggleTopics}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>{dictionary.interview.topic}</span>
                  <span className="text-foreground font-semibold bg-muted px-2 py-0.5 rounded-full">
                    {filterState.subcategory === "all"
                      ? dictionary.interview.allTopics
                      : filterState.subcategory}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>
                    {isTopicsOpen
                      ? dictionary.interview.hideTopics
                      : dictionary.interview.showTopics}
                  </span>
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
            className="sticky-progress-summary sticky top-2 sm:top-4 lg:top-6 z-40 w-full py-1.5 bg-background/80 backdrop-blur-md rounded-xl transition-all duration-200"
          >
            <div className="flex flex-col gap-2">
              <LearningSyncBanner />
              <ProgressSummary
                category={filterState.category}
                questionProgress={currentCategoryQuestionProgress}
              />
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
        categoryQuestionProgress={categoryQuestionProgress}
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
          <span className="text-sm font-semibold text-foreground">
            {dictionary.interview.categories}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg cursor-pointer"
            onClick={() => setIsMobileCategoryOpen(false)}
            aria-label={dictionary.interview.closeCategories}
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
      {mounted && isPending && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/10 backdrop-blur-[0.5px] pointer-events-none">
            <div className="rounded-xl border bg-background/90 p-3 shadow-md flex items-center justify-center pointer-events-auto">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>,
          document.body
        )}
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
