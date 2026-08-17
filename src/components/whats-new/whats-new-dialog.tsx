"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLibraryStore } from "@/stores/library-store";
import {
  APP_VERSION,
  markCurrentVersionSeen,
  readSeenVersion,
  unseenReleases,
  WHATS_NEW,
  type WhatsNewRelease,
} from "@/lib/whats-new";

type WhatsNewContextValue = {
  openWhatsNew: () => void;
};

const WhatsNewContext = createContext<WhatsNewContextValue>({
  openWhatsNew: () => {},
});

export function useWhatsNew() {
  return useContext(WhatsNewContext);
}

export function WhatsNewHost({ children }: { children: ReactNode }) {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const displayName = useLibraryStore((state) => state.displayName);
  const [open, setOpen] = useState(false);
  const [releases, setReleases] = useState<WhatsNewRelease[]>([]);

  useEffect(() => {
    if (!hydrated || !displayName) return;
    const next = unseenReleases(readSeenVersion());
    if (next.length === 0) return;
    setReleases(next);
    setOpen(true);
  }, [displayName, hydrated]);

  const value = useMemo<WhatsNewContextValue>(
    () => ({
      openWhatsNew: () => {
        setReleases(WHATS_NEW);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <WhatsNewContext.Provider value={value}>
      {children}
      <WhatsNewDialog
        open={open}
        releases={releases}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) markCurrentVersionSeen();
        }}
      />
    </WhatsNewContext.Provider>
  );
}

export function WhatsNewTrigger({ className }: { className?: string }) {
  const { openWhatsNew } = useWhatsNew();
  return (
    <button
      type="button"
      onClick={openWhatsNew}
      className={className}
      aria-label={`What's new in version ${APP_VERSION}`}
    >
      v{APP_VERSION} · what’s new
    </button>
  );
}

function WhatsNewDialog({
  open,
  onOpenChange,
  releases,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  releases: WhatsNewRelease[];
}) {
  const items = releases.length > 0 ? releases : WHATS_NEW;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">what’s new</DialogTitle>
          <DialogDescription>
            Vibe {APP_VERSION}
            {items[0]?.date ? ` · ${items[0].date}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(24rem,50dvh)] space-y-5 overflow-y-auto pr-1">
          {items.map((release) => (
            <section key={release.version} className="space-y-2">
              {items.length > 1 ? (
                <p className="font-display text-sm font-semibold">
                  v{release.version}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {release.date}
                  </span>
                </p>
              ) : (
                <p className="font-display text-sm font-semibold">{release.title}</p>
              )}
              {items.length > 1 ? (
                <p className="text-sm text-muted-foreground">{release.title}</p>
              ) : null}
              <ul className="space-y-2 text-sm">
                {release.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <DialogFooter className="border-0 bg-transparent p-1 sm:p-2 sm:justify-end">
          <Button className="rounded-full" onClick={() => onOpenChange(false)}>
            got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
