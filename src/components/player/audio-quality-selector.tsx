"use client";

import { AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatQualityLabel,
  pickPlaybackSource,
  playableSources,
} from "@/lib/player/quality";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";
import type { PlaybackSource } from "@/types/music";

export function AudioQualitySelector({
  sources,
  compact = false,
}: {
  sources: PlaybackSource[];
  compact?: boolean;
}) {
  const preferredQuality = usePlayerStore((state) => state.preferredQuality);
  const setPreferredQuality = usePlayerStore((state) => state.setPreferredQuality);
  const options = playableSources(sources);

  if (options.length < 2) return null;

  const active = pickPlaybackSource(options, preferredQuality);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size={compact ? "icon-sm" : "sm"}
            variant="ghost"
            className={cn("rounded-full", !compact && "px-2")}
            aria-label="Audio quality"
          />
        }
      >
        <AudioLines className="size-4" />
        {compact ? null : (
          <span className="text-xs font-semibold tabular-nums">
            {active ? formatQualityLabel(active.quality) : "Quality"}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup
          value={active?.quality}
          onValueChange={(value) => {
            if (typeof value === "string" && value) {
              setPreferredQuality(value);
            }
          }}
        >
          <DropdownMenuLabel>Audio quality</DropdownMenuLabel>
          {options.map((source) => (
            <DropdownMenuRadioItem key={source.quality} value={source.quality}>
              {formatQualityLabel(source.quality)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
