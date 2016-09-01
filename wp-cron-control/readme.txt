=== WP-Cron Control ===
Contributors: tott, ethitter, automattic, batmoo
Tags: wp-cron, cron, cron jobs, post missed schedule, scheduled posts
Requires at least: 3.4
Tested up to: 4.6
Stable tag: 0.7.1

This plugin allows you to take control over the execution of cron jobs.

== Description ==

This plugin allows you to take control over the execution of cron jobs. It's mainly useful for sites that either don't get enough comments to ensure a frequent execution of wp-cron or for sites where the execution of cron via regular methods can cause race conditions resulting in multiple execution of wp-cron at the same time. It can also help when you run into posts that missed their schedule.

This plugin implements a secret parameter and ensures that cron jobs are only executed when this parameter is existing.

== Installation ==

* Install either via the WordPress.org plugin directory, or by uploading the files to your server.
* Activate the Plugin and ensure that you enable the feature in the plugins' settings screen
* Follow the instructions on the plugins' settings screen in order to set up a cron job that either calls `php wp-cron-control.php http://blog.address secret_string` or `wget -q "http://blog.address/wp-cron.php?doing_wp_cron&secret_string"`
* If you like to have a global secret string you can define it in your wp-config.php by adding `define( 'WP_CRON_CONTROL_SECRET', my_secret_string' );`

== Limitations ==

This plugin performs a `remove_action( 'sanitize_comment_cookies', 'wp_cron' );` call in order to disable the spawning of new cron processes via the regular WordPress method. If `wp_cron` is hooked in an other action or called directly this might cause trouble.

== Screenshots ==

1. Settings screen to enable/disable various features.

== ChangeLog ==

= Version 0.7.1 =

* Security hardening (better escaping, sanitization of saved values)
* Update plugin to use core's updated cron hook

= Version 0.7 =

* Remove unneeded use of `$wpdb->prepare()` that triggered PHP warnings because a second argument wasn't provided.
* Update interface text to be translatable.

= Version 0.6 =

* Make sure that validated wp-cron-control requests also are valid in wp-cron.php by setting the global $doing_wp_cron value

= Version 0.5 =

* Adjustments for improved cron locking introduced in WordPress 3.3 http://core.trac.wordpress.org/changeset/18659

= Version 0.4 =

* Implementing feedback from Yoast http://yoast.com/wp-plugin-review/wp-cron-control/, fixing button classes, more inline comments

= Version 0.3 =

* Added option to enable extra check that would search for missing jobs for scheduled posts and add them if necessary.

= Version 0.2 =

* Added capability check in settings page

= Version 0.1 =

* Initial version of this plugin.
