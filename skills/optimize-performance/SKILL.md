---
name: optimize-performance
description: Optimize a website's performance in a measure-fix-remeasure loop, using agent-browser to measure each change and confirm it actually helped. Covers load speed (Core Web Vitals, bundle size) and runtime smoothness (framerate, jank, animation, scroll, canvas/WebGL). Use when the user wants to optimize performance, make the site faster, improve Core Web Vitals or load times, shrink the bundle, fix janky animations or scrolling, raise the framerate, or speed up canvas/WebGL rendering.
---

# Optimize Performance

Loop: measure → fix one thing → re-measure → keep or revert. Repeat until nothing worthwhile is left. No report file: every change must be confirmed by a measurement.

## Step 1 — Understand the stack

Use the Explore agent to survey the codebase. Identify:
- Language and framework (e.g. Next.js)
- CMS in use (e.g. Sanity)
- Backend/auth platform (e.g. Appwrite)
- Build and start commands (`package.json` scripts)
- Animation, scroll and rendering libraries (e.g. GSAP, Framer Motion, Lenis, Lottie, three.js / React Three Fiber, PixiJS) and any hand-written `<canvas>` or `requestAnimationFrame` loops
- The key pages to measure: the homepage plus 2–3 heavy or important routes. Ask the user if it's unclear.
- Which of those pages have heavy motion: canvas/WebGL scenes, scroll-driven animation, looping animations, long lists. These also get a runtime baseline in Step 2.

## Step 2 — Baseline

Always measure a **production build**, never the dev server. Dev numbers are meaningless for performance.

1. Build and start production (e.g. `npm run build && npm run start`). Save the build output: per-route JS sizes are a metric too.
2. **Load** — for each key page, measure 3 times and take the median of each metric:
   ```bash
   agent-browser open <url>
   agent-browser wait 2000
   agent-browser eval "$(cat <skill-dir>/measure.js)"
   agent-browser close
   ```
   Close the browser between runs so every run starts with a cold cache.
   [measure.js](measure.js) returns TTFB, FCP, LCP, CLS, load time, request count, total transfer KB and JS KB.
3. Also run `agent-browser network requests` once per page to see what loads: oversized images, duplicate requests, render-blocking third-party scripts.
4. **Runtime** — for each page with heavy motion, measure framerate with [frames.js](frames.js) in two modes, 3 runs each, median:
   ```bash
   agent-browser open <url>
   agent-browser wait 3000
   agent-browser eval "window.__frames = { ms: 5000 }; $(cat <skill-dir>/frames.js)"                # idle: page just running its animations
   agent-browser eval "window.__frames = { ms: 5000, scroll: true }; $(cat <skill-dir>/frames.js)"  # scrolls top → bottom while measuring
   agent-browser close
   ```
   It returns fps, frame-time p50/p95/p99/max, dropped frames, long frames, blocking ms, JS heap and (in Chromium) the worst scripts behind long frames. Judge by **p95 frame time and dropped %**, not average fps: an average of 58 fps can hide visible stutters.
   For a specific interaction (opening a menu, a hover effect, dragging in a canvas), trigger it with agent-browser (`click`, `hover`, `scroll`) right after starting the measurement, or ask the user which interaction feels janky.
   Headless browsers often render canvas/WebGL without a GPU, so absolute numbers can be worse than on a real device. Only compare runs made in the same mode, and if the numbers look implausibly low, check `agent-browser --help` for a headed mode.
   Run the idle measurement twice in a row on the same open page; if `heapMB` keeps climbing, something leaks (undisposed textures, listeners, growing arrays).
5. Show the user the baseline table before changing anything.

## Step 3 — Find candidates

Use the Explore agent to find instances from [ANTI-PATTERNS.md](ANTI-PATTERNS.md) that apply to the stack, and combine them with what the baseline showed (the largest requests, the slowest metric, the `worstScripts` behind long frames). Rank the candidates by expected impact on the worst metric first.

## Step 4 — Loop

For each candidate, highest impact first:

1. Make **one** focused change.
2. Rebuild and re-measure the affected pages exactly as in the baseline (3 runs, median), load and runtime both, so a load win that costs framerate (or the other way round) gets caught.
3. **Keep** the change if it improves a metric beyond run-to-run noise without regressing another. **Revert** it if it doesn't. A change that "should" help but doesn't show up in the numbers gets reverted.
4. Check that the page still works and looks right: `agent-browser screenshot` and `agent-browser console` (no new errors). For animation changes, take a few screenshots during the animation and compare them with before: easing, timing and visual quality must stay the same. If you can't verify motion this way, ask the user to look.
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
- Don't trade correctness or visuals for speed without asking. That includes lowering canvas resolution or pixel ratio, cutting particle or object counts, shortening or removing animations, and turning off antialiasing or effects.
