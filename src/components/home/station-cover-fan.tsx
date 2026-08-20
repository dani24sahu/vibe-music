import { Artwork } from "@/components/media/artwork";
import { cn } from "@/lib/utils";
import type { Song } from "@/types/music";

const ROTATIONS = [-14, 2, 12];

export function StationCoverFan({
  songs,
  className,
}: {
  songs: Song[];
  className?: string;
}) {
  const covers = songs
    .filter((song, index, list) => list.findIndex((item) => item.id === song.id) === index)
    .slice(0, 3);
  if (covers.length === 0) return null;

  return (
    <div className={cn("relative h-14 w-22 shrink-0", className)} aria-hidden>
      {covers.map((song, index) => (
        <div
          key={song.id}
          className="absolute top-0.5 left-1 size-12 overflow-hidden rounded-xl shadow-lg ring-1 ring-black/10 dark:ring-white/15"
          style={{
            transform: `translateX(${index * 11}px) rotate(${ROTATIONS[index] ?? 0}deg)`,
            zIndex: index + 1,
          }}
        >
          <Artwork
            images={song.image}
            alt=""
            size="sm"
            rounded="rounded-xl"
            className="size-full"
          />
        </div>
      ))}
    </div>
  );
}