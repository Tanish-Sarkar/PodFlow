import { HeroPreview } from "./hero-preview";
import { ArrowRightIcon } from "./icons";

const rise = (i: number) => ({ "--rise-i": i }) as React.CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-[1200px] gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-center xl:gap-14 xl:pt-20 xl:pb-24">
        <div className="max-w-xl xl:max-w-none">
          <div className="rise flex flex-wrap items-center gap-2.5" style={rise(0)}>
            <p className="eyebrow">A focused workspace for research teams</p>
          </div>
          <h1
            id="hero-heading"
            className="heading-1 hero-heading rise mt-5 max-w-[680px] text-balance"
            style={rise(1)}
          >
            Keep the context that makes research useful.
          </h1>
          <p
            className="body-3 rise mt-6 max-w-[680px] text-body"
            style={rise(2)}
          >
            PodFlow is a planned research workspace for analysts, writers, and media teams. It
            turns selected sources into concise, cited knowledge you can revisit and combine.
          </p>
          <div
            className="rise mt-8 flex flex-col gap-4 sm:flex-row"
            style={rise(3)}
          >
            <a href="#waitlist" className="btn btn-primary">
              Get early access
              <ArrowRightIcon className="size-4" />
            </a>
            <a href="#workflow" className="btn btn-secondary">
              See how it works
            </a>
          </div>
          <p className="caption-2 rise mt-8 max-w-xl text-muted" style={rise(4)}>
            In development. The visual is an illustrative concept, not a working product screen.
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
