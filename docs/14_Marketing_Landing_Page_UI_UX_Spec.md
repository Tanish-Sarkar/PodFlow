# PodFlow Public Marketing Page — UI/UX and SEO Specification

**Status:** Design direction for the first public web experience  
**Route:** `/`  
**Implementation target:** Existing Next.js App Router frontend in `frontend/`, managed with Bun  
**Audience:** Product/design implementation in Antigravity; Sonnet 4.6 Thinking is the user's selected implementation model

## 1. Purpose

Create a polished, trustworthy public website that explains PodFlow's product vision and makes the next step obvious. This is the marketing and SEO page, not the authenticated dashboard or help center. The dashboard/help experience belongs on separate application routes and should not be invented as part of this page.

PodFlow turns collections of sources into reusable, evidence-backed knowledge artifacts. People can then explore that knowledge in a readable presentation, chat with selected artifacts, export it, or distribute a newsletter. Email is one delivery path, not the product pitch.

The landing page may use a carefully designed static product illustration and small interactions. It does not need a working backend, authentication, source upload, chat, newsletter form, or generated AI output.

## 2. Design objective

Build a distinctive knowledge-work product site with the clarity and restraint of strong modern AI/product websites, while giving PodFlow its own visual identity. Do not copy another company's layout, illustrations, copy, logo, or motion. The page should feel considered, calm, editorial, and technically credible—not like a generic AI template or a security dashboard.

The primary visual idea is **sources becoming a connected, presentable body of knowledge**. Show source cards flowing into a structured artifact whose claims connect to citations. This expresses the product more clearly than a generic chatbot window, email envelope, brain graphic, or glowing AI orb.

## 3. Product and content boundaries

### The page can say or show

- PodFlow brings multiple resources together into a reusable Knowledge Artifact.
- Knowledge can be explored through a readable presentation and scoped, cited chat.
- Artifacts can be exported and transformed into different outputs.
- The product is designed to preserve source context and make evidence inspectable.
- The planned client experience includes a web workspace, mobile-friendly PWA, Chrome extension, and future connectors.
- Product capabilities that are planned or represented by a visual prototype, as long as they are labelled accurately.

### The page must not imply without evidence

- That unreleased features are already live. Clearly label mockups as a preview or planned experience where needed.
- That every generated statement is guaranteed correct or fully sourced.
- That PodFlow has customers, usage numbers, testimonials, awards, security certifications, compliance status, or integrations that have not been verified.
- That PodFlow trains on user data, or never uses user data for training, unless the product's approved privacy policy supports that statement.
- That PodFlow is a SIEM, SOAR, EDR, XDR, legal case-management, or records system. Those are potential connector destinations, not PodFlow's product identity.
- That PodFlow is only a YouTube summarizer or newsletter sender.
- Direct comparisons or implied endorsements involving OpenAI, Anthropic, Cursor, NotebookLM, or other products.

Avoid fake logos, fake customer quotes, invented metrics, unsubstantiated security badges, keyword stuffing, invisible SEO text, and autoplay audio/video.

## 4. Audience and search intent

The initial page should serve people who collect information across many sources and need to synthesize, retain, present, or revisit it. Likely audiences include researchers, students, analysts, writers, and knowledge workers; describe these as use cases, not as claimed customer segments.

Build clear, human-first copy around intent such as:

- knowledge workspace for research;
- organize and synthesize multiple sources;
- chat with selected research and documents;
- source-grounded knowledge artifacts;
- turn research into shareable reports and presentations.

Use a natural primary phrase in the title, heading, and description. Do not repeat exact phrases unnaturally. Search visibility should come from useful, indexable content, semantic HTML, good page performance, and clear information architecture.

## 5. Information architecture

One scrolling public page with a compact sticky header and anchor navigation:

