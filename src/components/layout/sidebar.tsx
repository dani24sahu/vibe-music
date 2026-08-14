"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Heart, Home, ListMusic, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/stores/library-store";

const nav = [
  { href: "/", label: "Home", short: "Home", icon: Home },
  { href: "/search", label: "Search", short: "Search", icon: Search },
  { href: "/favorites", label: "Liked", short: "Liked", icon: Heart },
  { href: "/recent", label: "Recents", short: "Recents", icon: Clock3 },
  { href: "/library", label: "Mixes", short: "Mixes", icon: ListMusic },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const playlists = useLibraryStore((state) => state.playlists);

  return (
    <aside className="relative z-10 hidden h-dvh w-64 shrink-0 flex-col gap-6 overflow-hidden p-4 pb-32 lg:flex">
      <div className="glass-panel flex h-full flex-col gap-6 overflow-y-auto rounded-[1.75rem] p-4">
        <Link href="/" className="px-2">
          <span className="font-display text-2xl font-bold tracking-tight text-gradient">
            vibe
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            play it loud
          </span>
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground",
                  active &&
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-h-0 flex-1">
          <p className="font-display px-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Your mixes
          </p>
          <div className="mt-2 space-y-1">
            {playlists.length === 0 ? (
              <p className="px-3 text-sm text-muted-foreground">
                Save a track and start a mix.
              </p>
            ) : (
              playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/library/${playlist.id}`}
                  className={cn(
                    "block truncate rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    pathname === `/library/${playlist.id}` &&
                      "bg-accent text-foreground",
                  )}
                >
                  {playlist.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="glass-panel mx-auto flex max-w-lg items-center justify-around rounded-full px-2 py-1.5 shadow-xl">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[10px] font-medium text-muted-foreground transition-all duration-200",
                active && "bg-primary/15 text-primary",
              )}
            >
              <item.icon className={cn("size-4", active && "scale-110")} />
              {item.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
