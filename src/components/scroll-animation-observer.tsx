"use client";

import { useEffect } from "react";

export function ScrollAnimationObserver() {
  useEffect(() => {
    // Small delay to ensure DOM is fully hydrated
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.05, rootMargin: "0px 0px 0px 0px" }
      );

      const elements = document.querySelectorAll("[data-animate]");
      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
