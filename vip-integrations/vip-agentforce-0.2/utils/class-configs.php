<?php

namespace Automattic\VIP\Salesforce\Agentforce\Utils;

use Automattic\VIP\Salesforce\Agentforce\Ingestion\Ingestion_Error;

class Configs {
	private const INTEGRATION_SLUG = 'agentforce';

	/**
	 * Cached config
	 *
	 * @var array<string, mixed>|null
	 */
	private static $cached_config = null;

	/**
	 * Cached ingestion token preflight failure.
	 *
	 * @var array{message: string, error_class: string, error_code: string}|null
	 */
	private static $cached_ingestion_token_failure = null;

	/**
	 * Whether the ingestion token preflight status has been cached.
	 */
	private static bool $cached_ingestion_token_status_loaded = false;

	/**
	 * Flush the cached config.
	 *
	 * Primarily useful for tests where configs may be overridden via filters.
	 */
	public static function flush_cache(): void {
		self::$cached_config                        = null;
		self::$cached_ingestion_token_failure       = null;
		self::$cached_ingestion_token_status_loaded = false;
	}

	/**
	 * Reload and cache the latest available integration config.
	 *
	 * @return array<string, mixed> The refreshed config.
	 */
	public static function refresh_config(): array {
		$config = self::get_actual_config();

		self::$cached_config                        = $config;
		self::$cached_ingestion_token_failure       = self::detect_ingestion_token_failure( $config );
		self::$cached_ingestion_token_status_loaded = true;

		return $config;
	}

