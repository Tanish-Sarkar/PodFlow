import Link from "next/link";
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
            PodFlow is actively in development. Explore the interactive previews below or launch
            the developer dashboard prototype right now.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn btn-primary">
              Open Dashboard Preview
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign in
            </Link>
            <a href="#artifact" className="btn btn-secondary">
              Preview an artifact
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
