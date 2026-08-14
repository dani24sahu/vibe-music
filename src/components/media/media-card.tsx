"use client";

import Link from "next/link";
import { Artwork } from "@/components/media/artwork";
import { cn } from "@/lib/utils";
import type { ArtworkImage } from "@/types/music";

export function MediaCard({
  href,
  title,
  subtitle,
  images,
  onPlay,
  circular = false,
}: {
  href: string;
  title: string;
  subtitle?: string;
  images: ArtworkImage[];
  onPlay?: () => void;
  circular?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl p-2.5 transition-all duration-300 hover:-translate-y-1 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative">
        <Artwork
          images={images}
          alt={title}
          size="lg"
          rounded={circular ? "rounded-full" : "rounded-2xl"}
          className={cn(
            "aspect-square w-full shadow-lg transition-transform duration-500 group-hover:scale-[1.03]",
            circular && "ring-2 ring-border",
          )}
        />
        {onPlay ? (
          <button
            type="button"
            aria-label={`Play ${title}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPlay();
            }}
            className="absolute right-2.5 bottom-2.5 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-100 shadow-primary/30 transition duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
              <path d="M8 5.14v13.72L19 12 8 5.14z" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="mt-3 min-w-0 px-1">
        <p className="truncate font-semibold">{title}</p>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </Link>
  );
}
