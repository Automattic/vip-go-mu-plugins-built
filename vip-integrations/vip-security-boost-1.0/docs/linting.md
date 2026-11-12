# Linting and Static Analysis

This document outlines the tools and procedures for linting and static analysis in this project.

## PHPCS for checking coding standards

We check against the following standards/rulesets:

- [VIP Coding Standards](https://github.com/Automattic/VIP-Coding-Standards)
- [WordPress Coding Standards](https://github.com/WordPress/WordPress-Coding-Standards)
- [PHPCompatibilityWP Standard](https://github.com/PHPCompatibility/PHPCompatibilityWP)

The [`.phpcs.xml.dist`](https://docs.wpvip.com/technical-references/vip-codebase/phpcs-xml-dist/) file contains a _suggested_ configuration, but you are free to amend this. You can also [extend](https://docs.wpvip.com/technical-references/vip-codebase/phpcs-xml-dist/#h-extending-the-root-phpcs-xml-dist-file-for-custom-themes-and-plugins) it for more granularity of configuration for theme and custom plugins.

To run PHPCS, navigate to the directory where the relevant `.phpcs.xml.dist` lives, and type:

```sh
vendor/bin/phpcs
```

See the [PHPCS documentation](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Usage) (or run `phpcs -h`) for the available command line arguments.

## PHPStan for static analysis

We use [PHPStan](https://phpstan.org/) for static analysis to find potential bugs and improve code quality. It's configured in the `phpstan.neon` file.

To run PHPStan locally, use the following command:

```sh
composer analyze
```

This will run PHPStan with the configuration defined in `phpstan.neon`. The command is an alias for `vendor/bin/phpstan analyse --memory-limit=1024M`.

PHPStan is also part of our CI pipeline and runs automatically on every pull request.
