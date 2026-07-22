---
name: debug
description: Drive a build or a running app to a clean, error-free state by looping fix-and-recheck until nothing is left to fix. Use when user says "debug this", wants a broken build fixed, or wants console/browser errors cleared.
---

# Debug

Two distinct targets live under this skill. If the user's request doesn't make it obvious which one they mean, ask before starting:

- **build** — the project doesn't build/compile/typecheck cleanly.
- **browser** — the running app throws errors in the browser console.

Don't guess between them when both are plausible (e.g. "fix the errors") — one wrong loop wastes a lot of turns.

## Mode: build

Goal: a clean, successful build. Loop until it is.

1. Determine the build command: check `package.json` scripts (`build`, `typecheck`, `lint`), or `Makefile`, or ask the user if neither is obvious. Prefer the most complete command available (e.g. `build` over just `typecheck`) unless the user names a specific one.
2. Run it via the terminal tool. Read the full error output, not just the first line — later errors sometimes explain earlier ones (missing export causing a cascade of type errors, etc).
3. Fix the root cause of the first real error. Don't silence errors (`// @ts-ignore`, `any` casts, deleting a failing check) unless the user explicitly asks for that — that's hiding the bug, not fixing it.
4. Re-run the build. Repeat from step 2.
5. Stop when the build exits clean. If the same error persists after a fix, re-read the surrounding code before trying again — don't repeat an identical fix that already failed.
6. If progress stalls (3+ attempts on the same error with no new information), stop and ask the user rather than continuing to guess.

## Mode: browser

Goal: no errors in the browser console while using the app. Loop until it is.

1. Make sure the app is running (use the project's own run skill/dev command if one exists; otherwise start it and wait for it to be ready).
2. Use `agent-browser` (or the `claude-in-chrome` skill if that's what's available in this environment) to open the app and read the console log.
3. For each console error: find the file/line it points to, read the surrounding code, and fix the root cause. Exercise the actual user flow that triggers it (navigate, click, submit) rather than only checking the landing page — errors often only fire on specific interactions.
4. Reload / re-navigate and re-check the console.
5. Repeat until the console is clean across the golden path and the flows touched by the errors you fixed. Don't stop after the first reload if you haven't re-exercised every flow that originally errored.
6. If an error's cause isn't reachable from the code (e.g. a third-party script, a browser extension, a CORS/network issue outside the app's control), say so explicitly instead of forcing an unrelated code change.

## Rules

- Never mark either mode "done" without a final clean run — a build that "should" pass now isn't the same as one that just did.
- Don't fix unrelated warnings/lint issues you notice along the way unless asked; stay scoped to what's actually broken.
