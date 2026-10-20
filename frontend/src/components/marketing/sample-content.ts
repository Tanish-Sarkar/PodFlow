/**
 * Illustrative sample content for the product previews on the marketing page.
 * Nothing here is real research or a real source; previews label it as such.
 */

export type SampleSource = {
  n: 1 | 2 | 3;
  kind: "video" | "article" | "document";
  label: string;
  title: string;
  locator: string;
  excerpt: string;
};

export const sampleSources: readonly SampleSource[] = [
  {
    n: 1,
    kind: "video",
    label: "Video",
    title: "Handoff retrospective: team interview",
    locator: "12:40",
    excerpt: "We remembered what we chose, but not why we chose it.",
  },
  {
    n: 2,
    kind: "article",
    label: "Article",
    title: "Decision logs in practice",
    locator: "Paragraph 4",
    excerpt: "A two-sentence rationale beside each decision is what later readers actually use.",
  },
  {
    n: 3,
    kind: "document",
    label: "Document",
    title: "Handoff checklist (PDF)",
    locator: "Page 2",
    excerpt: "Each checklist item links to the place the decision was recorded.",
  },
];

export const sampleArtifact = {
  title: "Why decisions get lost between teams",
  version: "v3",
  thesis:
    "Teams rarely forget what they decided. They forget why, and the reason tends to disappear at the handoff.",
  keyIdeas: [
    { text: "The decision survives; its rationale does not.", cites: [1] },
    { text: "Short written reasons travel better than meeting notes.", cites: [2] },
    { text: "A checklist is only as useful as the links inside it.", cites: [3] },
  ],
  claims: [
    {
      text: "Decisions are lost at handoffs more than in the meetings where they are made.",
      cites: [1, 2],
    },
    {
      text: "A short written rationale makes a decision reusable by people who were not there.",
      cites: [2],
    },
    {
      text: "Checklists work best when each item points to where the decision was recorded.",
      cites: [3],
    },
  ],
  takeaways: [
    "Record the reason next to the decision, not in a separate document.",
    "Link checklist items to the decision they refer to.",
    "Review handoffs for missing rationale before they close.",
  ],
} as const;

export const SAMPLE_QUESTION = "Why do handoffs lose decisions?";

/** Looks up a source's title for citation-marker labels. */
export function sourceTitle(sources: readonly SampleSource[], n: number): string {
  return sources.find((source) => source.n === n)?.title ?? `Source ${n}`;
}

/**
 * Second sample collection, used by the scoped-chat preview so it does not
 * repeat the hero's handoffs example.
 */
export const onboardingSources: readonly SampleSource[] = [
  {
    n: 1,
    kind: "video",
    label: "Video",
    title: "New-hire panel discussion",
    locator: "21:05",
    excerpt: "The first week got easier once someone showed me where past decisions were written down.",
  },
  {
    n: 2,
    kind: "article",
    label: "Article",
    title: "Buddy systems, explained",
    locator: "Section 2",
    excerpt: "A named buddy gives questions an obvious first stop.",
  },
  {
    n: 3,
    kind: "document",
    label: "Document",
    title: "First-week checklist (PDF)",
    locator: "Page 1",
    excerpt: "Schedule the decision-log walkthrough for day two.",
  },
];

export const ONBOARDING_QUESTION = "What helps new hires settle in?";

/** Third sample collection, used by the "how it works" steps. */
export const meetingSources: readonly SampleSource[] = [
  {
    n: 1,
    kind: "video",
    label: "Video",
    title: "Conference talk: meeting-free days",
    locator: "08:15",
    excerpt: "Protected focus time changed what we chose to put in a meeting.",
  },
  {
    n: 2,
    kind: "article",
    label: "Article",
    title: "Field notes on async updates",
    locator: "Paragraph 2",
    excerpt: "A written update can replace a status meeting when it names the next decision.",
  },
  {
    n: 3,
    kind: "document",
    label: "Document",
    title: "Team survey summary (PDF)",
    locator: "Page 3",
    excerpt: "Respondents asked for fewer recurring meetings and clearer agendas.",
  },
];

export const meetingArtifact = {
  title: "When a meeting can be a message",
  claims: [
    { text: "Protected focus time makes teams more selective about what needs a meeting.", cites: [1] },
    { text: "Written updates work best when they name the next decision.", cites: [2, 3] },
  ],
} as const;
