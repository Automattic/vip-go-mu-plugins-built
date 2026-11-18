<?php
/**
 * WordPress VIP runtime config reader for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads the runtime config WordPress VIP injects as the VIP_GIST_ANSWERS_CONFIG
 * constant: a plain associative array, defined before the plugin loads.
 *
 * Missing or invalid config never causes a fatal error. A constant that is not
 * an array is treated as no config at all; a config missing required fields is
 * a normal "setup in progress" state that callers detect with is_ready().
 */
final class Config {

	public const CONSTANT_NAME = 'VIP_GIST_ANSWERS_CONFIG';

	// Short array syntax so the VIP conformance checker can cross-check these against vip-manifest.yaml.
	public const REQUIRED_FIELDS = [ 'api_token' ]; // phpcs:ignore Universal.Arrays.DisallowShortArraySyntax.Found -- See above.

	// Values that must never be rendered in the admin UI or logs.
	public const SENSITIVE_FIELDS = [ 'api_token' ]; // phpcs:ignore Universal.Arrays.DisallowShortArraySyntax.Found -- See above.

	/**
	 * The injected config, or an empty array when none is usable.
	 *
	 * @var array<string, mixed>
	 */
	private array $config = array();

	/**
	 * Whether the constant was defined and held an array.
	 *
	 * @var bool
	 */
	private bool $available = false;

	/**
	 * Build a Config from the VIP_GIST_ANSWERS_CONFIG constant, if it is defined.
	 *
	 * @return self The config read from the constant.
	 */
	public static function from_constant(): self {
		return new self( defined( self::CONSTANT_NAME ) ? constant( self::CONSTANT_NAME ) : null );
	}

	/**
	 * Build a Config from a raw constant value.
	 *
	 * @param mixed $raw Raw value of the config constant; anything other than an array means no usable config.
	 */
	public function __construct( mixed $raw ) {
		if ( is_array( $raw ) ) {
			$this->config    = $raw;
			$this->available = true;
		}
	}

	/**
	 * Whether the config constant was defined and contained an array.
	 *
	 * @return bool True when VIP provided a config array.
	 */
	public function is_available(): bool {
		return $this->available;
	}

	/**
	 * Required fields that are missing or unusable.
	 *
	 * A field counts as present only when it is a non-empty, non-whitespace string.
	 *
	 * @return array<string> The names of the missing required fields.
	 */
	public function missing_fields(): array {

		$missing = array();

		foreach ( self::REQUIRED_FIELDS as $field ) {
			if ( ! is_string( $this->config[ $field ] ?? null ) || '' === trim( $this->config[ $field ] ) ) {
				$missing[] = $field;
			}
		}

		return $missing;
	}

	/**
	 * Whether the config is usable: the constant is an array and every required field is set.
	 *
	 * @return bool True when the config can be used.
	 */
	public function is_ready(): bool {
		return $this->available && array() === $this->missing_fields();
	}

	/**
	 * Get a single config value.
	 *
	 * @param string $key           The config key.
	 * @param mixed  $default_value Value returned when the key is not set.
	 *
	 * @return mixed The config value, or $default_value.
	 */
	public function get( string $key, mixed $default_value = null ): mixed {
		return $this->config[ $key ] ?? $default_value;
	}
}
