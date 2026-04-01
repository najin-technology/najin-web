"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Splits text into lines (by newline) then words, and reveals them
 * with a staggered fade-up animation — scoreboard style.
 *
 * Respects prefers-reduced-motion: shows everything immediately.
 */
export function TypewriterText({
  text,
  className,
  delayMs = 60,
  startDelayMs = 200,
}: {
  text: string;
  className?: string;
  /** Delay between each word appearing (ms) */
  delayMs?: number;
  /** Delay before starting the animation (ms) */
  startDelayMs?: number;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    if (mq.matches) {
      setStarted(true);
      return;
    }

    const timer = setTimeout(() => setStarted(true), startDelayMs);
    return () => clearTimeout(timer);
  }, [startDelayMs]);

  // Split text into lines, then each line into words
  const lines = text.split("\n").filter(Boolean);
  let wordIndex = 0;

  return (
    <span ref={containerRef} className={cn("inline", className)}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split(/(\s+)/).map((segment, segIdx) => {
            // Preserve whitespace segments as-is
            if (/^\s+$/.test(segment)) {
              return <span key={segIdx}>{segment}</span>;
            }

            const currentWordIndex = wordIndex++;
            const delay = currentWordIndex * delayMs;

            if (prefersReducedMotion) {
              return <span key={segIdx}>{segment}</span>;
            }

            return (
              <span
                key={segIdx}
                className="inline-block overflow-hidden"
              >
                <span
                  className={cn(
                    "inline-block transition-all duration-400 ease-out",
                    started
                      ? "opacity-100 translate-y-0 blur-0"
                      : "opacity-0 translate-y-[0.3em] blur-[2px]",
                  )}
                  style={{
                    transitionDelay: started ? `${delay}ms` : "0ms",
                  }}
                >
                  {segment}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
