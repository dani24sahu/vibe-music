type AnalyserListener = (analyser: AnalyserNode | null) => void;

let current: AnalyserNode | null = null;
const listeners = new Set<AnalyserListener>();

export function setPlaybackAnalyser(analyser: AnalyserNode | null) {
  current = analyser;
  listeners.forEach((listener) => listener(analyser));
}

export function getPlaybackAnalyser() {
  return current;
}

export function subscribePlaybackAnalyser(listener: AnalyserListener) {
  listener(current);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}