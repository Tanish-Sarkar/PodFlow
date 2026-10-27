# PodFlow --- UI Design System

> **Status:** Supporting UI direction. Website-view components and chat are part of the V2 product scope.

## Personality

Calm, premium, technical and trustworthy. The product should feel like a
serious knowledge product, not a developer tool or AI gimmick.

## Navigation

Home, Artifacts, Sources, Chat, Workflows, Integrations, Settings.

## Palette

  Token            Value
  ---------------- -----------
  Ink              `#111827`
  Slate            `#475569`
  Muted            `#64748B`
  Surface          `#FFFFFF`
  Surface subtle   `#F8FAFC`
  Border           `#E2E8F0`
  Primary          `#4F46E5`
  Primary hover    `#4338CA`
  Success          `#059669`
  Warning          `#D97706`
  Danger           `#DC2626`

Start light-first. Add dark mode after the core system is stable.

## Typography

Modern sans-serif. Restrained display sizes. 15--16px body text.
12--13px metadata. Avoid excessive weight and giant in-app marketing
typography.

## Dashboard

Show recent artifacts, processing sources, pending reviews and a primary
`Create Artifact` action.

## Artifact viewer

The flagship surface: Title → Thesis → Key insights → Claims + evidence
→ Quotes → Takeaways → Sources/citations → Edit/Share/Export/Send.

Evidence should be visually connected to claims.

## Website view

An artifact website view is a polished, shareable presentation rather
than the dashboard's editor. Use a constrained set of accessible blocks
for thesis, narrative sections, key points, quoted evidence, sources,
and optional visual callouts. The renderer consumes structured
presentation data; generated page code is not allowed.

## Chat

Show active artifact/source attachments above the conversation as
removable chips. Users can add, swap, or remove scopes. Every answer
shows citations and identifies the source/artifact version when opened.
When the selected knowledge lacks evidence, say so plainly.

## Workflow builder

React Flow for advanced users. Default users should not need to
understand graphs. Mobile should become a step/list editor rather than a
tiny canvas.

## UX rules

-   Every async action has visible status.
-   Errors explain what happened and what to do next.
-   Destructive actions confirm.
-   Review screens show changes clearly.
-   Citations are one click away.
-   Empty states provide a next action.

## Accessibility

Keyboard navigation, visible focus, semantic HTML, sufficient contrast,
labels, accessible dialogs, reduced motion and screen-reader support.

## Responsive

Desktop is primary workspace. Tablet fully supported. Mobile supports
viewing, review/edit, source management, sharing and simple workflow
editing.
