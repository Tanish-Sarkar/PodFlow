"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { CitationScope, CiteMarker, ClaimText } from "./citations";
import { ArrowDownIcon, ChatIcon, ExportIcon, LinkNodesIcon, PresentationIcon } from "./icons";
import { SAMPLE_QUESTION, sampleArtifact, sampleSources } from "./sample-content";
import { SourceCard } from "./source-card";

const TABS = [
  { id: "artifact", label: "Artifact", Icon: LinkNodesIcon },
  { id: "ask", label: "Ask", Icon: ChatIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

const sourceLabel = (n: number) => sampleSources.find((s) => s.n === n)?.title ?? `Source ${n}`;

/**
 * Hero product visual: sources flow into an evidence-linked artifact, which can
 * be switched to a scoped chat. Static, illustrative content only.
 */
export function HeroPreview() {
  const [tab, setTab] = useState<TabId>("artifact");
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ artifact: null, ask: null });

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    const id = TABS[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <figure className="@container m-0">
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        {/* Preview toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-paper/70 px-4 py-2.5">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-body">
            <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Concept preview
            </span>
            Sample research collection
          </span>
          <div
            role="tablist"
            aria-label="Preview mode"
            className="inline-flex rounded-lg border border-line bg-surface p-0.5"
          >
            {TABS.map(({ id, label, Icon }, index) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  ref={(node) => {
                    tabRefs.current[id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`hero-tab-${id}`}
                  aria-selected={selected}
                  aria-controls={`hero-panel-${id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
                    selected
                      ? "bg-ink text-white"
                      : "text-body hover:bg-tint hover:text-primary-hover"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <CitationScope className="grid gap-3 p-4 @xl:grid-cols-[11.5rem_2.25rem_minmax(0,1fr)] @xl:gap-0">
          {/* Sources */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase @xl:hidden">
              Sources
            </p>
            <ol
              aria-label="Sources in this collection"
              className="m-0 grid h-full list-none grid-cols-1 gap-3 p-0 @xl:grid-rows-3"
            >
              {sampleSources.map((source, index) => (
                <li key={source.n} className="min-w-0">
                  <SourceCard
                    source={source}
                    flowIndex={index}
                    clampExcerpt
                    hideExcerptWhenNarrow
                    className="h-full"
                  />
                </li>
              ))}
            </ol>
          </div>

          {/* Connector: sources -> artifact. Decorative, and always present in the server HTML. */}
          <div aria-hidden="true" className="relative hidden @xl:block">
            <svg
              viewBox="0 0 36 420"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <g fill="none" stroke="var(--color-flow)" strokeWidth="1.5" strokeLinecap="round">
                {[
                  "M0 70 C20 70 14 210 34 210",
                  "M0 210 L34 210",
                  "M0 350 C20 350 14 210 34 210",
                ].map((d, i) => (
                  <path
                    key={d}
                    className="flow-path"
                    vectorEffect="non-scaling-stroke"
                    style={{ "--flow-i": i } as React.CSSProperties}
                    d={d}
                  />
                ))}
              </g>
            </svg>
            <span className="absolute top-1/2 left-[34px] size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
          <p
            aria-hidden="true"
            className="flex items-center justify-center gap-2 text-xs font-medium text-primary @xl:hidden"
          >
            <ArrowDownIcon className="size-4" />
            Sources become one artifact
          </p>

          {/* Artifact / Ask panels */}
          <div className="flex min-w-0 flex-col rounded-lg border border-line bg-surface shadow-card">
            <div
              role="tabpanel"
              id="hero-panel-artifact"
              aria-labelledby="hero-tab-artifact"
              tabIndex={0}
              hidden={tab !== "artifact"}
              className={`flex-1 flex-col p-4 sm:p-5 ${tab === "artifact" ? "tab-panel-enter flex" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
                <span className="rounded-md bg-tint px-2 py-0.5 text-primary-hover">
                  Knowledge Artifact
                </span>
                <span>{sampleArtifact.version}</span>
              </div>
              <p className="mt-3 text-xl leading-tight font-semibold tracking-tight text-ink">
                {sampleArtifact.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-body">
                <span className="font-semibold text-ink">Thesis. </span>
                {sampleArtifact.thesis}
              </p>
              <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">
                Key ideas
              </p>
              <ul className="mt-2 m-0 list-none space-y-2.5 p-0">
                {sampleArtifact.keyIdeas.map((idea) => (
                  <li key={idea.text} className="flex gap-2 text-sm leading-relaxed text-ink">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-sm bg-primary" />
                    <span>
                      <ClaimText cites={idea.cites}>{idea.text}</ClaimText>
                      {idea.cites.map((n) => (
                        <CiteMarker key={n} n={n} label={sourceLabel(n)} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-line pt-3">
                <p className="text-xs text-muted">
                  Hover, focus or tap a numbered marker to see the source it points to.
                </p>
                <ul className="m-0 mt-3 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0 text-xs font-medium text-body">
                  <li className="text-xs font-semibold tracking-wide text-muted uppercase">
                    Then use it as
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <PresentationIcon className="size-4 text-primary" /> Presentation
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <ChatIcon className="size-4 text-primary" /> Cited chat
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <ExportIcon className="size-4 text-primary" /> Export
                  </li>
                </ul>
              </div>
            </div>

            <div
              role="tabpanel"
              id="hero-panel-ask"
              aria-labelledby="hero-tab-ask"
              tabIndex={0}
              hidden={tab !== "ask"}
              className={`flex-1 flex-col p-4 sm:p-5 ${tab === "ask" ? "tab-panel-enter flex" : ""}`}
            >
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Chat scope
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink">
                <LinkNodesIcon className="size-3.5 text-primary" />
                Team handoffs &middot; artifact {sampleArtifact.version}
              </p>
              <p className="mt-4 mb-4 ml-auto w-fit max-w-[88%] rounded-lg bg-ink px-3 py-2 text-sm text-white">
                {SAMPLE_QUESTION}
              </p>
              <div className="mb-4 rounded-lg border border-line bg-paper px-3 py-2.5 text-sm leading-relaxed text-ink">
                <p>
                  <ClaimText cites={[1]}>
                    People recall the decision but not the reason behind it.
                  </ClaimText>
                  <CiteMarker n={1} label={sourceLabel(1)} />{" "}
                  <ClaimText cites={[2]}>
                    A short written rationale is what later readers actually use.
                  </ClaimText>
                  <CiteMarker n={2} label={sourceLabel(2)} />
                </p>
              </div>
              <p className="mt-auto border-t border-line pt-3 text-xs text-muted">
                Answers draw only on the attached knowledge. If the evidence is not there, the chat
                says so.
              </p>
            </div>
          </div>
        </CitationScope>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted">
        Illustrative sample content. PodFlow is in development; this is not a screenshot of a
        released product.
      </figcaption>
    </figure>
  );
}
