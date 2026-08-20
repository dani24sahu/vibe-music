"use client";

import { useEffect, useRef } from "react";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const HEIGHT = 40;
const LINE_WIDTH = 1.75;
const CYCLES = 3.25;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waveY(x: number, width: number, mid: number, amp: number, phase: number) {
  const t = (x / Math.max(width, 1)) * Math.PI * 2 * CYCLES + phase;
  // Soft compound sine — smooth, not equalizer spikes.
  return mid - (Math.sin(t) * 0.82 + Math.sin(t * 0.5) * 0.18) * amp;
}

export function NowPlayingSeek({
  currentTime,
  duration,
  maxTime,
  isPlaying,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  maxTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const draggingRef = useRef(false);
  const playingRef = useRef(isPlaying);

  progressRef.current = maxTime > 0 ? Math.min(1, Math.max(0, currentTime / maxTime)) : 0;
  playingRef.current = isPlaying;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let frame = 0;
    let cssWidth = 0;

    function size() {
      const next = Math.max(1, Math.round(wrap.clientWidth));
      const dpr = window.devicePixelRatio || 1;
      if (next !== cssWidth || canvas.width !== Math.round(next * dpr)) {
        cssWidth = next;
        canvas.width = Math.round(next * dpr);
        canvas.height = Math.round(HEIGHT * dpr);
        canvas.style.width = `${next}px`;
        canvas.style.height = `${HEIGHT}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return cssWidth;
    }

    function drawPath(width: number, phase: number, amp: number) {
      const mid = HEIGHT / 2;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 1) {
        const y = waveY(x, width, mid, amp, phase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }

    function paint() {
      const width = size();
      if (width < 2) {
        frame = requestAnimationFrame(paint);
        return;
      }

      const progress = progressRef.current;
      const playhead = progress * width;
      const phase = playingRef.current && !reduced ? performance.now() / 900 : 0;
      const amp = HEIGHT * (playingRef.current && !reduced ? 0.28 : 0.2);

      ctx.clearRect(0, 0, width, HEIGHT);
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Remaining (dim)
      ctx.save();
      ctx.beginPath();
      ctx.rect(playhead, 0, width - playhead, HEIGHT);
      ctx.clip();
      drawPath(width, phase, amp);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.stroke();
      ctx.restore();

      // Played (bright)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, playhead, HEIGHT);
      ctx.clip();
      drawPath(width, phase, amp);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.stroke();
      ctx.restore();

      // Playhead dot on the wave
      const mid = HEIGHT / 2;
      const y = waveY(playhead, width, mid, amp, phase);
      ctx.beginPath();
      ctx.arc(playhead, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      frame = requestAnimationFrame(paint);
    }

    paint();
    const observer = new ResizeObserver(() => size());
    observer.observe(wrap);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  function timeFromClientX(clientX: number) {
    const wrap = wrapRef.current;
    if (!wrap) return 0;
    const rect = wrap.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
    return ratio * maxTime;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    onSeek(timeFromClientX(event.clientX));
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    onSeek(timeFromClientX(event.clientX));
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Already released.
    }
  }

  return (
    <div className="mt-6 w-full min-w-0">
      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(maxTime)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={formatTime(currentTime)}
        className={cn(
          "relative w-full min-w-0 cursor-pointer touch-none select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 5;
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            onSeek(Math.max(0, currentTime - step));
          } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            onSeek(Math.min(maxTime, currentTime + step));
          } else if (event.key === "Home") {
            event.preventDefault();
            onSeek(0);
          } else if (event.key === "End") {
            event.preventDefault();
            onSeek(maxTime);
          }
        }}
      >
        <canvas ref={canvasRef} className="block h-10 w-full" aria-hidden />
      </div>
      <div className="mt-1 flex w-full justify-between text-xs tabular-nums text-white/70">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
