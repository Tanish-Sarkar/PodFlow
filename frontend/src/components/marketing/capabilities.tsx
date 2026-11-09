import type { ReactNode } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  ChatIcon,
  ExportIcon,
  LayersIcon,
  LinkNodesIcon,
  PlugIcon,
  PresentationIcon,
  SourceKindIcon,
} from "./icons";
import { sampleSources } from "./sample-content";
import { Container, SectionHeading } from "./section";

const iconBadge = (icon: ReactNode) => (
  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-tint text-primary-hover">
    {icon}
  </span>
);

/* Small, static illustrations. They are decorative (the grid item hides them from assistive tech). */

function SourcesHeader() {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 overflow-hidden rounded-lg bg-paper/70 p-2.5">
      {sampleSources.map((source) => (
        <div
          key={source.n}
          className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-body"
        >
          <SourceKindIcon kind={source.kind} className="size-4 text-primary" />
          {source.label}
          <span className="ml-auto font-mono text-xs text-muted">{source.locator}</span>
        </div>
      ))}
    </div>
  );
}

function EvidenceHeader() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-lg bg-paper/70 p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="h-2.5 w-44 rounded-sm bg-line" />
        <span className="h-2.5 w-24 rounded-sm bg-line" />
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-evidence-soft bg-evidence-tint px-1 text-xs font-semibold text-evidence">
          2
        </span>
      </div>
      <div className="rounded-md border border-evidence bg-evidence-tint px-3 py-2.5 shadow-[inset_3px_0_0_var(--color-evidence)]">
        <p className="m-0 text-xs font-semibold text-ink">Source 2 &middot; Paragraph 4</p>
        <div className="mt-2 space-y-1.5">
          <div className="h-2 w-5/6 rounded-sm bg-evidence-soft" />
          <div className="h-2 w-2/3 rounded-sm bg-evidence-soft" />
        </div>
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 rounded-lg bg-paper/70 p-4">
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md border border-primary bg-tint px-2 py-0.5 text-xs font-medium text-ink">
          Artifact A &middot; in scope
        </span>
        <span className="rounded-md border border-dashed border-edge px-2 py-0.5 text-xs font-medium text-body">
          Artifact B &middot; removed
        </span>
      </div>
      <div className="h-6 w-2/5 rounded-md bg-ink" />
      <div className="rounded-md border border-line bg-surface px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-3/4 rounded-sm bg-line" />
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-evidence-soft bg-evidence-tint px-0.5 text-xs font-semibold text-evidence">
            1
          </span>
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded-lg bg-paper/70 p-4">
      <div className="h-3 w-3/4 rounded-sm bg-ink/80" />
      <div className="h-2 w-full rounded-sm bg-line" />
      <div className="h-2 w-5/6 rounded-sm bg-line" />
      <div className="mt-1 flex gap-2">
        <div className="h-8 flex-1 rounded-md border border-line bg-surface" />
        <div className="h-8 flex-1 rounded-md border border-line bg-surface" />
      </div>
    </div>
  );
}

function ExportsHeader() {
  return (
    <div className="flex h-full flex-wrap content-center gap-2 rounded-lg bg-paper/70 p-4">
      {["MD", "JSON", "DOCX", "PDF"].map((format) => (
        <span
          key={format}
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-xs font-semibold text-body"
        >
          .{format.toLowerCase()}
        </span>
      ))}
    </div>
  );
}

function DeliveryHeader() {
  return (
    <div className="flex h-full flex-wrap content-center gap-2 rounded-lg bg-paper/70 p-4">
      {["Web app", "Mobile-friendly PWA", "Chrome extension", "Email", "Connectors"].map((item) => (
        <span
          key={item}
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-body"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

const ITEMS = [
  {
    title: "Multi-source input",
    description:
      "Submit videos, web pages, and documents individually or together. One mixed collection becomes one artifact.",
    header: <SourcesHeader />,
    icon: <LayersIcon className="size-5" />,
    className: "md:col-span-1",
  },
  {
    title: "Evidence-linked artifacts",
    description:
      "A thesis, key ideas, claims, quotes, and takeaways, with references that lead back to the passage each one rests on.",
    header: <EvidenceHeader />,
    icon: <LinkNodesIcon className="size-5" />,
    className: "md:col-span-2",
  },
  {
    title: "Chat over selected knowledge",
    description:
      "Attach the artifacts you want to ask about. Add, swap, or remove them mid-conversation. Answers cite what they used and say so when the evidence is not there.",
    header: <ChatHeader />,
    icon: <ChatIcon className="size-5" />,
    className: "md:col-span-2",
  },
  {
    title: "Presentable web views",
    description:
      "Turn an artifact into a readable page built from a fixed set of accessible components. Nothing is shared until you create a link yourself.",
    header: <PageHeader />,
    icon: <PresentationIcon className="size-5" />,
    className: "md:col-span-1",
  },
  {
    title: "Exports",
    description:
      "Export a specific artifact version as Markdown, JSON, DOCX, or PDF, so the knowledge is not locked inside the workspace.",
    header: <ExportsHeader />,
    icon: <ExportIcon className="size-5" />,
    className: "md:col-span-1",
  },
  {
    title: "Delivery and clients",
    description:
      "Email is one output among several. The workspace is planned for the web, a mobile-friendly PWA, and a Chrome extension, with connectors to follow.",
    header: <DeliveryHeader />,
    icon: <PlugIcon className="size-5" />,
    className: "md:col-span-2",
  },
] as const;

export function Capabilities() {
  return (
    <section
      id="product"
      aria-labelledby="product-heading"
      className="border-y border-line bg-paper"
    >
      <Container className="py-20 sm:py-24">
        <SectionHeading
          id="product-heading"
          eyebrow="Product"
          title="One knowledge layer, several ways to use it."
        >
          PodFlow is not a one-off summarizer. It builds something you can come back to, question,
          present, and hand to someone else.
        </SectionHeading>

        <BentoGrid className="mt-12">
          {ITEMS.map((item) => (
            <BentoGridItem
              key={item.title}
              className={item.className}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={iconBadge(item.icon)}
            />
          ))}
        </BentoGrid>
      </Container>
    </section>
  );
}
