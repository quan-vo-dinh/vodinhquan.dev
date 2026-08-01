"use client";

import { useEffect, useRef, useState } from "react";
import { RankTier } from "../lib/rank-meta";
import { getInterviewCategoryMeta } from "../lib/category-meta";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TechIcon } from "./tech-icon";
import { useI18n } from "@/i18n/locale-provider";

// ─── Asset Lookup ──────────────────────────────────────────────────────────────

const FROM_RANKS = new Set([
  "iron", "bronze", "silver", "gold", "platinum",
  "emerald", "diamond", "master", "grandmaster", "unranked",
]);
const TO_RANKS = new Set([
  "iron", "bronze", "silver", "gold", "platinum",
  "emerald", "diamond", "master", "grandmaster", "challenger",
]);

function rkey(rank: string) { return rank.toLowerCase().trim(); }
function fromVidUrl(rank: string) { const k = rkey(rank); return FROM_RANKS.has(k) ? `/rank-animation/tier-promotion-from-${k}.webm` : null; }
function toVidUrl(rank: string)   { const k = rkey(rank); return TO_RANKS.has(k)   ? `/rank-animation/tier-promotion-to-${k}.webm`   : null; }
function fromAudUrl(rank: string) { const k = rkey(rank); return FROM_RANKS.has(k) ? `/rank-animation/sfx-tier-wings-promotion-from-${k}.ogg` : null; }
function toAudUrl(rank: string)   { const k = rkey(rank); return TO_RANKS.has(k)   ? `/rank-animation/sfx-tier-wings-promotion-to-${k}.ogg`   : null; }

// ─── Theme Colors ──────────────────────────────────────────────────────────────

const themeColors: Record<
  string,
  { bgGlow: string; borderCard: string; borderCorner: string; shadow: string; text: string; buttonBg: string; }
