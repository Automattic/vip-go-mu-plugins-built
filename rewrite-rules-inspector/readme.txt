=== Rewrite Rules Inspector ===
Contributors: danielbachhuber, automattic, tmoorewp
Tags: rewrite rules, tools
Tested up to: 3.5.1
Requires at least: 3.1
Stable tag: 1.2.1

Straightforward WordPress admin tool for inspecting your rewrite rules

== Description ==

A straightforward WordPress admin tool for inspecting your rewrite rules. View a listing of all your rewrite rules, see which rewrite rules match a given URL (and the priorites they match in), or filter by different sources of rewrite rules. Perform a soft flush of your rewrite rules to regenerate them.

Originally developed for [WordPress.com VIP](http://vip.wordpress.com/)-hosted clients, we thought it would be useful for development environments, etc. too. Feel free to [fork the plugin in Github](https://github.com/Automattic/Rewrite-Rules-Inspector/) — pull requests are always welcome. Hit us with feedback, questions, bug reports, and feature requests in the forums.

== Screenshots ==

1. See which rewrite rules match a given URL (and the priorites they match in)
2. Error message appears if rewrite rules are missing in the database

== Changelog ==

= 1.2.1 (Sept. 19, 2013) =
* Fix for strict standards error in declaration of Rewrite_Rules_Inspector_List_Table::single_row(). props @simonhampel

= 1.2 (Jan. 16, 2013) =
* Modify the rewrite rule source with a filter. Props [jeremyfelt](https://github.com/jeremyfelt)

= 1.1 (Sept. 25, 2012) =
* Support for route matching when WordPress lives in a subdirectory. Props [dbernar1](https://github.com/dbernar1)
* Display a success message after you've flushed your rewrite rules

= 1.0 (May 9, 2012) =
* Initial public release!
* View a listing of all your rewrite rules
* See which rewrite rules match a given URL (and the priorites they match in)
* Filter by different sources of rewrite rules
* Error message appears if rewrite rules are missing in the database
