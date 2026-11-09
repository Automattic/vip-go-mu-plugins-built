# Changelog for the Rewrite Rules Inspector WordPress plugin
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2026-11-08

### Changed

- The inspector now generates the rewrite rules once per page load instead of twice, and attributes each rule to its source from the rules WordPress actually generated. by @sjinks in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/87

### Fixed

- The URL tester no longer emits PHP warnings for URLs without a path, such as `https://example.com`, or for URLs it can't parse. by @sjinks in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/83
- Searching for a URL now filters the rules list and tests the URL against the same path, the one WordPress routes. The query string and fragment are ignored, protocol-relative URLs work, and on sites installed in a subdirectory only the leading home directory is removed, so `/blog/blogroll/` is no longer tested as `roll/`. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/91

### Security

- Rule download requests now check the nonce and the user's capability before preparing any rules, and a search URL that can't be parsed no longer causes a fatal error. by @sjinks in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/84 and https://github.com/Automattic/Rewrite-Rules-Inspector/pull/88
- Requesting the main plugin file or the list table class directly now exits quietly instead of causing a fatal error that could reveal the server path. by @sjinks and @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/85
- Rule downloads now send the `X-Content-Type-Options: nosniff` header, so browsers don't guess the file's content type. by @sjinks in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/86

### Maintenance

- Releases are now published automatically from the tag, with the changelog entry as the release notes and an installable ZIP attached, and the WordPress.org deploy runs from the same tag. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/92
- The unit test suite now loads the plugin's classes, so `composer test:unit` passes again. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/90
- Integration tests now run on the PHP version each CI job is named for, including the minimum, PHP 7.4, and also run against WordPress 7.1. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/94
- Add contributing and security guides, and adopt the shared Automattic security policy, which takes vulnerability reports through HackerOne. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/80 and https://github.com/Automattic/Rewrite-Rules-Inspector/pull/81
- Add `AGENTS.md` with guidance for AI coding agents. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/73
- Leave development files out of release archives and the WordPress.org package. by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/71
- Update GitHub Actions dependencies. by @dependabot

## [1.6.0] - 2026-01-06

Minimum WordPress version is now 6.4.

### Changed

- chore: bump minimum WordPress version to 6.4 by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/61

### Documentation

- docs: add detailed explanation for "Flush Rules" functionality in README by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/59

### Maintenance

- chore: add wp-env configuration for local development by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/60
- chore: standardise .editorconfig file by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/62
- chore: normalise composer.json by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/63
- chore: standardise .gitignore and add .distignore by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/64
- ci: add Dependabot, lint scripts, and test infrastructure by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/64
- Composer(deps-dev): update rector/rector requirement from ^1.2 to ^2.2 by @dependabot in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/66
- Actions(deps): bump actions/checkout in the actions group by @dependabot in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/65
- chore: add CODEOWNERS file and migrate Dependabot reviewers by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/67
- ci: add integration test workflow and consolidate test bootstrap by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/68

## [1.5.1] - 2025-10-14

### Fixed

- fix: implicitly marking parameter as nullable is deprecated by @sjinks in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/55

### Changed

- refactor: Update UI to use tabs navigation by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/56

## [1.5.0] - 2025-10-14

### Added

- feat: Add permastructs table with descriptions and structures by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/48
- feat: Implement URL testing feature by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/51

### Fixed

- fix: undefined $match_path variable by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/47

### Maintenance

- CI: Refresh deploy.yml by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/43
- Composer: Update composer/installers by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/44
- Add Rector by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/45
- Update GitHub action to install SVN before deploy to WordPress.org by @raamdev in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/46
- refactor: Extract inline CSS and improve admin interface styling by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/49
- refactor: Restructure plugin architecture and enhance service organization by @GaryJones in https://github.com/Automattic/Rewrite-Rules-Inspector/pull/50

## [1.4.0] - 2024-05-21

- Increase minimum PHP version to 7.4.
- Increase minimum WordPress version to 5.9.
- Forcibly delete rules cache on flush.
- Fix escaping of URL for the Reset button.

## [1.3.1] - 2021-05-18

- Fix WordPress.org banner image filename.
- Load text domain, to allow translations.

## [1.3.0] - 2021-05-18

- Add the count of missing rules.
- Add license file, changelog, .editorconfig file, PHPCS config file, and GitHub Action to deploy to WordPress.org.
- Add Composer support.
- Use optimized call of `get_rules()`.
- Update admin screen title to use level 1 heading.
- Update documentation and screenshots. 
- Move classes to their own file.
- Fix some incorrect escapings.
- Fix issues with negative lookarounds by changing regex delimiter.
- Fix many coding standards violations.
- Remove call to deprecated `screen_icon()` function.

## [1.2.1] - 2013-09-19

- Fix for strict standards error in declaration of `Rewrite_Rules_Inspector_List_Table::single_row()`. Props [simonhampel](https://github.com/simonhampel).

## [1.2] - 2013-01-16

- Modify the rewrite rule source with a filter. Props [jeremyfelt](https://github.com/jeremyfelt).

## [1.1] - 2012-09-25

- Add support for route matching when WordPress lives in a subdirectory. Props [dbernar1](https://github.com/dbernar1).
- Display a success message after flushing the rewrite rules.

## [1.0] - 2012-05-09

- Initial public release!
- View a list of all the rewrite rules.
- See which rewrite rules match a given URL, and the priorities they match in.
- Filter by different sources of rewrite rules.
- An error message appears if rewrite rules are missing in the database.

[1.6.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.6.0...1.6.1
[1.6.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.5.1...1.6.0
[1.5.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.5.0...1.5.1
[1.5.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.3.1...1.4.0
[1.3.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.2.1...1.3.0
[1.2.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.2...1.2.1
[1.2]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.1...1.2
[1.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.0...1.1
[1.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/releases/tag/1.0
