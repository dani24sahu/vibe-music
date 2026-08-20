"use client";

import { useEffect, useState } from "react";
import { subscribePlaybackAnalyser } from "@/lib/player/playback-analyser";

export function usePlaybackAnalyser() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => subscribePlaybackAnalyser(setAnalyser), []);

  return analyser;
}