> = {
  iron:        { bgGlow: "from-zinc-500/8 via-zinc-800/5 to-transparent",       borderCard: "border-zinc-500/20",    borderCorner: "border-zinc-500/50",   shadow: "shadow-[0_0_20px_rgba(113,113,122,0.15)]",  text: "text-zinc-400",                     buttonBg: "from-zinc-600 to-zinc-800 hover:from-zinc-500 hover:to-zinc-700" },
  bronze:      { bgGlow: "from-amber-900/15 via-amber-800/5 to-transparent",    borderCard: "border-amber-800/20",   borderCorner: "border-amber-800/60",  shadow: "shadow-[0_0_20px_rgba(180,83,9,0.2)]",      text: "text-amber-600 dark:text-amber-500", buttonBg: "from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900" },
  silver:      { bgGlow: "from-slate-400/10 via-slate-600/5 to-transparent",    borderCard: "border-slate-400/20",   borderCorner: "border-slate-400/50",  shadow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",   text: "text-slate-300",                    buttonBg: "from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600" },
  gold:        { bgGlow: "from-yellow-600/12 via-yellow-800/5 to-transparent",   borderCard: "border-yellow-500/20", borderCorner: "border-yellow-500/70",  shadow: "shadow-[0_0_25px_rgba(234,179,8,0.25)]",    text: "text-yellow-400 font-bold",         buttonBg: "from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700" },
  platinum:    { bgGlow: "from-teal-500/10 via-teal-800/5 to-transparent",      borderCard: "border-teal-500/20",    borderCorner: "border-teal-500/70",   shadow: "shadow-[0_0_25px_rgba(20,184,166,0.25)]",   text: "text-teal-400 font-bold",           buttonBg: "from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700" },
  emerald:     { bgGlow: "from-emerald-500/10 via-emerald-800/5 to-transparent", borderCard: "border-emerald-500/20",borderCorner: "border-emerald-500/70", shadow: "shadow-[0_0_25px_rgba(16,185,129,0.25)]",   text: "text-emerald-400 font-bold",        buttonBg: "from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700" },
  diamond:     { bgGlow: "from-blue-500/12 via-blue-800/5 to-transparent",      borderCard: "border-blue-500/20",    borderCorner: "border-blue-500/80",   shadow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",    text: "text-blue-400 font-extrabold",      buttonBg: "from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700" },
  master:      { bgGlow: "from-purple-500/12 via-purple-800/5 to-transparent",   borderCard: "border-purple-500/25", borderCorner: "border-purple-500/80",  shadow: "shadow-[0_0_30px_rgba(147,51,234,0.35)]",   text: "text-purple-400 font-extrabold",    buttonBg: "from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700" },
  grandmaster: { bgGlow: "from-rose-500/12 via-rose-800/5 to-transparent",      borderCard: "border-rose-500/25",    borderCorner: "border-rose-500/80",   shadow: "shadow-[0_0_30px_rgba(225,29,72,0.4)]",     text: "text-rose-400 font-extrabold",      buttonBg: "from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700" },
  challenger:  { bgGlow: "from-amber-500/15 via-red-800/8 to-transparent",      borderCard: "border-amber-500/25",   borderCorner: "border-amber-500/80",  shadow: "shadow-[0_0_40px_rgba(245,158,11,0.45)]",   text: "text-amber-400 font-black tracking-widest", buttonBg: "from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600" },
};

// ─── Phase Types ───────────────────────────────────────────────────────────────

type Phase = "from" | "to" | "stable";

type RankUpModalProps = {
  oldRank: RankTier;
  newRank: RankTier;
  category: string;
  onClose: () => void;
};

export function RankUpModal({ oldRank, newRank, category, onClose }: RankUpModalProps) {
  const { dictionary } = useI18n();

  const fromVid = fromVidUrl(oldRank.colorTheme);
  const fromAud = fromAudUrl(oldRank.colorTheme);
  const toVid   = toVidUrl(newRank.colorTheme);
  const toAud   = toAudUrl(newRank.colorTheme);

  const [phase, setPhase] = useState<Phase>(() => (fromVid ? "from" : toVid ? "to" : "stable"));

  const fromVideoRef = useRef<HTMLVideoElement>(null);
  const toVideoRef   = useRef<HTMLVideoElement>(null);

  const colors = themeColors[newRank.colorTheme] ?? themeColors.iron;

  // ── Lock body scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  // ── ESC key to close (only when stable / animation finished) ──────────────────
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "stable") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, phase]);

  // ── Play audio for FROM phase ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "from" || !fromAud) return;
    const audio = new Audio(fromAud);
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, [phase, fromAud]);

  // ── Play audio for TO phase ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "to" || !toAud) return;
    const audio = new Audio(toAud);
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, [phase, toAud]);

  // ── Start FROM phase (mount) ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "from") return;
    const v = fromVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    // Safety fallback (6s) if video fails to report end
    const timer = setTimeout(() => {
      setPhase((p) => (p === "from" ? "to" : p));
    }, 6000);
    return () => clearTimeout(timer);
  }, [phase]);

  // ── Start TO phase ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "to") return;
    if (!toVid) {
      const timer = setTimeout(() => setPhase("stable"), 0);
      return () => clearTimeout(timer);
    }
    const v = toVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    // Safety fallback (8s) if video fails to report end
    const timer = setTimeout(() => {
      setPhase((p) => (p === "to" ? "stable" : p));
    }, 8000);
    return () => clearTimeout(timer);
  }, [phase, toVid]);

  const handleFromEnded = () => {
    setPhase("to");
  };

  const handleToEnded = () => {
    setPhase("stable");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-300 overflow-hidden w-full max-w-full">
      {/* Ambient Rank Color Glow */}
      <div className={cn("absolute w-full max-w-sm sm:size-[600px] aspect-square rounded-full blur-[100px] sm:blur-[140px] opacity-45 pointer-events-none z-0", colors.bgGlow)} />

      {/* Lightweight Glassmorphic Frame */}
      <div
        className={cn(
          "relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto rounded-3xl border bg-black/25 backdrop-blur-md overflow-hidden z-10 animate-in zoom-in-95 duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col items-center text-center px-6 py-4 sm:px-10 sm:py-6",
          colors.borderCard,
          colors.shadow,
        )}
      >
        {/* LoL Corner Brackets */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className={cn("absolute top-[8px] left-[8px] w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl opacity-70", colors.borderCorner)} />
          <div className={cn("absolute top-[8px] right-[8px] w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl opacity-70", colors.borderCorner)} />
          <div className={cn("absolute bottom-[8px] left-[8px] w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl opacity-70", colors.borderCorner)} />
          <div className={cn("absolute bottom-[8px] right-[8px] w-8 h-8 border-b-2 border-r-2 rounded-br-2xl opacity-70", colors.borderCorner)} />
        </div>

        {/* ── Transparent Video Stage (Large & Prominent) ─────────────────── */}
        <div className="relative w-full h-[250px] sm:h-[280px] flex items-center justify-center overflow-visible -my-2 sm:-my-4">
          {/* FROM video — departure animation */}
          {fromVid && (
            <video
              ref={fromVideoRef}
              src={fromVid}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={handleFromEnded}
              onError={handleFromEnded}
              className={cn(
                "absolute inset-0 w-full h-full object-contain scale-155 sm:scale-175 md:scale-185 transition-opacity duration-300 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]",
                phase === "from" ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            />
          )}

          {/* TO video — target rank reveal animation */}
          {toVid && (
            <video
              ref={toVideoRef}
              src={toVid}
              muted
              playsInline
              preload="auto"
              onEnded={handleToEnded}
              onError={handleToEnded}
              className={cn(
                "absolute inset-0 w-full h-full object-contain scale-155 sm:scale-175 md:scale-185 transition-opacity duration-300 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]",
                phase !== "from" ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            />
          )}
        </div>

        {/* ── Overlaid Text & Controls Layer (Tightly Positioned Under Video) ─── */}
        <div className="relative z-20 w-full max-w-md flex flex-col items-center gap-2.5 -mt-3 sm:-mt-5">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.35em] text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {dictionary.interview.rankPromotion}
          </span>

          <h2
            className={cn(
              "text-lg sm:text-xl font-extrabold uppercase tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-opacity duration-500",
              phase === "stable" ? "opacity-100" : "opacity-50",
            )}
          >
            {dictionary.interview.promoted}
          </h2>

          {/* Category Pill */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md shadow-inner">
            <TechIcon
              iconKey={getInterviewCategoryMeta(category).iconKey}
              className="size-8 shrink-0"
              iconClassName="size-7"
            />
            <span className="text-sm font-bold text-zinc-200 tracking-wide">{category}</span>
          </div>

          {/* Congratulations Text */}
          <p
            className={cn(
              "text-sm sm:text-base text-zinc-300 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-opacity duration-700",
              phase === "stable" ? "opacity-100" : "opacity-40",
            )}
          >
            {dictionary.interview.rankCongratsBefore}{" "}
            <strong className={cn("uppercase tracking-wide font-black", colors.text)}>
              {newRank.name}
            </strong>{" "}
            {dictionary.interview.rankCongratsIn} {category}.{" "}
            {dictionary.interview.rankCongratsAfter}
          </p>

          {/* Continue Button — Only shown after entire animation finishes */}
          {phase === "stable" ? (
            <Button
              onClick={onClose}
              aria-label={dictionary.interview.continue}
              className={cn(
                "relative w-full max-w-[220px] h-11 sm:h-12 mt-1 text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white border border-white/20 rounded-xl bg-gradient-to-b shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_6px_30px_rgba(0,0,0,0.7)] hover:scale-105 active:scale-95 cursor-pointer overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-500",
                colors.buttonBg,
              )}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              <span>{dictionary.interview.continue}</span>
            </Button>
          ) : (
            <div className="h-11 sm:h-12 mt-1" />
          )}
        </div>
      </div>
    </div>
  );
}
