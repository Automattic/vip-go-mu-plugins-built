# Linting

## Post-Edit Tasks

Only run lint, tests, or self-review when **explicitly asked**. Do not run them automatically after
completing feature work.

### PHP Lint Fix Workflow

```bash
# Auto-fix coding standards
composer format

# Verify — should return clean
composer lint

# Static analysis
composer analyze
```

### JS/CSS Lint Fix Workflow

```bash
npm run lint:js:fix
npm run lint:css:fix

# Verify
npm run lint
```
