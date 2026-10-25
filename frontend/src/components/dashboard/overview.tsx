"use client";

import { useState, useRef } from "react";
import {
  MOCK_RESOURCES,
  MOCK_ARTIFACTS,
  MOCK_STATS,
  MOCK_INTEGRATIONS,
  type MockResource,
  type MockArtifact,
} from "@/lib/dashboard-fixtures";
import {
  PlusIcon,
  LinkIcon,
  CheckCircleIcon,
  ClockIcon,
  VideoIcon,
  ArticleIcon,
  DocumentIcon,
  KnowledgeIcon,
  MailIcon,
  SparklesIcon,
  AlertIcon,
} from "./icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function kindIcon(kind: MockResource["kind"]) {
  switch (kind) {
    case "video":
      return VideoIcon;
    case "article":
      return ArticleIcon;
    case "document":
      return DocumentIcon;
    default:
      return DocumentIcon;
  }
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------
function StatsBar({ name }: { name: string }) {
  const stats = [
    { label: "Resources", value: MOCK_STATS.resourceCount },
    { label: "Artifacts", value: MOCK_STATS.artifactCount },
    { label: "Last active", value: MOCK_STATS.lastActive },
  ];
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[1.5rem] font-semibold tracking-tight text-ink">
          Welcome back, {name.split(" ")[0]} 👋
        </h1>
        <p className="mt-0.5 text-[14px] text-muted">
          Here&apos;s what&apos;s in your knowledge workspace.
        </p>
      </div>
      <div className="mt-3 flex items-center gap-5 sm:mt-0">
        {stats.map(({ label, value }) => (
          <div key={label} className="text-center sm:text-right">
            <p className="text-[1.25rem] font-semibold text-ink">{value}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resource entry panel
// ---------------------------------------------------------------------------
interface EnteredResource {
  id: string;
  url: string;
  status: "added";
}

function ResourceEntryPanel({
  added,
  onAdd,
}: {
  added: EnteredResource[];
  onAdd: (urls: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) return;

    const invalid = lines.filter((l) => !isValidUrl(l));
    if (invalid.length) {
      setErrors(invalid);
      return;
    }

    setErrors([]);
    onAdd(lines);
    setValue("");
    textareaRef.current?.focus();
  }

  return (
    <section
      aria-labelledby="add-resources-heading"
      className="rounded-xl border border-line bg-surface p-5 [box-shadow:var(--shadow-card)]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2
            id="add-resources-heading"
            className="flex items-center gap-2 text-[15px] font-semibold text-ink"
          >
            <PlusIcon className="size-4 text-primary" />
            Add resources
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Paste one URL per line — videos, articles, PDFs, pages.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="relative">
          <label htmlFor="resource-urls" className="sr-only">
            Resource URLs, one per line
          </label>
          <textarea
            id="resource-urls"
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (errors.length) setErrors([]);
            }}
            rows={4}
            placeholder={"https://www.youtube.com/watch?v=…\nhttps://example.com/article\nhttps://example.com/report.pdf"}
            className={cn(
              "w-full resize-none rounded-lg border bg-paper px-3.5 py-3 font-mono text-[13px] text-ink placeholder:font-sans placeholder:text-muted transition-colors duration-150",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              errors.length ? "border-red-400" : "border-line",
            )}
            aria-describedby={errors.length ? "url-errors" : undefined}
            aria-invalid={errors.length > 0}
          />
        </div>

        {errors.length > 0 && (
          <p id="url-errors" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-600">
            <AlertIcon className="size-3.5 shrink-0" />
            Invalid URLs: {errors.join(", ")}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-muted">
            <LinkIcon className="mr-1 inline size-3.5 align-middle" />
            URLs are validated locally — no fetching in preview mode.
          </p>
          <button
            type="submit"
            id="add-resources-btn"
            className="btn btn-primary shrink-0 text-sm"
          >
            <PlusIcon className="size-4" />
            Add to workspace
          </button>
        </div>
      </form>

      {/* Newly added URLs this session */}
      {added.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
            Added this session
          </p>
          <ul className="space-y-1.5">
            {added.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-[13px]">
                <CheckCircleIcon className="size-4 shrink-0 text-evidence" />
                <span className="truncate font-mono text-body">{r.url}</span>
                <span className="ml-auto shrink-0 rounded-full bg-evidence-tint px-2 py-0.5 text-[11px] font-medium text-evidence">
                  Added
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Resource list
// ---------------------------------------------------------------------------
function ResourceList({ extras }: { extras: EnteredResource[] }) {
  const combined = [
    ...MOCK_RESOURCES,
    ...extras.map((e) => ({
      id: e.id,
      url: e.url,
      title: e.url,
      kind: "article" as const,
      status: "added" as const,
      addedAt: new Date().toISOString().split("T")[0],
    })),
  ];

  if (!combined.length) return null;

  return (
    <section aria-labelledby="resources-heading" className="rounded-xl border border-line bg-surface [box-shadow:var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 id="resources-heading" className="text-[15px] font-semibold text-ink">
          Resources ({combined.length})
        </h2>
        <span className="text-[12px] text-muted">
          Preview only — no backend processing
        </span>
      </div>

      <ul role="list" className="divide-y divide-line">
        {combined.map((r) => {
          const KindIcon = kindIcon(r.kind);
          return (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-paper">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  r.kind === "video"
                    ? "bg-violet-100 text-violet-600"
                    : r.kind === "article"
                    ? "bg-sky-100 text-sky-600"
                    : "bg-teal-100 text-teal-600",
                )}
              >
                <KindIcon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">{r.title}</p>
                <p className="truncate text-[12px] text-muted">{r.url}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[11px] text-muted">{r.addedAt}</span>
                {r.status === "sample" ? (
                  <span className="flex items-center gap-1 rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    Sample preview
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    <ClockIcon className="size-3" />
                    Added (preview)
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Artifact cards
// ---------------------------------------------------------------------------
const TAG_STYLES: Record<string, string> = {
  research: "bg-violet-100 text-violet-700",
  process: "bg-sky-100 text-sky-700",
  reference: "bg-teal-100 text-teal-700",
  decision: "bg-amber-100 text-amber-700",
};

function ArtifactCard({ artifact }: { artifact: MockArtifact }) {
  return (
    <article
      aria-labelledby={`artifact-${artifact.id}-title`}
      className="flex flex-col rounded-xl border border-line bg-surface p-5 transition-shadow duration-150 hover:[box-shadow:var(--shadow-lift)] [box-shadow:var(--shadow-card)]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tint"
          aria-hidden="true"
        >
          <KnowledgeIcon className="size-5 text-primary" />
        </div>
        <time
          dateTime={artifact.updatedAt}
          className="text-[11px] text-muted"
          title={`Last updated ${artifact.updatedAt}`}
        >
          {artifact.updatedAt}
        </time>
      </div>

      <h3
        id={`artifact-${artifact.id}-title`}
        className="mb-1.5 text-[15px] font-semibold leading-snug text-ink"
      >
        {artifact.title}
      </h3>
      <p className="mb-4 flex-1 text-[13px] leading-relaxed text-body">
        {artifact.summary}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {artifact.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                TAG_STYLES[tag] ?? "bg-line text-muted",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[12px] text-muted">
          {artifact.sourceCount} source{artifact.sourceCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Viewing artifacts will be available once the backend is connected"
          className="btn btn-secondary w-full cursor-not-allowed text-[13px] opacity-60"
        >
          <SparklesIcon className="size-4" />
          View artifact — preview coming soon
        </button>
      </div>
    </article>
  );
}

function ArtifactsSection() {
  return (
    <section aria-labelledby="artifacts-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="artifacts-heading" className="text-[15px] font-semibold text-ink">
          Knowledge artifacts
        </h2>
        <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          Sample — not your data
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MOCK_ARTIFACTS.map((a) => (
          <ArtifactCard key={a.id} artifact={a} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Integrations section
// ---------------------------------------------------------------------------
function IntegrationsSection() {

  return (
    <section aria-labelledby="integrations-heading" className="rounded-xl border border-line bg-surface p-5 [box-shadow:var(--shadow-card)]">
      <h2
        id="integrations-heading"
        className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-ink"
      >
        <MailIcon className="size-4 text-muted" />
        Integrations
      </h2>

      <ul role="list" className="space-y-3">
        {MOCK_INTEGRATIONS.map((integration) => (
          <li
            key={integration.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-line p-4 transition-colors hover:bg-paper"
          >
            <div>
              <p className="text-[14px] font-medium text-ink">{integration.name}</p>
              <p className="mt-0.5 text-[12px] text-muted">{integration.description}</p>
            </div>
            <div className="shrink-0">
              {integration.status === "not_connected" ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span className="rounded-full bg-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    Not connected
                  </span>
                  <button
                    type="button"
                    id={`connect-${integration.id}`}
                    disabled
                    aria-disabled="true"
                    title={`Connect ${integration.name} — coming soon, no data will be sent`}
                    className="btn btn-secondary cursor-not-allowed text-[12px] opacity-60 py-1.5 px-3 min-h-0"
                  >
                    Connect {integration.name}
                  </button>
                </div>
              ) : (
                <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Coming soon
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] text-muted" role="note">
        Integrations are not connected in this preview. No email or file access will occur.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main overview
// ---------------------------------------------------------------------------
export function DashboardOverview({ displayName }: { displayName: string }) {
  const [sessionResources, setSessionResources] = useState<EnteredResource[]>([]);

  function handleAdd(urls: string[]) {
    const newResources: EnteredResource[] = urls.map((url) => ({
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      status: "added",
    }));
    setSessionResources((prev) => [...prev, ...newResources]);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <StatsBar name={displayName} />

      {/* Resource entry */}
      <ResourceEntryPanel added={sessionResources} onAdd={handleAdd} />

      {/* Resource list */}
      <ResourceList extras={sessionResources} />

      {/* Knowledge artifacts */}
      <ArtifactsSection />

      {/* Integrations */}
      <IntegrationsSection />
    </div>
  );
}
