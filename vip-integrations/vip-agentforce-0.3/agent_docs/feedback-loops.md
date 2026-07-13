# Feedback Loops

**Every change MUST have a verification command.** Run the relevant checks locally before finishing.
Agents: only run these when explicitly asked — but know which checks apply to your change.

Run checks in this order (validates correctness fastest first):

| Check  | Details                                 |
| ------ | --------------------------------------- |
| Types  | See `linting.md` (PHPStan) — gate check, code won't run if this fails |
| Logs   | See `dev-environment.md` — Logs         |
| WP-CLI | See `dev-environment.md` — WP-CLI       |
| Shell  | See `dev-environment.md` — Shell        |
| REST   | See `visual-verification.md` — REST API |
| DB     | See `dev-environment.md` — Database     |
| Visual | See `visual-verification.md`            |
| Cron   | See `dev-environment.md` — Cron         |
| Tests  | See `testing.md`                        |
| Lint   | See `linting.md` — cosmetic, run last   |

**Don't play whack-a-mole.** Run ALL relevant checks before pushing, not just the one you think you fixed.