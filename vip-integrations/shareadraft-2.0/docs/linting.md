# Linting and coding standards

Linting is powered by [PHP_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer)
with the [WordPress VIP](https://github.com/Automattic/VIP-Coding-Standards) and
[WordPress](https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards)
rulesets, plus [PHPCompatibilityWP](https://github.com/PHPCompatibility/PHPCompatibilityWP)
pinned to the VIP platform PHP baseline. The ruleset lives in
[`phpcs.xml.dist`](../phpcs.xml.dist).

JavaScript in `src/` is linted by [`@wordpress/scripts`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)
(ESLint with the WordPress ruleset, including Prettier formatting).

| Purpose                    | Command                      |
| -------------------------- | ---------------------------- |
| Check (PHP)                | `composer phpcs`             |
| Auto-fix what can be fixed | `composer phpcbf`            |
| Static analysis (PHPStan)  | `composer phpstan`           |
| Check (JavaScript)         | `npm run lint:js`            |
| Auto-fix JavaScript        | `npm run lint:js -- --fix`   |

CI runs both on every push and pull request (`lint.yml`,
`static-code-analysis.yml`).
