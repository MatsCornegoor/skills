---
name: optimize-performance
description: Optimize a website's performance in a measure-fix-remeasure loop, using agent-browser to measure each change and confirm it actually helped. Use when the user wants to optimize performance, make the site faster, improve Core Web Vitals or load times, or shrink the bundle.
---

# Optimize Performance

Loop: measure → fix one thing → re-measure → keep or revert. Repeat until nothing worthwhile is left. No report file: every change must be confirmed by a measurement.

## Step 1 — Understand the stack

Use the Explore agent to survey the codebase. Identify:
- Language and framework (e.g. Next.js)
- CMS in use (e.g. Sanity)
- Backend/auth platform (e.g. Appwrite)
- Build and start commands (`package.json` scripts)
- The key pages to measure: the homepage plus 2–3 heavy or important routes. Ask the user if it's unclear.

## Step 2 — Baseline

Always measure a **production build**, never the dev server. Dev numbers are meaningless for performance.

1. Build and start production (e.g. `npm run build && npm run start`). Save the build output: per-route JS sizes are a metric too.
2. For each key page, measure 3 times and take the median of each metric:
   ```bash
   agent-browser open <url>
   agent-browser wait 2000
   agent-browser eval "$(cat <skill-dir>/measure.js)"
   agent-browser close
   ```
   Close the browser between runs so every run starts with a cold cache.
   [measure.js](measure.js) returns TTFB, FCP, LCP, CLS, load time, request count, total transfer KB and JS KB.
3. Also run `agent-browser network requests` once per page to see what loads: oversized images, duplicate requests, render-blocking third-party scripts.
4. Show the user the baseline table before changing anything.

## Step 3 — Find candidates

Use the Explore agent to find instances from [ANTI-PATTERNS.md](ANTI-PATTERNS.md) that apply to the stack, and combine them with what the baseline showed (the largest requests, the slowest metric). Rank the candidates by expected impact on the worst metric first.

## Step 4 — Loop

For each candidate, highest impact first:

1. Make **one** focused change.
2. Rebuild and re-measure the affected pages exactly as in the baseline (3 runs, median).
3. **Keep** the change if it improves a metric beyond run-to-run noise without regressing another. **Revert** it if it doesn't. A change that "should" help but doesn't show up in the numbers gets reverted.
4. Check that the page still works and looks right: `agent-browser screenshot` and `agent-browser console` (no new errors).
5. Log the result in a running table: change, metric before → after, kept/reverted.

Stop when the candidates run out, or 3 changes in a row give no measurable gain. If something big needs an architectural or product decision (dropping a library, changing rendering strategy, removing a feature), ask the user instead of doing it.

## Step 5 — Wrap up

Do a final full measurement of all key pages. Give the user, in chat:
- A baseline vs final table per page
- The kept changes, each with its measured gain
- The reverted attempts, in one line each
- Any remaining opportunities that need a decision from them

## Rules

- Never claim an improvement without a measurement that shows it.
- One change per measurement, otherwise you can't tell what helped.
- Don't trade correctness or visuals for speed without asking.
