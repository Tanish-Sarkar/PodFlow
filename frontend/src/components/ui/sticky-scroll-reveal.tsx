"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StickyScrollItem = {
  title: string;
  description: string;
  /** Eyebrow shown above the title, e.g. "01". */
  label?: string;
  /** Visual shown in the sticky panel (desktop) and under the step (mobile). */
  content: ReactNode;
};

/**
 * Sticky scroll storytelling (after Aceternity's "Sticky Scroll Reveal"),
 * implemented with an IntersectionObserver and CSS transitions rather than an
 * animation library. It follows the page scroll (no nested scroll container),
 * keeps inactive steps at full text contrast, and shows each step's visual
 * inline on small screens where a sticky panel doesn't fit. Every step's text
 * and visual is in the server-rendered HTML.
 */
export const StickyScroll = ({
  content,
  className,
  panelClassName,
}: {
  content: StickyScrollItem[];
  className?: string;
  panelClassName?: string;
}) => {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = itemRefs.current.filter((el): el is HTMLLIElement => el !== null);
    // A step becomes active while it crosses a band around the middle of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content.length]);

  return (
    <div className={cn("grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16", className)}>
      <ol className="m-0 min-w-0 list-none p-0">
        {content.map((item, index) => {
          const isActive = index === active;
          return (
            <li
              key={item.title}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-index={index}
              aria-current={isActive ? "step" : undefined}
              className="flex flex-col justify-center py-8 lg:min-h-[45vh] lg:py-10"
            >
              <div
                className={cn(
                  "border-l-2 pl-6 transition-colors duration-300",
                  isActive ? "border-primary" : "border-line",
                )}
              >
                {item.label ? (
                  <p
                    className={cn(
                      "font-mono text-sm font-semibold transition-colors duration-300",
                      isActive ? "text-evidence" : "text-muted",
                    )}
                  >
                    {item.label}
                  </p>
                ) : null}
                <h3
                  className={cn(
                    "mt-2 text-2xl font-semibold tracking-tight transition-colors duration-300 sm:text-3xl",
                    isActive ? "text-ink" : "text-body",
                  )}
                >
                  {item.title}
                </h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-body sm:text-lg sm:leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-8 lg:hidden">{item.content}</div>
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:block">
        <div className={cn("sticky top-28 grid", panelClassName)}>
          {content.map((item, index) => {
            const isActive = index === active;
            return (
              <div
                key={item.title}
                aria-hidden={isActive ? undefined : true}
                inert={!isActive}
                data-active={isActive}
                className="sticky-visual"
                style={{ gridArea: "1 / 1" }}
              >
                {item.content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
