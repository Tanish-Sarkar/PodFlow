import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { BuildVisual, CollectVisual, UseVisual } from "./how-visuals";
import { Container, SectionHeading } from "./section";

const STEPS = [
  {
    label: "01",
    title: "Collect sources",
    description:
      "Add YouTube videos, web pages, and files together as one collection. PodFlow keeps each source's origin and the location of every passage it reads.",
    content: <CollectVisual />,
  },
  {
    label: "02",
    title: "Build an artifact",
    description:
      "PodFlow extracts and indexes the material, then drafts a Knowledge Artifact: a thesis, key ideas, and claims that each point to their evidence.",
    content: <BuildVisual />,
  },
  {
    label: "03",
    title: "Use and share it",
    description:
      "Open it as a readable presentation, ask cited questions in a chat scoped to the knowledge you choose, or export it. Sharing and sending are always your call.",
    content: <UseVisual />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading">
      <Container className="pt-20 pb-8 sm:pt-24">
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="From a pile of sources to knowledge you can reuse."
        >
          Three steps, one durable result. The artifact is the thing you keep; everything else is a
          way of using it.
        </SectionHeading>
        <StickyScroll content={STEPS} className="mt-6" />
      </Container>
    </section>
  );
}
