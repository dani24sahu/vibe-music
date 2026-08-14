"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallVibeButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent) return null;

  return (
    <Button
      variant="ghost"
      className="h-10 gap-2 rounded-full px-3 glass-panel"
      aria-label="Install Vibe"
      onClick={async () => {
        await installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
      }}
    >
      <DownloadIcon className="size-4" />
      <span className="hidden sm:inline">Install Vibe</span>
    </Button>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 21h14" />
    </svg>
  );
}
