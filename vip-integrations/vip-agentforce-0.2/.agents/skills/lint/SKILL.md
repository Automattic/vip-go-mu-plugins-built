---
name: lint
description: Run linting, formatting, and type checking on changed files. Use when asked to "lint", "fix linting", "run linter", "check formatting", or "check types".
---

# Lint

Run after editing files. Fix all issues before finishing.

## Commands

```bash
# PHP — auto-fix coding standards
composer format

# PHP — verify clean
composer lint

# PHP — static analysis (PHPStan level 6)
composer analyze

# JS — lint with auto-fix
npm run lint:js:fix

# CSS — lint with auto-fix
npm run lint:css:fix

# All JS/CSS linters
npm run lint
```

## Workflow

1. Run PHP format first (`composer format`)
2. Run PHP lint to verify (`composer lint`)
3. Run PHPStan (`composer analyze`)
4. Run JS/CSS lint if frontend files changed (`npm run lint`)
5. If any check fails, fix errors and re-run — don't push until clean.

If only PHP files changed, skip JS/CSS checks. If only JS/CSS files changed, skip PHP checks.
