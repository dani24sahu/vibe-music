"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  EQ_BAND_HZ,
  EQ_MAX_DB,
  EQ_MIN_DB,
  EQ_PRESET_LABELS,
  EQ_PRESET_ORDER,
  formatEqHz,
} from "@/lib/player/eq";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";

export function EqSheet({
  compact = false,
  triggerClassName,
}: {
  compact?: boolean;
  triggerClassName?: string;
}) {
  const eqPreset = usePlayerStore((state) => state.eqPreset);
  const eqGains = usePlayerStore((state) => state.eqGains);
  const setEqPreset = usePlayerStore((state) => state.setEqPreset);
  const setEqBand = usePlayerStore((state) => state.setEqBand);
  const resetEq = usePlayerStore((state) => state.resetEq);
  const active = eqPreset !== "flat";

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            size={compact ? "icon-sm" : "sm"}
            variant="ghost"
            className={cn("rounded-full", !compact && "px-2", active && "text-primary", triggerClassName)}
            aria-label="Equalizer"
          />
        }
      >
        <SlidersHorizontal className="size-4" />
        {compact ? null : (
          <span className="text-xs font-semibold">{EQ_PRESET_LABELS[eqPreset]}</span>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="gap-0 rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Equalizer
          </SheetTitle>
          <SheetDescription>Ten bands, ±12 dB. Moving a slider saves a Custom preset.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap gap-1.5 px-4">
          {EQ_PRESET_ORDER.map((id) => (
            <Button
              key={id}
              size="sm"
              variant={eqPreset === id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setEqPreset(id)}
            >
              {EQ_PRESET_LABELS[id]}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-0.5 px-3 pt-4 pb-2">
          {EQ_BAND_HZ.map((hz, index) => {
            const db = eqGains[index] ?? 0;
            return (
              <div key={hz} className="flex min-w-0 flex-col items-center gap-2">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {db > 0 ? `+${db}` : db}
                </span>
                <Slider
                  orientation="vertical"
                  className="h-40 data-vertical:h-40"
                  min={EQ_MIN_DB}
                  max={EQ_MAX_DB}
                  step={1}
                  value={[db]}
                  onValueChange={(value) => {
                    const nextValue = Array.isArray(value) ? value[0] : value;
                    setEqBand(index, Number(nextValue ?? 0));
                  }}
                  aria-label={`${formatEqHz(hz)} hertz`}
                />
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {formatEqHz(hz)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end px-4 pt-1">
          <Button variant="ghost" size="sm" onClick={resetEq}>
            Reset to flat
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
