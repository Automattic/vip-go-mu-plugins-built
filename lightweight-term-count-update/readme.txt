=== Cronify Term Count Update ===
Contributors: Automattic, alleyinteractive
Tags: performance, post-save
Requires at least: 4.7
Tested up to: 4.7.3
Stable tag: 0.1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

This plugin deferres the _update_term_count_on_transition_post_status action to cron

== Description ==

Sometimes the term count update hooked to the transition_post_status action may slow down the post_save action. This plugin offloads the action to cron, so it does no block the post_save action.

== Installation ==

1. Upload this plugin to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress

== Changelog ==

= 0.1.0 =
Initial version
