<?php
/**
 * Telemetry: Records events related to plugin options and settings page
 *
 * @package Parsely\Telemetry
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\Telemetry;

/**
 * Records an event whenever the Parsely option gets updated. The changed
 * values are included in the event.
 *
 * @since 3.12.0
 *
 * @param array<string, mixed> $old_values  The old option values.
 * @param array<string, mixed> $values      The new option values.
 * @param Telemetry_System     $telemetry_system The telemetry system to use.
 */
function record_parsely_option_updated(
	array $old_values,
	array $values,
	Telemetry_System $telemetry_system
): void {
	$all_keys = array_unique( array_merge( array_keys( $old_values ), array_keys( $values ) ) );

	// Get the option keys that got updated.
	$updated_keys = array_reduce(
		$all_keys,
		function ( array $carry, string $key ) use ( $old_values, $values ) {
			if ( (
					// The old key and the new key have the same value.
					isset( $old_values[ $key ] ) === isset( $values[ $key ] ) &&
					wp_json_encode( $old_values[ $key ] ) === wp_json_encode( $values[ $key ] )
				) ||
					'plugin_version' === $key // Ignoring the `plugin_version` key.
			) {
				return $carry;
			}

			// The values are different, we're marking the current key as changed.
			$carry[] = $key;

			return $carry;
		},
		array()
	);

	if ( count( $updated_keys ) === 0 ) {
		return;
	}

	$telemetry_system->record_event(
		'wpparsely_option_updated',
		array(
			'updated_keys' => $updated_keys,
		)
	);
}

/**
 * Records an event whenever the plugin settings page gets loaded.
 *
 * @since 3.12.0
 *
 * @param Telemetry_System $telemetry_system The telemetry system to use.
 */
function record_settings_page_loaded( Telemetry_System $telemetry_system ): void {
	if (
		! ( isset( $_SERVER['REQUEST_METHOD'] ) && 'GET' === $_SERVER['REQUEST_METHOD'] ) ||
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			( isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated'] )
	) {
		return;
	}

	$telemetry_system->record_event( 'wpparsely_settings_page_loaded' );
}
