<?php

namespace Automattic\ShareADraft;

/**
 * Centralized reader for the runtime configuration the VIP platform injects
 * as the VIP_SHAREADRAFT_CONFIG PHP constant (a plain associative
 * array, defined before the plugin is loaded).
 *
 * The constant carries no data today. Defining it at all is the signal that
 * matters: it is how the platform says this integration is enabled for the
 * site. An empty array is therefore a complete, valid configuration, and the
 * fields below stay empty until the plugin actually needs something from the
 * platform (an IP allowlist, say).
 *
 * Missing or invalid required fields must never cause a fatal error: callers
 * check is_ready() and disable the affected behavior instead.
 */
final class Config {
	public const CONSTANT_NAME = 'VIP_SHAREADRAFT_CONFIG';

	/**
	 * Fields the plugin cannot work without. Empty: nothing is required yet.
	 *
	 * Adding one here makes a config that omits it report as incomplete, so
	 * declare it in `vip-manifest.yaml` at the same time — that is what puts the
	 * field in front of the customer in the VIP Dashboard.
	 *
	 * @var list<string>
	 */
	public const REQUIRED_FIELDS = [];

	/**
	 * Keys whose values are secrets and must never be rendered in the admin UI
	 * (or logs). Surface that a value is set without exposing it. Empty until a
	 * secret is actually carried.
	 *
	 * @var list<string>
	 */
	public const SENSITIVE_FIELDS = [];

	/** @var self|null */
	private static $instance;

	/** @var array<string, mixed> */
	private array $config = [];

	private bool $available = false;

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self( defined( self::CONSTANT_NAME ) ? constant( self::CONSTANT_NAME ) : null );
		}

		return self::$instance;
	}

	/**
	 * @param mixed $raw Raw value of the config constant. Anything other than
	 *                   an array is treated as "no usable config".
	 */
	public function __construct( $raw ) {
		if ( is_array( $raw ) ) {
			/** @var array<string, mixed> $raw */
			$this->config    = $raw;
			$this->available = true;
		}
	}

	/**
	 * Whether the config constant was defined and contained an array.
	 */
	public function is_available(): bool {
		return $this->available;
	}

	/**
	 * Required fields that are missing or unusable. An incomplete setup is a
	 * normal state: an integration can be enabled before the customer has
	 * saved all required values in the VIP Dashboard.
	 *
	 * "Required" means present and usable: a field must be a non-empty string.
	 * A missing key, a non-string value (false, 0, [] from a misparsed config),
	 * or a blank/whitespace-only string all count as missing rather than
	 * silently enabling a half-configured integration.
	 *
	 * @return list<string>
	 */
	public function missing_fields(): array {
		$missing = [];

		// @phpstan-ignore foreach.emptyArray (Empty until a field is required; see REQUIRED_FIELDS.)
		foreach ( self::REQUIRED_FIELDS as $field ) {
			if ( ! isset( $this->config[ $field ] )
				|| ! is_string( $this->config[ $field ] )
				|| '' === trim( $this->config[ $field ] )
			) {
				$missing[] = $field;
			}
		}

		return $missing;
	}

	/**
	 * Whether the config is usable: constant present and all required fields set.
	 */
	public function is_ready(): bool {
		return $this->available && [] === $this->missing_fields();
	}

	/**
	 * @param mixed $default_value
	 * @return mixed
	 */
	public function get( string $key, $default_value = null ) {
		return $this->config[ $key ] ?? $default_value;
	}

	/**
	 * The injected config as key => display string, with sensitive values
	 * masked. Lets an integration surface where its runtime settings come from
	 * (the VIP-injected constant) without leaking secrets or reinventing the
	 * wheel per-site.
	 *
	 * @return array<string, string>
	 */
	public function for_display(): array {
		$display = [];

		foreach ( array_keys( $this->config ) as $key ) {
			// @phpstan-ignore function.impossibleType (Empty until a secret is carried; see SENSITIVE_FIELDS.)
			$display[ $key ] = in_array( $key, self::SENSITIVE_FIELDS, true )
				? '••••••••'
				: self::stringify( $this->config[ $key ] );
		}

		return $display;
	}

	/**
	 * @param mixed $value
	 */
	private static function stringify( $value ): string {
		return is_scalar( $value ) ? (string) $value : (string) wp_json_encode( $value );
	}
}
