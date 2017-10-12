=== Cron Control ===
Contributors: automattic, ethitter
Tags: cron, cron control, concurrency, parallel, async
Requires at least: 4.4
Tested up to: 4.9
Requires PHP: 7.0
Stable tag: 2.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Execute WordPress cron events in parallel, with custom event storage for high-volume cron.

== Description ==

Execute WordPress cron events in parallel, with custom event storage for high-volume cron.

Using REST API endpoints (requires WordPress 4.4+), or a Golang daemon, an event queue is produced and events are triggered.

== Installation ==

1. Define `WP_CRON_CONTROL_SECRET` in `wp-config.php`
1. Upload the `cron-control` directory to the `/wp-content/mu-plugins/` directory
1. Create a file at `/wp-content/mu-plugins/cron-control.php` to load `/wp-content/mu-plugins/cron-control/cron-control.php`

== Frequently Asked Questions ==

= Why is PHP 7 required? =

To be able to catch fatal errors triggered by event callbacks, and define arrays in constants (such as for adding "Internal Events"), PHP 7 is necessary.

= Adding Internal Events =

**This should be done sparingly as "Internal Events" bypass certain locks and limits built into the plugin.** Overuse will lead to unexpected resource usage, and likely resource exhaustion.

In `wp-config.php` or a similarly-early and appropriate place, define `CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS` as an array of arrays like:

```
define( 'CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS', array(
array(
	'schedule' => 'hourly',
	'action'   => 'do_a_thing',
	'callback' => '__return_true',
),
) );
```

Due to the early loading (to limit additions), the `action` and `callback` generally can't directly reference any Core, plugin, or theme code. Since WordPress uses actions to trigger cron, class methods can be referenced, so long as the class name is not dynamically referenced. For example:

```
define( 'CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS', array(
array(
	'schedule' => 'hourly',
	'action'   => 'do_a_thing',
	'callback' => array( 'Some_Class', 'some_method' ),
),
) );
```

Take care to reference the full namespace when appropriate.

= Increasing Event Concurrency =

In some circumstances, multiple events with the same action can safely run in parallel. This is usually not the case, largely due to Core's alloptions, but sometimes an event is written in a way that we can support concurrent executions.

To allow concurrency for your event, and to specify the level of concurrency, please hook the `a8c_cron_control_concurrent_event_whitelist` filter as in the following example:

```
add_filter( 'a8c_cron_control_concurrent_event_whitelist', function( $wh ) {
$wh['my_custom_event'] = 2;

return $wh;
} );
```

== Changelog ==

= 2.0 =
* Support additional Internal Events
* Break large cron queues into several caches
* Introduce Golang runner to execute cron
* Support concurrency for whitelisted events

= 1.5 =
* Convert from custom post type to custom table with proper indices

= 1.0 =
* Initial release
