"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
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
  const lineRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndexRef = useRef(-1);
  const programmatic = useRef(false);
  const [unfollowed, setUnfollowed] = useState(false);
  const activeIndex = lyrics?.synced ? activeLyricIndex(lyrics.lines, currentTime) : -1;
  const dark = tone === "dark";
  const canFollow = Boolean(follow && lyrics?.synced && activeIndex >= 0);
  activeIndexRef.current = activeIndex;

  function scrollToActive(smooth = false) {
    const scroller = scrollerRef.current;
    const node = lineRefs.current[activeIndexRef.current];
    if (!scroller || !node || scroller.clientHeight < 32) return;
    const target =
      scroller.scrollTop +
      (node.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
      scroller.clientHeight / 2 +
      node.getBoundingClientRect().height / 2;
    programmatic.current = true;
    scroller.scrollTo({
      top: Math.max(0, target),
      behavior: smooth ? "smooth" : "auto",
    });
    window.setTimeout(() => {
      programmatic.current = false;
    }, smooth ? 320 : 50);
  }

  function detachFromFollow() {
    if (!lyrics?.synced || unfollowed) return;
    setUnfollowed(true);
  }

  useEffect(() => {
    setUnfollowed(false);
  }, [lyrics?.songId]);

  useEffect(() => {
    if (!canFollow || unfollowed) return;
    scrollToActive(false);
  }, [activeIndex, canFollow, unfollowed]);

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
    <div className={cn("relative flex h-full min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        ref={scrollerRef}
        className={cn(
          "lyrics-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-1",
          dark && "lyrics-scroll-on-dark",
        )}
        onWheel={detachFromFollow}
        onTouchMove={detachFromFollow}
        onScroll={() => {
          if (programmatic.current || !lyrics.synced) return;
          detachFromFollow();
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
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                type="button"
                disabled={!canSeek}
                onClick={() => {
                  if (time === null || !onSeek) return;
                  setUnfollowed(false);
                  onSeek(time);
                  requestAnimationFrame(() => scrollToActive(true));
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
      {unfollowed && lyrics.synced ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setUnfollowed(false);
              requestAnimationFrame(() => scrollToActive(true));
            }}
            className={cn(
              "pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-lg",
              dark
                ? "bg-white text-black hover:bg-white/90"
                : "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            <LocateFixed className="size-4" aria-hidden />
            Sync
          </button>
        </div>
      ) : null}
    </div>
  );
}
