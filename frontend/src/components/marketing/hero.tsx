import Link from "next/link";
import { HeroPreview } from "./hero-preview";
import { ArrowRightIcon } from "./icons";

const rise = (i: number) => ({ "--rise-i": i }) as React.CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-dots pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid w-full max-w-[1200px] gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-center xl:gap-14 xl:pt-20 xl:pb-24">
        <div className="max-w-xl xl:max-w-none">
          <div className="rise flex flex-wrap items-center gap-2.5" style={rise(0)}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary-hover">
              <span aria-hidden="true" className="h-px w-6 bg-primary" />A workspace for connected
              knowledge
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
            >
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              Dev Preview Live &rarr;
            </Link>
          </div>
          <h1
            id="hero-heading"
            className="rise mt-5 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-5xl xl:text-[3.5rem]"
            style={rise(1)}
          >
            Turn scattered sources into <span className="text-primary">knowledge you can use.</span>
          </h1>
          <p
            className="rise mt-6 text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed"
            style={rise(2)}
          >
            Bring videos, articles, and documents together. Build an evidence-linked artifact,
            explore it through a focused chat, and shape it into a presentation or export.
          </p>
          <div
            className="rise mt-8 flex flex-col gap-3 sm:flex-row"
            style={rise(3)}
          >
            <Link href="/dashboard" className="btn btn-primary">
              Open Dashboard
              <ArrowRightIcon className="size-4" />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary">
              Explore the workflow
            </a>
            <a href="#artifact" className="btn btn-secondary">
              Preview an artifact
            </a>
          </div>
          <p className="rise mt-8 max-w-md text-sm leading-relaxed text-muted" style={rise(4)}>
            For researchers, students, analysts, writers, and anyone who works from many sources at
            once. PodFlow is in development; the screens on this page are previews of the planned
            experience.
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
