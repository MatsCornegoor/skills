# Agent Skills

Ten skills for real engineering work with Claude Code.

## Install

```bash
npx skills@latest add MatsCornegoor/skills
```

```bash
ln -s ~/.agents/skills/* ~/.claude/skills/
```

- **[/improve-codebase-architecture](./skills/improve-codebase-architecture/SKILL.md)** — Surface architectural friction and find deepening opportunities in a codebase.
- **[/grill-me](./skills/grill-me/SKILL.md)** — Get relentlessly interviewed about a plan until every branch of the decision tree is resolved.
- **[/sharpen](./skills/sharpen/SKILL.md)** — Grill session that also sharpens `CONTEXT.md` terminology and records ADRs inline as decisions crystallise.
- **[/to-spec](./skills/to-spec/SKILL.md)** — Synthesize the current conversation into a spec/PRD and publish it to the project issue tracker.
- **[/implement](./skills/implement/SKILL.md)** — Implement a spec or set of tickets test-first, one vertical slice at a time.
- **[/performance](./skills/performance/SKILL.md)** — Scan the codebase for common performance anti-patterns and write a structured report.
- **[/best-practices](./skills/best-practices/SKILL.md)** — Audit the codebase for missing or incomplete best practices (SEO, images, Sanity CMS, security, accessibility) and write a report.
- **[/security](./skills/security/SKILL.md)** — Scan the codebase for common security vulnerabilities (OWASP-style) and write a structured report.
- **[/write-a-skill](./skills/write-a-skill/SKILL.md)** — Create new agent skills with proper structure and bundled resources.
- **[/merge](./skills/merge/SKILL.md)** — Resolve merge conflicts by understanding both sides' intent, asking when unclear which to keep.

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
