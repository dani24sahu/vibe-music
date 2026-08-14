import { Skeleton } from "@/components/ui/skeleton";

export function SongRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <Skeleton className="size-12 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-3 w-16 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function DetailHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
      <Skeleton className="size-48 rounded-xl sm:size-56" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
