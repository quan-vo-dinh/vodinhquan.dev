"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

type FocusCard = {
  alt?: string;
  href?: string;
  metadata?: string;
  src?: string;
  title: string;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: FocusCard;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    const className = cn(
      "group relative min-h-72 w-full overflow-hidden rounded-2xl border bg-muted shadow-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      hovered !== null &&
        hovered !== index &&
        "scale-[0.985] opacity-60 saturate-50"
    );
    const content = (
      <>
        {card.src ? (
          <Image
            src={card.src}
            alt={card.alt ?? card.title}
            fill
            preload={index === 0}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-muted to-secondary">
            <ImageIcon className="size-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-white">
          <p className="text-xl font-semibold tracking-tight">{card.title}</p>
          {card.metadata ? (
            <p className="text-xs leading-5 text-white/75">{card.metadata}</p>
          ) : null}
        </div>
      </>
    );

    return card.href ? (
      <Link
        href={card.href}
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(index)}
        onBlur={() => setHovered(null)}
        className={className}
        aria-label={card.title}
      >
        {content}
      </Link>
    ) : (
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        className={className}
      >
        {content}
      </div>
    );
  }
);

Card.displayName = "Card";

export function FocusCards({
  cards,
  className,
}: {
  cards: FocusCard[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4",
        className
      )}
    >
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
