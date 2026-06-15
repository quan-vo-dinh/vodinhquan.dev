"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
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
import { useI18n } from "@/i18n/locale-provider";

import type { MomentAssetView } from "../types";

const THUMBNAIL_HOVER_OFFSET = 6;

export function MomentPhotoGallery({
  assets,
  momentTitle,
}: {
  assets: MomentAssetView[];
  momentTitle: string;
}) {
  const { dictionary } = useI18n();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const activeAsset = activeIndex === null ? null : assets[activeIndex];
  const hasMultipleAssets = assets.length > 1;
  const isLightboxOpen = activeIndex !== null;

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior =
      document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
      openerRef.current?.focus();
    };
  }, [assets.length, hasMultipleAssets, isLightboxOpen]);

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
              aria-label={`${dictionary.moments.openFull}: ${ariaLabel}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setActiveIndex(index);
              }}
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
                    {dictionary.moments.viewFull}
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

      {activeAsset
        ? createPortal(
            <div
              ref={lightboxRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${momentTitle} ${dictionary.moments.fullSize}`}
              tabIndex={-1}
              data-testid="moment-lightbox"
              className="fixed inset-0 z-[100] h-dvh w-screen overflow-hidden bg-black text-white focus-visible:outline-none"
            >
              <div
                data-testid="moment-lightbox-image"
                className="absolute inset-0"
              >
                <Image
                  src={activeAsset.secureUrl}
                  alt={activeAsset.alt ?? momentTitle}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
                <div className="min-w-0 pt-1">
                  <p className="truncate text-sm font-medium text-white">
                    {activeAsset.caption ?? activeAsset.alt ?? momentTitle}
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    {dictionary.moments.photoPosition}{" "}
                    {(activeIndex ?? 0) + 1}{" "}
                    {dictionary.moments.positionOf} {assets.length}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={dictionary.moments.closeFull}
                  className="pointer-events-auto shrink-0 border-white/20 bg-black/45 text-white shadow-lg backdrop-blur hover:bg-black/70 hover:text-white"
                  onClick={() => setActiveIndex(null)}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>

              {hasMultipleAssets ? (
                <>
                  <LightboxNavButton
                    className="left-3 sm:left-5"
                    label={dictionary.moments.previousPhoto}
                    onClick={showPreviousAsset}
                  >
                    <ChevronLeftIcon className="size-5" />
                  </LightboxNavButton>
                  <LightboxNavButton
                    className="right-3 sm:right-5"
                    label={dictionary.moments.nextPhoto}
                    onClick={showNextAsset}
                  >
                    <ChevronRightIcon className="size-5" />
                  </LightboxNavButton>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}
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
        "absolute top-1/2 z-10 -translate-y-1/2 border-white/20 bg-black/45 text-white shadow-lg backdrop-blur hover:bg-black/70 hover:text-white",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
