"use client";

import { useEffect, useRef } from "react";

export function TaglineReveal({ text }: { text: string }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = Array.from(element.querySelectorAll<HTMLElement>("[data-tagline-word]"));
    if (!("IntersectionObserver" in window)) return;

    element.dataset.observed = "true";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.75 },
    );

    words.forEach((word) => observer.observe(word));
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p ref={root} className="tagline-reveal heading-2 max-w-4xl text-balance">
      {words.map((word, index) => (
        <span data-tagline-word key={`${word}-${index}`}>
          {word}{index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
