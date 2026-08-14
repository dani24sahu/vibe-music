"use client";

import { Play } from "lucide-react";
import { Artwork } from "@/components/media/artwork";
import { Button } from "@/components/ui/button";
import type { ArtworkImage } from "@/types/music";

export function CollectionHeader({
  eyebrow,
  title,
  subtitle,
  images,
  onPlay,
  playLabel = "Play",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  images: ArtworkImage[];
  onPlay?: () => void;
  playLabel?: string;
}) {
  return (
    <header className="relative overflow-hidden rounded-[1.75rem] p-4 sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-hot/10 to-transparent" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
        <Artwork
          images={images}
          alt={title}
          size="lg"
          rounded="rounded-[1.4rem]"
          className="size-40 shadow-2xl shadow-primary/20 sm:size-56"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl leading-[0.95] font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          {onPlay ? (
            <Button
              className="mt-5 h-11 rounded-full px-6 shadow-lg shadow-primary/25"
              onClick={onPlay}
            >
              <Play className="size-4 fill-current" />
              {playLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
