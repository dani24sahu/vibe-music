"use client";

import { useState } from "react";
import { NameSetupDialog } from "@/components/profile/name-setup-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initialsFor } from "@/lib/profile";
import { useLibraryStore } from "@/stores/library-store";

export function ProfileButton({
  className,
  showName = false,
}: {
  className?: string;
  showName?: boolean;
}) {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const displayName = useLibraryStore((state) => state.displayName);
  const [open, setOpen] = useState(false);

  if (!hydrated || !displayName) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Change name, currently ${displayName}`}
        className={cn(
          "h-10 gap-2 rounded-full px-1.5",
          showName && "pr-3",
          className,
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold tracking-wide text-primary">
          {initialsFor(displayName)}
        </span>
        {showName ? (
          <span className="max-w-[9rem] truncate text-sm font-medium">{displayName}</span>
        ) : null}
      </Button>
      <NameSetupDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
