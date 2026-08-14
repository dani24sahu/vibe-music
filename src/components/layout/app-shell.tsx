"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { TopSearch } from "@/components/layout/top-search";
import { AudioEngine } from "@/components/player/audio-engine";
import { KeyboardShortcuts } from "@/components/player/keyboard-shortcuts";
import { PlayerBar } from "@/components/player/player-bar";
import { FirstRunNamePrompt } from "@/components/profile/first-run-name-prompt";
import { ProfileButton } from "@/components/profile/profile-button";
import { InstallVibeButton } from "@/components/pwa/install-vibe";
import { MobileOfflineBar, OfflineIndicator } from "@/components/pwa/offline-indicator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WhatsNewHost } from "@/components/whats-new/whats-new-dialog";
import { cn } from "@/lib/utils";
import { currentSong, usePlayerStore } from "@/stores/player-store";
import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nowPlaying = pathname === "/now-playing";
  const song = usePlayerStore(currentSong);
  const showPlayer = Boolean(song);

  return (
    <WhatsNewHost>
      {nowPlaying ? (
        children
      ) : (
        <div className="relative flex h-dvh overflow-hidden bg-background">
          <div className="mesh-bg" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <Sidebar insetBottom={showPlayer} />
          <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex shrink-0 items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 lg:px-6">
              <Link
                href="/"
                className="font-display shrink-0 text-lg font-bold tracking-tight lg:hidden"
              >
                vibe
              </Link>
              <TopSearch />
              <OfflineIndicator className="hidden max-w-[14rem] truncate sm:block" />
              <ProfileButton className="lg:hidden" />
              <InstallVibeButton />
              <ThemeToggle />
            </header>
            <MobileOfflineBar />
            <main
              key={pathname}
              className={cn(
                "page-enter min-h-0 flex-1 overflow-y-auto px-3 pt-2 sm:px-4 sm:pt-4 lg:px-8",
                showPlayer
                  ? "pb-[calc(var(--mobile-nav-offset)+var(--player-bar-h)+var(--bottom-stack-gap)+1.25rem)] lg:pb-[calc(var(--player-bar-h)+2rem)]"
                  : "pb-[calc(var(--mobile-nav-offset)+1.25rem)] lg:pb-8",
              )}
            >
              {children}
            </main>
          </div>
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-[var(--bottom-stack-gap)] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:contents">
            {showPlayer ? <PlayerBar /> : null}
            <MobileNav />
          </div>
        </div>
      )}
      <AudioEngine />
      <KeyboardShortcuts />
      <FirstRunNamePrompt />
    </WhatsNewHost>
  );
}
