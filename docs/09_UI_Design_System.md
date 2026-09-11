# PodFlow --- UI Design System

## Personality

Calm, premium, technical and trustworthy. The product should feel like a
serious knowledge product, not a developer tool or AI gimmick.

## Navigation

Home, Artifacts, Sources, Workflows, Integrations, Settings.

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
