import { Container } from "./section";
import { TaglineReveal } from "./tagline-reveal";
import { WaitlistForm } from "./waitlist-form";

const FLOW = [
  {
    number: "01",
    title: "Choose the sources that matter",
    body: "Bring together the web pages and videos that belong to one question. Keep the collection narrow enough to preserve its point of view.",
  },
  {
    number: "02",
    title: "Shape them into a Knowledge Artifact",
    body: "PodFlow is planned to distill useful points into a readable, structured reference, with links back to the material each point came from.",
  },
  {
    number: "03",
    title: "Select the context for the next question",
    body: "Use one memory clip or combine several. Adjust the selection when the question changes, without starting from an unrelated pool of information.",
  },
] as const;

const USE_CASES = [
  {
    label: "Company research",
    body: "Keep company background, market coverage, and financial material together as separate context you can bring into a focused question.",
  },
  {
    label: "Editorial work",
    body: "Build a reusable reference from interviews, reports, and public sources while keeping the origin of each point close at hand.",
  },
  {
    label: "Research teams",
    body: "Give each project a defined collection of sources and a context that can be revisited as the work develops.",
  },
  {
    label: "Media monitoring",
    body: "Keep coverage from reports, publications, and video sources together to review how a story or market develops.",
  },
] as const;

const FAQS = [
  {
    question: "What is PodFlow?",
    answer:
      "PodFlow is a planned knowledge workspace for collecting selected sources, turning them into concise references, and reusing that context for focused research.",
  },
  {
    question: "Who is PodFlow being designed for?",
    answer:
      "The initial focus is industry professionals, analysts, writers, media teams, and organizations whose work depends on selected sources. A free path for students is a possibility, but plans and pricing are not finalized.",
  },
  {
    question: "What is a Knowledge Artifact?",
    answer:
      "It is a structured, reusable representation of useful information from a source collection. The idea is to keep concise points and their source links together, so the material can be revisited without processing every source again for each use.",
  },
  {
    question: "What are memory clips?",
    answer:
      "Memory clips are a planned way to save a focused packet of context from an artifact. The intended workflow lets people select one clip or combine several before asking a question. This feature is not available yet.",
  },
  {
    question: "Can I use PodFlow today?",
    answer:
      "The product is in early development. The screens and flow on this page are concept previews, not a working service. Join the early access list when registration opens.",
  },
  {
    question: "Which sources will PodFlow support?",
    answer:
      "The initial direction includes web pages and videos. The supported source list and connection methods have not been finalized. Browser extensions and other connectors are planned for later.",
  },
  {
    question: "Will PodFlow make presentations or exports?",
    answer:
      "Presentations, web views, and exports are part of the product direction. They are not available today, and their formats are still being planned.",
  },
  {
    question: "Are source links a guarantee that every answer is correct?",
    answer:
      "No. Source links are intended to help people inspect the original material. They do not guarantee that a generated point is complete or correct, so important information should be checked against its source.",
  },
  {
    question: "Can I add confidential or personal information?",
    answer:
      "Please do not submit confidential, sensitive, or personal information. Data handling and security details are not finalized, and the product is not ready for that use.",
  },
] as const;

