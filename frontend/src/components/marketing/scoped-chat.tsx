"use client";

import { useState } from "react";
import { CitationScope, CiteMarker, ClaimText } from "./citations";
import { CheckIcon, LinkNodesIcon, MinusIcon } from "./icons";
import { ONBOARDING_QUESTION, onboardingSources, sourceTitle } from "./sample-content";
import { SourceCard } from "./source-card";

type ScopeId = "onboarding" | "handoffs";

const SCOPES: readonly { id: ScopeId; name: string; kind: string }[] = [
  { id: "onboarding", name: "Onboarding notes", kind: "Artifact v1" },
  { id: "handoffs", name: "Team handoffs", kind: "Artifact v3" },
];

const sourceLabel = (n: number) => sourceTitle(onboardingSources, n);

/**
 * Interactive preview of scoped chat. Toggling knowledge in or out of scope
 * changes the (canned) answer, showing that answers depend only on what is
 * attached. No model or network call is involved.
 */
export function ScopedChat() {
  const [inScope, setInScope] = useState<Record<ScopeId, boolean>>({
    onboarding: true,
    handoffs: true,
  });

  const hasRelevant = inScope.onboarding;
  const hasAny = inScope.onboarding || inScope.handoffs;

  return (
    <CitationScope className="@container">
      <section
        aria-label="Scoped chat preview"
        className="overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-lift"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper/70 px-4 py-2.5 text-xs text-body">
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Concept preview
            </span>
            Chat
          </span>
          <span className="text-muted">Illustrative sample content</span>
        </div>

        <div className="p-4 sm:p-5">
          <p id="scope-label" className="text-xs font-semibold tracking-wide text-muted uppercase">
            Knowledge in scope
          </p>
          <div role="group" aria-labelledby="scope-label" className="mt-2 flex flex-wrap gap-2">
            {SCOPES.map((scope) => {
              const on = inScope[scope.id];
              return (
                <button
                  key={scope.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setInScope((current) => ({ ...current, [scope.id]: !current[scope.id] }))
                  }
                  className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-[13px] font-medium transition-colors ${
                    on
                      ? "border-primary bg-tint text-ink hover:bg-primary-wash"
                      : "border-dashed border-edge bg-surface text-body hover:border-primary hover:text-primary-hover"
                  }`}
                >
                  {on ? (
                    <CheckIcon className="size-4 text-primary" />
                  ) : (
                    <MinusIcon className="size-4" />
                  )}
                  <span>
                    {scope.name}
                    <span className="ml-1.5 text-xs font-normal text-muted">{scope.kind}</span>
                  </span>
                  <span className="rounded bg-surface/80 px-1.5 py-0.5 text-xs font-semibold text-body">
                    {on ? "In scope" : "Removed"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Select a chip to remove it from, or add it back to, the chat&rsquo;s scope.
          </p>

          <p className="mt-5 ml-auto w-fit max-w-[88%] rounded-lg bg-ink px-3.5 py-2 text-sm text-white">
            {ONBOARDING_QUESTION}
          </p>

          <div
            aria-live="polite"
            className="mt-3 rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink"
          >
            {hasRelevant ? (
              <>
                <p>
                  <ClaimText cites={[1]}>
                    Knowing where past decisions are written down makes the first week easier.
                  </ClaimText>
                  <CiteMarker n={1} label={sourceLabel(1)} />
                </p>
                <p className="mt-2">
                  <ClaimText cites={[2]}>
                    A named buddy gives questions an obvious first stop.
                  </ClaimText>
                  <CiteMarker n={2} label={sourceLabel(2)} />
                </p>
                <p className="mt-2">
                  <ClaimText cites={[3]}>
                    A checklist that books the decision-log walkthrough early helps it happen.
                  </ClaimText>
                  <CiteMarker n={3} label={sourceLabel(3)} />
                </p>
                {inScope.handoffs ? (
                  <p className="mt-2 text-xs text-muted">
                    Team handoffs (artifact v3) was searched; no passages were relevant to this
                    question.
                  </p>
                ) : null}
              </>
            ) : hasAny ? (
              <p>
                The selected knowledge does not establish an answer to this question. Add an
                artifact that covers onboarding, or ask something the team handoffs artifact can
                support.
              </p>
            ) : (
              <p>No knowledge is attached. Add an artifact or source collection to scope this chat.</p>
            )}
          </div>

          {hasRelevant ? (
            <div className="mt-4">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Cited passages
              </p>
              <ul className="m-0 mt-2 grid list-none gap-2 p-0 @lg:grid-cols-3">
                {onboardingSources.map((source) => (
                  <li key={source.n}>
                    <SourceCard source={source} clampExcerpt className="h-full" />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <LinkNodesIcon className="size-4" />
              Nothing is cited, because nothing in scope supports an answer.
            </p>
          )}
        </div>
      </section>
    </CitationScope>
  );
}
