# Agent Skills

Six skills for real engineering work with Claude Code.

## Install

```bash
npx skills@latest add MatsCornegoor/skills
```

```bash
ln -s ~/.agents/skills ~/.claude/skills
```

- **[/sharpen](./skills/sharpen/SKILL.md)** — Grill session that also sharpens `CONTEXT.md` terminology and records ADRs inline as decisions crystallise.
- **[/optimize-performance](./skills/optimize-performance/SKILL.md)** — Loop measure-fix-remeasure with agent-browser until the site loads fast and runs smooth (framerate, animation, scroll, canvas/WebGL), keeping only changes that measurably help.
- **[/report-best-practices](./skills/report-best-practices/SKILL.md)** — Audit the codebase for missing or incomplete best practices (SEO, images, Sanity CMS, security, accessibility) and write a report.
- **[/report-security](./skills/report-security/SKILL.md)** — Scan the codebase for common security vulnerabilities (OWASP-style) and write a structured report.
- **[/merge](./skills/merge/SKILL.md)** — Resolve merge conflicts by understanding both sides' intent, asking when unclear which to keep.
- **[/debug](./skills/debug/SKILL.md)** — Loop fix-and-recheck on a broken build or a browser console full of errors until it's clean.

## Other tools

### Agent browser

Browser automation CLI for AI agents. Fast native Rust CLI.

```bash
npm install -g agent-browser
agent-browser install
```

```bash
npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser
```
