import { cn } from "@/lib/utils";

export function Equalizer({ className }: { className?: string }) {
  return (
    <span className={cn("eq-bars text-primary", className)} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}
