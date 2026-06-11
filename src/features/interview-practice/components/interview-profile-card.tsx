"use client";

import Link from "next/link";

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { SignInWithGitHubButton } from "@/features/auth/components/sign-in-with-github-button";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import type { CurrentViewer } from "@/features/auth/types";
import { cn } from "@/lib/utils";
import { getRankTier } from "../lib/rank-meta";

type InterviewProfileCardProps = {
  categoryProgress: number;
  learnedCount: number;
  viewer: CurrentViewer | null;
};

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
    case "silver":
      return {
        rankName: "Silver IV",
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
    case "bronze":
      return {
        rankName: "Bronze IV",
        rankSvg: "/ranked/bronze.svg",
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

export function InterviewProfileCard({
  categoryProgress,
  learnedCount,
  viewer,
}: InterviewProfileCardProps) {
  const displayName = viewer?.displayName ?? "Guest learner";
  const avatarUrl = viewer?.avatarUrl ?? null;
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "GL";

  const currentTier = getRankTier(categoryProgress);
  const lolStyles = getLoLProfileStyles(categoryProgress, learnedCount);

  return (
    <CardContainer
      containerClassName="py-0"
      className="w-full md:w-[280px]"
      xDivisor={10}
      yDivisor={10}
      perspective={400}
    >
      <CardBody
        className={cn(
          "relative flex items-center gap-3.5 rounded-2xl border bg-background/90 py-4 pl-6 pr-4 shadow-sm w-full h-auto transition-all duration-500 group/card",
          lolStyles.hoverGlow
        )}
      >
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
          <div
            className={cn(
              "absolute -top-[1px] -left-[1px] w-5 h-5 border-t-2 border-l-2 rounded-tl-2xl transition-all duration-500",
              lolStyles.cornerBorder
            )}
          />
          <div
            className={cn(
              "absolute -top-[1px] -right-[1px] w-5 h-5 border-t-2 border-r-2 rounded-tr-2xl transition-all duration-500",
              lolStyles.cornerBorder
            )}
          />
          <div
            className={cn(
              "absolute -bottom-[1px] -left-[1px] w-5 h-5 border-b-2 border-l-2 rounded-bl-2xl transition-all duration-500",
              lolStyles.cornerBorder
            )}
          />
          <div
            className={cn(
              "absolute -bottom-[1px] -right-[1px] w-5 h-5 border-b-2 border-r-2 rounded-br-2xl transition-all duration-500",
              lolStyles.cornerBorder
            )}
          />
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
            <Avatar
              className={cn(
                "size-12 border shadow-sm ring-2 transition-all duration-500",
                lolStyles.avatarRing
              )}
            >
              {avatarUrl && (
                <AvatarImage alt={displayName} src={avatarUrl} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
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
        <div className={cn("flex min-w-0 flex-col gap-1 [transform-style:preserve-3d] z-10 w-full justify-center", viewer && "pr-16")}>
          <CardItem
            translateZ={75}
            as="h3"
            className="truncate text-sm font-semibold leading-none tracking-tight text-foreground"
          >
            {displayName}
          </CardItem>

          {viewer?.profileUrl ? (
            <CardItem translateZ={90}>
              <Link
                href={viewer.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Visit ${displayName} GitHub profile`}
              >
                <Icons.github className="size-3.5" aria-hidden />
                <span>{viewer.githubUsername ?? "GitHub Profile"}</span>
              </Link>
            </CardItem>
          ) : (
            <CardItem translateZ={90} as="div" className="mt-1">
              <SignInWithGitHubButton />
            </CardItem>
          )}
        </div>

        {viewer ? (
          <CardItem
            translateZ={90}
            as="div"
            className="absolute bottom-2.5 right-2.5 z-20"
          >
            <SignOutButton />
          </CardItem>
        ) : null}
      </CardBody>
    </CardContainer>
  );
}
