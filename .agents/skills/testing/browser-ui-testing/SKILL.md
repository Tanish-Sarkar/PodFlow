# Browser and UI Testing

## Purpose

Check browser-rendered behavior, responsive layouts, navigation, input interaction, focus, and browser-specific behavior. Use when touching frontend components, CSS, route metadata, or motion.

## Repository procedure

1. Read `frontend/AGENTS.md` before Next.js changes and consult the installed Next.js documentation for the exact API/version.
2. Build the production site and run the existing browser suite: from `frontend/`, `bun run build` then `bun run test:e2e`.
3. Preserve coverage at 375, 768, and 1280 px when changing shared layout; add a viewport only when a requirement needs it.
4. Verify navigation, hover/focus/touch where relevant, no-JavaScript content when SSR matters, reduced motion, and console errors.
5. Use the existing Edge fallback on Windows if Playwright Chromium is missing: `$env:PW_CHANNEL="msedge"; bun run test:e2e`.

## Cross-browser scope and completion

The current Playwright config defines Chromium only. Do not claim Firefox/WebKit coverage unless added and run. Keep assertions semantic (role/name/state) instead of brittle class selectors when possible. Report browser, viewport, build state, and exact failures. A screenshot alone is not an interaction or accessibility test.
