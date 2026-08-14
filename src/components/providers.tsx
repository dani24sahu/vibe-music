"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLibraryStore } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await Promise.all([
          usePlayerStore.persist.rehydrate(),
          useLibraryStore.persist.rehydrate(),
        ]);
      } catch {
        // Corrupt or unavailable localStorage must not block the app.
      } finally {
        if (!cancelled) {
          usePlayerStore.getState().setHydrated(true);
          useLibraryStore.getState().setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
