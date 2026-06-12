# Coding

## Code Principles

- **Fewer codepaths, always.** Normalize data to a predictable shape upfront instead of branching on
  edge cases. `items = config.items ?? []` then one filter pass — not three nested `if` checks.

## Rules

- Do NOT refactor unrelated code. Only touch code directly required for the task.
- No cleanup passes, no style fixes outside your feature.
