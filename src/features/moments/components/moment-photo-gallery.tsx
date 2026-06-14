"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import { cn } from "@/lib/utils";

import type { MomentAssetView } from "../types";

const THUMBNAIL_HOVER_OFFSET = 6;

export function MomentPhotoGallery({
  assets,
  momentTitle,
}: {
  assets: MomentAssetView[];
  momentTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const activeAsset = activeIndex === null ? null : assets[activeIndex];
  const hasMultipleAssets = assets.length > 1;

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    lightboxRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }

      if (!hasMultipleAssets) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + assets.length) % assets.length
        );
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) =>
          index === null ? index : (index + 1) % assets.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, assets.length, hasMultipleAssets]);

  function showPreviousAsset() {
    setActiveIndex((index) =>
      index === null ? index : (index - 1 + assets.length) % assets.length
    );
  }

  function showNextAsset() {
    setActiveIndex((index) =>
      index === null ? index : (index + 1) % assets.length
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {assets.map((asset, index) => {
          const label = asset.caption;
          const ariaLabel = label ?? asset.alt ?? `${momentTitle} photo`;

          return (
            <button
              key={asset.id}
              type="button"
              aria-label={`Open ${ariaLabel} full size`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setActiveIndex(index)}
            >
              <DirectionAwareHover
                imageUrl={asset.secureUrl}
                imageAlt={asset.alt ?? momentTitle}
                className="aspect-[4/3] h-auto w-full rounded-none md:h-auto md:w-full"
                imageClassName="scale-110"
                motionOffset={THUMBNAIL_HOVER_OFFSET}
                sizes="(min-width: 768px) 20rem, calc((100vw - 3.75rem) / 2)"
              >
                <div className="flex flex-col items-start gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-xs font-medium backdrop-blur-sm text-white">
                    <ExpandIcon className="size-3.5" />
                    View full
                  </span>
                  {label && (
                    <span className="text-sm font-medium text-white line-clamp-2 drop-shadow-md">
                      {label}
                    </span>
                  )}
                </div>
              </DirectionAwareHover>
            </button>
          );
        })}
      </div>

      {activeAsset ? (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${momentTitle} full-size photo`}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl focus-visible:outline-none"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="flex h-full w-full max-w-6xl flex-col gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {activeAsset.caption ?? activeAsset.alt ?? momentTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  Photo {(activeIndex ?? 0) + 1} of {assets.length}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Close full-size photo"
                onClick={() => setActiveIndex(null)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border bg-black">
              <Image
                src={activeAsset.secureUrl}
                alt={activeAsset.alt ?? momentTitle}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />

              {hasMultipleAssets ? (
                <>
                  <LightboxNavButton
                    className="left-3"
                    label="Show previous photo"
                    onClick={showPreviousAsset}
                  >
                    <ChevronLeftIcon className="size-5" />
                  </LightboxNavButton>
                  <LightboxNavButton
                    className="right-3"
                    label="Show next photo"
                    onClick={showNextAsset}
                  >
                    <ChevronRightIcon className="size-5" />
                  </LightboxNavButton>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function LightboxNavButton({
  children,
  className,
  label,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 border-white/20 bg-background/80 text-foreground shadow-lg backdrop-blur",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