1. Header: PodFlow mark/name, Product, How it works, Use cases, and one primary CTA.
2. Hero: concise promise, supporting copy, two clear actions, and the product visual.
3. Trust/positioning strip: explain the workflow and provenance principle without fabricated social proof.
4. How it works: collect sources → build an artifact → use and share knowledge.
5. Product capabilities: multi-source input, evidence-linked artifacts, selected-knowledge chat, presentable web views, exports, and delivery/connectors.
6. Artifact presentation section: a larger editorial example of a polished artifact page with citations.
7. Scoped chat section: show one or two attached knowledge sources and a cited answer; communicate that users can add or swap knowledge scope.
8. Use cases: a small set of concrete examples, e.g. research brief, study guide, investigation notes, or project knowledge hub. Avoid implying domain certifications.
9. Closing CTA: invite the user to explore or access PodFlow using a route that actually exists.
10. Footer: concise navigation and only real policy/contact links. Do not invent a privacy-policy URL.

The marketing page and the authenticated app must remain separate experiences. If an existing login/dashboard/help route is not present, do not create a fake navigation destination or dead CTA. Use an in-page anchor or a clearly marked non-functional preview action until routing is decided.

## 6. Hero and product visual

### Suggested copy direction

**Eyebrow:** A workspace for connected knowledge  
**Headline:** Turn scattered sources into knowledge you can use.  
**Supporting copy:** Bring videos, articles, and documents together. Build an evidence-linked artifact, explore it through a focused chat, and shape it into a presentation or export.  
**Primary action:** Explore the workflow  
**Secondary action:** Preview an artifact

This is draft copy, not locked brand messaging. Keep the headline specific and readable; avoid generic claims like “the future of AI” or “unlock infinite productivity.”

### Visual composition

Create a custom, responsive product illustration using existing frontend tools (HTML/CSS/SVG) rather than a generic dashboard screenshot. Include a few source cards—video, article, document—moving visually toward a central artifact panel with title, thesis, key ideas, and linked citation markers. The artifact can sit beside a minimal chat pane with a couple of source attachment chips.

The visual should look like an intentional product preview, not a claim that every screen is already implemented. Give it realistic content density, clear spacing, small labels, and visible citations. If necessary, label it “Concept preview.”

## 7. Color direction

Recommendation: a warm paper surface, deep ink typography, and a confident indigo/cobalt action color. This preserves the existing product's indigo direction while making the public site warmer and more editorial. Use mint/teal sparingly for evidence or completed processing states, not as a second competing primary color.

| Token | Suggested value | Use |
| --- | --- | --- |
| Paper | `#F7F7F3` | Main background |
| Surface | `#FFFFFF` | Cards and artifact panel |
| Ink | `#111827` | Main text and dark bands |
| Slate | `#475569` | Secondary text |
| Muted | `#64748B` | Metadata and helper text |
| Border | `#E2E8F0` | Fine dividers and card edges |
| Primary | `#4F46E5` | Links, CTA, focus accent |
| Primary hover | `#4338CA` | CTA hover |
| Evidence accent | `#0F766E` | Citation/evidence detail, used sparingly |
| Accent surface | `#EEF2FF` | Soft primary backgrounds |

Keep body copy contrast strong. Do not use color alone to identify citations, status, or selected state. Verify contrast for all text and controls before delivery. A dark section may be used once for visual pacing, but the overall experience should remain light-first.

## 8. Typography, layout, and visual language

- Use the existing Geist font setup unless the implementation review finds a clear reason to change it. Do not add a font dependency casually.
- Use a restrained display scale: one expressive hero heading, clear section headings, readable body copy, and small but legible metadata.
- Use a centered content width around 1120–1240px, generous vertical spacing, and a consistent 8px-based spacing rhythm.
- Prefer thin borders, layered neutral surfaces, subtle shadows, and precise alignment over excessive glass, blur, gradients, or glowing outlines.
- Use one consistent corner-radius system. Avoid making every card a floating pill.
- Use small line icons only where they add meaning. Prefer inline SVG/CSS or an existing icon dependency; do not add a large icon package just for a few glyphs.
- The design should scale from a wide desktop hero to a single-column phone layout without shrinking the desktop composition into a tiny unreadable miniature.

## 9. Motion and micro-interactions

Motion should explain the source-to-knowledge relationship and make the interface feel responsive. Keep it short, quiet, and purposeful.