	/**
	 * Returns whether the Agentforce JS SDK is activated in integration config.
	 */
	public static function is_js_sdk_activated(): bool {
		$config = self::get_config();

		if ( ! array_key_exists( 'agentforce_js_sdk_activated', $config ) ) {
			return false;
		}

		$activated = filter_var( $config['agentforce_js_sdk_activated'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
		return null === $activated ? false : $activated;
	}

	/**
	 * Returns the Agentforce JS SDK URL from integration config.
	 */
	public static function get_js_sdk_url(): string {
		$config = self::get_config();
		$url    = $config['agentforce_js_sdk_url'] ?? '';

		return is_string( $url ) ? $url : '';
	}

	/**
	 * Returns the configured Salesforce instance (My Domain) URL from integration config.
	 */
	public static function get_salesforce_instance_url(): string {
		$config = self::get_config();
		$url    = $config['salesforce_instance_url'] ?? '';

		return is_string( $url ) ? trim( $url ) : '';
	}

	/**
	 * Returns the Agentforce embedding script snippet from integration config.
	 */
	public static function get_embedding_script(): string {
		$config           = self::get_config();
		$embedding_script = $config['agentforce_embedding_script'] ?? '';

		return is_string( $embedding_script ) ? $embedding_script : '';
	}

	/**
	 * Get the config
	 * @return array{
	 *     salesforce_instance_url?: string,
	 *     site_key?: string,
	 *     ingestion_api_instance_url?: string,
	 *     ingestion_api_token?: string,
	 *     ingestion_api_token_expires_at?: string|int,
	 *     ingestion_api_endpoint?: string,
	 *     ingestion_api_source_name?: string,
	 *     ingestion_api_object_name?: string,
	 *     ingestion_api_sync_all_posts?: bool,
	 *     ingestion_api_categories?: array<string>,
	 *     agentforce_js_sdk_url?: string,
	 *     agentforce_embedding_script?: string,
	 *     agentforce_js_sdk_activated?: bool
	 * } The module configs. Returns an empty array if configs are not found, not defined, or if JSON parsing fails.
	 *
	 */
	public static function get_config(): array {
		if ( null === self::$cached_config ) {
			self::init();
		}

		$current_config = [];

		if ( isset( self::$cached_config ) ) {
			$current_config = self::$cached_config;
		}

		if ( ! is_array( $current_config ) ) {
			return [];
		}

		return $current_config;
	}

	/**
	 * Whether the ingestion token exists and has usable expiry metadata.
	 */
	public static function has_valid_ingestion_token(): bool {
		return null === self::get_ingestion_token_failure();
	}

	/**
	 * Get the token preflight failure details.
	 *
	 * @return array{message: string, error_class: string, error_code: string}|null Failure details, or null when the token can be used.
	 */
	public static function get_ingestion_token_failure(): ?array {
		if ( null === self::$cached_config ) {
			self::init();
		}

		if ( ! self::$cached_ingestion_token_status_loaded ) {
			self::$cached_ingestion_token_failure       = self::detect_ingestion_token_failure( self::get_config() );
			self::$cached_ingestion_token_status_loaded = true;
		}

		return self::$cached_ingestion_token_failure;
	}

	/**
	 * Detect the token preflight failure details.
	 *
	 * @param array<string, mixed> $config Ingestion API config.
	 * @return array{message: string, error_class: string, error_code: string}|null Failure details, or null when the token can be used.
	 */
	private static function detect_ingestion_token_failure( array $config ): ?array {
		if ( self::is_missing_ingestion_token( $config ) ) {
			// Missing token is a setup/config problem, not an auth failure from
			// Salesforce, so Dashboard should point users back to setup.
			return [
				'message'     => 'Missing required API configuration: ingestion_api_token',
				'error_class' => 'config',
				'error_code'  => Ingestion_Error::MISSING_API_CONFIG,
			];
		}

		if ( ! array_key_exists( 'ingestion_api_token_expires_at', $config ) ) {
			// Older/local configs may not include expiry metadata. Treat absence
			// as usable so we do not block working sites on a new optional field.
			return null;
		}

		$expires_at_timestamp = self::get_ingestion_token_expiry_timestamp( $config['ingestion_api_token_expires_at'] );
		if ( null === $expires_at_timestamp ) {
			// Bad expiry metadata is safer to surface as auth/config drift than
			// to keep sending requests with an unknown token lifetime.
			return [
				'message'     => 'Ingestion API token expiry is invalid',
				'error_class' => 'auth',
				'error_code'  => Ingestion_Error::TOKEN_INVALID,
			];
		}

		if ( $expires_at_timestamp <= time() ) {
			// Expired tokens are deterministic: retry backoff will not help
			// until the customer reconnects.
			return [
				'message'     => 'Ingestion API token has expired',
				'error_class' => 'auth',
				'error_code'  => Ingestion_Error::TOKEN_EXPIRED,
			];
		}

		return null;
	}

	/**
	 * Whether the ingestion token is missing.
	 *
	 * @param array<string, mixed> $config Ingestion API config.
	 */
	private static function is_missing_ingestion_token( array $config ): bool {
		$token = $config['ingestion_api_token'] ?? '';

		return ! is_string( $token ) || '' === trim( $token );
	}

	/**
	 * Get the token expiry timestamp.
	 *
	 * @param mixed $expires_at Token expiry value.
	 * @return int|null Parsed expiry timestamp, or null when invalid.
	 */
	private static function get_ingestion_token_expiry_timestamp( $expires_at ): ?int {
		if ( ! is_scalar( $expires_at ) ) {
			return null;
		}

		$expires_at = trim( (string) $expires_at );
		if ( '' === $expires_at ) {
			return null;
		}

		$expires_at_timestamp = is_numeric( $expires_at ) ? (int) $expires_at : strtotime( $expires_at );
		if ( false === $expires_at_timestamp ) {
			return null;
		}

		return $expires_at_timestamp;
	}

	private static function init(): void {
		self::refresh_config();
	}

	/**
	 * Retrieve the actual configuration from VIP platform config or the legacy constant.
	 *
	 * @return array<string, mixed> The configuration array.
	 */
	private static function get_actual_config(): array {
		$configs = self::get_vip_integration_config();

		if ( null === $configs ) {
			$configs = self::get_constant_config();
		}

		if ( null === $configs ) {
			Logger::warning_log_if_user_logged_in( 'sb_configs', 'VIP Agentforce config is not available from platform config or VIP_AGENTFORCE_CONFIGS.' );
			$configs = [];
		}

		if ( is_string( $configs ) ) {
			$configs = json_decode( $configs, true );
		}
		if ( ! is_array( $configs ) ) {
			$configs = [];
		}

		$normalized_config = self::normalize_config( $configs );
		$filtered_config   = apply_filters( 'vip_agentforce_config', $normalized_config );

		if ( ! is_array( $filtered_config ) ) {
			return $normalized_config;
		}

		return self::normalize_config( $filtered_config );
	}

	/**
	 * Retrieve the latest config from VIP's integrations config file, if loaded.
	 *
	 * @return array<string, mixed>|null The platform config, or null when unavailable.
	 */
	private static function get_vip_integration_config(): ?array {
		if ( ! class_exists( '\\Automattic\\VIP\\Integrations\\IntegrationVipConfig' ) ) {
			return null;
		}

		$vip_config = new \Automattic\VIP\Integrations\IntegrationVipConfig( self::INTEGRATION_SLUG );
		$config     = array_merge(
			$vip_config->get_env_config(),
			$vip_config->get_network_site_config()
		);

		return ! empty( $config ) ? $config : null;
	}

	/**
	 * Retrieve config from the legacy constant.
	 *
	 * @return array<string, mixed>|string|null The constant value, or null when absent.
	 */
	private static function get_constant_config(): array|string|null {
		if ( ! defined( 'VIP_AGENTFORCE_CONFIGS' ) ) {
			return null;
		}

		$configs = constant( 'VIP_AGENTFORCE_CONFIGS' );

		return is_array( $configs ) || is_string( $configs ) ? $configs : null;
	}

	/**
	 * Normalize config values for consistent access.
	 *
	 * @param array<string, mixed> $configs Raw config array.
	 * @return array<string, mixed> Normalized config array.
	 */
	public static function normalize_config( array $configs ): array {
		$categories = $configs['ingestion_api_categories'] ?? [];
		// Normalize ingestion_api_categories: filter to non-empty strings only.
		if ( is_array( $categories ) && ! empty( $categories ) ) {
			$configs['ingestion_api_categories'] = array_values(
				array_filter( $categories, fn( $cat ) => is_string( $cat ) && '' !== $cat )
			);
		} else {
			$configs['ingestion_api_categories'] = [];
		}

		return $configs;
	}

	/**
	 * Returns the prechat fields to pass to the Agentforce embedded messaging widget.
	 *
	 * @return array<string, string> Key-value pairs of hidden prechat fields.
	 */
	public static function get_prechat_fields(): array {
		$site_key = self::get_site_key();

		$fields = array();

		if ( '' !== $site_key ) {
			$fields['site_id_blog_id'] = $site_key;
		}

		/**
		 * Filters the hidden prechat fields sent to the Agentforce widget.
		 *
		 * @since 0.2.0
		 *
		 * @param array<string, string> $fields Key-value pairs of prechat fields.
		 */
		$filtered_fields = apply_filters( 'vip_agentforce_prechat_fields', $fields );

		if ( ! is_array( $filtered_fields ) ) {
			return $fields;
		}

		$normalized = array();
		foreach ( $filtered_fields as $key => $value ) {
			if ( is_string( $key ) && is_string( $value ) && '' !== $value ) {
				$normalized[ $key ] = $value;
			}
		}

		return $normalized;
	}

	/**
	 * Returns the stored site key used for prechat and ingestion filtering.
	 */
	public static function get_site_key(): string {
		$config = self::get_config();
		$key    = $config['site_key'] ?? '';

		if ( ! is_string( $key ) ) {
			return '';
		}

		$key = trim( $key );
		if ( '' === $key ) {
			return '';
		}

		return $key;
	}

	public static function is_local_env(): bool {
		return ! defined( 'VIP_GO_APP_ENVIRONMENT' ) || 'local' === constant( 'VIP_GO_APP_ENVIRONMENT' );
	}

	public static function is_production_env(): bool {
		return defined( 'VIP_GO_APP_ENVIRONMENT' ) && 'production' === constant( 'VIP_GO_APP_ENVIRONMENT' );
	}

	/**
	 * Returns whether all posts should be synced to the Ingestion API.
	 *
	 * When true, all published posts will be ingested regardless of other filters.
	 *
	 * @return bool
	 */
	public static function should_sync_all_posts(): bool {
		$config = self::get_config();
		return true === ( $config['ingestion_api_sync_all_posts'] ?? false );
	}

	/**
	 * Returns the list of category names to sync to the Ingestion API.
	 *
	 * Posts in any of these categories will be ingested.
	 * Uses category name (not slug) for human readability and resilience to slug changes.
	 *
	 * @return string[] Array of category names.
	 */
	public static function get_ingestion_categories(): array {
		return self::get_config()['ingestion_api_categories'] ?? [];
	}
}
