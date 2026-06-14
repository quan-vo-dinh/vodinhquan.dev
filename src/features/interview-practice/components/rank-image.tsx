import Image from "next/image";

import { cn } from "@/lib/utils";

type RankImageProps = {
  alt: string;
  className?: string;
  height?: number;
  priority?: boolean;
  sizes?: string;
  src: string;
  width?: number;
};

export function RankImage({
  alt,
  className,
  height = 96,
  priority,
  sizes,
  src,
  width = 96,
}: RankImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      unoptimized
      className={cn("object-contain", className)}
    />
  );
}
