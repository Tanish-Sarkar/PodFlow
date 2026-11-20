/**
 * Mock data fixtures for the dashboard developer preview.
 *
 * These are illustrative, typed fixtures only. Nothing here represents real
 * user data, real URLs that have been fetched, or real backend responses.
 * The dashboard preview makes no API or Supabase requests.
 */

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export type ResourceStatus = "sample" | "added" | "ready";

export interface MockResource {
  id: string;
  url: string;
  title: string;
  kind: "video" | "article" | "document";
  status: ResourceStatus;
  addedAt: string; // ISO date string
}

export const MOCK_RESOURCES: MockResource[] = [
  {
    id: "r1",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Design systems at scale — conference talk",
    kind: "video",
    status: "sample",
    addedAt: "2026-10-20",
  },
  {
    id: "r2",
    url: "https://example.com/articles/decision-logs-practice",
    title: "Decision logs in practice",
    kind: "article",
    status: "sample",
    addedAt: "2026-10-21",
  },
  {
    id: "r3",
    url: "https://example.com/docs/team-handoff-checklist.pdf",
    title: "Team handoff checklist (PDF)",
    kind: "document",
    status: "sample",
    addedAt: "2026-10-23",
  },
];

// ---------------------------------------------------------------------------
// Knowledge Artifacts
// ---------------------------------------------------------------------------

export type ArtifactTag = "research" | "process" | "reference" | "decision";

export interface MockArtifact {
  id: string;
  title: string;
  summary: string;
  sourceCount: number;
  tags: ArtifactTag[];
  updatedAt: string;
}

export const MOCK_ARTIFACTS: MockArtifact[] = [
  {
    id: "a1",
    title: "Why decisions get lost between teams",
    summary:
      "Teams rarely forget what they decided — they forget why. This artifact traces the evidence for decision-loss at handoff points.",
    sourceCount: 3,
    tags: ["research", "decision"],
    updatedAt: "2026-10-22",
  },
  {
    id: "a2",
    title: "When a meeting can be a message",
    summary:
      "Protected focus time makes teams more selective about what truly needs synchronous discussion versus a written update.",
    sourceCount: 2,
    tags: ["process", "research"],
    updatedAt: "2026-10-24",
  },
  {
    id: "a3",
    title: "Design system adoption patterns",
    summary:
      "A comparative look at how teams with and without component libraries differ in shipping velocity and visual consistency.",
    sourceCount: 4,
    tags: ["reference", "research"],
    updatedAt: "2026-10-25",
  },
];

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export type IntegrationStatus = "connected" | "not_connected" | "coming_soon";

export interface MockIntegration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
}

export const MOCK_INTEGRATIONS: MockIntegration[] = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Import newsletter digests, research threads, and saved links from your inbox.",
    status: "not_connected",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pull in pages and databases as source documents.",
    status: "coming_soon",
  },
  {
    id: "drive",
    name: "Google Drive",
    description: "Access PDFs, Docs, and presentations directly.",
    status: "coming_soon",
  },
];

// ---------------------------------------------------------------------------
// Activity / overview stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  resourceCount: number;
  artifactCount: number;
  lastActive: string;
}

export const MOCK_STATS: DashboardStats = {
  resourceCount: MOCK_RESOURCES.length,
  artifactCount: MOCK_ARTIFACTS.length,
  lastActive: "Today",
};
