# Accessibility Testing

## Purpose

Check that users can understand and operate the interface across keyboard, assistive technology, visual, and motion needs.

## Current repository checks

`frontend/e2e/marketing.spec.ts` runs axe-core at 375, 768, and 1280 px and checks a skip link, heading order, tab keyboard interaction, citation markers, mobile navigation, touch, and reduced motion. Run `bun run build` followed by `bun run test:e2e` from `frontend/`; Edge fallback is `$env:PW_CHANNEL="msedge"; bun run test:e2e` on Windows.

## Procedure

1. Review semantics: landmarks, accessible names, labels, heading structure, status announcements, and correct control roles/states.
2. Test keyboard-only operation, visible focus, logical tab order, Escape/arrow behavior, focus placement/restoration, and no keyboard trap.
3. Run axe against representative states, not only initial load. Manually assess contrast, zoom/reflow, target size, reduced motion, and screen-reader announcements; automated tools do not prove full conformance.
4. Check responsive states and interactive open/selected/error/empty states. Avoid hiding content from assistive tech unless the behavior is intentional.
5. Report violations with impact, element/location, and a reproducible state.

## Completion

No critical automated violation remains; keyboard and relevant manual checks pass; any known limitation is documented. State the tested browser, viewport, axe rules, and states.
