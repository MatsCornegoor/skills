---
name: best-practices
description: Browse a codebase for missing or incomplete best practices and write a report of findings. Use when the user wants a best practices audit, wants to check what's missing, or asks about improvements like SEO, accessibility, security headers, or CMS integration quality.
---

# Best Practices

Browse the codebase, check which best practices are present or missing, and produce a written report.

## Step 1 — Detect the stack

Use the Explore agent to identify:
- Framework (Next.js, Remix, SvelteKit, etc.)
- CMS in use (Sanity, Contentful, etc.)
- Styling approach
- Deployment target

This determines which sections of [CHECKLIST.md](CHECKLIST.md) apply.

## Step 2 — Work through the checklist

Use the Explore agent to check each relevant item in [CHECKLIST.md](CHECKLIST.md). For each item, determine:
- **Present** — implemented and looks correct
- **Partial** — exists but incomplete or misconfigured
- **Missing** — not found at all

Be concrete: note the file and line where something is present, or what specifically is absent.

## Step 3 — Write the report

Write the report using [REPORT-TEMPLATE.md](REPORT-TEMPLATE.md) and save it to `docs/best-practices/YYYY-MM-DD-review.md`.

Only include categories that are relevant to the detected stack. Skip categories that clearly don't apply.
