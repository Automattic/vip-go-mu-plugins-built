---
name: update-agent-context
description: Update agent context files for this project. Use when the user invokes /update-agent-context, asks to "update agent docs", "update CLAUDE.md", "update AGENTS.md", "add to agent_docs", "record a correction", or mentions updating context for a specific topic.
---

# Update Agent Context

Updates any part of the agent instruction layer: `AGENTS.md`, `CLAUDE.md`, `CLAUDE.local.md`,
`agent_docs/`, `agent_docs_local/`, or `agent_docs/MEMORY/`.

**Accepts an optional topic** — e.g. `/update-agent-context testing` or `/update-agent-context linting`.
If no topic is given, infer from the current task context.

## What to Update

| File / Folder                   | When                                                                 |
| ------------------------------- | -------------------------------------------------------------------- |
| `AGENTS.md`                     | Always-run instructions changed                                      |
| `CLAUDE.md` / `CLAUDE.local.md` | Discovery or setup instructions changed                              |
| `agent_docs/<topic>.md`         | Stable pattern learned — would have saved time if documented earlier |
| `agent_docs_local/<topic>.md`   | Machine-specific override or local workaround                        |
| `agent_docs/MEMORY/<TOPIC>.md`  | Mistake made and correct approach found — record immediately         |

## Two-Layer Rule

- `AGENTS.md` and `agent_docs/` are **universal** — fully self-contained, no global Claude assumptions
- `CLAUDE.md`, `CLAUDE.local.md`, `agent_docs_local/` are **personal Claude layer** — may reference
  developer machine config

## Rules

- Update **at the same time** as the code change, not after
- Keep entries actionable — commands, not prose
- `agent_docs/` is for stable patterns; `MEMORY/` is for corrections and gotchas
- Prefer editing an existing file over creating a new one
- Run prettier after editing:

```bash
npx prettier --write AGENTS.md CLAUDE.md CLAUDE.local.md agent_docs/*.md agent_docs_local/*.md 2>/dev/null
```

## Memory Entry Format

```
- `<wrong thing>` is wrong. Correct: <right thing>.
```

One bullet per correction. Specific, terse, immediately usable.
