"use client";

import { useEffect, useState } from "react";
import { triggerConfetti } from "../lib/celebrate";
import { RankTier } from "../lib/rank-meta";
import { getInterviewCategoryMeta } from "../lib/category-meta";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { TechIcon } from "./tech-icon";

type RankUpModalProps = {
  oldRank: RankTier;
  newRank: RankTier;
  category: string;
  onClose: () => void;
};

export function RankUpModal({ oldRank, newRank, category, onClose }: RankUpModalProps) {
  const [showNewRank, setShowNewRank] = useState(false);

  useEffect(() => {
    // Trigger milestone celebration confetti
    setTimeout(() => {
      triggerConfetti(newRank.minPercent);
    }, 400);

    // Timing for showing the new rank transition
    const timer = setTimeout(() => {
      setShowNewRank(true);
    }, 800);

    // Prevent scrolling when modal is open
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalStyle;
    };
  }, [newRank]);

  // Custom styling based on colorTheme
  const themeColors: Record<
    string,
    {
      bgGlow: string;
      borderCard: string;
      borderCorner: string;
      shadow: string;
      text: string;
      buttonBg: string;
    }
  > = {
    iron: {
      bgGlow: "from-zinc-500/8 via-zinc-800/5 to-transparent",
      borderCard: "border-zinc-500/20",
      borderCorner: "border-zinc-500/50",
      shadow: "shadow-[0_0_20px_rgba(113,113,122,0.15)]",
      text: "text-zinc-400",
      buttonBg: "from-zinc-600 to-zinc-800 hover:from-zinc-500 hover:to-zinc-700",
    },
    bronze: {
      bgGlow: "from-amber-900/15 via-amber-800/5 to-transparent",
      borderCard: "border-amber-800/20",
      borderCorner: "border-amber-800/60",
      shadow: "shadow-[0_0_20px_rgba(180,83,9,0.2)]",
      text: "text-amber-600 dark:text-amber-500",
      buttonBg: "from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900",
    },
    silver: {
      bgGlow: "from-slate-400/10 via-slate-600/5 to-transparent",
      borderCard: "border-slate-400/20",
      borderCorner: "border-slate-400/50",
      shadow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
      text: "text-slate-300",
      buttonBg: "from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600",
    },
    gold: {
      bgGlow: "from-yellow-600/12 via-yellow-800/5 to-transparent",
      borderCard: "border-yellow-500/20",
      borderCorner: "border-yellow-500/70",
      shadow: "shadow-[0_0_25px_rgba(234,179,8,0.25)]",
      text: "text-yellow-500 dark:text-yellow-400 font-bold",
      buttonBg: "from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700",
    },
    platinum: {
      bgGlow: "from-teal-500/10 via-teal-800/5 to-transparent",
      borderCard: "border-teal-500/20",
      borderCorner: "border-teal-500/70",
      shadow: "shadow-[0_0_25px_rgba(20,184,166,0.25)]",
      text: "text-teal-400 font-bold",
      buttonBg: "from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700",
    },
    emerald: {
      bgGlow: "from-emerald-500/10 via-emerald-800/5 to-transparent",
      borderCard: "border-emerald-500/20",
      borderCorner: "border-emerald-500/70",
      shadow: "shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      text: "text-emerald-400 font-bold",
      buttonBg: "from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700",
    },
    diamond: {
      bgGlow: "from-blue-500/12 via-blue-800/5 to-transparent",
      borderCard: "border-blue-500/20",
      borderCorner: "border-blue-500/80",
      shadow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      text: "text-blue-400 font-extrabold",
      buttonBg: "from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700",
    },
    master: {
      bgGlow: "from-purple-500/12 via-purple-800/5 to-transparent",
      borderCard: "border-purple-500/25",
      borderCorner: "border-purple-500/80",
      shadow: "shadow-[0_0_30px_rgba(147,51,234,0.35)]",
      text: "text-purple-400 font-extrabold",
      buttonBg: "from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700",
    },
    grandmaster: {
      bgGlow: "from-rose-500/12 via-rose-800/5 to-transparent",
      borderCard: "border-rose-500/25",
      borderCorner: "border-rose-500/80",
      shadow: "shadow-[0_0_30px_rgba(225,29,72,0.4)]",
      text: "text-rose-400 font-extrabold",
      buttonBg: "from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700",
    },
    challenger: {
      bgGlow: "from-amber-500/15 via-red-800/8 to-transparent",
      borderCard: "border-amber-500/25",
      borderCorner: "border-amber-500/80",
      shadow: "shadow-[0_0_40px_rgba(245,158,11,0.45)]",
      text: "text-amber-400 font-black animate-pulse tracking-widest",
      buttonBg: "from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600",
    },
  };

  const currentColors = themeColors[newRank.colorTheme] || themeColors.iron;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 animate-in fade-in duration-500">
      {/* Background Radial Glow */}
      <div className={cn("absolute inset-0 bg-gradient-to-b pointer-events-none z-0", currentColors.bgGlow)} />

      {/* Promotion Dialog Container */}
      <div 
        className={cn(
          "relative w-full max-w-xl sm:max-w-2xl mx-4 rounded-3xl border bg-zinc-950/90 p-8 text-center flex flex-col items-center justify-center overflow-hidden z-10 transition-all duration-700 transform animate-in zoom-in-95 duration-500",
          currentColors.borderCard,
          currentColors.shadow
        )}
      >
        {/* LoL Loading Bracket Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn("absolute top-[6px] left-[6px] w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl opacity-60", currentColors.borderCorner)} />
          <div className={cn("absolute top-[6px] right-[6px] w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl opacity-60", currentColors.borderCorner)} />
          <div className={cn("absolute bottom-[6px] left-[6px] w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl opacity-60", currentColors.borderCorner)} />
          <div className={cn("absolute bottom-[6px] right-[6px] w-8 h-8 border-b-2 border-r-2 rounded-br-2xl opacity-60", currentColors.borderCorner)} />
        </div>

        {/* Shine sweeping animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-pulse pointer-events-none" />

        {/* Monospace Gaming Header */}
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-amber-500/80 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          ★ RANK PROMOTION SUCCESSFUL ★
        </span>

        {/* Main Promoted Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground uppercase tracking-wider mb-8 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
          PROMOTED
        </h2>

        {/* Emblem Transition Arena */}
        <div className="relative w-full h-64 sm:h-72 mb-8 z-10">
          
          {/* Old Rank Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-[1000ms] ease-out transform pointer-events-auto",
                showNewRank 
                  ? "opacity-30 scale-75 -translate-x-24 sm:-translate-x-36" 
                  : "opacity-100 scale-100 translate-x-0"
              )}
            >
              <div className="relative h-32 w-32 sm:h-48 sm:w-48 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                <img
                  src={oldRank.logoSvg}
                  alt={oldRank.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{oldRank.name}</span>
            </div>
          </div>

          {/* Chevron Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className={cn(
                "transition-all duration-[800ms] ease-out transform pointer-events-auto",
                showNewRank 
                  ? "opacity-100 scale-100 rotate-0" 
                  : "opacity-0 scale-50 -rotate-90 pointer-events-none"
              )}
            >
              <ChevronRight className={cn("size-8 sm:size-10 animate-pulse", currentColors.text)} />
            </div>
          </div>

          {/* New Rank Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-[1000ms] ease-out transform pointer-events-auto",
                showNewRank 
                  ? "opacity-100 scale-110 translate-x-24 sm:translate-x-36" 
                  : "opacity-0 scale-50 translate-x-0 pointer-events-none"
              )}
            >
              {/* Radial glow behind the new logo */}
              <div className={cn("absolute size-48 sm:size-64 bg-gradient-to-r blur-3xl opacity-15 rounded-full animate-pulse", currentColors.bgGlow)} />
              
              <div className="relative h-32 w-32 sm:h-48 sm:w-48 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-bounce duration-1000">
                <img
                  src={newRank.logoSvg}
                  alt={newRank.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className={cn("text-base font-extrabold uppercase tracking-widest mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]", currentColors.text)}>
                {newRank.name}
              </span>
            </div>
          </div>
        </div>

        {/* Rank Up Message with Category Context */}
        <div className="flex flex-col items-center gap-2 mb-8">
          {/* Category pill */}
          <div className="flex items-center gap-2.5">
            <TechIcon
              iconKey={getInterviewCategoryMeta(category).iconKey}
              className="size-10 shrink-0"
              iconClassName="size-9"
            />
            <span className="text-sm font-semibold text-zinc-300 tracking-wide">{category}</span>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 max-w-sm leading-relaxed text-center">
            You conquered{" "}
            <strong className="text-zinc-200">{category}</strong>{" "}
            and ascended to{" "}
            <strong className={cn("uppercase tracking-wide", currentColors.text)}>{newRank.name}</strong>.
            Keep compile-solving to reach the top!
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={onClose}
          className={cn(
            "relative w-full max-w-[200px] h-11 text-xs font-black uppercase tracking-[0.2em] text-white border border-white/10 rounded-xl bg-gradient-to-b shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer overflow-hidden z-20",
            currentColors.buttonBg
          )}
        >
          {/* Sweep sheen on button */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
          <span>Continue</span>
        </Button>
      </div>
    </div>
  );
}
