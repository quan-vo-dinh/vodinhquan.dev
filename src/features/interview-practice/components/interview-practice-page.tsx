"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { getRankTier, RankTier } from "../lib/rank-meta";
import { RankUpModal } from "./rank-up-modal";

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
import { useLocalLearningState } from "./local-learning-state";

type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  categoryQuestionIds: Record<string, number[]>;
  filterState: InterviewFilterState;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
};

const BLUR_FADE_DELAY = 0.04;

function getLoLProfileStyles(percentage: number, learnedCount: number) {
  const tier = getRankTier(percentage);
  const isMax = percentage === 100;
  const levelText = isMax ? "MAX" : `LV.${learnedCount}`;

  switch (tier.colorTheme) {
    case "iron":
      return {
        rankName: "Iron IV",
        rankSvg: "/ranked/iron.svg",
        avatarRing: "ring-zinc-600 dark:ring-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.2)]",
        wingColor: "bg-zinc-600/10 dark:bg-zinc-500/10 border-zinc-600/20 text-zinc-500",
        badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
        hasWings: false,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_15px_rgba(113,113,122,0.15)] border-zinc-600/30",
        ambientBgGlow: "bg-zinc-500/10 blur-xl opacity-0 group-hover/card:opacity-30",
        cornerBorder: "border-zinc-400/30 dark:border-zinc-500/30",
        levelText,
      };
    case "bronze":
      return {
        rankName: "Bronze IV",
        rankSvg: "/ranked/sliver.svg",
        avatarRing: "ring-slate-400 dark:ring-slate-300 shadow-[0_0_8px_rgba(148,163,184,0.2)]",
        wingColor: "bg-slate-400/10 border-slate-400/30 text-slate-500",
        badgeClass: "bg-slate-400/10 text-slate-700 dark:text-slate-300 border-slate-400/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_15px_rgba(148,163,184,0.15)] border-slate-400/30",
        ambientBgGlow: "bg-slate-400/10 blur-xl opacity-0 group-hover/card:opacity-30",
        cornerBorder: "border-slate-400/60 dark:border-slate-500/50",
        levelText,
      };
    case "gold":
      return {
        rankName: "Gold IV",
        rankSvg: "/ranked/gold.svg",
        avatarRing: "ring-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
        wingColor: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
        badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] border-yellow-500/30",
        ambientBgGlow: "bg-yellow-500/15 blur-xl opacity-0 group-hover/card:opacity-40",
        cornerBorder: "border-yellow-500/70 dark:border-yellow-500/60",
        levelText,
      };
    case "platinum":
      return {
        rankName: "Platinum IV",
        rankSvg: "/ranked/platinum.svg",
        avatarRing: "ring-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]",
        wingColor: "bg-teal-500/10 border-teal-500/30 text-teal-600",
        badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_20px_rgba(20,184,166,0.2)] border-teal-500/30",
        ambientBgGlow: "bg-teal-500/15 blur-xl opacity-0 group-hover/card:opacity-40",
        cornerBorder: "border-teal-500/70 dark:border-teal-400/60",
        levelText,
      };
    case "emerald":
      return {
        rankName: "Emerald IV",
        rankSvg: "/ranked/emerald.svg",
        avatarRing: "ring-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
        wingColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] border-emerald-500/30",
        ambientBgGlow: "bg-emerald-500/15 blur-xl opacity-0 group-hover/card:opacity-40",
        cornerBorder: "border-emerald-500/70 dark:border-emerald-400/60",
        levelText,
      };
    case "diamond":
      return {
        rankName: "Diamond IV",
        rankSvg: "/ranked/diamond.svg",
        avatarRing: "ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.35)]",
        wingColor: "bg-blue-500/10 border-blue-500/30 text-blue-600",
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_22px_rgba(59,130,246,0.28)] border-blue-500/30",
        ambientBgGlow: "bg-blue-500/20 blur-xl opacity-0 group-hover/card:opacity-45",
        cornerBorder: "border-blue-500/70 dark:border-blue-400/60",
        levelText,
      };
    case "master":
      return {
        rankName: "Master",
        rankSvg: "/ranked/master.svg",
        avatarRing: "ring-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]",
        wingColor: "bg-purple-600/10 border-purple-600/30 text-purple-600",
        badgeClass: "bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-600/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_25px_rgba(147,51,234,0.3)] border-purple-600/30",
        ambientBgGlow: "bg-purple-600/20 blur-xl opacity-0 group-hover/card:opacity-50",
        cornerBorder: "border-purple-600/70 dark:border-purple-500/60",
        levelText,
      };
    case "grandmaster":
      return {
        rankName: "Grandmaster",
        rankSvg: "/ranked/grandmaster.svg",
        avatarRing: "ring-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.45)]",
        wingColor: "bg-rose-600/10 border-rose-600/30 text-rose-600",
        badgeClass: "bg-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-600/20",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_28px_rgba(225,29,72,0.35)] border-rose-600/30",
        ambientBgGlow: "bg-rose-600/20 blur-xl opacity-0 group-hover/card:opacity-55",
        cornerBorder: "border-rose-600/80 dark:border-rose-500/70",
        levelText,
      };
    case "challenger":
    default:
      return {
        rankName: "Challenger 👑",
        rankSvg: "/ranked/challenger.svg",
        avatarRing: "ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.55)] animate-pulse",
        wingColor: "bg-amber-500/15 border-amber-500/40 text-amber-600 animate-pulse",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/30 animate-pulse font-bold",
        hasWings: true,
        hasCrown: false,
        hoverGlow: "hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] border-amber-500/30",
        ambientBgGlow: "bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-red-500/20 blur-xl opacity-0 group-hover/card:opacity-65 animate-pulse",
        cornerBorder: "border-amber-500/90 dark:border-amber-400/80 animate-pulse",
        levelText: isMax ? "MAX" : `LV.${learnedCount}`,
      };
  }
}

