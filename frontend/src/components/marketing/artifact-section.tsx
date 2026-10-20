import { CitationScope, CiteMarker, ClaimText } from "./citations";
import { CheckIcon } from "./icons";
import { sampleArtifact, sampleSources } from "./sample-content";
import { Container, SectionHeading } from "./section";
import { SourceCard } from "./source-card";

const sourceLabel = (n: number) => sampleSources.find((s) => s.n === n)?.title ?? `Source ${n}`;

const WHAT_YOU_GET = [
  "A thesis up front, then the ideas that support it",
  "Claims that point to the passage they rest on",
  "Quoted evidence you can read in context",
  "Takeaways you can act on or hand to someone else",
] as const;

export function ArtifactSection() {
  return (
    <section id="artifact" aria-labelledby="artifact-heading">
      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] xl:gap-14">
          <div className="xl:pt-4">
            <SectionHeading
              id="artifact-heading"
              eyebrow="The Knowledge Artifact"
              title="A page worth reading, not a disposable summary."
            >
              The artifact is the durable result. It reads like a considered page, and every claim
              stays one click from its evidence.
            </SectionHeading>
            <ul className="m-0 mt-8 list-none space-y-3 p-0">
              {WHAT_YOU_GET.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-evidence" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-lg border border-line bg-surface p-4 text-sm leading-relaxed text-body">
              <span className="font-semibold text-ink">Try it. </span>
              Hover, focus, or tap a numbered marker in the preview. The claims that use it and the
              source it points to light up together.
            </p>
          </div>

          <CitationScope className="@container min-w-0">
            <article
              aria-label="Sample Knowledge Artifact preview"
              className="overflow-hidden rounded-xl border border-line bg-surface shadow-lift"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper/70 px-5 py-2.5 text-xs text-body">
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
                    Concept preview
                  </span>
                  Presentation view
                </span>
                <span className="text-muted">Illustrative sample content</span>
              </div>

              <div className="px-5 py-8 sm:px-9 sm:py-10">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-wide text-muted uppercase">
                  <span className="rounded-md bg-tint px-2 py-0.5 text-primary-hover">
                    Knowledge Artifact
                  </span>
                  <span>Version {sampleArtifact.version.replace("v", "")}</span>
                  <span>{sampleSources.length} sources</span>
                </p>
                <p className="mt-4 text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-ink sm:text-4xl">
                  {sampleArtifact.title}
                </p>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed">
                  {sampleArtifact.thesis}
                </p>

                <div className="mt-9">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                      Claims and evidence
                    </p>
                    <ol className="m-0 mt-4 list-none space-y-5 p-0">
                      {sampleArtifact.claims.map((claim, index) => (
                        <li key={claim.text} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-0.5 font-mono text-sm font-semibold text-muted"
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <p className="text-base leading-relaxed text-ink">
                            <ClaimText cites={claim.cites}>{claim.text}</ClaimText>
                            {claim.cites.map((n) => (
                              <CiteMarker key={n} n={n} label={sourceLabel(n)} />
                            ))}
                          </p>
                        </li>
                      ))}
                    </ol>

                    <figure className="m-0 mt-8 border-l-2 border-evidence pl-5">
                      <blockquote className="m-0 text-lg leading-snug font-medium text-ink">
                        <ClaimText cites={[1]}>
                          &ldquo;{sampleSources[0].excerpt}&rdquo;
                        </ClaimText>
                        <CiteMarker n={1} label={sourceLabel(1)} />
                      </blockquote>
                      <figcaption className="mt-2 text-sm text-muted">
                        {sampleSources[0].title}, {sampleSources[0].locator}
                      </figcaption>
                    </figure>

                    <p className="mt-9 text-xs font-semibold tracking-wide text-muted uppercase">
                      Takeaways
                    </p>
                    <ul className="m-0 mt-3 list-none space-y-2 p-0">
                      {sampleArtifact.takeaways.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
                          <span
                            aria-hidden="true"
                            className="mt-2.5 size-1.5 shrink-0 rounded-sm bg-primary"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10 border-t border-line pt-8">
                    <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                      Sources
                    </p>
                    <ol className="m-0 mt-4 grid list-none gap-3 p-0 @2xl:grid-cols-3">
                      {sampleSources.map((source) => (
                        <li key={source.n}>
                          <SourceCard source={source} className="h-full" />
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </article>
          </CitationScope>
        </div>
      </Container>
    </section>
  );
}
