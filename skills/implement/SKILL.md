---
name: implement
description: Implement a piece of work based on a spec or set of tickets.
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Work test-first at the pre-agreed seams: write a failing test, make it pass with the minimum code, then refactor before moving to the next slice. One vertical slice at a time.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.
