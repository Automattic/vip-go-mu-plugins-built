# Changelog for the Rewrite Rules Inspector WordPress plugin
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.4.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.3.1...1.4.0
[1.3.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.2.1...1.3.0
[1.2.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.2...1.2.1
[1.2]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.1...1.2
[1.1]: https://github.com/Automattic/Rewrite-Rules-Inspector/compare/1.0...1.1
[1.0]: https://github.com/Automattic/Rewrite-Rules-Inspector/releases/tag/1.0
