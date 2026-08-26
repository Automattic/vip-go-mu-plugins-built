<?php
/**
 * Base class for all settings endpoints.
 *
 * @package Parsely
 * @since   3.13.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

use Parsely\REST_API\Base_API_Controller;
use Parsely\REST_API\Base_Endpoint;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Base class for all settings endpoints.
 *
 * Settings endpoints are used to manage user meta data.
 *
 * @since 3.13.0
 *
 * @phpstan-type Subvalue_Spec array{values: array<mixed>, default: mixed}
 */
abstract class Base_Settings_Endpoint extends Base_Endpoint {
	/**
	 * The format that stored settings are expected to be in. Recorded per user,
	 * and bumped whenever stored values need converting.
	 *
	 * @since 3.24.1
	 *
	 * @var int
	 */
	protected const STORED_FORMAT_VERSION = 1;

	/**
	 * The meta entry's default value. Initialized in the constructor.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @var array<string, mixed>
	 */
	protected $default_value = array();

	/**
	 * The valid values that can be used for each subvalue. Initialized in the
	 * constructor.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @var array<string, array<int, mixed>>
	 */
	protected $valid_subvalues = array();

	/**
	 * The current user's ID.
	 *
	 * @since 3.14.0
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @var int
	 */
	protected $current_user_id = 0;

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @return string The meta entry's key.
	 */
	abstract protected function get_meta_key(): string;

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	abstract protected function get_subvalues_specs(): array;

	/**
	 * Returns the composite keys of the settings that inherit their default.
	 *
	 * These are stored only once the user deviates from the default, so that a
	 * later change to it still reaches users who never set them.
	 *
	 * @since 3.24.1
	 *
	 * @return array<string> The composite keys.
	 */
	protected function get_inheritable_keys(): array {
		return array();
	}

	/**
	 * Returns the defaults that inheritable settings had before they became
	 * inheritable, keyed by composite key.
	 *
	 * A stored value matching one of these was written when the setting had no
	 * configurable default, so it cannot be told apart from an untouched one.
	 *
	 * @since 3.24.1
	 *
	 * @return array<string, mixed> The defaults, as composite key => value pairs.
	 */
	protected function get_legacy_defaults(): array {
		return array();
	}

	/**
	 * Constructor.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param Base_API_Controller $controller The REST API controller.
	 */
	public function __construct( Base_API_Controller $controller ) {
		parent::__construct( $controller );

		$subvalues_specs = $this->get_subvalues_specs();

		foreach ( $subvalues_specs as $key => $value ) {
			$this->default_value[ $key ]   = $value['default'];
			$this->valid_subvalues[ $key ] = $value['values'];
		}
	}

