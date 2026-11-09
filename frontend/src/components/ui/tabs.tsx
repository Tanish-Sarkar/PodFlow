"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  title: string;
  value: string;
  content?: ReactNode;
};

/**
 * Stacked-card tabs (after Aceternity's "Tabs"), implemented with CSS
 * transitions instead of an animation library. The cards share one grid cell so
 * the stage is always as tall as the tallest card (no fixed heights, no
 * clipping). Full tablist/tab/tabpanel semantics, arrow-key navigation, and
 * inactive cards are removed from the accessibility tree.
 */
export const Tabs = ({
  tabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  stageClassName,
  label,
}: {
  tabs: TabItem[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  /** Spacing around the card stack, e.g. `mt-20` (room for the hover peek). */
  stageClassName?: string;
  label: string;
}) => {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [peek, setPeek] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let target = index;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveIndex(target);
    buttonRefs.current[target]?.focus();
  };

  // Stack order: the active tab on top, the rest behind it in their original order.
  const stack = [activeIndex, ...tabs.map((_, i) => i).filter((i) => i !== activeIndex)];

  return (
    <>
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          "no-visible-scrollbar flex w-full max-w-full flex-row items-center justify-start gap-1 overflow-x-auto sm:overflow-visible",
          containerClassName,
        )}
      >
        {tabs.map((tab, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={tab.value}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              onMouseEnter={() => setPeek(true)}
              onMouseLeave={() => setPeek(false)}
              className={cn(
                "relative rounded-full border border-transparent px-4 py-2 whitespace-nowrap transition-colors duration-200",
                tabClassName,
                selected && activeTabClassName,
              )}
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      <div className={cn("grid", stageClassName)}>
        {tabs.map((tab, index) => {
          const position = stack.indexOf(index);
          const isActive = position === 0;
          const style: CSSProperties = {
            gridArea: "1 / 1",
            transform: `translateY(${peek ? position * -50 : 0}px) scale(${1 - position * 0.1})`,
            zIndex: -position,
            opacity: position < 3 ? 1 - position * 0.1 : 0,
          };
          return (
            <div
              key={tab.value}
              role="tabpanel"
              id={`${baseId}-panel-${tab.value}`}
              aria-labelledby={`${baseId}-tab-${tab.value}`}
              aria-hidden={isActive ? undefined : true}
              inert={!isActive}
              data-active={isActive}
              style={style}
              className={cn("tab-card", contentClassName)}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </>
  );
};
