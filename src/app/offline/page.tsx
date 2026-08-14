import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        offline
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight">
        you’re offline
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Cached library, recents, mixes, artwork, and lyrics still work. Streaming and
        new searches need a connection.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/favorites"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Liked
        </Link>
        <Link
          href="/recent"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium"
        >
          Recents
        </Link>
        <Link
          href="/library"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium"
        >
          Mixes
        </Link>
      </div>
    </div>
  );
}
