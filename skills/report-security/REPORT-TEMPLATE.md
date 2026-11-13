# Security Review: <project or scope>

**Date**: YYYY-MM-DD
**Stack**: <language, framework, DB>
**Scope**: <directories or modules reviewed>

---

## Summary

X findings: Y critical, Z high, W medium, V low.

---

## Critical

### 1. <Vulnerability class> — `path/to/file.ts:line`

**Issue**: <one sentence describing the vulnerability and how it's exploitable>

**Fix**:
```diff
- vulnerable code
+ corrected code
```

### 2. ...

---

## High

### 1. <Vulnerability class> — `path/to/file.ts:line`

**Issue**: ...

**Fix**: ...

---

## Medium

### 1. ...

---

## Low

### 1. ...

---

## Out of scope

<Anything noticed but not reviewed — e.g. "infrastructure/deployment config not reviewed, dependency audit not run">
