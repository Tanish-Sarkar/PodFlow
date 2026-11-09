import type { CSSProperties } from "react";
import { EvidenceTarget } from "./citations";
import { SourceKindIcon } from "./icons";
import type { SampleSource } from "./sample-content";

/**
 * A source/evidence card. In the hero rail it flows toward the artifact
 * (`flowIndex` set, excerpt clamped); in the editorial sections it shows the
 * full cited passage.
 */
export function SourceCard({
  source,
  flowIndex,
  clampExcerpt = false,
  hideExcerptWhenNarrow = false,
  className = "",
}: {
  source: SampleSource;
  flowIndex?: number;
  clampExcerpt?: boolean;
  /** Drop the excerpt below the nearest `@xl` container width (title, number and locator remain). */
  hideExcerptWhenNarrow?: boolean;
  className?: string;
}) {
  const isFlowing = flowIndex !== undefined;

  return (
    <EvidenceTarget
      n={source.n}
      className={`${isFlowing ? "flow-card" : ""} rounded-lg border border-line bg-surface p-3 ${className}`}
      style={isFlowing ? ({ "--flow-i": flowIndex } as CSSProperties) : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-body">
          <SourceKindIcon kind={source.kind} className="size-4 text-primary" />
          {source.label}
        </span>
        <span
          className="ev-badge inline-flex size-5 items-center justify-center rounded-md border border-line bg-paper text-xs font-semibold text-ink"
          aria-label={`Source ${source.n}`}
        >
          {source.n}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-snug font-medium text-ink">{source.title}</p>
      <p className="mt-1 font-mono text-xs text-muted">{source.locator}</p>
      <blockquote
        className={`mt-2 border-l-2 border-line pl-2 text-xs leading-relaxed text-body ${
          clampExcerpt ? "line-clamp-2" : ""
        } ${hideExcerptWhenNarrow ? "max-@xl:hidden" : ""}`}
      >
        &ldquo;{source.excerpt}&rdquo;
      </blockquote>
    </EvidenceTarget>
  );
}
