---
name: performance
description: Browse a codebase for common performance mistakes and write a report of findings. Use when the user wants to audit performance, find performance anti-patterns, check for performance issues, or get a performance review of the codebase.
---

# Performance

Browse the codebase, identify common performance mistakes, and produce a written report.

## Step 1 — Understand the stack

Use the Explore agent to survey the codebase. Identify:
- Language and framework
- Database / ORM in use
- Frontend framework (if any)
- Any existing performance tooling or benchmarks

This determines which anti-patterns are relevant.

## Step 2 — Scan for anti-patterns

Use the Explore agent to find instances of the anti-patterns from [ANTI-PATTERNS.md](ANTI-PATTERNS.md) that apply to the detected stack. For each finding, note:
- File and line number
- The specific anti-pattern
- A concrete fix

Collect all findings before writing the report.

## Step 3 — Write the report

Write the report using [REPORT-TEMPLATE.md](REPORT-TEMPLATE.md) and save it to `docs/performance/YYYY-MM-DD-review.md`.

Group findings by severity: **High** (likely user-visible impact), **Medium** (cumulative or load-dependent), **Low** (minor or speculative).
