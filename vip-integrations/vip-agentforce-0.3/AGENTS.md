# VIP Agentforce

WordPress VIP plugin integrating Salesforce Agentforce. PHP 8.1+, WordPress 6.7+, TypeScript/JS frontend.

**CRITICAL**: Before starting any task, run:

```bash
ls -1 agent_docs/
```

Read the files relevant to your task.

For local dev-env configuration, mock integration config, or temporary API
response shims, read `agent_docs/dev-environment.md` first. Use the gitignored
plugin-root `env.php` hook for local `VIP_AGENTFORCE_CONFIGS` and test-only
filters. Do not patch `.wpvip/plugin-loader.php` for local config or mocks
unless the task is specifically about the loader itself.

Check for memory files too:

```bash
ls -1 agent_docs/MEMORY/ 2>/dev/null
```

Then search for relevant ones:

```bash
grep -r -li "<keyword>" agent_docs/ 2>/dev/null
```

Replace `<keyword>` with terms relevant to your task. Read any matching files.

## Learning Mode

**Always enabled.** Whenever you make a mistake and discover the correct approach — whether corrected
by the user or self-discovered — record it immediately in `agent_docs/MEMORY/<TOPIC>.md`. Do not
wait until the end of the task.

```
- `<wrong thing>` is wrong. Correct: <right thing>.
```