export function InterviewPracticePage({
  categories,
  categoryQuestionIds,
  filterState,
  questions,
  subcategories,
  totalQuestions,
}: InterviewPracticePageProps) {
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pinnedCategories, setPinnedCategories] = useState<string[]>([]);

  const { isReady, learnedIds } = useLocalLearningState();

  const [rankUpData, setRankUpData] = useState<{ oldRank: RankTier; newRank: RankTier } | null>(null);
  const prevCategoryLearnedCountRef = useRef<Record<string, number>>({});

  const currentCategoryQuestionIds = categoryQuestionIds[filterState.category] || [];
  const categoryLearnedCount = isReady
    ? currentCategoryQuestionIds.filter((id) => learnedIds.has(id)).length
    : 0;
  const categoryProgress = currentCategoryQuestionIds.length > 0
    ? Math.round((categoryLearnedCount / currentCategoryQuestionIds.length) * 100)
    : 0;

  const currentTier = getRankTier(categoryProgress);
  const lolStyles = getLoLProfileStyles(categoryProgress, categoryLearnedCount);

  useEffect(() => {
    if (!isReady) return;
    const currentCategoryName = filterState.category;
    const currentCount = categoryLearnedCount;

    if (prevCategoryLearnedCountRef.current[currentCategoryName] !== undefined) {
      const prevCount = prevCategoryLearnedCountRef.current[currentCategoryName];

      if (currentCount > prevCount) {
        const prevProgress = Math.round((prevCount / currentCategoryQuestionIds.length) * 100);
        const newProgress = Math.round((currentCount / currentCategoryQuestionIds.length) * 100);

        const oldTier = getRankTier(prevProgress);
        const newTier = getRankTier(newProgress);

        if (oldTier.colorTheme !== newTier.colorTheme && newProgress > prevProgress) {
          setRankUpData({ oldRank: oldTier, newRank: newTier });
        }
      }
    }

    prevCategoryLearnedCountRef.current[currentCategoryName] = currentCount;
  }, [categoryLearnedCount, filterState.category, currentCategoryQuestionIds.length, isReady]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("interview-practice:v1:pinned-categories");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTimeout(() => setPinnedCategories(parsed), 0);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const togglePinCategory = useCallback((categoryName: string) => {
    setPinnedCategories((prev) => {
      const next = prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName];
      try {
        window.localStorage.setItem("interview-practice:v1:pinned-categories", JSON.stringify(next));
      } catch {
        // Silently fail
      }
      return next;
    });
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
              <CardContainer
                containerClassName="py-0"
                className="w-full md:w-[280px]"
                xDivisor={10}
                yDivisor={10}
                perspective={400}
              >
                <CardBody className={cn("relative flex items-center gap-3.5 rounded-2xl border bg-background/90 py-4 pl-6 pr-4 shadow-sm w-full h-auto transition-all duration-500 group/card", lolStyles.hoverGlow)}>

                  {/* Ambient Background Glow (Gamer Aura) */}
                  <div
                    className={cn(
                      "absolute -inset-1.5 rounded-2xl opacity-0 transition-all duration-700 group-hover/card:opacity-100 pointer-events-none z-0",
                      lolStyles.ambientBgGlow
                    )}
                    style={{ transform: "translateZ(-10px)" }}
                  />

                  {/* Gamer Corner Brackets (LoL Loading Screen Style) - Rounded to hug the border-radius perfectly */}
                  <div className="absolute inset-0 pointer-events-none z-20 [transform-style:preserve-3d]">
                    <div className={cn("absolute -top-[1px] -left-[1px] w-5 h-5 border-t-2 border-l-2 rounded-tl-2xl transition-all duration-500", lolStyles.cornerBorder)} />
                    <div className={cn("absolute -top-[1px] -right-[1px] w-5 h-5 border-t-2 border-r-2 rounded-tr-2xl transition-all duration-500", lolStyles.cornerBorder)} />
                    <div className={cn("absolute -bottom-[1px] -left-[1px] w-5 h-5 border-b-2 border-l-2 rounded-bl-2xl transition-all duration-500", lolStyles.cornerBorder)} />
                    <div className={cn("absolute -bottom-[1px] -right-[1px] w-5 h-5 border-b-2 border-r-2 rounded-br-2xl transition-all duration-500", lolStyles.cornerBorder)} />
                  </div>

                  {/* Metallic Sheen Sweep Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-white/10 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out pointer-events-none rounded-2xl z-30" />

                  {/* Dynamic Game Rank SVG Image - Direct child of CardBody, sitting on top of the avatar */}
                  <CardItem
                    translateZ={100}
                    as="div"
                    className="absolute -top-12 left-0 right-0 mx-auto w-fit h-20 pointer-events-none select-none z-30"
                  >
                    <img
                      src={currentTier.svg}
                      alt={lolStyles.rankName}
                      className="h-full w-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]"
                    />
                  </CardItem>

                  {/* Winged Summoner Avatar & XP */}
                  <div className="relative shrink-0 flex flex-col items-center justify-center py-2 [transform-style:preserve-3d]">
                    {/* Left Wing */}
                    {lolStyles.hasWings && (
                      <CardItem
                        translateZ={30}
                        className={cn(
                          "absolute -left-2.5 top-1/2 -translate-y-1/2 -mt-1 w-1.5 h-6 rounded-l-md border-y border-l transition-all duration-300 pointer-events-none",
                          lolStyles.wingColor
                        )}
                      >
                        {""}
                      </CardItem>
                    )}

                    {/* Avatar with Ring */}
                    <CardItem translateZ={50} className="relative z-10">
                      <Avatar className={cn("size-12 border shadow-sm ring-2 transition-all duration-500", lolStyles.avatarRing)}>
                        <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                        <AvatarFallback>{DATA.initials}</AvatarFallback>
                      </Avatar>
                    </CardItem>

                    {/* Right Wing */}
                    {lolStyles.hasWings && (
                      <CardItem
                        translateZ={30}
                        className={cn(
                          "absolute -right-2.5 top-1/2 -translate-y-1/2 -mt-1 w-1.5 h-6 rounded-r-md border-y border-r transition-all duration-300 pointer-events-none",
                          lolStyles.wingColor
                        )}
                      >
                        {""}
                      </CardItem>
                    )}

                    {/* Level Badge */}
                    <CardItem
                      translateZ={75}
                      className={cn(
                        "absolute -bottom-6 left-0 right-0 mx-auto w-fit px-1 py-0.5 rounded text-[8px] font-extrabold tracking-wider border shadow-sm transition-all duration-500 z-20 pointer-events-none select-none",
                        lolStyles.badgeClass
                      )}
                    >
                      {lolStyles.levelText}
                    </CardItem>
                  </div>

                  {/* Card Details */}
                  <div className="flex min-w-0 flex-col gap-1 [transform-style:preserve-3d] z-10">
                    <CardItem
                      translateZ={75}
                      as="h3"
                      className="truncate text-sm font-semibold leading-none tracking-tight text-foreground"
                    >
                      {DATA.name}
                    </CardItem>

                    <CardItem translateZ={90} as="div">
                      <Link
                        href={DATA.contact.social.GitHub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Visit Vo Dinh Quan GitHub profile"
                      >
                        <Icons.github className="size-3.5" aria-hidden />
                        <span>GitHub Profile</span>
                      </Link>
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
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
            <CategoryNav
              categories={categories}
              filterState={filterState}
              pinnedCategories={pinnedCategories}
              onTogglePin={togglePinCategory}
            />
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
            className="sticky-progress-summary sticky top-0 z-40 -mx-2 px-2 py-2 bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm sm:-mx-4 sm:px-4 lg:top-6 lg:z-20 lg:-mx-0 lg:px-0 lg:border-none lg:shadow-none lg:pb-0 lg:pt-0 lg:bg-transparent lg:backdrop-blur-none transition-all duration-200"
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

      {/* Floating Category Progress Vertical Sidebar */}
      <CategoryProgressVertical
        categories={categories}
        categoryQuestionIds={categoryQuestionIds}
        filterState={filterState}
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
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainContent}
      {mounted && typeof document !== "undefined" && createPortal(drawerContent, document.body)}
      {rankUpData && (
        <RankUpModal
          oldRank={rankUpData.oldRank}
          newRank={rankUpData.newRank}
          onClose={() => setRankUpData(null)}
        />
      )}
    </>
  );
}
