# Visual Regression Testing

## Purpose

Detect unintended changes to rendered layout, typography, spacing, or color with repeatable screenshots.

## Current state

The repo has Playwright E2E checks but no screenshot-baseline workflow or visual comparison service. Avoid creating baselines until visual regression is an agreed quality gate and CI has a stable rendering environment.

## Procedure

1. Select stable routes/states that represent the design; mask truly dynamic content only when necessary and document masks.
2. Pin browser, OS/container, fonts, viewport, device scale factor, color scheme, motion preference, and animation state.
3. Capture a baseline from reviewed current design. For each change, inspect the changed image and diff; update baselines only when the visual change is intentional and reviewed.
4. Keep a small set across desktop/mobile and key interaction states; test accessibility and behavior separately.
5. Set pixel/region thresholds from repeatability measurements. Investigate shifts rather than broadening thresholds until failures disappear.

## Completion

Report route/state, runtime/browser/viewport, diff thresholds, intentional changes, and baseline review. A normal E2E pass does not equal visual regression coverage.
