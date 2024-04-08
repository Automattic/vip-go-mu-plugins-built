<?php
/**
 * Endpoints: Base endpoint class for saving and retrieving WordPress user meta
 * entries
 *
 * @package Parsely
 * @since   3.13.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\User_Meta;

use Parsely\Endpoints\Base_Endpoint;
use Parsely\Parsely;
use WP_REST_Request;

/**
 * Base class for all user meta endpoints. Child classes must add a protected
 * `ENDPOINT` constant.
 *
 * @since 3.13.0
 *
 * @phpstan-type Subvalue_Spec array{values: array<mixed>, default: mixed}
 */
abstract class Base_Endpoint_User_Meta extends Base_Endpoint {
	/**
	 * The meta entry's default value. Initialized in the constructor.
	 *
	 * @since 3.13.0
	 *
	 * @var array<string, mixed>
	 */
	protected $default_value = array();

	/**
	 * The valid values that can be used for each subvalue. Initialized in the
	 * constructor.
	 *
	 * @since 3.13.0
	 *
	 * @var array<string, array<int, mixed>>
	 */
	protected $valid_subvalues = array();

	/**
	 * The current user's ID.
	 *
	 * @since 3.14.0
	 *
	 * @var int
	 */
	protected $current_user_id = 0;

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.13.0
	 *
	 * @return string The meta entry's key.
	 */
	abstract protected function get_meta_key(): string;

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.13.0
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	abstract protected function get_subvalues_specs(): array;

	/**
	 * Constructor.
	 *
	 * @since 3.13.0
	 *
	 * @param Parsely $parsely Parsely instance.
	 */
	public function __construct( Parsely $parsely ) {
		parent::__construct( $parsely );

		$subvalues_specs = $this->get_subvalues_specs();

		foreach ( $subvalues_specs as $key => $value ) {
			$this->default_value[ $key ]   = $value['default'];
			$this->valid_subvalues[ $key ] = $value['values'];
		}
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.13.0
	 */
	public function run(): void {
		// Initialize the current user ID here, as doing it in the constructor
		// is too early.
		$this->current_user_id = get_current_user_id();

		$this->register_endpoint(
			static::get_route(),
			'process_request',
			array( 'GET', 'PUT' )
		);
	}

	/**
	 * Returns the endpoint's route.
	 *
	 * @since 3.13.0
	 *
	 * @return string The endpoint's route.
	 */
	public static function get_route(): string {
		return static::ENDPOINT;
	}

	/**
	 * Processes the requests sent to the endpoint.
	 *
	 * @since 3.13.0
	 *
	 * @param WP_REST_Request $request The request sent to the endpoint.
	 * @return string The meta entry's value as JSON.
	 */
	public function process_request( WP_REST_Request $request ): string {
		$request_method = $request->get_method();

		// Update the meta entry's value if the request method is PUT.
		if ( 'PUT' === $request_method ) {
			$meta_value = $request->get_json_params();
			$this->set_value( $meta_value );
		}

		return $this->get_value();
	}

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0
	 *
	 * @return bool
	 */
	public function is_available_to_current_user(): bool {
		return current_user_can( 'edit_user', $this->current_user_id );
	}

	/**
	 * Returns the meta entry's value as JSON.
	 *
	 * @since 3.13.0
	 *
	 * @return string The meta entry's value as JSON.
	 */
	protected function get_value(): string {
		$meta_key   = $this->get_meta_key();
		$meta_value = get_user_meta( $this->current_user_id, $meta_key, true );

		if ( ! is_array( $meta_value ) || 0 === count( $meta_value ) ) {
			$meta_value = $this->default_value;
		}

		$result = wp_json_encode( $meta_value );

		return false !== $result ? $result : '';
	}

	/**
	 * Sets the meta entry's value.
	 *
	 * @since 3.13.0
	 *
	 * @param array<string, string> $meta_value The value to set the meta entry to.
	 * @return bool Whether updating the meta entry's value was successful.
	 */
	protected function set_value( array $meta_value ): bool {
		$sanitized_value = $this->sanitize_value( $meta_value );

		$update_meta = update_user_meta(
			$this->current_user_id,
			$this->get_meta_key(),
			$sanitized_value
		);

		if ( false !== $update_meta ) {
			return true;
		}

		return false;
	}

	/**
	 * Sanitizes the passed meta value.
	 *
	 * @since 3.13.0
	 * @since 3.14.0 Added support for nested arrays.
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
	 * Sanitizes the passed subvalue.
	 *
	 * @since 3.14.0 Added support for nested arrays.
	 * @since 3.13.0
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
	 * Checks if a given composite key is valid.
	 *
	 * @since 3.14.3
	 *
	 * @param string|mixed $composite_key The composite key representing the nested path.
	 * @return bool Whether the key is valid.
	 */
	protected function is_valid_key( $composite_key ): bool {
		if ( ! is_string( $composite_key ) ) {
			return false; // Key path is not a string.
		}

		$keys    = explode( '.', $composite_key );
		$current = $this->valid_subvalues;

		foreach ( $keys as $key ) {
			if ( ! is_array( $current ) || ! isset( $current[ $key ] ) ) {
				return false; // Key path is invalid.
			}

			if ( isset( $current[ $key ]['values'] ) ) {
				$current = $current[ $key ]['values'];
			} else {
				$current = $current[ $key ];
			}
		}

		return true;
	}

	/**
	 * Gets the valid values for a given setting path.
	 *
	 * @since 3.14.3
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
}
