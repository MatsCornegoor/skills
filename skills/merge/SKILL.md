---
name: merge
description: Resolve git merge/rebase conflicts by understanding both sides' intent, not just picking one blindly. Use when user hits merge conflicts, asks to resolve conflicts, or runs into "CONFLICT" / conflict markers during a merge, rebase, or cherry-pick.
---

# Merge

Resolve merge conflicts by understanding *why* each side changed, not by pattern-matching markers.

## Workflow

1. Run `git status` to list all conflicted files. Handle one file at a time.
2. For each file, read the full conflict region plus surrounding context — don't operate on isolated `<<<<<<<` hunks blind.
3. For each hunk, understand intent of both sides before touching anything:
   - `git log --oneline -p <base>..HEAD -- <file>` for "ours"
   - `git log --oneline -p <base>..MERGE_HEAD -- <file>` for "theirs" (or the equivalent tip during a rebase/cherry-pick)
   - Check surrounding code for which change is still relevant (e.g. one side renamed something the other side still calls by the old name).
4. Classify each hunk:
   - **Same change, different form** (whitespace, reorder, trivial rename) — merge to the equivalent form, keep both intents.
   - **Additive, non-overlapping** (both sides added different things in the same spot) — keep both, order by dependency if it matters.
   - **Genuine conflict** (both sides changed the same behavior differently, or one side's change contradicts the other's assumption) — this needs a decision, go to step 5.
5. **When intent is ambiguous or the two sides genuinely disagree on behavior, stop and ask the user.** Present:
   - The file and the specific hunk (not the whole file).
   - What each side does and why (from the commit/PR context you found).
   - Your recommended resolution, if you have one, and why.
   - Do not guess-resolve a real behavioral conflict and move on silently.
6. After resolving a hunk, remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) — a leftover marker is a bug, always double check none remain in the file.
7. Once a file's conflicts are fully resolved, `git add` it, then move to the next file.
8. After all files are resolved: run the project's build/typecheck/tests if available before considering the merge done — a conflict can resolve cleanly and still break at runtime.
9. Do not run `git commit`, `git merge --continue`, `git rebase --continue`, or push — leave that to the user, unless they explicitly ask you to.

## Rules

- Never resolve a conflict by discarding one side wholesale unless it's truly superseded (e.g. dead code the other branch deleted for a reason visible in its commit message).
- Never resolve by keeping both hunks stacked with markers removed but logic untouched — that just hides the conflict instead of resolving it (e.g. two competing implementations of the same function left in sequence).
- If a conflict spans generated/lock files (package-lock.json, yarn.lock, Cargo.lock, etc.), regenerate them via the appropriate tool instead of hand-editing.
- If unsure whether a hunk is trivial or genuine, treat it as genuine and ask.
