<?php
/**
 * Telemetry: Telemetry activation and event registration
 *
 * @package Parsely\Telemetry
 * @since   3.12.0
 */

declare(strict_types=1);

use Parsely\Telemetry\Telemetry_System;
use Parsely\Telemetry\Tracks;

require_once __DIR__ . '/class-telemetry-system.php';

// If in a VIP environment, prevent logging duplicate Tracks events.
if ( defined( 'VIP_GO_APP_ENVIRONMENT' ) ) {
	add_filter( 'wp_parsely_enable_telemetry_backend', '__return_false' );
}

add_action(
	'init',
	function (): void {
		// Initialize the JS tracking. It will handle if telemetry is enabled or not by itself.
		Telemetry_System::init_js_tracking();

		// Bail if wp-admin telemetry is not allowed.
		if ( false === Telemetry_System::is_wpadmin_telemetry_allowed() ) {
			return;
		}

		require_once __DIR__ . '/Events/recommended-widget.php';
		require_once __DIR__ . '/Events/settings.php';
		require_once __DIR__ . '/Tracks/class-tracks-event.php';
		require_once __DIR__ . '/Tracks/class-tracks-pixel.php';
		require_once __DIR__ . '/Tracks/class-tracks.php';

		$tracks = new Tracks();

		$tracks->register_events(
		// Recommended Widget events.
			array(
				'action_hook'   => 'delete_widget',
				'callable'      => 'Parsely\Telemetry\record_widget_deleted',
				'accepted_args' => 3,
			),
			array(
				'action_hook'   => 'widget_update_callback',
				'callable'      => 'Parsely\Telemetry\record_widget_updated',
				'accepted_args' => 4,
			),
			// Setting events.
			array(
				'action_hook' => 'load-parse-ly_page_parsely-settings',
				'callable'    => 'Parsely\Telemetry\record_settings_page_loaded',
			),
			array(
				'action_hook'   => 'update_option_parsely',
				'callable'      => 'Parsely\Telemetry\record_parsely_option_updated',
				'accepted_args' => 2,
			)
		);

		$tracks->run();
	}
);

// Attempt to enable the Pendo JavaScript library. It's up to the Pendo class to
// decide whether the library will be enabled.
if ( class_exists( '\Automattic\VIP\Telemetry\Pendo' ) ) {
	add_action(
		'admin_init',
		// @phpstan-ignore argument.type
		array( \Automattic\VIP\Telemetry\Pendo::class, 'enable_javascript_library' )
	);
}
