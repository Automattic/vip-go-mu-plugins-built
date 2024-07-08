<?php
/**
 * Telemetry: Telemetry System abstract class
 *
 * @package Parsely\Telemetry
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\Telemetry;

use WP_Error;
use function Parsely\Utils\get_asset_info;
use const Parsely\PARSELY_FILE;
use const Parsely\PARSELY_VERSION;

/**
 * Base class for all telemetry system implementations.
 *
 * @since 3.12.0
 */
abstract class Telemetry_System {
	/**
	 * Holds the list of events to be tracked.
	 *
	 * @var array<array<string, string|int>>
	 */
	protected $events;

	/**
	 * Registers the telemetry system.
	 *
	 * @since 3.12.0
	 */
	abstract public function run(): void;

	/**
	 * Activates event tracking.
	 *
	 * @since 3.12.0
	 */
	abstract protected function activate_tracking(): void;

	/**
	 * Returns whether wp-admin telemetry is allowed to be enabled. This is off
	 * by default.
	 *
	 * @since 3.12.0
	 *
	 * @return bool Whether wp-admin telemetry is allowed to be enabled.
	 */
	public static function is_wpadmin_telemetry_allowed(): bool {
		return apply_filters( 'wp_parsely_enable_wpadmin_telemetry', false );
	}

	/**
	 * Registers the passed events so they can be recorded later.
	 *
	 * Note: All events must be registered before the run() function of this
	 * class gets called.
	 *
	 * @since 3.12.0
	 *
	 * @param array<string, string|int> ...$events The events to register.
	 */
	public function register_events( array ...$events ): void {
		foreach ( $events as $event ) {
			$this->events[] = $event;
		}
	}

	/**
	 * Records the passed event.
	 *
	 * @since 3.12.0
	 *
	 * @param string               $event_name The event's name.
	 * @param array<string, mixed> $event_properties Any additional properties
	 *                                               to include with the event.
	 * @return bool|WP_Error True if recording the event succeeded.
	 *                       False if telemetry is disabled.
	 *                       WP_Error if recording the event failed.
	 */
	abstract public function record_event(
		string $event_name,
		array $event_properties = array()
	);

	/**
	 * Initializes JavaScript tracking.
	 *
	 * This method is responsible for setting up the JavaScript tracking for the application.
	 * It enqueues the necessary scripts and sets up the parameters for the tracking script.
	 *
	 * If the user has disabled wp-admin telemetry, the script will be enqueued, however the
	 * global object `wpParselyTra§cksTelemetry` will not be available.
	 *
	 * @since 3.12.0
	 */
	public static function init_js_tracking(): void {
		// Enqueue the JS file.
		add_action(
			'admin_enqueue_scripts',
			function (): void {
				$asset_php        = get_asset_info( 'build/telemetry.asset.php' );
				$built_assets_url = plugin_dir_url( PARSELY_FILE ) . 'build/';

				// The Telemetry script is always enqueued in the admin.
				// If the user has disabled wp-admin telemetry, the global object will not be available.
				wp_enqueue_script(
					'wp-parsely-tracks-telemetry',
					$built_assets_url . 'telemetry.js',
					$asset_php['dependencies'],
					$asset_php['version'],
					true
				);

				// If the user has disabled wp-admin telemetry, return early.
				if ( ! Telemetry_System::is_wpadmin_telemetry_allowed() ) {
					return;
				}

				// Set the script params.
				$script_params = array(
					'version' => PARSELY_VERSION,
					'user'    => array(),
				);

				// If it's a VIP environment, add the VIP environment to the script params.
				if ( defined( 'VIP_GO_APP_ENVIRONMENT' ) ) {
					$app_environment = constant( 'VIP_GO_APP_ENVIRONMENT' );
					if ( is_string( $app_environment ) && '' !== $app_environment ) {
						$script_params['vipgo_env'] = $app_environment;
					}
				}

				// Define user-specific params.
				$wp_user_id = get_current_user_id();
				if ( 0 !== $wp_user_id ) {
					// If it's VIP environment, add the VIP user ID to the script params.
					if ( defined( 'VIP_GO_APP_ID' ) ) {
						$app_id = constant( 'VIP_GO_APP_ID' );
						if ( is_integer( $app_id ) && 0 < $app_id ) {
							$script_params['user'] = array(
								'type' => 'vip_go_app_wp_user',
								'id'   => $app_id . '_' . $wp_user_id,
							);
						}
					}

					// If not VIP, fallback to the generated parse.ly user ID.
					if ( 0 === count( $script_params['user'] ) ) {
						$wp_base_url = get_option( 'home' );
						if ( ! is_string( $wp_base_url ) || '' === $wp_base_url ) {
							$wp_base_url = get_option( 'siteurl' );
						}

						/**
						 * The base URL of the site.
						 *
						 * @var string $wp_base_url
						 */
						$script_params['user'] = array(
							'type' => 'wpparsely:user_id',
							'id'   => wp_hash( sprintf( '%s|%s', $wp_base_url, $wp_user_id ) ),
						);
					}
				}

				wp_add_inline_script(
					'wp-parsely-tracks-telemetry',
					'const wpParselyTracksTelemetry = ' . wp_json_encode( $script_params ) . ';',
					'before'
				);
			}
		);
	}
}
