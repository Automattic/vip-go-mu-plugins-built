---
name: setup-claude
description: Set up Claude Code for this project. Use when the user invokes /setup-claude, asks to "set up claude", or "create the skills symlink".
---

# Setup Claude

Run once after cloning to wire up Claude Code's skills symlink.

```bash
mkdir -p .claude
ln -sfn ../.agents/skills .claude/skills
```
