"use client";

import { useEffect, useRef } from "react";
import { activeLyricIndex } from "@/lib/player/lyrics";
import { cn } from "@/lib/utils";
import type { LyricsResult } from "@/types/lyrics";

export function SyncedLyrics({
  lyrics,
  currentTime,
  onSeek,
  follow = true,
  tone = "dark",
  isLoading = false,
  isError = false,
  onRetry,
  className,
}: {
  lyrics?: LyricsResult;
  currentTime: number;
  onSeek?: (time: number) => void;
  follow?: boolean;
  tone?: "dark" | "light";
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const programmatic = useRef(false);
  const resumeAt = useRef(0);
  const activeIndex = lyrics?.synced ? activeLyricIndex(lyrics.lines, currentTime) : -1;
  const dark = tone === "dark";

  useEffect(() => {
    if (!follow || activeIndex < 0 || Date.now() < resumeAt.current) return;
    const node = activeRef.current;
    if (!node) return;
    programmatic.current = true;
    node.scrollIntoView({ block: "center", behavior: "smooth" });
    const timer = window.setTimeout(() => {
      programmatic.current = false;
    }, 400);
    return () => window.clearTimeout(timer);
  }, [activeIndex, follow]);

  if (isLoading) {
    return (
      <p className={cn("px-2 py-8 text-center text-sm", dark ? "text-white/60" : "text-muted-foreground")}>
        Finding synced lyrics…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="px-2 py-8 text-center">
        <p className={cn("text-sm", dark ? "text-white/70" : "text-muted-foreground")}>
          Lyrics couldn’t be loaded.
        </p>
        {onRetry ? (
          <button
            type="button"
            className={cn(
              "mt-3 text-sm font-semibold underline-offset-4 hover:underline",
              dark ? "text-white" : "text-foreground",
            )}
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (!lyrics?.found) {
    return (
      <p className={cn("px-2 py-8 text-center text-sm", dark ? "text-white/60" : "text-muted-foreground")}>
        No lyrics matched this track yet.
      </p>
    );
  }

  if (lyrics.instrumental) {
    return (
      <p className={cn("px-2 py-8 text-center text-sm", dark ? "text-white/60" : "text-muted-foreground")}>
        This track is instrumental.
      </p>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className={cn("h-full min-h-0 overflow-y-auto px-1", className)}
      onScroll={() => {
        if (programmatic.current) return;
        resumeAt.current = Date.now() + 4000;
      }}
    >
      <div className="flex flex-col gap-4 py-[28%] sm:gap-5">
        {lyrics.lines.map((line, index) => {
          const active = lyrics.synced && index === activeIndex;
          const time = line.time;
          const canSeek = Boolean(onSeek && time !== null);
          return (
            <button
              key={`${line.time ?? "u"}-${index}`}
              ref={active ? (node) => {
                activeRef.current = node;
              } : undefined}
              type="button"
              disabled={!canSeek}
              onClick={() => {
                if (time === null || !onSeek) return;
                resumeAt.current = 0;
                onSeek(time);
              }}
              className={cn(
                "block w-full text-left text-pretty transition-all duration-300",
                canSeek ? "cursor-pointer" : "cursor-default",
                active
                  ? dark
                    ? "font-display text-2xl font-bold text-white sm:text-3xl"
                    : "font-display text-2xl font-bold text-foreground sm:text-3xl"
                  : dark
                    ? "text-lg text-white/40 hover:text-white/75 sm:text-xl"
                    : "text-lg text-muted-foreground hover:text-foreground sm:text-xl",
              )}
            >
              {line.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
