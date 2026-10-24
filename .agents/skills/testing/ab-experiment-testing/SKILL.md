# A/B and Experiment Testing

## Purpose

Validate both the experiment mechanism and, separately, whether a treatment improves a product outcome. Do not call visual variants “A/B tested” when no valid random assignment and analysis exist.

## Before an experiment exists

PodFlow currently has no experiment assignment or analytics system. A/B infrastructure should be proposed only for a clear product question and privacy review; do not add tracking by default.

## Experiment implementation checks

1. Write one falsifiable hypothesis, one primary metric, guardrail metrics, eligible population, and stopping/decision rule before assignment.
2. Randomize at a stable user/workspace unit; verify assignment is consistent across sessions and the groups are mutually exclusive.
3. Test control and treatment rendering, exposure logging, eligibility exclusions, event deduplication, missing/late events, and no-treatment fallback.
4. Keep treatment behavior feature-flagged and ensure experiment identifiers do not leak private source content or sensitive identity.

## Outcome analysis

1. Estimate required sample size from baseline rate/variance, minimum meaningful effect, alpha, and power before launch. Do not peek repeatedly and stop when the result looks favorable.
2. Analyze the preselected primary metric and guardrails, confidence interval/effect size, sample-ratio mismatch, missing data, and segment imbalance.
3. Separate statistical evidence from product significance and operational safety. A statistically significant result may be too small or harmful on a guardrail.
4. Preserve analysis code/data definition and make a rollout/rollback decision with uncertainty documented.

## Completion

Report assignment validation and outcome analysis as separate results. Never claim product lift from implementation tests alone.
