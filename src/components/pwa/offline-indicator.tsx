"use client";

import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineIndicator({ className }: { className?: string }) {
  const online = useOnlineStatus();

  return (
    <p
      className={cn(
        "shrink-0 text-[11px] leading-tight",
        online ? "text-muted-foreground" : "text-primary",
        className,
      )}
      role="status"
    >
      {online ? (
        "Online"
      ) : (
        <>
          <span className="sm:hidden">Offline — cached content</span>
          <span className="hidden sm:inline">
            You&apos;re offline — showing cached content
          </span>
        </>
      )}
    </p>
  );
}

export function MobileOfflineBar() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="px-3 pb-2 sm:hidden">
      <OfflineIndicator />
    </div>
  );
}
