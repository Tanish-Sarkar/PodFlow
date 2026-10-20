import { Tabs, type TabItem } from "@/components/ui/tabs";
import { ArticleIcon, CheckIcon, DocumentIcon, LayersIcon, LinkNodesIcon } from "./icons";
import { Container, SectionHeading } from "./section";

const USE_CASES = [
  {
    value: "research-brief",
    Icon: ArticleIcon,
    title: "Research brief",
    from: ["Articles", "Interviews", "Reports"],
    body: "Gather what you have read and watched on a topic into a thesis and a set of claims you can defend, each tied to a passage.",
    gets: ["A thesis and the claims behind it", "Quotes you can read in context"],
  },
  {
    value: "study-guide",
    Icon: DocumentIcon,
    title: "Study guide",
    from: ["Lectures", "Readings", "Notes"],
    body: "Turn a term's material into key ideas and takeaways, then ask questions over exactly the units you are revising.",
    gets: ["Key ideas and takeaways to revisit", "Cited answers scoped to what you pick"],
  },
  {
    value: "investigation-notes",
    Icon: LinkNodesIcon,
    title: "Investigation notes",
    from: ["Documents", "Recordings", "Web pages"],
    body: "Build up claims as you go and keep the trail to their sources intact, so you can show how you got there.",
    gets: ["Claims that keep their sources", "A trail you can walk back"],
  },
  {
    value: "knowledge-hub",
    Icon: LayersIcon,
    title: "Project knowledge hub",
    from: ["Specs", "Talks", "Decisions"],
    body: "Keep a project's scattered context in one artifact the whole team can read, present, or export.",
    gets: ["One page the team can read", "Exports for people outside the workspace"],
  },
] as const;

const TABS: TabItem[] = USE_CASES.map(({ value, Icon, title, from, body, gets }) => ({
  value,
  title,
  content: (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-lift sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className="inline-flex size-11 items-center justify-center rounded-lg bg-tint text-primary-hover">
          <Icon className="size-6" />
        </span>
        <p className="m-0 flex flex-wrap justify-end gap-1.5 text-xs text-muted">
          <span className="sr-only">Starting from: </span>
          {from.map((item) => (
            <span
              key={item}
              className="rounded-md border border-line bg-paper px-2 py-0.5 font-medium text-body"
            >
              {item}
            </span>
          ))}
        </p>
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-body">{body}</p>
      <ul className="m-0 mt-auto list-none space-y-2 p-0 pt-5">
        {gets.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-ink">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-evidence" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

export function UseCases() {
  return (
    <section id="use-cases" aria-labelledby="use-cases-heading">
      <Container className="py-20 sm:py-24">
        <SectionHeading
          id="use-cases-heading"
          eyebrow="Use cases"
          title="For work that starts with too many tabs."
        >
          PodFlow is for anyone who synthesizes from many sources. These are examples of how the
          workflow can be used, not a list of customers.
        </SectionHeading>

        <div className="mt-10">
          <Tabs
            label="Use cases"
            tabs={TABS}
            containerClassName="gap-1 rounded-full"
            tabClassName="text-sm font-medium text-body hover:text-primary-hover aria-selected:text-ink"
            activeTabClassName="bg-tint border border-primary-soft"
            stageClassName="mt-20"
          />
        </div>
      </Container>
    </section>
  );
}
