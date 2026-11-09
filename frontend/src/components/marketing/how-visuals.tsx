import type { ReactNode } from "react";
import { CitationScope, CiteMarker, ClaimText } from "./citations";
import { ChatIcon, CheckIcon, ExportIcon, PresentationIcon, SourceKindIcon } from "./icons";
import { meetingArtifact, meetingSources, sourceTitle } from "./sample-content";
import { SourceCard } from "./source-card";

const sourceLabel = (n: number) => sourceTitle(meetingSources, n);

function Frame({
  label,
  preview = false,
  children,
}: {
  label: string;
  /** Show the "Concept preview" tag. Used once per section, on the first frame. */
  preview?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-lift">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-paper/70 px-4 py-2.5 text-xs text-body">
        {preview ? (
          <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
            Concept preview
          </span>
        ) : (
          <span className="text-muted">Sample content</span>
        )}
        <span className="font-medium">{label}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/** Step 1: a collection of mixed sources. */
export function CollectVisual() {
  return (
    <Frame preview label="Collection: Meeting research">
      <ul className="m-0 list-none space-y-2.5 p-0">
        {meetingSources.map((source) => (
          <li
            key={source.n}
            className="flex items-center gap-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-tint text-primary-hover">
              <SourceKindIcon kind={source.kind} className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{source.title}</span>
              <span className="block text-xs text-muted">{source.label}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-evidence">
              <CheckIcon className="size-4" />
              Added
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Each source keeps its origin and the locations of the passages PodFlow reads.
      </p>
    </Frame>
  );
}

/** Step 2: an artifact whose claims point at sources. */
export function BuildVisual() {
  return (
    <Frame label="Knowledge Artifact">
      <CitationScope>
        <p className="text-lg leading-tight font-semibold tracking-tight text-ink">
          {meetingArtifact.title}
        </p>
        <ul className="m-0 mt-4 list-none space-y-3 p-0">
          {meetingArtifact.claims.map((claim) => (
            <li key={claim.text} className="text-sm leading-relaxed text-ink">
              <ClaimText cites={claim.cites}>{claim.text}</ClaimText>
              {claim.cites.map((n) => (
                <CiteMarker key={n} n={n} label={sourceLabel(n)} />
              ))}
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {meetingSources.slice(0, 2).map((source) => (
            <SourceCard key={source.n} source={source} clampExcerpt className="h-full" />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Hover or focus a marker to see its source.</p>
      </CitationScope>
    </Frame>
  );
}

/** Step 3: the ways an artifact is used. */
export function UseVisual() {
  const formats = ["Markdown", "JSON", "DOCX", "PDF"];
  return (
    <Frame label="One artifact, three uses">
      <div className="space-y-3">
        <div className="flex gap-3 rounded-lg border border-line bg-paper/60 p-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-tint text-primary-hover">
            <PresentationIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Presentation</p>
            <div className="mt-2 space-y-1.5">
              <div className="h-2 w-3/4 rounded-sm bg-line" />
              <div className="h-2 w-full rounded-sm bg-line" />
              <div className="h-2 w-2/3 rounded-sm bg-line" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-line bg-paper/60 p-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-tint text-primary-hover">
            <ChatIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Cited chat</p>
            <div className="mt-2 space-y-1.5">
              <div className="h-2 w-2/3 rounded-sm bg-ink/80" />
              <div className="h-2 w-5/6 rounded-sm bg-line" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-line bg-paper/60 p-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-tint text-primary-hover">
            <ExportIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Export</p>
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
              {formats.map((format) => (
                <li
                  key={format}
                  className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-medium text-body"
                >
                  {format}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Frame>
  );
}
