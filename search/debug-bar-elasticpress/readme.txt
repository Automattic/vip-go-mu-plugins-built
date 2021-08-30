=== Debug Bar ElasticPress ===
Contributors: tlovett1, 10up
Tags: debug, debug bar, elasticpress, elasticsearch
Requires at least: 4.6
Tested up to: 5.8
Requires PHP: 5.4
Stable tag: 2.1.0
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Extends the Debug Bar plugin for ElasticPress queries.

== Description ==

Adds an [ElasticPress](https://wordpress.org/plugins/elasticpress) panel to the [Debug Bar](https://wordpress.org/plugins/debug-bar/) plugin. Allows you to examine every ElasticPress query running on any given request.

= Requirements: =

* [ElasticPress 3.0+](https://wordpress.org/plugins/elasticpress)
* [Debug Bar 1.0+](https://wordpress.org/plugins/debug-bar/)
* PHP 5.4+

== Installation ==
1. Install [ElasticPress](https://wordpress.org/plugins/elasticpress).
2. Install [Debug Bar](https://wordpress.org/plugins/debug-bar/).
3. Install the plugin in WordPress.

== Changelog ==

= 2.1.0 =

Added:
* ElasticPress and Elasticsearch versions. Props to [@oscarssanchez](https://github.com/oscarssanchez) and [@felipeelia](https://github.com/felipeelia) via [#43](https://github.com/10up/debug-bar-elasticpress/pull/43)
* Log of bulk_index requests. Props [@felipeelia](https://github.com/felipeelia) via [#44](https://github.com/10up/debug-bar-elasticpress/pull/44)
* Warning when ElasticPress is indexing. Props [@nathanielks](https://github.com/nathanielks) and [@felipeelia](https://github.com/felipeelia) via [#45](https://github.com/10up/debug-bar-elasticpress/pull/45)

Changed:
* Only load CSS and JS files for logged-in users. Props [@cbratschi](https://github.com/cbratschi) and [@felipeelia](https://github.com/felipeelia) via [#47](https://github.com/10up/debug-bar-elasticpress/pull/47)

= 2.0.0 =
This release drops the support for older versions of WordPress Core, ElasticPress and Debug Bar.

* Code refactoring. Props [@felipeelia](https://github.com/felipeelia)
* Fixed Query Logs in EP Dashboard [@felipeelia](https://github.com/felipeelia)
* Fixed typo from "clsas" to "class" in the query output. Props [@Rahmon](https://github.com/Rahmon) 

= 1.4 =
* Support ElasticPress 3.0+

= 1.3 =
* Add query log

= 1.2 =
* Show query errors (i.e. cURL timeout)
* Add ?explain to query if GET param is set

= 1.1.1 =
* Only show query body if it exits

= 1.1 =
* Improve formatting
* Show original query args (EP 2.1+)

= 1.0 =
* Initial release
