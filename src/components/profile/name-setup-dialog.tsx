"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@/lib/profile";
import { useLibraryStore } from "@/stores/library-store";

export function NameSetupDialog({
  open,
  onOpenChange,
  firstRun = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firstRun?: boolean;
}) {
  const displayName = useLibraryStore((state) => state.displayName);
  const setDisplayName = useLibraryStore((state) => state.setDisplayName);
  const [value, setValue] = useState(displayName ?? "");

  useEffect(() => {
    if (open) setValue(displayName ?? "");
  }, [displayName, open]);

  const trimmed = normalizeDisplayName(value);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    setDisplayName(trimmed);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (firstRun && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!firstRun} className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {firstRun ? "what should we call you?" : "change your name"}
            </DialogTitle>
            <DialogDescription>
              {firstRun
                ? "This stays on this device. We’ll use it on home, your mixes, and liked tracks."
                : "Update the name Vibe uses in greetings and your library."}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="your name"
            autoFocus
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            aria-label="Display name"
            className="h-11 rounded-full px-4"
          />
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
            {!firstRun ? (
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" className="rounded-full" disabled={!trimmed}>
              {firstRun ? "that's me" : "save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
