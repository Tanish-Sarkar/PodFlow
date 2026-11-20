import { LayersIcon, LinkNodesIcon, PresentationIcon } from "./icons";
import { Container } from "./section";

const PRINCIPLES = [
  {
    Icon: LayersIcon,
    title: "Sources stay attached",
    body: "Each artifact keeps track of the videos, pages, and files it came from, with a pointer to the passage.",
  },
  {
    Icon: LinkNodesIcon,
    title: "Evidence you can inspect",
    body: "Claims are designed to link back to supporting passages, so you can check them instead of taking them on faith.",
  },
  {
    Icon: PresentationIcon,
    title: "One artifact, many uses",
    body: "Read it as a presentation, ask it questions, export it, or send it on. You do not start over for each format.",
  },
] as const;

export function TrustStrip() {
  return (
    <section aria-labelledby="principles-heading" className="border-y border-line bg-surface">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <h2
              id="principles-heading"
              className="text-2xl leading-snug font-semibold tracking-[-0.015em] text-balance text-ink sm:text-[1.75rem]"
            >
              Built around where knowledge came from.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-body">
              AI-generated text can contain mistakes. PodFlow is designed to keep the original
              passage one step away, so the checking is quick and the trust is earned.
            </p>
          </div>
          <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-3">
            {PRINCIPLES.map(({ Icon, title, body }) => (
              <li key={title}>
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-tint text-primary-hover">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-body">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
