<?php
/**
 * API Endpoint: Credentials Settings
 *
 * @package Parsely
 * @since   3.25.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

use Parsely\Parsely;
use Parsely\REST_API\Base_Endpoint;
use Parsely\Validator;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Endpoint for setting the site's Parse.ly Site ID.
 *
 * Unlike the other settings endpoints, which store per-user preferences, this
 * one writes to the site-level plugin options, so that the plugin can be
 * configured remotely.
 *
 * @since 3.25.0
 */
class Endpoint_Credentials_Settings extends Base_Endpoint {
	/**
	 * Returns the endpoint's name.
	 *
	 * @since 3.25.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'credentials';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * The `site_id` parameter is validated in the callback rather than through
	 * route arguments, since WordPress validates arguments before checking
	 * permissions, and the endpoint returns its own error codes.
	 *
	 * @since 3.25.0
	 */
	public function register_routes(): void {
		/**
		 * POST|PUT settings/credentials
		 * Sets the Site ID.
		 */
		$this->register_rest_route(
			'/',
			array( 'POST', 'PUT' ),
			array( $this, 'set_site_id' )
		);
	}

	/**
	 * API Endpoint: POST|PUT settings/credentials
	 *
	 * Sets the Site ID, leaving the rest of the options untouched. Setting the
	 * Site ID that is already stored succeeds, so that requests can be retried.
	 *
	 * @since 3.25.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The stored Site ID, or an error.
	 */
	public function set_site_id( WP_REST_Request $request ) {
		// Managed credentials override the stored ones, so a write would be ignored.
		if ( $this->parsely->are_credentials_managed ) {
			return new WP_Error(
				'parsely_credentials_managed',
				__( 'The Parse.ly credentials are managed by the hosting platform and cannot be changed.', 'wp-parsely' ),
				array( 'status' => 409 )
			);
		}

		$site_id = $request->get_param( 'site_id' );
		$site_id = is_string( $site_id ) ? Validator::sanitize_site_id( $site_id ) : '';

		if ( '' === $site_id ) {
			return new WP_Error(
				'parsely_invalid_site_id',
				__( 'A valid Parse.ly Site ID is required.', 'wp-parsely' ),
				array( 'status' => 400 )
			);
		}

		// Sanitized, because a Site ID saved on the settings page before 3.25.0
		// may be stored as it was typed.
		$stored_site_id = Validator::sanitize_site_id( $this->parsely->get_site_id() );

		if ( '' !== $stored_site_id && $site_id !== $stored_site_id ) {
			return new WP_Error(
				'parsely_site_id_conflict',
				__( 'A different Parse.ly Site ID is already set.', 'wp-parsely' ),
				array( 'status' => 409 )
			);
		}

		if ( '' === $stored_site_id && ! $this->store_site_id( $site_id ) ) {
			return new WP_Error(
				'parsely_site_id_not_saved',
				__( 'The Parse.ly Site ID could not be saved.', 'wp-parsely' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( array( 'site_id' => $this->parsely->get_site_id() ), 200 );
	}

	/**
	 * Stores the passed Site ID in the plugin's options.
	 *
	 * If no options are stored yet, they are created from the defaults, as the
	 * settings page does.
	 *
	 * @since 3.25.0
	 *
	 * @param string $site_id The sanitized Site ID.
	 * @return bool Whether the Site ID is now stored.
	 */
	private function store_site_id( string $site_id ): bool {
		$options = get_option( Parsely::OPTIONS_KEY );

		if ( ! is_array( $options ) ) {
			$options = $this->parsely->get_options();
		}

		$options['apikey'] = $site_id;
		update_option( Parsely::OPTIONS_KEY, $options );

		return $site_id === $this->parsely->get_site_id();
	}

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * Only users who can manage the plugin's settings have access. A Site ID
	 * isn't required, since this endpoint is what sets it.
	 *
	 * @since 3.25.0
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool
	 */
	public function is_available_to_current_user( ?WP_REST_Request $request = null ): bool {
		// phpcs:ignore WordPress.WP.Capabilities.Undetermined
		return current_user_can( Parsely::CAPABILITY );
	}
}
