# Changelog

All notable changes to this project will be documented in this file, per [the Keep a Changelog standard](http://keepachangelog.com/).

## [Unreleased]

## [2.1.1] - 2022-08-04

### Security
- Fix XSS vulnerability. Props [@piotr-bajer](https://github.com/piotr-bajer) and [@felipeelia](https://github.com/felipeelia) via [#52](https://github.com/10up/debug-bar-elasticpress/pull/52).
- Bumped `path-parse` from 1.0.6 to 1.0.7. Props [@dependabot](https://github.com/dependabot) via [#49](https://github.com/10up/debug-bar-elasticpress/pull/49).
- Bumps `minimist` from 1.2.5 to 1.2.6. Props [@dependabot](https://github.com/dependabot) via [#51](https://github.com/10up/debug-bar-elasticpress/pull/51).
- Bumps `ansi-regex` from 5.0.0 to 5.0.1. Props [@dependabot](https://github.com/dependabot) via [#53](https://github.com/10up/debug-bar-elasticpress/pull/53).

## [2.1.0] - 2021-08-09

### Added
* ElasticPress and Elasticsearch versions. Props to [@oscarssanchez](https://github.com/oscarssanchez) and [@felipeelia](https://github.com/felipeelia) via [#43](https://github.com/10up/debug-bar-elasticpress/pull/43)
* Log of bulk_index requests. Props [@felipeelia](https://github.com/felipeelia) via [#44](https://github.com/10up/debug-bar-elasticpress/pull/44)
* Warning when ElasticPress is indexing. Props [@nathanielks](https://github.com/nathanielks) and [@felipeelia](https://github.com/felipeelia) via [#45](https://github.com/10up/debug-bar-elasticpress/pull/45)

### Changed
* Only load CSS and JS files for logged-in users. Props [@cbratschi](https://github.com/cbratschi) and [@felipeelia](https://github.com/felipeelia) via [#47](https://github.com/10up/debug-bar-elasticpress/pull/47)

## [2.0.0] - 2021-04-19

This release drops the support for older versions of WordPress Core, ElasticPress and Debug Bar.

* Code refactoring. Props [@felipeelia](https://github.com/felipeelia)
* Fixed Query Logs in EP Dashboard [@felipeelia](https://github.com/felipeelia)
* Fixed typo from "clsas" to "class" in the query output. Props [@Rahmon](https://github.com/Rahmon) 

## [1.4] - 2019-03-01
* Support ElasticPress 3.0+

## [1.3] - 2017-08-23
* Add query log

## [1.2] - 2017-03-15
* Show query errors (i.e. cURL timeout)
* Add ?explain to query if GET param is set

## [1.1.1] - 2016-12-13
* Only show query body if it exits

## [1.1] - 2016-07-25
* Improve formatting
* Show original query args (EP 2.1+)

## [1.0] - 2016-01-20
* Initial release

[Unreleased]: https://github.com/10up/debug-bar-elasticpress/compare/trunk...develop
[2.1.1]: https://github.com/10up/debug-bar-elasticpress/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/10up/debug-bar-elasticpress/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/10up/debug-bar-elasticpress/compare/1.4...2.0.0
[1.4]: https://github.com/10up/debug-bar-elasticpress/compare/1.3...1.4
[1.3]: https://github.com/10up/debug-bar-elasticpress/compare/1.2...1.3
[1.2]: https://github.com/10up/debug-bar-elasticpress/compare/1.1.1...1.2
[1.1.1]: https://github.com/10up/debug-bar-elasticpress/compare/1.1...1.1.1
[1.1]: https://github.com/10up/debug-bar-elasticpress/compare/55102f1...1.1
[1.0]: https://github.com/10up/debug-bar-elasticpress/tree/55102f1b
