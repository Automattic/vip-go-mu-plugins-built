<?php
/**
 * Integrations: AMP integration class
 *
 * @package Parsely
 * @since   2.6.0
 */

declare(strict_types=1);

namespace Parsely\Integrations;

/**
 * Integrates Parse.ly tracking with the AMP plugin.
 *
 * @since 2.6.0 Moved from Parsely class to this file.
 *
 * @phpstan-type Amp_Analytics array{
 *   parsely: Parsely_Amp_Analytics,
 * }
 *
 * @phpstan-type Amp_Native_Analytics array{
 *   parsely: Parsely_Amp_Native_Analytics,
 * }
 *
 * @phpstan-type Parsely_Amp_Analytics array{
 *   type: string,
 *   attributes: array<string, mixed>,
 *   config_data: Parsely_Amp_Config
 * }
 *
 * @phpstan-type Parsely_Amp_Native_Analytics array{
 *   type: string,
 *   attributes: array<string, mixed>,
 *   config: string
 * }
 *
 * @phpstan-type Parsely_Amp_Config array{
 *   vars: Parsely_Amp_Config_Vars,
 * }
 *
 * @phpstan-type Parsely_Amp_Config_Vars array{
 *   apikey: string,
 * }
 */
class Amp extends Integration {
	/**
	 * Applies the hooks that integrate the plugin or theme with the Parse.ly
	 * plugin.
	 *
	 * @since 2.6.0
	 */
	public function integrate(): void {
		if ( defined( 'AMP__VERSION' ) ) {
			add_action( 'template_redirect', array( $this, 'add_actions' ) );
		}
	}

	/**
	 * Verifies that request is an AMP request.
	 *
	 * This is needed to make it easier to mock whether the function exists or
	 * not during tests.
	 *
	 * @since 2.6.0
	 *
	 * @return bool True is an AMP request, false otherwise.
	 */
	public function is_amp_request(): bool {
		return function_exists( 'amp_is_request' ) && amp_is_request();
	}

	/**
	 * Verifies that request is an AMP request, and that AMP support is not
	 * disabled.
	 *
	 * @since 2.6.0
	 *
	 * @return bool True is an AMP request and not disabled, false otherwise.
	 */
	public function can_handle_amp_request(): bool {
		$options = self::$parsely->get_options();

		return $this->is_amp_request() && ! $options['disable_amp'];
	}

	/**
	 * Adds AMP actions and deregisters any scripts that create AMP validation
	 * issues.
	 *
	 * @since 2.6.0
	 */
	public function add_actions(): void {
		if ( $this->can_handle_amp_request() ) {
			add_filter( 'amp_post_template_analytics', array( $this, 'register_parsely_for_amp_analytics' ) );
			add_filter( 'amp_analytics_entries', array( $this, 'register_parsely_for_amp_native_analytics' ) );

			// The tracker script isn't needed here, since tracking is done via
			// the amp-analytics tag. Including the tracker creates an AMP
			// validation issue.
			wp_deregister_script( 'wp-parsely-tracker' );

			// Our loader script creates an AMP validation issue, and it might
			// not be useful under the AMP context. If we get feedback that it's
			// needed, we can consider adding it under AMP.
			wp_deregister_script( 'wp-parsely-loader' );
		}
	}

	/**
	 * Registers Parse.ly for AMP analytics.
	 *
	 * @since 2.6.0
	 *
	 * @param array<string, mixed>|null $analytics The analytics registry.
	 * @return array<string, mixed> The analytics registry.
	 */
	public function register_parsely_for_amp_analytics( ?array $analytics ): array {
		if ( null === $analytics ) {
			$analytics = array();
		}

		$config = self::construct_amp_config();
		if ( array() === $config ) {
			return $analytics;
		}

		$analytics['parsely'] = array(
			'type'        => 'parsely',
			'attributes'  => array(),
			'config_data' => $config,
		);

		return $analytics;
	}

	/**
	 * Registers Parse.ly for AMP native analytics.
	 *
	 * @since 2.6.0
	 *
	 * @param array<string, mixed>|null $analytics The analytics registry.
	 * @return Amp_Analytics|array<string, mixed> The analytics registry.
	 */
	public function register_parsely_for_amp_native_analytics( ?array $analytics ): array {
		if ( null === $analytics ) {
			$analytics = array();
		}

		$options = self::$parsely->get_options();

		if ( true === $options['disable_amp'] ) {
			return $analytics;
		}

		$config = self::construct_amp_json();
		if ( '' === $config ) {
			return $analytics;
		}

		$analytics['parsely'] = array(
			'type'       => 'parsely',
			'attributes' => array(),
			'config'     => $config,
		);

		return $analytics;
	}

	/**
	 * Returns a string containing the JSON-encoded configuration required for
	 * AMP. It consists of the site's Site ID if that's defined, an empty string
	 * otherwise.
	 *
	 * @since 3.2.0
	 *
	 * @return string
	 */
	public static function construct_amp_json(): string {
		$config = self::construct_amp_config();
		if ( array() === $config ) {
			return '';
		}

		$encoded = wp_json_encode( $config );
		return is_string( $encoded ) ? $encoded : '';
	}

	/**
	 * Returns an array containing the configuration required for AMP. It
	 * consists of the site's Site ID if that's defined, or an empty array
	 * otherwise.
	 *
	 * @since 3.2.0
	 *
	 * @link https://docs.parse.ly/google-amp/
	 *
	 * @return array<string, array<string, string>>
	 */
	public static function construct_amp_config(): array {
		if ( self::$parsely->site_id_is_set() ) {
			return array(
				'vars' => array(
					// This field will be rendered in a JS context.
					'apikey' => esc_js( self::$parsely->get_site_id() ),
				),
			);
		}

		return array();
	}
}
