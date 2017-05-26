# Cron Control

Execute WordPress cron events in parallel, using a custom post type for event storage.

Using REST API endpoints (requires WordPress 4.4+), an event queue is produced and events are triggered.

## Event Concurrency

In some circumstances, multiple events with the same action can safely run in parallel. This is usually not the case, largely due to Core's alloptions, but sometimes an event is written in a way that we can support concurrent executions.

To allow concurrency for your event, and to specify the level of concurrency, please hook the `a8c_cron_control_concurrent_event_whitelist` filter as in the following example:

``` php
add_filter( 'a8c_cron_control_concurrent_event_whitelist', function( $wh ) {
	$wh['my_custom_event'] = 2;

	return $wh;
} );
```
