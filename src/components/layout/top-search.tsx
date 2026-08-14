"use client";

import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Search } from "lucide-react";
import { Artwork } from "@/components/media/artwork";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useGlobalSearch } from "@/hooks/use-music";
import { usePlayback } from "@/hooks/use-playback";
import { getSong } from "@/lib/api/music";
import { cn } from "@/lib/utils";
import type { GlobalSearch, GlobalSearchHit } from "@/types/music";

type SuggestionType = "artist" | "song" | "album" | "playlist";

type Suggestion = {
  id: string;
  title: string;
  subtitle: string;
  type: SuggestionType;
  image: GlobalSearchHit["image"];
};

const TYPE_LABEL: Record<SuggestionType, string> = {
  artist: "Artist",
  song: "Song",
  album: "Album",
  playlist: "Playlist",
};

function normalizeType(type: string): SuggestionType | null {
  const value = type.toLowerCase();
  if (value.includes("artist")) return "artist";
  if (value.includes("song")) return "song";
  if (value.includes("album")) return "album";
  if (value.includes("playlist")) return "playlist";
  return null;
}

function hitSubtitle(hit: GlobalSearchHit, type: SuggestionType) {
  if (type === "song") {
    return hit.primaryArtists || hit.singers || hit.album || hit.description || "Song";
  }
  if (type === "album") return hit.artist || hit.year || hit.description || "Album";
  if (type === "playlist") return hit.description || hit.language || "Playlist";
  return hit.description || "Artist";
}

function collectSuggestions(data: GlobalSearch | undefined): Suggestion[] {
  if (!data) return [];
  const seen = new Set<string>();
  const items: Suggestion[] = [];

  function add(hit: GlobalSearchHit, type: SuggestionType, limit: number) {
    const key = `${type}:${hit.id}`;
    if (!hit.id || !hit.title || seen.has(key)) return;
    if (items.filter((item) => item.type === type).length >= limit) return;
    seen.add(key);
    items.push({
      id: hit.id,
      title: hit.title,
      subtitle: hitSubtitle(hit, type),
      type,
      image: hit.image ?? [],
    });
  }

  for (const hit of data.topQuery.results) {
    const type = normalizeType(hit.type);
    if (type) add(hit, type, 2);
  }
  for (const hit of data.artists.results) add(hit, "artist", 3);
  for (const hit of data.songs.results) add(hit, "song", 4);
  for (const hit of data.albums.results) add(hit, "album", 2);
  for (const hit of data.playlists.results) add(hit, "playlist", 2);
  return items;
}

function suggestionHref(item: Suggestion) {
  if (item.type === "artist") return `/artist/${item.id}`;
  if (item.type === "album") return `/album/${item.id}`;
  if (item.type === "playlist") return `/playlist/${item.id}`;
  return `/song/${item.id}`;
}

export function TopSearch() {
  const router = useRouter();
  const { play } = usePlayback();
  const rootRef = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const query = useDebouncedValue(value.trim(), 250);
  const enabled = query.length >= 2;
  const search = useGlobalSearch(enabled ? query : "");
  const suggestions = useMemo(
    () => collectSuggestions(search.data),
    [search.data],
  );
  const showPanel = open && value.trim().length >= 2;
  const waiting =
    value.trim().length >= 2 &&
    (query !== value.trim() || query.length < 2 || search.isFetching);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!showPanel) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showPanel]);

  function goToResults(nextQuery = value.trim()) {
    if (!nextQuery) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  }

  async function choose(item: Suggestion) {
    setOpen(false);
    setValue(item.title);
    if (item.type === "song") {
      const song = await getSong(item.id);
      await play(song);
      return;
    }
    router.push(suggestionHref(item));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const selected = showPanel ? suggestions[activeIndex] : undefined;
    if (selected) {
      void choose(selected);
      return;
    }
    goToResults();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel) return;
    const lastIndex = Math.max(suggestions.length - 1, 0);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index >= lastIndex ? 0 : index + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? lastIndex : index - 1));
    }
  }

  return (
    <form ref={rootRef} onSubmit={onSubmit} className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      {waiting ? (
        <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}
      <Input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="search a vibe..."
        className="h-11 rounded-full border-border/70 bg-card/70 pr-10 pl-10 shadow-sm backdrop-blur-md"
        aria-label="Search music"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={
          showPanel && suggestions[activeIndex]
            ? `${listId}-${suggestions[activeIndex].type}-${suggestions[activeIndex].id}`
            : undefined
        }
        autoComplete="off"
        spellCheck={false}
        role="combobox"
      />
      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="glass-panel absolute inset-x-0 top-[calc(100%+0.4rem)] z-50 max-h-[min(24rem,70dvh)] overflow-y-auto rounded-2xl p-1.5 shadow-2xl"
        >
          {waiting && suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : null}
          {search.isError ? (
            <p className="px-3 py-3 text-sm text-destructive">
              {search.error instanceof Error
                ? search.error.message
                : "Suggestions couldn’t be loaded."}
            </p>
          ) : null}
          {!waiting && !search.isError && suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No matches for “{query}”.
            </p>
          ) : null}
          {suggestions.map((item, index) => (
            <button
              key={`${item.type}-${item.id}`}
              id={`${listId}-${item.type}-${item.id}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                index === activeIndex ? "bg-accent" : "hover:bg-accent/70",
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void choose(item)}
            >
              <Artwork
                images={item.image}
                alt={item.title}
                size="sm"
                rounded={item.type === "artist" ? "rounded-full" : "rounded-lg"}
                className="size-10 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {TYPE_LABEL[item.type]}
                  {item.subtitle ? ` · ${item.subtitle}` : ""}
                </span>
              </span>
            </button>
          ))}
          <button
            type="button"
            className="mt-0.5 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => goToResults()}
          >
            See all results for “{value.trim()}”
          </button>
        </div>
      ) : null}
    </form>
  );
}
