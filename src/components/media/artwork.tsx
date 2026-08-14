"use client";

import { bestArtwork } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ArtworkImage } from "@/types/music";
import { Music } from "lucide-react";

type ArtworkProps = {
  images: ArtworkImage[];
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  rounded?: string;
};

export function Artwork({
  images,
  alt,
  size = "md",
  className,
  rounded = "rounded-md",
}: ArtworkProps) {
  const src = bestArtwork(images ?? [], size);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          rounded,
          className,
        )}
      >
        <Music className="size-1/3 opacity-60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("object-cover", rounded, className)}
    />
  );
}
