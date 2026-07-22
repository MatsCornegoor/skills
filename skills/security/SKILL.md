---
name: security
description: Browse a codebase for common security mistakes and write a report of findings. Use when the user wants a security audit, wants to find vulnerabilities, check for OWASP-style issues, or get a security review of the codebase.
---

# Security

Browse the codebase, identify common security mistakes, and produce a written report.

## Step 1 — Understand the stack

Use the Explore agent to survey the codebase. Identify:
- Language and framework
- Authentication / authorization mechanism
- Database / ORM in use
- How user input enters the system (forms, APIs, file uploads, query params)
- Secrets management (env vars, vaults, config files)

This determines which vulnerability classes are relevant.

## Step 2 — Scan for vulnerabilities

Use the Explore agent to find instances of the vulnerability classes from [ANTI-PATTERNS.md](ANTI-PATTERNS.md) that apply to the detected stack. For each finding, note:
- File and line number
- The specific vulnerability class
- A concrete fix

Collect all findings before writing the report.

## Step 3 — Write the report

Write the report using [REPORT-TEMPLATE.md](REPORT-TEMPLATE.md) and save it to `docs/security/YYYY-MM-DD-review.md`.

Group findings by severity: **Critical** (remotely exploitable, no auth required), **High** (exploitable with some precondition, e.g. auth or specific config), **Medium** (requires unusual conditions or limited impact), **Low** (defense-in-depth / hardening).
