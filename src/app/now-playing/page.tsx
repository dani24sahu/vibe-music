import type { Metadata } from "next";
import { NowPlayingScreen } from "@/components/player/now-playing-screen";

export const metadata: Metadata = {
  title: "Now playing — Vibe",
};

export default function NowPlayingPage() {
  return <NowPlayingScreen />;
}
