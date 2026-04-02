"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Character-by-character typewriter with blinking cursor.
 * Cursor blinks briefly after typing completes, then fades out.
 *
 * Fires onComplete callback when the animation finishes,
 * so parent elements can choreograph subsequent reveals.
 *
 * Respects prefers-reduced-motion: shows everything immediately.
 */
export function TypewriterText({
  text,
  className,
  charDelayMs = 45,
  startDelayMs = 400,
  onComplete,
}: {
  text: string;
  className?: string;
  /** Delay between each character (ms) */
  charDelayMs?: number;
  /** Delay before starting the animation (ms) */
  startDelayMs?: number;
  /** Callback when typing animation completes */
  onComplete?: () => void;
}) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "typing" | "done">("waiting");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setPrefersReducedMotion(true);
      setDisplayedCount(text.length);
      setPhase("done");
      onCompleteRef.current?.();
      return;
    }

    // Start delay
    const startTimer = setTimeout(() => {
      setPhase("typing");
    }, startDelayMs);

    return () => clearTimeout(startTimer);
  }, [startDelayMs, text.length]);

  useEffect(() => {
    if (phase !== "typing") return;

    if (displayedCount >= text.length) {
      // Typing complete — keep cursor blinking briefly, then mark done
      const doneTimer = setTimeout(() => {
        setPhase("done");
        onCompleteRef.current?.();
      }, 600);
      return () => clearTimeout(doneTimer);
    }

    const charTimer = setTimeout(() => {
      setDisplayedCount((c) => c + 1);
    }, charDelayMs);

    return () => clearTimeout(charTimer);
  }, [phase, displayedCount, text.length, charDelayMs]);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const showCursor = phase === "typing" || (phase === "done" && displayedCount >= text.length);

  return (
    <span className={cn("inline", className)}>
      <span>{text.slice(0, displayedCount)}</span>
      <span
        className={cn(
          "inline-block w-[3px] h-[0.85em] ml-[2px] align-middle rounded-full bg-brand-copper",
          phase === "typing" && displayedCount < text.length
            ? "animate-cursor-blink"
            : phase === "done"
              ? "animate-cursor-fade-out"
              : "opacity-0",
        )}
        aria-hidden="true"
      />
    </span>
  );
}
