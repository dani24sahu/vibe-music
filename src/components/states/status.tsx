import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center",
        className,
      )}
    >
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(buttonVariants(), "mt-6 rounded-full")}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "that didn't load",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-6 rounded-full" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
