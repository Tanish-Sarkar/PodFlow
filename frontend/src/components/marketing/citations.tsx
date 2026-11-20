"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Local-only interaction for the product previews: hovering, focusing or
 * pinning a citation marker highlights the claim(s) that use it and the
 * evidence card it points to. Nothing here talks to a backend.
 */

type CitationState = {
  active: number | null;
  pinned: number | null;
  preview: (n: number | null) => void;
  toggle: (n: number) => void;
};

const CitationContext = createContext<CitationState | null>(null);

function useCitation(): CitationState {
  const value = useContext(CitationContext);
  if (!value) throw new Error("Citation components must be rendered inside <CitationScope>.");
  return value;
}

export function CitationScope({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const value = useMemo<CitationState>(
    () => ({
      active: hovered ?? pinned,
      pinned,
      preview: setHovered,
      toggle: (n) => setPinned((current) => (current === n ? null : n)),
    }),
    [hovered, pinned],
  );

  return (
    <CitationContext.Provider value={value}>
      <div className={className}>{children}</div>
    </CitationContext.Provider>
  );
}

export function CiteMarker({ n, label }: { n: number; label: string }) {
  const { pinned, preview, toggle } = useCitation();

  return (
    <button
      type="button"
      className="cite-marker"
      aria-pressed={pinned === n}
      aria-label={`Source ${n}: ${label}`}
      // Hover previews are for mouse pointers only; on touch a tap pins, a second tap clears.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") preview(n);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") preview(null);
      }}
      // Focus previews are for keyboard focus only (a tapped button is focused but not :focus-visible).
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) preview(n);
      }}
      onBlur={() => preview(null)}
      onClick={() => toggle(n)}
    >
      {n}
    </button>
  );
}

/** Text of a claim; highlighted while one of its citations is active. */
export function ClaimText({
  cites,
  children,
  className,
}: {
  cites: readonly number[];
  children: ReactNode;
  className?: string;
}) {
  const { active } = useCitation();
  const isActive = active !== null && cites.includes(active);

  return (
    <span
      data-claim=""
      data-active={isActive}
      className={`[box-decoration-break:clone] ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

/** A source/evidence card; highlighted while its marker is active. */
export function EvidenceTarget({
  n,
  children,
  className,
  style,
}: {
  n: number;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { active } = useCitation();
  const isActive = active === n;

  return (
    <div
      data-evidence=""
      data-active={isActive}
      aria-current={isActive ? "true" : undefined}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
