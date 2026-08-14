"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-10 rounded-full glass-panel"
      aria-label={
        !mounted
          ? "Toggle color theme"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      {mounted && isDark ? (
        <Sun className="size-4 transition-transform duration-300" />
      ) : (
        <Moon className="size-4 transition-transform duration-300" />
      )}
    </Button>
  );
}