	/**
	 * Initializes the endpoint and sets the current user ID.
	 *
	 * @since 3.17.0
	 */
	public function init(): void {
		parent::init();
		$this->current_user_id = get_current_user_id();
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.17.0
	 */
	public function register_routes(): void {
		/**
		 * GET settings/{endpoint}/get
		 * Retrieves the settings for the current user.
		 */
		$this->register_rest_route(
			'/get',
			array( 'GET' ),
			array( $this, 'get_settings' )
		);

		/**
		 * PUT settings/{endpoint}/set
		 * Updates the settings for the current user.
		 */
		$this->register_rest_route(
			'/set',
			array( 'PUT' ),
			array( $this, 'set_settings' )
		);

		/**
		 * GET|PUT settings/{endpoint}
		 * Handles direct requests to the endpoint.
		 */
		$this->register_rest_route(
			'/',
			array( 'GET', 'PUT' ),
			array( $this, 'process_request' )
		);
	}

	/**
	 * API Endpoint: GET|PUT settings/{endpoint}/
	 *
	 * Processes the requests sent directly to the main endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request sent to the endpoint.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function process_request( WP_REST_Request $request ) {
		$request_method = $request->get_method();

		// Update the meta entry's value if the request method is PUT.
		if ( 'PUT' === $request_method ) {
			return $this->set_settings( $request );
		}

		return $this->get_settings();
	}

	/**
	 * API Endpoint: GET settings/{endpoint}/get
	 *
	 * Retrieves the settings for the current user.
	 *
	 * The stored value is resolved against the current specifications, so that
	 * a setting added after the user's last save still reaches them.
	 *
	 * @since 3.17.0
	 * @since 3.24.0 The stored value is resolved against the current
	 *               specifications.
	 * @since 3.24.1 A stored value predating the current format is normalized
	 *               and stored anew.
	 *
	 * @return WP_REST_Response The response object.
	 */
	public function get_settings(): WP_REST_Response {
		return new WP_REST_Response(
			$this->sanitize_value( $this->get_stored_settings() ),
			200
		);
	}

	/**
	 * API Endpoint: PUT settings/{endpoint}/set
	 *
	 * Updates the settings for the current user.
	 *
	 * Settings absent from the request keep their current value, rather than
	 * being reset to their default.
	 *
	 * @since 3.17.0
	 * @since 3.24.1 The request is merged into the current settings, and
	 *               inheritable settings are stored only once set.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function set_settings( WP_REST_Request $request ) {
		$meta_value = $request->get_json_params();

		// Validates the settings format.
		if ( ! is_array( $meta_value ) ) { // @phpstan-ignore-line
			return new WP_Error(
				'ch_settings_invalid_format',
				__( 'Settings must be a valid JSON array', 'wp-parsely' )
			);
		}

		$stored_settings  = $this->get_stored_settings();
		$current_settings = $this->sanitize_value( $stored_settings );
		$sanitized_value  = $this->sanitize_value(
			$this->merge_settings( $meta_value, $current_settings )
		);

		// If the current settings are the same as the new settings, return early.
		if ( $current_settings === $sanitized_value ) {
			return new WP_REST_Response( $current_settings, 200 );
		}

		$update_meta = update_user_meta(
			$this->current_user_id,
			$this->get_meta_key(),
			$this->strip_inherited_values( $sanitized_value, $stored_settings )
		);

		if ( false === $update_meta ) {
			return new WP_Error(
				'ch_settings_update_failed',
				__( 'Failed to update settings', 'wp-parsely' )
			);
		}

		$this->record_stored_format();

		return new WP_REST_Response( $sanitized_value, 200 );
	}

	/**
	 * Returns the current user's stored settings, normalizing them first if
	 * they were stored in an earlier format.
	 *
	 * @since 3.24.1
	 *
	 * @return array<string, mixed> The stored settings.
	 */
	protected function get_stored_settings(): array {
		$settings = get_user_meta( $this->current_user_id, $this->get_meta_key(), true );
		$settings = is_array( $settings ) ? $settings : array();

		return $this->needs_normalizing( $settings )
			? $this->normalize_stored_settings( $settings )
			: $settings;
	}

	/**
	 * Returns whether the passed stored settings need normalizing before use.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $settings The stored settings.
	 * @return bool
	 */
	protected function needs_normalizing( array $settings ): bool {
		if ( 0 === count( $settings ) || 0 === count( $this->get_inheritable_keys() ) ) {
			return false;
		}

		$format = get_user_meta( $this->current_user_id, $this->get_format_meta_key(), true );

		return static::STORED_FORMAT_VERSION !== ( is_numeric( $format ) ? (int) $format : 0 );
	}

	/**
	 * Drops the stored inheritable settings that cannot be told apart from an
	 * untouched default, and stores the result.
	 *
	 * A value matching the setting's current default was stored by a full-tree
	 * save; one matching its legacy default was stored when the setting had no
	 * configurable default. Neither expresses a choice.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $settings The stored settings.
	 * @return array<string, mixed> The normalized settings.
	 */
	protected function normalize_stored_settings( array $settings ): array {
		$legacy_defaults = $this->get_legacy_defaults();

		foreach ( $this->get_inheritable_keys() as $composite_key ) {
			$keys  = explode( '.', $composite_key );
			$value = $this->get_path_value( $settings, $keys );

			if ( null === $value ) {
				continue;
			}

			$defaults = array( $this->get_default( $keys ) );
			if ( array_key_exists( $composite_key, $legacy_defaults ) ) {
				$defaults[] = $legacy_defaults[ $composite_key ];
			}

			if ( in_array( $value, $defaults, true ) ) {
				$this->unset_path_value( $settings, $keys );
			}
		}

		update_user_meta( $this->current_user_id, $this->get_meta_key(), $settings );
		$this->record_stored_format();

		return $settings;
	}

	/**
	 * Removes the inheritable settings that the user has not set, so that they
	 * keep following their default.
	 *
	 * A setting counts as set once it is stored, so that a choice is not undone
	 * by a later change to the default that happens to match it.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $settings The settings about to be stored.
	 * @param array<string, mixed> $stored   The settings as they are stored.
	 * @return array<string, mixed> The settings to store.
	 */
	protected function strip_inherited_values( array $settings, array $stored ): array {
		foreach ( $this->get_inheritable_keys() as $composite_key ) {
			$keys = explode( '.', $composite_key );

			if ( $this->is_stored_override( $stored, $composite_key ) ||
				$this->get_path_value( $settings, $keys ) !== $this->get_default( $keys )
			) {
				continue;
			}

			$this->unset_path_value( $settings, $keys );
		}

		return $settings;
	}

	/**
	 * Returns whether the user set the passed setting.
	 *
	 * A value that sanitization rejects resolves to the setting's default on
	 * read, so treating it as set would pin the user to that default.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $stored        The settings as they are stored.
	 * @param string               $composite_key The setting's composite key.
	 * @return bool
	 */
	protected function is_stored_override( array $stored, string $composite_key ): bool {
		$value = $this->get_path_value( $stored, explode( '.', $composite_key ) );

		return null !== $value && $this->sanitize_subvalue( $composite_key, $value ) === $value;
	}

	/**
	 * Records that the current user's settings are stored in the current
	 * format.
	 *
	 * @since 3.24.1
	 */
	protected function record_stored_format(): void {
		if ( 0 === count( $this->get_inheritable_keys() ) ) {
			return;
		}

		update_user_meta(
			$this->current_user_id,
			$this->get_format_meta_key(),
			static::STORED_FORMAT_VERSION
		);
	}

	/**
	 * Returns the key of the meta entry holding the stored format's version.
	 *
	 * @since 3.24.1
	 *
	 * @return string The meta entry's key.
	 */
	protected function get_format_meta_key(): string {
		return $this->get_meta_key() . '_format';
	}

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0
	 * @since 3.16.0 Added the `$request` parameter.
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool
	 */
	public function is_available_to_current_user( ?WP_REST_Request $request = null ): bool {
		return current_user_can( 'edit_user', $this->current_user_id );
	}

	/**
	 * Sanitizes the passed meta value.
	 *
	 * @since 3.13.0
	 * @since 3.14.0 Added support for nested arrays.
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param array<string, mixed> $meta_value The meta value to sanitize.
	 * @param string               $parent_key  The parent key for the current level of the meta.
	 * @return array<string, mixed> The sanitized meta as an array of subvalues.
	 */
	protected function sanitize_value( array $meta_value, string $parent_key = '' ): array {
		$sanitized_value = array();

		// Determine the current level's specifications based on the parent key.
		/**
		 * Current level's specifications.
		 *
		 * @var array<string, Subvalue_Spec> $current_specs
		 */
		$current_specs = ( '' === $parent_key ) ? $this->get_subvalues_specs() : $this->get_nested_specs( $parent_key );

		foreach ( $current_specs as $key => $spec ) {
			$composite_key = '' === $parent_key ? $key : $parent_key . '.' . $key;

			// Check if the key exists in the input meta value array.
			if ( array_key_exists( $key, $meta_value ) ) {
				$value = $meta_value[ $key ];
			} else {
				// Key is missing in the input, use the default value from the specifications.
				$value = $this->get_default( explode( '.', $composite_key ) );
			}

			/**
			 * Spec for the current key.
			 *
			 * @var array{default: mixed, values?: array<mixed>} $spec
			 */
			if ( is_array( $value ) && isset( $spec['values'] ) ) {
				// Recursively handle nested arrays if 'values' spec exists for this key.
				$sanitized_value[ $key ] = $this->sanitize_value( $value, $composite_key );
			} else {
				// Directly sanitize non-array values or non-nested specs.
				$sanitized_value[ $key ] = $this->sanitize_subvalue( $composite_key, $value );
			}
		}

		return $sanitized_value;
	}

	/**
	 * Merges the passed settings into the current ones.
	 *
	 * Recursion follows the specifications, so that a setting holding a list of
	 * values is replaced rather than merged into.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $settings   The settings to merge in.
	 * @param array<string, mixed> $current    The settings to merge into.
	 * @param string               $parent_key The parent key for the current level of the settings.
	 * @return array<string, mixed> The merged settings.
	 */
	protected function merge_settings(
		array $settings,
		array $current,
		string $parent_key = ''
	): array {
		/**
		 * Current level's specifications.
		 *
		 * @var array<string, Subvalue_Spec> $current_specs
		 */
		$current_specs = ( '' === $parent_key ) ? $this->get_subvalues_specs() : $this->get_nested_specs( $parent_key );

		foreach ( $current_specs as $key => $spec ) {
			if ( ! array_key_exists( $key, $settings ) ) {
				continue;
			}

			$value = $settings[ $key ];

			/**
			 * Spec for the current key.
			 *
			 * @var array{default: mixed, values?: array<mixed>} $spec
			 */
			if ( is_array( $value ) && isset( $spec['values'] ) ) {
				$current_value   = $current[ $key ] ?? null;
				$current[ $key ] = $this->merge_settings(
					$value,
					is_array( $current_value ) ? $current_value : array(),
					'' === $parent_key ? $key : $parent_key . '.' . $key
				);
			} else {
				$current[ $key ] = $value;
			}
		}

		return $current;
	}

	/**
	 * Sanitizes the passed subvalue.
	 *
	 * @since 3.13.0
	 * @since 3.14.0 Added support for nested arrays.
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param string $composite_key The subvalue's key.
	 * @param mixed  $value The value to sanitize.
	 * @return mixed The sanitized subvalue.
	 */
	protected function sanitize_subvalue( string $composite_key, $value ) {
		$keys         = explode( '.', $composite_key );
		$valid_values = $this->get_valid_values( $keys );

		if ( is_array( $value ) ) {
			// Check if $value elements are inside $valid_values
			// If not, the value should be the default value.
			$valid_value = array();
			foreach ( $value as $key => $val ) {
				if ( in_array( $val, $valid_values, true ) ) {
					$valid_value[ $key ] = $val;
				}
			}
			return $valid_value;
		}

		if ( is_string( $value ) ) {
			$value = sanitize_text_field( $value );
		}

		if ( count( $valid_values ) === 0 ) {
			return $value;
		}

		if ( ! in_array( $value, $valid_values, true ) ) {
			return $this->get_default( $keys );
		}

		return $value;
	}

	/**
	 * Gets the valid values for a given setting path.
	 *
	 * @since 3.14.3
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param array<string> $keys The path to the setting.
	 * @return array<mixed> The valid values for the setting path.
	 */
	protected function get_valid_values( array $keys ): array {
		$current = $this->valid_subvalues;

		foreach ( $keys as $key ) {
			if ( ! is_array( $current ) || ! isset( $current[ $key ] ) ) {
				return array(); // No valid values for invalid key path.
			}
			if ( isset( $current[ $key ]['values'] ) ) {
				$current = $current[ $key ]['values'];
			} else {
				$current = $current[ $key ];
			}
		}

		return is_array( $current ) ? $current : array();
	}

	/**
	 * Gets the default value for a given setting path.
	 *
	 * @since 3.14.3
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param array<string> $keys The path to the setting.
	 * @return mixed|array<mixed>|null The default value for the setting path.
	 */
	protected function get_default( array $keys ) {
		$current = $this->default_value;

		foreach ( $keys as $key ) {
			if ( ! is_array( $current ) || ! isset( $current[ $key ] ) ) {
				return null; // No default value for invalid key path.
			}
			if ( isset( $current[ $key ]['default'] ) ) {
				$current = $current[ $key ]['default'];
			} else {
				$current = $current[ $key ];
			}
		}

		return $current; // Return default value for valid key path.
	}

	/**
	 * Gets the specifications for nested settings based on a composite key.
	 *
	 * @since 3.14.3
	 * @since 3.17.0 Moved from Base_Endpoint_User_Meta.
	 *
	 * @param string $composite_key The composite key representing the nested path.
	 * @return array<mixed> The specifications for the nested path.
	 */
	protected function get_nested_specs( string $composite_key ): array {
		$keys  = explode( '.', $composite_key );
		$specs = $this->get_subvalues_specs();

		foreach ( $keys as $key ) {
			if ( is_array( $specs[ $key ] ) && array_key_exists( 'values', $specs[ $key ] ) ) {
				$specs = $specs[ $key ]['values'];
			} else {
				break;
			}
		}

		return $specs;
	}

	/**
	 * Returns the value held at the passed path.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $settings The settings to look in.
	 * @param array<string>        $keys     The path to the setting.
	 * @return mixed The value, or null if the path holds none.
	 */
	protected function get_path_value( array $settings, array $keys ) {
		$current = $settings;

		foreach ( $keys as $key ) {
			if ( ! is_array( $current ) || ! array_key_exists( $key, $current ) ) {
				return null;
			}

			$current = $current[ $key ];
		}

		return $current;
	}

	/**
	 * Removes the value held at the passed path.
	 *
	 * @since 3.24.1
	 *
	 * @param array<string, mixed> $settings The settings to remove from.
	 * @param array<string>        $keys     The path to the setting.
	 */
	protected function unset_path_value( array &$settings, array $keys ): void {
		$last_key = array_pop( $keys );

		if ( null === $last_key ) {
			return;
		}

		$current = &$settings;

		foreach ( $keys as $key ) {
			if ( ! isset( $current[ $key ] ) || ! is_array( $current[ $key ] ) ) {
				return;
			}

			$current = &$current[ $key ];
		}

		unset( $current[ $last_key ] );
	}
}
