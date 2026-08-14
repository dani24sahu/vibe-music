"use client";

import Link from "next/link";
import { ListMusic, Trash2 } from "lucide-react";
import { Artwork } from "@/components/media/artwork";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { primaryArtistName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";

export function QueueSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const playAt = usePlayerStore((state) => state.playAt);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const clearQueue = usePlayerStore((state) => state.clearQueue);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListMusic className="size-4" />
            Queue
          </SheetTitle>
          <SheetDescription>
            {queue.length === 0
              ? "Nothing queued yet."
              : `${queue.length} track${queue.length === 1 ? "" : "s"}`}
          </SheetDescription>
        </SheetHeader>
        {queue.length > 0 ? (
          <div className="flex justify-end px-4">
            <Button variant="ghost" size="sm" onClick={clearQueue}>
              Clear
            </Button>
          </div>
        ) : null}
        <ScrollArea className="h-[calc(100vh-8rem)] px-2">
          <div className="space-y-1 pb-8">
            {queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-accent",
                  index === currentIndex && "bg-primary/10 ring-1 ring-primary/20",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => playAt(index)}
                >
                  <Artwork
                    images={song.image}
                    alt={song.name}
                    size="sm"
                    className="size-10"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{song.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {primaryArtistName(song)}
                    </p>
                  </div>
                </button>
                <Link
                  href={`/song/${song.id}`}
                  className="sr-only"
                >
                  Open {song.name}
                </Link>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Remove from queue"
                  onClick={() => removeFromQueue(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