export function HomePageSections() {
  return (
    <>
      <section id="why" aria-labelledby="why-heading" className="border-y border-line bg-surface">
        <Container className="grid gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 id="why-heading" className="heading-3 mt-4 text-ink">
              More information does not always mean more understanding.
            </h2>
          </div>
          <div className="body-3 space-y-4 text-body">
            <p>
              People can reach more reports, articles, videos, and conversations than they can
              reasonably keep in working memory. The harder part is returning to the useful pieces
              and remembering why they mattered.
            </p>
            <p>
              PodFlow is being designed around a narrower starting point: choose the sources for a
              question, keep their context together, and make it easier to reuse that knowledge
              later.
            </p>
          </div>
        </Container>
      </section>

      <section aria-label="PodFlow principle" className="bg-ink py-16 text-white sm:py-24">
        <Container>
          <p className="eyebrow text-on-dark-accent">The principle</p>
          <TaglineReveal text="Keep research specific. Keep its sources close." />
        </Container>
      </section>

      <section id="workflow" aria-labelledby="workflow-heading">
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">How it is intended to work</p>
            <h2 id="workflow-heading" className="heading-2 mt-4 text-ink">
              A deliberate path from sources to reusable context.
            </h2>
            <p className="body-3 mt-4 text-body">
              This is the product direction. None of these steps are available in the current
              prototype.
            </p>
          </div>

          <ol className="mt-12 grid list-none gap-4 p-0 lg:grid-cols-3">
            {FLOW.map((step) => (
              <li key={step.number} className="rounded-xl border border-line bg-surface p-6 shadow-card">
                <p className="caption-3 text-evidence">STEP {step.number}</p>
                <h3 className="heading-5 mt-8 text-ink">{step.title}</h3>
                <p className="body-6 mt-4 text-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="artifact" aria-labelledby="artifact-heading" className="border-y border-line bg-surface">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">The working reference</p>
            <h2 id="artifact-heading" className="heading-2 mt-4 text-ink">
              A Knowledge Artifact keeps useful points beside their sources.
            </h2>
            <p className="body-3 mt-6 text-body">
              It is a concise, structured representation of a collection, designed for models to
              reuse without processing every source from the beginning. People can still inspect
              where a point came from and return to the original material.
            </p>
            <p className="body-6 mt-4 text-muted">
              The artifact format and source linking behavior are still being developed.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-paper p-4 sm:p-6" aria-label="Illustrative artifact concept">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="caption-3 text-evidence">CONCEPT PREVIEW</p>
                <p className="title-2 mt-2 text-ink">Research context</p>
              </div>
              <span className="caption-4 rounded-md border border-line bg-surface px-3 py-2 text-muted">
                Illustrative structure
              </span>
            </div>
            <div className="space-y-4 py-6">
              <div>
                <p className="caption-4 text-muted">Question</p>
                <p className="body-5 mt-2 text-ink">What should this research help explain?</p>
              </div>
              <div className="rounded-lg border border-line bg-surface p-4">
                <p className="caption-4 text-muted">Useful point</p>
                <p className="body-5 mt-2 text-ink">
                  A concise finding stays connected to the material it came from.
                </p>
                <p className="caption-4 mt-4 text-evidence">Source reference · original material</p>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                {["Key ideas", "Source links", "Reusable context"].map((item) => (
                  <span key={item} className="caption-4 rounded-md border border-line bg-surface px-3 py-2 text-body">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="memory-clips" aria-labelledby="memory-heading">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="order-2 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-6 lg:order-1">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="caption-3 text-evidence">PLANNED CONCEPT</p>
                <p className="title-2 mt-2 text-ink">Choose the context</p>
              </div>
              <span className="caption-4 rounded-md bg-tint px-3 py-2 text-primary-hover">2 selected</span>
            </div>
            <ul className="my-6 space-y-3 p-0">
              {[
                ["Company background", true],
                ["Market notes", true],
                ["Recent updates", false],
              ].map(([label, selected]) => (
                <li key={String(label)} className="flex list-none items-center gap-3 rounded-lg border border-line px-4 py-3">
                  <span aria-hidden="true" className={`inline-flex size-5 items-center justify-center rounded border ${selected ? "border-evidence bg-evidence text-white" : "border-line-strong bg-surface text-transparent"}`}>
                    ✓
                  </span>
                  <span className="body-5 text-ink">{label}</span>
                  <span className="caption-4 ml-auto text-muted">Example clip</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg bg-ink p-4 text-white">
              <p className="caption-4 text-on-dark">A focused question</p>
              <p className="body-5 mt-2">How do these notes relate to the current research question?</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow">The memory clip idea</p>
            <h2 id="memory-heading" className="heading-2 mt-4 text-ink">
              Choose what belongs in the conversation.
            </h2>
            <p className="body-3 mt-6 text-body">
              A memory clip is planned as a reusable packet of focused context. Select one, combine
              several, or change the selection when the question changes. The goal is to keep each
              conversation grounded in the knowledge that belongs to it.
            </p>
            <p className="body-6 mt-4 text-muted">
              The labels shown here are examples. Memory clips are not available yet.
            </p>
          </div>
        </Container>
      </section>

      <section id="use-cases" aria-labelledby="use-cases-heading" className="border-y border-line bg-surface">
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Where this could help</p>
            <h2 id="use-cases-heading" className="heading-2 mt-4 text-ink">
              For work that depends on more than one source.
            </h2>
            <p className="body-3 mt-4 text-body">
              These are example workflows, not customer stories or claims of current use.
            </p>
          </div>
          <ul className="mt-12 grid list-none gap-4 p-0 sm:grid-cols-2">
            {USE_CASES.map((useCase, index) => (
              <li key={useCase.label} className="rounded-xl border border-line bg-paper p-6">
                <p className="caption-3 text-evidence">EXAMPLE 0{index + 1}</p>
                <h3 className="heading-5 mt-6 text-ink">{useCase.label}</h3>
                <p className="body-6 mt-4 text-body">{useCase.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="later" aria-labelledby="later-heading">
        <Container className="grid gap-8 py-16 sm:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Planned direction</p>
            <h2 id="later-heading" className="heading-3 mt-4 text-ink">
              One body of knowledge, more ways to use it later.
            </h2>
          </div>
          <div>
            <p className="body-3 text-body">
              Presentations, web views, and exports are part of the longer term direction. A
              mobile friendly app, browser extensions, and connectors may extend access in the
              future. None of these capabilities are available today, and no release dates have
              been set.
            </p>
            <p className="caption-2 mt-4 text-muted">
              Email and newsletters are possible outputs, not the purpose of PodFlow.
            </p>
          </div>
        </Container>
      </section>

      <section id="questions" aria-labelledby="questions-heading" className="border-y border-line bg-surface">
        <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 id="questions-heading" className="heading-2 mt-4 text-ink">
              What is known so far.
            </h2>
            <p className="body-6 mt-4 text-body">
              PodFlow is early. These answers describe the current direction, not a live feature set.
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left marker:hidden">
                  <span className="title-2 text-ink">{item.question}</span>
                  <span aria-hidden="true" className="text-2xl font-normal text-muted transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="body-6 mt-4 max-w-2xl pr-8 text-body">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section id="waitlist" aria-labelledby="waitlist-heading" className="bg-paper py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl rounded-xl border border-line bg-surface p-6 shadow-card sm:p-10">
            <p className="eyebrow">Early access</p>
            <h2 id="waitlist-heading" className="heading-2 mt-4 text-ink">
              Help shape a more focused way to work with research.
            </h2>
            <p className="body-3 mt-4 text-body">
              Join the early access list to hear when PodFlow is ready to invite its first users.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
            <p className="caption-2 mt-6 text-muted">
              Please do not submit confidential, sensitive, or personal information.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
