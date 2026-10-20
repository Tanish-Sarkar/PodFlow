import { ArrowRightIcon } from "./icons";
import { Container } from "./section";

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-heading" className="pb-20 sm:pb-24">
      <Container>
        <div className="rounded-xl border border-primary-soft bg-tint px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2
            id="closing-heading"
            className="mx-auto max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-ink sm:text-4xl"
          >
            See what a source-linked workspace feels like.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-body sm:text-lg sm:leading-relaxed">
            PodFlow is still being built and there is no sign-up yet. In the meantime, the previews
            on this page are the best view of how it is planned to work.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#artifact" className="btn btn-primary">
              Preview an artifact
              <ArrowRightIcon className="size-4" />
            </a>
            <a href="#chat" className="btn btn-secondary">
              Try the scoped chat
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
