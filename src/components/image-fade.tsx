"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * next/image wrapper that fades in on load with a shimmer placeholder.
 * For `fill` images, renders shimmer + image as siblings (parent must be positioned).
 * For sized images, wraps in a relative container.
 */
export function ImageFade({
  className,
  wrapperClassName,
  fast,
  ...props
}: ImageProps & {
  wrapperClassName?: string;
  /** Use a shorter 300ms fade for priority/hero images */
  fast?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  const imageEl = (
    <Image
      {...props}
      className={cn(
        "transition-opacity ease-out",
        fast ? "duration-300" : "duration-500",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={() => setLoaded(true)}
    />
  );

  const shimmer = (
    <div
      className={cn(
        "absolute inset-0 bg-surface-warm-100 transition-opacity duration-300",
        loaded ? "opacity-0 pointer-events-none" : "opacity-100 animate-pulse",
      )}
    />
  );

  // For fill images: render shimmer + image as siblings (parent provides position context)
  if (props.fill) {
    return (
      <>
        {shimmer}
        {imageEl}
      </>
    );
  }

  // For sized images: wrap in a container
  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {shimmer}
      {imageEl}
    </div>
  );
}
