"use client";

import { Artwork } from "@/components/media/artwork";
import { upcomingFromQueue } from "@/lib/player/queue";
import { cn } from "@/lib/utils";
import type { Song } from "@/types/music";

const PEEK_TRANSFORMS = [
  "translate(-10%, 8%) rotate(-9deg) scale(0.9)",
  "translate(12%, 10%) rotate(8deg) scale(0.88)",
] as const;

export function CueCardStack({
  queue,
  currentIndex,
  isPlaying,
}: {
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
}) {
  const current = queue[currentIndex] ?? null;
  const upcoming = upcomingFromQueue(queue, currentIndex, 2);

  return (
    <div className="mx-auto w-full max-w-[min(100%,24rem)] px-5 sm:px-8">
      <div className="relative aspect-square">
        {upcoming.map((song, index) => (
          <div
            key={`${song.id}-peek-${index}`}
            className="absolute inset-[8%] overflow-hidden rounded-[1.6rem] opacity-70 shadow-xl ring-1 ring-white/15"
            style={{
              transform: PEEK_TRANSFORMS[index] ?? PEEK_TRANSFORMS[0],
              zIndex: index,
            }}
            aria-hidden
          >
            <Artwork
              images={song.image}
              alt=""
              size="lg"
              rounded="rounded-[1.6rem]"
              className="size-full"
            />
          </div>
        ))}
        <div
          className={cn(
            "absolute inset-0 z-10 overflow-hidden rounded-[1.85rem] shadow-[0_28px_70px_rgba(0,0,0,0.5)] ring-1 ring-white/25",
            isPlaying && "cue-breathe",
          )}
        >
          <Artwork
            images={current?.image ?? []}
            alt={current?.name ?? "No track"}
            size="lg"
            rounded="rounded-[1.85rem]"
            className="size-full"
          />
        </div>
      </div>
    </div>
  );
}