"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLibraryStore } from "@/stores/library-store";
import type { Song } from "@/types/music";

export function AddToPlaylistDialog({
  song,
  open,
  onOpenChange,
}: {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const playlists = useLibraryStore((state) => state.playlists);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const addToPlaylist = useLibraryStore((state) => state.addToPlaylist);
  const [name, setName] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
          <DialogDescription>
            Save “{song.name}” to a personal playlist stored in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {playlists.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You don’t have any playlists yet.
            </p>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  addToPlaylist(playlist.id, song);
                  onOpenChange(false);
                }}
              >
                <span>{playlist.name}</span>
                <span className="text-xs text-muted-foreground">
                  {playlist.songs.length} songs
                </span>
              </button>
            ))
          )}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const playlist = createPlaylist(name);
            addToPlaylist(playlist.id, song);
            setName("");
            onOpenChange(false);
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New playlist name"
          />
          <Button type="submit" disabled={!name.trim()}>
            Create
          </Button>
        </form>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
