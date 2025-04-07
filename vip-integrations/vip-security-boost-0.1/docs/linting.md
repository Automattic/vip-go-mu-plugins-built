## PHPCS for checking coding standards

We check against the following standards/rulesets

- [VIP Coding Standards](https://github.com/Automattic/VIP-Coding-Standards)
- [WordPress Coding Standards](https://github.com/WordPress/WordPress-Coding-Standards)
- [PHPCompatibilityWP Standard](https://github.com/PHPCompatibility/PHPCompatibilityWP)

The [`.phpcs.xml.dist`](https://docs.wpvip.com/technical-references/vip-codebase/phpcs-xml-dist/) file contains a _suggested_ configuration, but you are free to amend this. You can also [extend](https://docs.wpvip.com/technical-references/vip-codebase/phpcs-xml-dist/#h-extending-the-root-phpcs-xml-dist-file-for-custom-themes-and-plugins) it for more granularity of configuration for theme and custom plugins.

To run PHPCS, navigate to the directory where the relevant `.phpcs.xml.dist` lives, and type:

```sh
vendor/bin/phpcs
```

See the [PHPCS documentation](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Usage) (or run `phpcs -h`) for the available command line arguments.
