<?php
/**
 * Telemetry: Records events related to the Recommended Widget
 *
 * @package Parsely\Telemetry
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\Telemetry;

use WP_Widget;

/**
 * This is determined by the value passed to the `WP_Widget` constructor.
 *
 * @see https://github.com/Parsely/wp-parsely/blob/e9f1b8cd1a94743e068681a8106176d23857992d/src/class-parsely-recommended-widget.php#L28
 */
const PARSELY_RECOMMENDED_WIDGET_BASE_ID = 'parsely_recommended_widget';

/**
 * Records an event whenever a Recommended Widget instance gets deleted.
 *
 * @since 3.12.0
 *
 * @param string           $widget_id ID of the widget marked for deletion.
 * @param string           $sidebar_id ID of the sidebar the widget was deleted from.
 * @param string           $id_base ID base for the widget.
 * @param Telemetry_System $telemetry_system The Telemetry System to use.
 */
function record_widget_deleted(
	string $widget_id,
	string $sidebar_id,
	string $id_base,
	Telemetry_System $telemetry_system
): void {
	if ( strtolower( PARSELY_RECOMMENDED_WIDGET_BASE_ID ) !== strtolower( $id_base ) ) {
		return;
	}

	$telemetry_system->record_event(
		'wpparsely_delete_widget',
		array(
			'id_base' => $id_base,
		)
	);
}

/**
 * Records an event whenever a Recommended Widget instance gets updated.
 *
 * @since 3.12.0
 *
 * @param array<string, mixed>|false $instance The current widget instance's settings.
 * @param array<string, mixed>|null  $new_instance Array of new widget settings.
 * @param array<string, mixed>|null  $old_instance Array of old widget settings.
 * @param WP_Widget                  $widget_obj The current widget instance.
 * @param Telemetry_System           $telemetry_system The Telemetry System to use.
 * @return array<string, mixed>|false The updated widget settings.
 */
function record_widget_updated(
	$instance,
	?array $new_instance,
	?array $old_instance,
	WP_Widget $widget_obj,
	Telemetry_System $telemetry_system
) {
	if ( ! is_array( $instance ) ) {
		return $instance;
	}

	$id_base = $widget_obj->id_base;
	if ( PARSELY_RECOMMENDED_WIDGET_BASE_ID !== $id_base ) {
		return $instance;
	}

	global $wp;

	if (
	isset( $wp->query_vars['rest_route'] ) &&
		'/wp/v2/widget-types/parsely_recommended_widget/encode' === $wp->query_vars['rest_route']
	) {
		// This is an "encode" call to preview the widget in the admin.
		// Track this event separately.
		$telemetry_system->record_event(
			'wpparsely_widget_prepublish_change',
			compact( 'id_base' )
		);
		return $instance;
	}

	if ( null === $old_instance ) {
		// If there is no old instance, all keys are updated. We have this
		// shortcut so we don't have to do `array_keys` of null, thus raising a
		// warning.
		$updated_keys = array_keys( $instance );
	} else {
		$all_keys = array_unique(
			array_merge( array_keys( $old_instance ), array_keys( $instance ) )
		);

		$updated_keys = array_reduce(
			$all_keys,
			function ( array $carry, string $key ) use ( $old_instance, $instance ) {
				if (
					isset( $old_instance[ $key ] ) === isset( $instance[ $key ] ) &&
					wp_json_encode( $old_instance[ $key ] ) === wp_json_encode( $instance[ $key ] )
				) {
					return $carry;
				}
				$carry[] = $key;

				return $carry;
			},
			array()
		);
	}

	if ( 0 < count( $updated_keys ) ) {
		$telemetry_system->record_event(
			'wpparsely_widget_updated',
			array(
				'updated_keys' => $updated_keys,
				'id_base'      => $id_base,
			)
		);
	}

	return $instance;
}