- On initial load, reveal the headline and supporting copy with a brief opacity/translate transition; do not delay content visibility.
- Animate source cards into the artifact area once as the hero visual enters the viewport. Use small staggered offsets and restrained duration.
- Let citation markers highlight or draw a subtle connector to the evidence card on hover/focus.
- Give buttons, nav links, and interactive cards a clear hover/focus/pressed state with small color, border, or 1–2px position changes.
- Allow a small preview tab/chip to switch the static hero mockup between “Artifact” and “Ask” states if the state transition can be implemented accessibly.
- Do not use scroll-jacking, parallax that harms reading, cursor-following effects, constant pulsing, long looping animations, or motion that blocks interaction.
- Respect `prefers-reduced-motion: reduce`; provide a static composition with the same information.
- Every animated element must remain understandable without animation and usable by keyboard and screen-reader users.

Prefer CSS transitions/keyframes for this single page unless the repository already includes a suitable motion library. Do not add Motion for React solely for decorative effects without a reason.

## 10. Responsive behavior

- Desktop: balanced text/visual hero; navigation and clear CTA; source-to-artifact visual shown at legible size.
- Tablet: preserve readable measure and reduce the visual's columns before shrinking text.
- Mobile: compact header, stacked hero, full-width CTA where appropriate, simplified artifact mockup, horizontally scrollable source chips only if keyboard and touch interaction remain clear.
- Do not hide core product explanation or evidence cues on mobile.
- Ensure focus does not become trapped in any interactive preview.

## 11. SEO and sharing metadata

Implement metadata through the current Next.js App Router conventions after reading the installed version's documentation:

- Unique title and meta description for PodFlow's knowledge-workspace positioning.
- Canonical URL based on a documented production base URL; do not invent a domain if none exists. Use a safe placeholder/configuration plan.
- Open Graph and social preview metadata with a designed image only if one exists; otherwise avoid broken image URLs.
- Semantic landmarks and a single descriptive H1; use ordered H2/H3 levels.
- Meaningful link labels, descriptive image alt text, and visible page content that remains server-rendered/indexable.
- Add sitemap and robots directives only with correct canonical host and actual routes. Do not accidentally block production crawling or index development routes.
- Use JSON-LD only if an accurate schema applies, such as SoftwareApplication; include no invented pricing, ratings, reviews, or aggregate scores.
- Avoid keyword stuffing, hidden text, duplicate headings, and generic boilerplate sections created only to target search engines.
- Keep content fast and lightweight. Avoid large autoplay video or unnecessary client-side JavaScript.

## 12. Accessibility and quality bar

- Semantic HTML, landmarks, descriptive link/button names, keyboard operation, visible focus, and correct heading order.
- WCAG AA contrast target for text and controls.
- Reduced-motion support and no information conveyed only through animation or color.
- Images/SVGs have appropriate accessible names or are hidden from assistive technology when decorative.
- Test at narrow mobile, tablet, and wide desktop sizes; check horizontal overflow.
- All controls in a non-functional preview must either have a real local interaction or be clearly non-interactive. No dead buttons.
- Keep copy concise and scannable; a visitor should understand what PodFlow does and who it helps in the first screenful.

## 13. Implementation boundary

This specification is for the public marketing landing page only. Do not implement dashboard, help center, auth, upload, chat, export, email, share-link backend, or connector functionality. The product visual can be a static, accessible mockup. Do not add dependencies unless they are needed, compatible with the installed Next.js 16.4.2/Bun project, and justified.

## 14. Acceptance checklist

- `/` explains PodFlow as a reusable knowledge workspace; email is not the main value proposition.
- The hero has one strong promise, concise supporting copy, and honest CTAs.
- The visual clearly communicates sources → evidence-backed artifact → presentation/chat/use.
- No fake testimonials, logos, metrics, compliance claims, or unsupported feature claims.
- SEO metadata and semantic page structure are complete and accurate.
- Motion is restrained, responsive, and disabled/reduced appropriately.
- The page works with keyboard, screen readers, and reduced-motion preference.
- The design is responsive and has no dead controls or horizontal overflow.
- Existing frontend architecture, package manager, and agent guidance are respected.
- Relevant frontend lint, typecheck, and production build pass after implementation.
