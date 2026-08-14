"use client";

import { NameSetupDialog } from "@/components/profile/name-setup-dialog";
import { useLibraryStore } from "@/stores/library-store";

export function FirstRunNamePrompt() {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const displayName = useLibraryStore((state) => state.displayName);

  return (
    <NameSetupDialog firstRun open={hydrated && !displayName} onOpenChange={() => {}} />
  );
}
