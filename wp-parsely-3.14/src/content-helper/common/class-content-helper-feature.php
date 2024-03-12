<?php
/**
 * Content Helper: Base class for all Content Helper features
 *
 * @package Parsely
 * @since   3.9.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper;

use Parsely\Parsely;
use WP_REST_Request;

/**
 * Base class for all Content Helper features.
 *
 * @since 3.9.0
 */
abstract class Content_Helper_Feature {
	/**
	 * Instance of Parsely class.
	 *
	 * @since 3.9.0
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * Returns the global Content Helper filter name. The global filter controls
	 * the enabled/disabled state of all Content Helper features.
	 *
	 * @since 3.9.0
	 *
	 * @return string The filter name.
	 */
	final public static function get_global_filter_name(): string {
		return 'wp_parsely_enable_content_helper';
	}

	/**
	 * Returns the feature's filter name. The feature filter controls the
	 * enabled/disabled state of a particular Content Helper feature.
	 *
	 * @since 3.9.0
	 *
	 * @return string The filter name.
	 */
	abstract public static function get_feature_filter_name(): string;

	/**
	 * Returns the feature's script ID.
	 *
	 * @since 3.9.0
	 *
	 * @return string The script ID.
	 */
	abstract public static function get_script_id(): string;

	/**
	 * Returns the feature's style ID.
	 *
	 * @since 3.9.0
	 *
	 * @return string The style ID.
	 */
	abstract public static function get_style_id(): string;

	/**
	 * Runs the feature's initialization process.
	 */
	abstract public function run(): void;


	/**
	 * Examines filters and conditions to determine whether the feature can be
	 * enabled.
	 *
	 * - By default (no filters are explicitly set), the value returns true.
	 * - If not set, the feature filter will take the global filter's value.
	 * - When explicitly set, the feature filter overrides the global filter.
	 * - Possible invalid filter values will resolve to false.
	 *
	 * @since 3.9.0
	 *
	 * @param bool ...$conditions Conditions that need to be met besides filters
	 *                            for the function to return true.
	 * @return bool Whether the feature can be enabled.
	 */
	protected function can_enable_feature( bool ...$conditions ): bool {
		// Get filter values.
		$global  = apply_filters( self::get_global_filter_name(), null ); // phpcs:ignore
		$feature = apply_filters( static::get_feature_filter_name(), null ); // phpcs:ignore

		// If not set, the feature filter will get its value from the global
		// filter.
		$global_filter_is_false = null !== $global && true !== $global;
		if ( null === $feature && $global_filter_is_false ) {
			return false;
		}

		// Feature filter has explicitly been set to a value different than true.
		$feature_filter_is_false = null !== $feature && true !== $feature;
		if ( $feature_filter_is_false ) {
			return false;
		}

		// Return false if any of the passed conditions are false.
		if ( in_array( false, $conditions, true ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Injects any required inline scripts.
	 *
	 * @since 3.9.0
	 *
	 * @param string|null $settings_route Optional. The settings route if the
	 *                                    feature uses settings. Defaults to null.
	 */
	protected function inject_inline_scripts(
		?string $settings_route = null
	): void {
		$are_credentials_set = $this->parsely->site_id_is_set() &&
			$this->parsely->api_secret_is_set();

		if ( ! $are_credentials_set ) {
			$message = $this->get_credentials_not_set_message();

			wp_add_inline_script(
				static::get_script_id(),
				"window.wpParselyEmptyCredentialsMessage = '{$message}';",
				'before'
			);
		}

		// If the feature has settings, inject them.
		if ( null !== $settings_route ) {
			$settings = '';

			if ( ! defined( 'INTEGRATION_TESTS_RUNNING' ) ) {
				$settings = rest_do_request(
					new WP_REST_Request(
						'GET',
						'/wp-parsely/v1' . $settings_route
					)
				)->get_data();
			}

			if ( ! is_string( $settings ) ) {
				$settings = '';
			}

			wp_add_inline_script(
				static::get_script_id(),
				"window.wpParselyContentHelperSettings = '$settings';",
				'before'
			);
		}
	}

	/**
	 * Returns the message to be shown when required credentials are not set.
	 *
	 * HTML is allowed within the message. The message can be overridden using
	 * the wp_parsely_message_credentials_not_set filter.
	 *
	 * @since 3.9.0
	 *
	 * @return string The sanitized message.
	 */
	protected function get_credentials_not_set_message(): string {
		$default_message = '
			<p>
				<a href="https://www.parse.ly/contact" target="_blank" rel="noopener">' .
					__( 'Contact us', 'wp-parsely' ) .
				'</a>' .
				__( ' about advanced plugin features and the Parse.ly dashboard.', 'wp-parsely' ) . '
			</p>
			<p>' .
				__(
					'Existing Parse.ly customers can enable this feature by setting their Site ID and API Secret in ',
					'wp-parsely'
				) . '
				<a href="/wp-admin/options-general.php?page=parsely" target="_blank" rel="noopener">' .
					__( 'wp-parsely options.', 'wp-parsely' ) . '
				</a>
			</p>
		';

		// Override default message if the respective filter is set.
		$message = apply_filters(
			'wp_parsely_message_credentials_not_set',
			$default_message
		);

		// Remove unnecessary whitespace to avoid broken output.
		$message = str_replace( array( "\r", "\n", "\t" ), '', $message );

		return wp_kses_post( $message );
	}
}
