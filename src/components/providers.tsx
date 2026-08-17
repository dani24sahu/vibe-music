"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { shouldRetryQuery } from "@/lib/api/retry";
import { localLibrarySongs } from "@/lib/offline/local-library";
import { cacheSongsMetadata } from "@/lib/offline/metadata-cache";
import { useLibraryStore } from "@/stores/library-store";
import { usePlayerStore } from "@/stores/player-store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        retry: shouldRetryQuery,
        networkMode: "always",
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
          void cacheSongsMetadata(localLibrarySongs());
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
