"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { TopSearch } from "@/components/layout/top-search";
import { AudioEngine } from "@/components/player/audio-engine";
import { KeyboardShortcuts } from "@/components/player/keyboard-shortcuts";
import { PlayerBar } from "@/components/player/player-bar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nowPlaying = pathname === "/now-playing";

  return (
    <>
      {nowPlaying ? (
        children
      ) : (
        <div className="relative flex min-h-dvh bg-background">
          <div className="mesh-bg" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <Sidebar />
          <div className="relative z-10 flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 lg:px-6">
              <Link
                href="/"
                className="font-display shrink-0 text-lg font-bold tracking-tight lg:hidden"
              >
                vibe
              </Link>
              <TopSearch />
              <ThemeToggle />
            </header>
            <main
              key={pathname}
              className="page-enter flex-1 px-3 pt-2 pb-[calc(var(--mobile-nav-offset)+var(--player-bar-h)+1.5rem)] sm:px-4 sm:pt-4 lg:px-8 lg:pb-[calc(var(--player-bar-h)+2rem)]"
            >
              {children}
            </main>
          </div>
          <MobileNav />
          <PlayerBar />
        </div>
      )}
      <AudioEngine />
      <KeyboardShortcuts />
    </>
  );
}
