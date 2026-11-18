<?php
/**
 * Secure credential storage for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API;

use GistAnswers\Admin\MenuItems\ToolsOptions;
use GistAnswers\API\Endpoint;
use GistAnswers\API\Get\Categories;
use GistAnswers\API\Get\Publishers;
use GistAnswers\API\Get\PublisherGroups;
use GistAnswers\Model\GistSite;
use GistAnswers\Model\GistWidget;
use GistAnswers\Plugin\Config;
use GistAnswers\Plugin\Utilities;
use SodiumException;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles encrypted storage and retrieval of the Gist Answers API token.
 */
final class Credentials {

	// Version 2 no longer binds the encrypted token to the site's home URL (see get_additional_authenticated_data()).
	private const CIPHER_VERSION = 2;

	private const PRIMARY_OPTION_NAME = 'gist_answers_api_token';

	public const CIPHER_SODIUM      = 'sodium_secretbox';
	public const CIPHER_OPENSSL_GCM = 'openssl_aes_256_gcm';
	public const CIPHER_OPENSSL_CBC = 'openssl_aes_256_cbc_hmac';

	private const PRIMARY_TRANSIENT_NAME     = 'gist_answers_api_token_is_valid';
	private const PRIMARY_TRANSIENT_DURATION = 5 * MINUTE_IN_SECONDS;

	// A failed token check is remembered briefly, so an API outage doesn't make every request re-check the token.
	private const FAILED_CHECK_TRANSIENT_NAME     = 'gist_answers_api_token_check_failed';
	private const FAILED_CHECK_TRANSIENT_DURATION = MINUTE_IN_SECONDS;

	// The value of the failed check transient when the API couldn't be reached, rather than rejecting the token.
	private const FAILED_CHECK_UNREACHABLE = 'unreachable';

	// How long the last successful token check is relied on, on the front end, while the API can't be reached.
	private const LAST_VALID_TRANSIENT_NAME     = 'gist_answers_api_token_was_valid';
	private const LAST_VALID_TRANSIENT_DURATION = HOUR_IN_SECONDS;

	// Only one front-end request at a time checks the token; the lock expires by itself in case that request dies.
	private const CHECK_LOCK_NAME     = 'gist_answers_api_token_check_lock';
	private const CHECK_LOCK_DURATION = 30;

	// When no publisher is linked to a site, the API is only searched for a matching one this often.
	private const PUBLISHER_LOOKUP_TRANSIENT_NAME     = 'gist_answers_publisher_lookup_attempted';
	private const PUBLISHER_LOOKUP_TRANSIENT_DURATION = 5 * MINUTE_IN_SECONDS;

	// The plugin's admin screens and the block editor refresh a site's publisher data at most this often.
	private const PUBLISHER_REFRESH_TRANSIENT_NAME     = 'gist_answers_publisher_refreshed';
	private const PUBLISHER_REFRESH_TRANSIENT_DURATION = MINUTE_IN_SECONDS;

	// When the publisher group (account) can't be fetched, it isn't requested again for this long.
	private const PUBLISHER_GROUP_FAILED_TRANSIENT_NAME     = 'gist_answers_publisher_group_failed';
	private const PUBLISHER_GROUP_FAILED_TRANSIENT_DURATION = 5 * MINUTE_IN_SECONDS;

	// When a publisher can't be fetched to refresh a site's data, no site (in the network, on multisite) refreshes its
	// publisher data for this long, so an outage costs one failed lookup rather than one per site.
	private const PUBLISHER_FETCH_FAILED_TRANSIENT_NAME     = 'gist_answers_publisher_fetch_failed';
	private const PUBLISHER_FETCH_FAILED_TRANSIENT_DURATION = MINUTE_IN_SECONDS;

	// Every transient this class sets (on each site, and network-wide on multisite), for the Danger Zone to delete.
	public const TRANSIENT_NAMES = array(
		self::PRIMARY_TRANSIENT_NAME,
		self::FAILED_CHECK_TRANSIENT_NAME,
		self::LAST_VALID_TRANSIENT_NAME,
		self::PUBLISHER_LOOKUP_TRANSIENT_NAME,
		self::PUBLISHER_REFRESH_TRANSIENT_NAME,
		self::PUBLISHER_GROUP_FAILED_TRANSIENT_NAME,
		self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME,
	);

	private const PUBLISHER_GROUP_OPTION = 'gist_answers_publisher_group';
	private const PUBLISHER_OPTION       = 'gist_answers_publisher';
	private const CATEGORIES_OPTION      = 'gist_answers_categories';

	private const PUBLISHER_STORED_OPTION = 'gist_answers_publisher_is_stored';

	// On multisite, which publisher each site in the network is linked to (blog ID => publisher ID), stored network-wide.
	private const PUBLISHER_LINKS_OPTION = 'gist_answers_publisher_links';

	// While that map is being rebuilt, the ID of the last site whose stored publisher has been added to it.
	private const PUBLISHER_LINKS_REBUILD_OPTION = 'gist_answers_publisher_links_rebuilt_to';

	/**
	 * The WP-Cron hook that carries on rebuilding the network's map of linked publishers (see get_publisher_links()).
	 *
	 * @var string
	 */
	public const PUBLISHER_LINKS_REBUILD_CRON_HOOK = 'gist_answers_rebuild_publisher_links';

	// How long the WP-Cron event spends rebuilding the map before it schedules itself again.
	private const PUBLISHER_LINKS_REBUILD_SECONDS = 10;

	/**
	 * Minimum name match score (see Utilities::get_name_match_score()) for a site to be linked to a publisher
	 * without asking, once their domains match.
	 *
	 * @var int
	 */
	private const NAME_MATCH_THRESHOLD = 70;

	/**
	 * The WP-Cron hook that refreshes a site's publisher data in the background (see schedule_publisher_data_refresh()).
	 *
	 * @var string
	 */
	public const PUBLISHER_REFRESH_CRON_HOOK = 'gist_answers_refresh_publisher_data';

	private const CACHE_CONNECTION_STATUS = true;

	private const API_KEY_ENVIRONMENT_VAR = 'GIST_ANSWERS_API_KEY';
	private const API_KEY_DEFINED_CONST   = 'GIST_ANSWERS_API_KEY';

	/**
	 * The publishers list, for the current request: null until it has been requested, and empty if that failed.
	 *
	 * @var array<mixed>|null
	 */
	private static ?array $publishers_list_cache = null;

	/**
	 * Whether the request for the publishers list failed (it isn't requested again in the same request).
	 *
	 * @var bool
	 */
	private static bool $publishers_list_failed = false;

	/**
	 * Cached response for the categories list.
	 *
	 * @var mixed
	 */
	private static mixed $categories_list_cache = array();

	/**
	 * Flag indicating a valid API token has already been confirmed.
	 *
	 * @var bool
	 */
	private static bool $has_valid_api_token = false;

	/**
	 * API token source ('vip', 'environment', 'constant', 'database', or 'undefined').
	 *
	 * @var string
	 */
	private static string $api_token_source = 'undefined';

	/**
	 * How many sites' stored publishers are added to the network's map of linked publishers at a time, while it's
	 * being rebuilt.
	 *
	 * @var int
	 */
	private static int $publisher_links_rebuild_batch_size = 100;

	/**
	 * Saves the (already validated) API token encrypted in the WordPress options table.
	 *
	 * @param string $api_token Plain-text API token (which has already been validated with the API).
	 *
	 * @return bool True if the API token was successfully stored, false otherwise.
	 */
	public static function store_api_token( string $api_token ): bool {

		self::delete_api_token();

		// The new token may see other publishers, or reach the API where the old one couldn't.
		self::clear_publishers_list_cache();

		$api_token = trim( $api_token );

		if ( empty( $api_token ) ) {
			return false;
		}

		$encrypted = self::encrypt( $api_token );

		if ( ! empty( $encrypted ) ) {
			if ( is_multisite() ) {
				update_site_option( self::PRIMARY_OPTION_NAME, $encrypted, false );
			} else {
				update_option( self::PRIMARY_OPTION_NAME, $encrypted );
			}
		}

		return boolval( $encrypted );
	}

	/**
	 * Retrieves and decrypts the stored API token.
	 *
	 * @return string The decrypted API token, or an empty string if not available.
	 */
	public static function get_api_token(): string {

		$breaking_suffix = ToolsOptions::should_simulate_api_token_error() ? 'x' : '';

		$vip_config = Config::from_constant();

		// A VIP-provided config always wins, even when incomplete, so a stale token from another source is never used in its place.
		if ( $vip_config->is_available() ) {

			self::$api_token_source = 'vip';

			return $vip_config->is_ready() ? trim( $vip_config->get( 'api_token' ) ) . $breaking_suffix : '';
		}

		$api_token = getenv( self::API_KEY_ENVIRONMENT_VAR );

		if ( ! empty( $api_token ) ) {

			self::$api_token_source = 'environment';

			return $api_token . $breaking_suffix;
		}

		$api_token = defined( self::API_KEY_DEFINED_CONST ) ? constant( self::API_KEY_DEFINED_CONST ) : '';

		if ( ! empty( $api_token ) ) {

			self::$api_token_source = 'constant';

			return $api_token . $breaking_suffix;
		}

		self::$api_token_source = 'database';

		if ( is_multisite() ) {
			$encrypted = get_site_option( self::PRIMARY_OPTION_NAME );
		} else {
			$encrypted = get_option( self::PRIMARY_OPTION_NAME );
		}

		if ( ! is_array( $encrypted ) ) {
			return '';
		}

		$decrypted = self::decrypt( $encrypted );

		// Re-encrypt a token stored with an earlier version of the scheme, so it no longer depends on the home URL.
		if ( '' !== $decrypted && intval( $encrypted['version'] ?? 0 ) < self::CIPHER_VERSION ) {

			$reencrypted = self::encrypt( $decrypted, strval( $encrypted['cipher'] ?? '' ) );

			if ( ! empty( $reencrypted ) ) {
				if ( is_multisite() ) {
					update_site_option( self::PRIMARY_OPTION_NAME, $reencrypted );
				} else {
					update_option( self::PRIMARY_OPTION_NAME, $reencrypted );
				}
			}
		}

		return is_string( $decrypted ) ? $decrypted . $breaking_suffix : '';
	}

	/**
	 * Deletes the stored API token.
	 *
	 * @return void
	 */
	public static function delete_api_token(): void {

		if ( is_multisite() ) {
			delete_site_option( self::PRIMARY_OPTION_NAME );
		} else {
			delete_option( self::PRIMARY_OPTION_NAME );
		}

		self::delete_primary_transient();
	}

	/**
	 * Delete the primary transient (possibly due to a detected connection issue).
	 */
	public static function delete_primary_transient(): void {
		if ( is_multisite() ) {
			delete_site_transient( self::PRIMARY_TRANSIENT_NAME );
			delete_site_transient( self::FAILED_CHECK_TRANSIENT_NAME );
			delete_site_transient( self::LAST_VALID_TRANSIENT_NAME );
		} else {
			delete_transient( self::PRIMARY_TRANSIENT_NAME );
			delete_transient( self::FAILED_CHECK_TRANSIENT_NAME );
			delete_transient( self::LAST_VALID_TRANSIENT_NAME );
		}
	}

	/**
	 * Checks whether an API token is currently stored.
	 *
	 * @return bool True if an API token is currently stored, false otherwise.
	 */
	public static function has_stored_api_token(): bool {

		$vip_config = Config::from_constant();

		if ( $vip_config->is_available() ) {
			return $vip_config->is_ready();
		}

		if ( ! empty( getenv( self::API_KEY_ENVIRONMENT_VAR ) ) ) {
			return true;
		}

		if ( defined( self::API_KEY_DEFINED_CONST ) && ! empty( constant( self::API_KEY_DEFINED_CONST ) ) ) {
			return true;
		}

		if ( is_multisite() ) {
			$maybe_stored_api_token = get_site_option( self::PRIMARY_OPTION_NAME );
		} else {
			$maybe_stored_api_token = get_option( self::PRIMARY_OPTION_NAME );
		}

		return is_array( $maybe_stored_api_token );
	}

	/**
	 * Checks whether the stored API token is valid.
	 *
	 * A successful check is cached for PRIMARY_TRANSIENT_DURATION, and a failed one for FAILED_CHECK_TRANSIENT_DURATION.
	 * On the front end, where the check would hold up the page, only one request at a time makes it, and while it
	 * does, or while the API can't be reached, the token counts as valid if it was valid within
	 * LAST_VALID_TRANSIENT_DURATION. Only the API rejecting the token (401 or 403) makes it invalid straight away.
	 *
	 * @return bool True if the stored API token is valid, false otherwise.
	 */
	public static function has_valid_api_token(): bool {

		if ( ! self::$has_valid_api_token ) {

			if ( is_multisite() ) {
				$primary_transient = get_site_transient( self::PRIMARY_TRANSIENT_NAME );
			} else {
				$primary_transient = get_transient( self::PRIMARY_TRANSIENT_NAME );
			}

			self::$has_valid_api_token = ( self::CACHE_CONNECTION_STATUS && $primary_transient );
		}

		if ( self::$has_valid_api_token ) {

			Endpoint::reset_last_response_if_valid();

			return true;
		}

		$api_token = self::get_api_token();

		// Without a token there's nothing to check, so the Gist API isn't contacted.
		if ( '' === trim( $api_token ) ) {
			return false;
		}

		$is_front_end = Endpoint::is_front_end_request();

		$last_known_valid = $is_front_end && self::CACHE_CONNECTION_STATUS && ( is_multisite() ? get_site_transient( self::LAST_VALID_TRANSIENT_NAME ) : get_transient( self::LAST_VALID_TRANSIENT_NAME ) );

		$recently_failed = is_multisite() ? get_site_transient( self::FAILED_CHECK_TRANSIENT_NAME ) : get_transient( self::FAILED_CHECK_TRANSIENT_NAME );

		if ( self::CACHE_CONNECTION_STATUS && $recently_failed ) {
			return self::FAILED_CHECK_UNREACHABLE === $recently_failed && $last_known_valid;
		}

		if ( $is_front_end && ! Utilities::acquire_lock( self::CHECK_LOCK_NAME, self::CHECK_LOCK_DURATION, true ) ) {
			return $last_known_valid;
		}

		self::$has_valid_api_token = Endpoint::validate_api_token( $api_token );

		$is_rejected = in_array( Endpoint::get_last_response()->code, array( 401, 403 ), true );

		if ( $is_front_end ) {
			Utilities::release_lock( self::CHECK_LOCK_NAME, true );
		}

		if ( self::CACHE_CONNECTION_STATUS ) {
			if ( self::$has_valid_api_token ) {
				self::set_token_check_transient( self::PRIMARY_TRANSIENT_NAME, true, self::PRIMARY_TRANSIENT_DURATION );
				self::set_token_check_transient( self::LAST_VALID_TRANSIENT_NAME, true, self::LAST_VALID_TRANSIENT_DURATION );
			} else {
				self::set_token_check_transient( self::FAILED_CHECK_TRANSIENT_NAME, $is_rejected ? true : self::FAILED_CHECK_UNREACHABLE, self::FAILED_CHECK_TRANSIENT_DURATION );
			}
		}

		return self::$has_valid_api_token || ( ! $is_rejected && $last_known_valid );
	}

	/**
	 * Set one of the transients that cache the result of the token check (network-wide on multisite).
	 *
	 * @param string $transient_name The transient name.
	 * @param mixed  $value          The value.
	 * @param int    $duration       The number of seconds until it expires.
	 *
	 * @return void
	 */
	private static function set_token_check_transient( string $transient_name, mixed $value, int $duration ): void {
		if ( is_multisite() ) {
			set_site_transient( $transient_name, $value, $duration );
		} else {
			set_transient( $transient_name, $value, $duration );
		}
	}

	/**
	 * Encrypts plain text using the strongest available supported cipher.
	 *
	 * @param string $plain_text Plain text to be encrypted.
	 * @param string $method     Encryption method to use ('any' to select the strongest available).
	 *
	 * @return array<mixed> Encrypted payload containing the cipher, version, and encrypted data.
	 */
	public static function encrypt( string $plain_text, string $method = 'any' ): array {

		switch ( $method ) {
			case self::CIPHER_SODIUM:
				return self::encrypt_sodium( $plain_text );

			case self::CIPHER_OPENSSL_GCM:
				return self::encrypt_openssl_gcm( $plain_text );

			case self::CIPHER_OPENSSL_CBC:
				return self::encrypt_openssl_cbc( $plain_text );
		}

		if ( self::supports_sodium() ) {
			return self::encrypt_sodium( $plain_text );
		}

		if ( self::supports_openssl_gcm() ) {
			return self::encrypt_openssl_gcm( $plain_text );
		}

		if ( self::supports_openssl_cbc() ) {
			return self::encrypt_openssl_cbc( $plain_text );
		}

		return array();
	}

	/**
	 * Decrypts a stored encrypted payload.
	 *
	 * @param array<mixed> $payload Encrypted payload data.
	 *
	 * @return string The decrypted plain text, or an empty string if decryption fails.
	 */
	public static function decrypt( array $payload ): string {

		if ( ! self::validate_payload_base( $payload ) ) {
			return '';
		}

		switch ( $payload['cipher'] ) {

			case self::CIPHER_SODIUM:
				return self::decrypt_sodium( $payload );

			case self::CIPHER_OPENSSL_GCM:
				return self::decrypt_openssl_gcm( $payload );

			case self::CIPHER_OPENSSL_CBC:
				return self::decrypt_openssl_cbc( $payload );

			default:
				return '';
		}
	}

	/**
	 * Encrypts using Sodium secretbox.
	 *
	 * @param string $plain_text Plain text to be encrypted.
	 *
	 * @return array<mixed> Encrypted payload containing the cipher, version, nonce, and encrypted data.
	 */
	private static function encrypt_sodium( string $plain_text ): array {

		$key   = self::get_encryption_key( SODIUM_CRYPTO_SECRETBOX_KEYBYTES );
		$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );

		$cipher_text = sodium_crypto_secretbox( $plain_text, $nonce, $key );

		return array(
			'version' => self::CIPHER_VERSION,
			'cipher'  => self::CIPHER_SODIUM,
			'nonce'   => base64_encode( $nonce ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
			'value'   => base64_encode( $cipher_text ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
		);
	}

	/**
	 * Decrypts a Sodium secretbox payload.
	 *
	 * @param array<mixed> $payload Encrypted payload data.
	 *
	 * @return string The decrypted plain text, or an empty string if decryption fails.
	 */
	private static function decrypt_sodium( array $payload ): string {

		if ( ! self::supports_sodium() ) {
			return '';
		}

		if ( empty( $payload['nonce'] ) || empty( $payload['value'] ) ) {
			return '';
		}

		$key         = self::get_encryption_key( SODIUM_CRYPTO_SECRETBOX_KEYBYTES, null, $payload['version'] );
		$nonce       = self::base64_decode_strict( $payload['nonce'] );
		$cipher_text = self::base64_decode_strict( $payload['value'] );

		if ( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES !== strlen( $nonce ) || '' === $cipher_text ) {
			return '';
		}

		try {
			$plain_text = sodium_crypto_secretbox_open( $cipher_text, $nonce, $key );
		} catch ( SodiumException $e ) {
			return '';
		}

		if ( false === $plain_text ) {
			return '';
		}

		return $plain_text;
	}

	/**
	 * Encrypts using OpenSSL AES-256-GCM.
	 *
	 * @param string $plain_text Plain text to be encrypted.
	 *
	 * @return array<mixed> Encrypted payload containing the cipher, version, IV, tag, and encrypted data.
	 */
	private static function encrypt_openssl_gcm( string $plain_text ): array {

		$key = self::get_encryption_key( 32 );
		$iv  = random_bytes( 12 );
		$tag = '';

		$cipher_text = openssl_encrypt(
			$plain_text,
			'aes-256-gcm',
			$key,
			OPENSSL_RAW_DATA,
			$iv,
			$tag,
			self::get_additional_authenticated_data( self::CIPHER_VERSION )[0],
		);

		if ( false === $cipher_text ) {
			return array();
		}

		return array(
			'version' => self::CIPHER_VERSION,
			'cipher'  => self::CIPHER_OPENSSL_GCM,
			'iv'      => base64_encode( $iv ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
			'tag'     => base64_encode( $tag ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
			'value'   => base64_encode( $cipher_text ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
		);
	}

	/**
	 * Decrypts an OpenSSL AES-256-GCM payload.
	 *
	 * @param array<mixed> $payload Encrypted payload data.
	 *
	 * @return string The decrypted plain text, or an empty string if decryption fails.
	 */
	private static function decrypt_openssl_gcm( array $payload ): string {

		if ( ! self::supports_openssl_gcm() ) {
			return '';
		}

		if ( empty( $payload['iv'] ) || empty( $payload['tag'] ) || empty( $payload['value'] ) ) {
			return '';
		}

		$key         = self::get_encryption_key( 32, null, $payload['version'] );
		$iv          = self::base64_decode_strict( $payload['iv'] );
		$tag         = self::base64_decode_strict( $payload['tag'] );
		$cipher_text = self::base64_decode_strict( $payload['value'] );

		foreach ( self::get_additional_authenticated_data( intval( $payload['version'] ) ) as $additional_authenticated_data ) {

			$plain_text = openssl_decrypt(
				$cipher_text,
				'aes-256-gcm',
				$key,
				OPENSSL_RAW_DATA,
				$iv,
				$tag,
				$additional_authenticated_data,
			);

			if ( false !== $plain_text ) {
				return $plain_text;
			}
		}

		return '';
	}

	/**
	 * Encrypts using OpenSSL AES-256-CBC with HMAC authentication.
	 *
	 * @param string $plain_text Plain text to be encrypted.
	 *
	 * @return array<mixed> Encrypted payload containing the cipher, version, IV, HMAC, and encrypted data.
	 */
	private static function encrypt_openssl_cbc( string $plain_text ): array {

		$enc_key  = self::get_encryption_key( 32, 'encryption' );
		$hmac_key = self::get_encryption_key( 32, 'authentication' );
		$iv       = random_bytes( 16 );

		$cipher_text = openssl_encrypt(
			$plain_text,
			'aes-256-cbc',
			$enc_key,
			OPENSSL_RAW_DATA,
			$iv,
		);

		if ( false === $cipher_text ) {
			return array();
		}

		$mac = hash_hmac(
			'sha256',
			$iv . $cipher_text . self::get_additional_authenticated_data( self::CIPHER_VERSION )[0],
			$hmac_key,
			true,
		);

		return array(
			'version' => self::CIPHER_VERSION,
			'cipher'  => self::CIPHER_OPENSSL_CBC,
			'iv'      => base64_encode( $iv ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
			'mac'     => base64_encode( $mac ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
			'value'   => base64_encode( $cipher_text ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Used for key encryption.
		);
	}

	/**
	 * Decrypts an OpenSSL AES-256-CBC + HMAC payload.
	 *
	 * @param array<mixed> $payload Encrypted payload data.
	 *
	 * @return string The decrypted plain text, or an empty string if decryption fails.
	 */
	private static function decrypt_openssl_cbc( array $payload ): string {

		if ( ! self::supports_openssl_cbc() ) {
			return '';
		}

		if ( empty( $payload['iv'] ) || empty( $payload['mac'] ) || empty( $payload['value'] ) ) {
			return '';
		}

		$enc_key     = self::get_encryption_key( 32, 'encryption', $payload['version'] );
		$hmac_key    = self::get_encryption_key( 32, 'authentication', $payload['version'] );
		$iv          = self::base64_decode_strict( $payload['iv'] );
		$stored_mac  = self::base64_decode_strict( $payload['mac'] );
		$cipher_text = self::base64_decode_strict( $payload['value'] );

		$is_authentic = false;

		foreach ( self::get_additional_authenticated_data( intval( $payload['version'] ) ) as $additional_authenticated_data ) {

			$calculated_mac = hash_hmac(
				'sha256',
				$iv . $cipher_text . $additional_authenticated_data,
				$hmac_key,
				true,
			);

			$is_authentic = $is_authentic || hash_equals( $calculated_mac, $stored_mac );
		}

		if ( ! $is_authentic ) {
			return '';
		}

		$plain_text = openssl_decrypt(
			$cipher_text,
			'aes-256-cbc',
			$enc_key,
			OPENSSL_RAW_DATA,
			$iv,
		);

		if ( false === $plain_text ) {
			return '';
		}

		return $plain_text;
	}

	/**
	 * Validates shared encrypted payload fields.
	 *
	 * @param array<mixed> $payload Encrypted payload data.
	 *
	 * @return bool True if the payload contains the required fields, false otherwise.
	 */
	private static function validate_payload_base( array $payload ): bool {

		if (
			empty( $payload['version'] ?? null ) ||
			empty( $payload['cipher'] ?? null )
		) {
			return false;
		}

		return true;
	}

	/**
	 * Generates a stable binary encryption token from WordPress salts.
	 *
	 * @param int     $length  Token length in bytes.
	 * @param ?string $purpose Optional purpose string for token separation.
	 * @param int     $version Optional version for token separation.
	 *
	 * @return string The generated binary encryption token.
	 */
	private static function get_encryption_key( int $length, ?string $purpose = null, int $version = self::CIPHER_VERSION ): string {

		$purpose = $purpose ? $purpose : 'default';

		$material =
			wp_salt( 'auth' ) .
			wp_salt( 'secure_auth' ) .
			wp_salt( 'logged_in' ) .
			wp_salt( 'nonce' ) .
			'|gist_answers_api_token|' .
			$purpose .
			'|v' .
			$version;

		if ( function_exists( 'sodium_crypto_generichash' ) ) {
			return sodium_crypto_generichash( $material, '', $length );
		}

		return hash_hkdf(
			'sha256',
			$material,
			$length,
			'gist_answers_api_token_' . $purpose,
			'',
		);
	}

	/**
	 * Returns the additional authenticated data that a payload of the given version may have been encrypted with
	 * (the first is used for encrypting).
	 *
	 * Version 1 included the site's home URL, so a token stored network-wide on multisite (encrypted on the main site)
	 * didn't decrypt on other sites, nor after a domain change. The main site's home URL is tried too for those
	 * payloads. Later versions don't include a URL: the key is already bound to this install by its salts.
	 *
	 * @param int $version Version of the encryption scheme.
	 *
	 * @return array<string> The additional authenticated data for the given encryption version.
	 */
	private static function get_additional_authenticated_data( int $version ): array {

		if ( $version >= 2 ) {
			return array( 'gist_answers|' . self::PRIMARY_OPTION_NAME . '|v' . $version );
		}

		$home_urls = array( home_url() );

		if ( is_multisite() ) {
			$home_urls[] = get_home_url( get_main_site_id() );
		}

		return array_map(
			fn ( $home_url ) => $home_url . '|gist_answers|' . self::PRIMARY_OPTION_NAME . '|v' . $version,
			array_values( array_unique( $home_urls ) )
		);
	}

	/**
	 * Strictly decodes a base64 value.
	 *
	 * @param mixed $value Base64 value.
	 *
	 * @return string The decoded binary value, or an empty string if decoding fails.
	 */
	private static function base64_decode_strict( $value ): string {

		if ( ! is_string( $value ) ) {
			return '';
		}

		$decoded = base64_decode( $value, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Used legitimately for key encryption.

		if ( false === $decoded ) {
			return '';
		}

		return $decoded;
	}

	/**
	 * Determines whether Sodium secretbox is available.
	 *
	 * @return bool True if Sodium secretbox is available, false otherwise.
	 */
	private static function supports_sodium(): bool {
		return function_exists( 'sodium_crypto_secretbox' )
			&& function_exists( 'sodium_crypto_secretbox_open' )
			&& function_exists( 'sodium_crypto_generichash' )
			&& defined( 'SODIUM_CRYPTO_SECRETBOX_KEYBYTES' )
			&& defined( 'SODIUM_CRYPTO_SECRETBOX_NONCEBYTES' );
	}

	/**
	 * Determines whether OpenSSL AES-256-GCM is available.
	 *
	 * @return bool True if OpenSSL AES-256-GCM is available, false otherwise.
	 */
	private static function supports_openssl_gcm(): bool {
		return function_exists( 'openssl_encrypt' )
			&& function_exists( 'openssl_decrypt' )
			&& in_array( 'aes-256-gcm', openssl_get_cipher_methods(), true );
	}

	/**
	 * Determines whether OpenSSL AES-256-CBC is available.
	 *
	 * @return bool True if OpenSSL AES-256-CBC is available, false otherwise.
	 */
	private static function supports_openssl_cbc(): bool {
		return function_exists( 'openssl_encrypt' )
			&& function_exists( 'openssl_decrypt' )
			&& function_exists( 'hash_hmac' )
			&& in_array( 'aes-256-cbc', openssl_get_cipher_methods(), true );
	}

	/**
	 * Store the publisher group data for the selected site.
	 *
	 * A response without a publisher group (e.g., a failed request) leaves the stored data as it was, and stops
	 * get_publisher_group() from requesting it again for PUBLISHER_GROUP_FAILED_TRANSIENT_DURATION.
	 *
	 * @param object $response The response object containing publisher group data.
	 * @param int    $blog_id  Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return object The publisher group data from the response (with an empty `id` if there is none).
	 */
	public static function store_publisher_group( object $response, int $blog_id = 0 ): object {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$data = $response->data ?? null;

		if ( ! is_object( $data ) ) {
			$data = (object) array();
		}

		$output = (object) array(
			'id'          => $data->id ?? '',
			'name'        => $data->name ?? '',
			'description' => $data->description ?? '',
		);

		if ( empty( $output->id ) ) {
			set_transient( self::PUBLISHER_GROUP_FAILED_TRANSIENT_NAME, true, self::PUBLISHER_GROUP_FAILED_TRANSIENT_DURATION );
		} else {
			delete_transient( self::PUBLISHER_GROUP_FAILED_TRANSIENT_NAME );
			update_option( self::PUBLISHER_GROUP_OPTION, $output );
		}

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return $output;
	}

	/**
	 * Retrieve the stored publisher group data for the selected site, requesting it from the API if none is stored
	 * (unless that request failed within PUBLISHER_GROUP_FAILED_TRANSIENT_DURATION).
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return object The stored publisher group data (or empty object if not found)
	 */
	public static function get_publisher_group( int $blog_id = 0 ): object {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$data = get_option( self::PUBLISHER_GROUP_OPTION );

		$recently_failed = boolval( get_transient( self::PUBLISHER_GROUP_FAILED_TRANSIENT_NAME ) );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		$data = is_object( $data ) ? $data : (object) array();

		if ( empty( $data->id ?? null ) && ! $recently_failed ) {

			$publisher_groups_request = new PublisherGroups();

			return self::store_publisher_group( $publisher_groups_request->response(), $blog_id );
		}

		return $data;
	}

	/**
	 * Get the stored publisher group ID.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return string The stored publisher group ID, or an empty string if not found.
	 */
	public static function get_publisher_group_id( int $blog_id = 0 ): string {

		$publisher_group = self::get_publisher_group( $blog_id );

		return $publisher_group->id ?? '';
	}

	/**
	 * Delete the stored publisher group data for the selected site.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return void
	 */
	public static function delete_publisher_group( int $blog_id = 0 ): void {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		delete_option( self::PUBLISHER_GROUP_OPTION );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}
	}

	/**
	 * Refresh the publisher data for this site.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return void
	 */
	public static function refresh_publisher_data( int $blog_id = 0 ): void {

		self::update_publisher( $blog_id );

		if ( GistSite::should_gather_categories() ) {
			self::update_categories();
		}

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		set_transient( self::PUBLISHER_REFRESH_TRANSIENT_NAME, true, self::PUBLISHER_REFRESH_TRANSIENT_DURATION );

		// Any widget that is new to the site has its code fetched in the background, before a page view needs it.
		GistWidget::prewarm_widget_code();

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}
	}

	/**
	 * Refresh the publisher data for this site, unless it was refreshed within PUBLISHER_REFRESH_TRANSIENT_DURATION.
	 *
	 * The plugin's admin screens use this, so that loading them doesn't make the same API requests every time.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return void
	 */
	public static function refresh_publisher_data_if_stale( int $blog_id = 0 ): void {
		if ( ! self::publisher_data_is_fresh( $blog_id ) ) {
			self::refresh_publisher_data( $blog_id );
		}
	}

	/**
	 * Determine whether this site's publisher data was refreshed within PUBLISHER_REFRESH_TRANSIENT_DURATION.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return bool True if it was refreshed recently, false otherwise.
	 */
	public static function publisher_data_is_fresh( int $blog_id = 0 ): bool {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$is_fresh = boolval( get_transient( self::PUBLISHER_REFRESH_TRANSIENT_NAME ) );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return $is_fresh;
	}

	/**
	 * Schedule a WP-Cron event that refreshes this site's publisher data in the background, if it isn't fresh (see
	 * publisher_data_is_fresh()) and no refresh is already scheduled.
	 *
	 * @return void
	 */
	public static function schedule_publisher_data_refresh(): void {
		if ( self::has_stored_api_token() && ! self::publisher_data_is_fresh() && false === wp_next_scheduled( self::PUBLISHER_REFRESH_CRON_HOOK ) ) {
			wp_schedule_single_event( time(), self::PUBLISHER_REFRESH_CRON_HOOK );
		}
	}

	/**
	 * Update the stored publisher data for the selected site.
	 *
	 * A publisher that is already stored for the site (or the one given explicitly) is kept as long as it is still
	 * enabled in Gist Answers. Otherwise, a publisher is only matched automatically when its name matches the site
	 * name exactly (ignoring case and non-alphanumeric characters) and one of its domains matches the site URL.
	 *
	 * @param int    $blog_id                Optional ID of the blog/site. Defaults to 0.
	 * @param string $preferred_publisher_id Optional ID of a publisher to associate with the site. Defaults to the
	 *                                       ID of the publisher already stored for the site.
	 *
	 * @return object
	 */
	public static function update_publisher( int $blog_id = 0, string $preferred_publisher_id = '' ): object {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		if ( empty( $preferred_publisher_id ) ) {

			$stored_publisher = get_option( self::PUBLISHER_OPTION );

			$preferred_publisher_id = is_object( $stored_publisher ) ? strval( $stored_publisher->id ?? '' ) : '';
		}

		$publisher_data = null;

		// While Gist Answers can't be reached, the stored publisher is kept (rather than unlinking the site), without
		// trying again on every site.
		if ( ! self::publisher_fetch_recently_failed() ) {

			// A linked (or chosen) publisher is fetched by itself, rather than with every publisher in the account.
			$publisher = '' !== $preferred_publisher_id ? self::fetch_publisher( $preferred_publisher_id ) : null;

			if ( is_object( $publisher ) ) {

				$publisher_data = self::get_publisher_data_from( array( $publisher ), $preferred_publisher_id );

				// It has been disabled, so the site may match another of the account's publishers instead.
				if ( empty( (array) $publisher_data ) ) {
					$publisher_data = null;
					$publisher      = null;
				}
			}

			// No publisher is linked, or it no longer exists or is enabled (but not if it couldn't be fetched): the
			// account's publishers are searched for a match (see get_publisher_data_from()).
			if ( null === $publisher ) {

				$publishers = self::get_publishers_list();

				if ( ! self::$publishers_list_failed ) {
					$publisher_data = self::get_publisher_data_from( $publishers, $preferred_publisher_id );
				}
			}
		}

		// Keep the stored publisher if Gist Answers couldn't be reached, rather than unlinking the site.
		if ( null === $publisher_data ) {

			$stored_publisher = get_option( self::PUBLISHER_OPTION );

			if ( ! empty( $blog_id ) ) {
				restore_current_blog();
			}

			return is_object( $stored_publisher ) ? $stored_publisher : (object) array();
		}

		update_option( self::PUBLISHER_OPTION, $publisher_data );

		self::store_publisher_link( get_current_blog_id(), strval( $publisher_data->id ?? '' ) );

		if ( ! empty( (array) $publisher_data ) ) {
			update_option( self::PUBLISHER_STORED_OPTION, true );
		}

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return is_object( $publisher_data ) ? $publisher_data : (object) array();
	}

	/**
	 * Clear the cached list of publishers, and forget that fetching a publisher failed recently, so the next lookup
	 * asks Gist Answers again.
	 *
	 * @return void
	 */
	public static function clear_publishers_list_cache(): void {

		self::$publishers_list_cache  = null;
		self::$publishers_list_failed = false;

		if ( is_multisite() ) {
			delete_site_transient( self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME );
		} else {
			delete_transient( self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME );
		}
	}

	/**
	 * Retrieve the list of publishers known to Gist Answers (cached for the current page load, including a failure, so
	 * a failed list isn't requested again by every site on the page).
	 *
	 * @return array<object> The list of publishers returned by the API (empty if the request failed; see
	 *                       $publishers_list_failed).
	 */
	private static function get_publishers_list(): array {

		if ( null === self::$publishers_list_cache ) {

			$publishers_request = new Publishers();

			$response = $publishers_request->response();

			// A response without a list of publishers (e.g., invalid JSON, or the wrong shape) counts as a failure, so
			// that it isn't read as an empty list, which would unlink the site from its publisher.
			self::$publishers_list_failed = 200 !== $response->code || ! is_object( $response->data ?? null ) || ! is_array( $response->data->publishers ?? null );

			self::$publishers_list_cache = self::$publishers_list_failed ? array() : $response->data->publishers;

			if ( self::$publishers_list_failed ) {
				self::remember_publisher_fetch_failed();
			}
		}

		return self::$publishers_list_cache;
	}

	/**
	 * Fetch a single publisher from Gist Answers by its ID.
	 *
	 * @param string $publisher_id The publisher ID.
	 *
	 * @return object|false|null The publisher; null if it doesn't exist (or the API token can't see it); or false if
	 *                           Gist Answers couldn't be reached, or its response wasn't a publisher.
	 */
	private static function fetch_publisher( string $publisher_id ): object|false|null {

		$response = ( new Publishers( $publisher_id ) )->response();

		if ( in_array( $response->code, array( 403, 404 ), true ) ) {
			return null;
		}

		$publisher = $response->data ?? null;

		if ( 200 !== $response->code || ! is_object( $publisher ) || self::string_from( $publisher->id ?? null ) !== $publisher_id ) {

			self::remember_publisher_fetch_failed();

			return false;
		}

		return $publisher;
	}

	/**
	 * Remember that a publisher couldn't be fetched, so publisher data isn't refreshed for a while (see
	 * PUBLISHER_FETCH_FAILED_TRANSIENT_DURATION).
	 *
	 * @return void
	 */
	private static function remember_publisher_fetch_failed(): void {
		if ( is_multisite() ) {
			set_site_transient( self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME, true, self::PUBLISHER_FETCH_FAILED_TRANSIENT_DURATION );
		} else {
			set_transient( self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME, true, self::PUBLISHER_FETCH_FAILED_TRANSIENT_DURATION );
		}
	}

	/**
	 * Determine whether a publisher couldn't be fetched within the last PUBLISHER_FETCH_FAILED_TRANSIENT_DURATION.
	 *
	 * @return bool True if a fetch failed recently, false otherwise.
	 */
	private static function publisher_fetch_recently_failed(): bool {
		return boolval( is_multisite() ? get_site_transient( self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME ) : get_transient( self::PUBLISHER_FETCH_FAILED_TRANSIENT_NAME ) );
	}

	/**
	 * Extract the publisher data from the API response.
	 *
	 * @param array<object> $response_data          The API response data containing publisher information.
	 * @param string        $preferred_publisher_id Optional ID of a publisher to use if it is present and enabled.
	 *
	 * @return object The extracted publisher data, or an empty object if not match is found.
	 */
	private static function get_publisher_data_from( array $response_data, string $preferred_publisher_id = '' ): object {

		$eligible_publishers = array_filter(
			$response_data,
			fn ( $publisher ) => is_object( $publisher ) && ( $publisher->enabled ?? false ) && is_object( $publisher->config ?? null ) && '' !== self::string_from( $publisher->id ?? null )
		);

		if ( ! empty( $preferred_publisher_id ) ) {
			foreach ( $eligible_publishers as $publisher ) {
				if ( self::string_from( $publisher->id ?? null ) === $preferred_publisher_id ) {
					return self::build_publisher_data( $publisher );
				}
			}
		}

		$site_name = get_bloginfo( 'name' );

		foreach ( $eligible_publishers as $publisher ) {
			if ( self::publisher_domains_match_site( $publisher ) && self::publisher_name_matches_site( $publisher, $site_name ) ) {
				return self::build_publisher_data( $publisher );
			}
		}

		return (object) array();
	}

	/**
	 * Determine whether any of the publisher's domains match this site's URL (see get_publisher_domains()).
	 *
	 * @param object $publisher The publisher object from the API response.
	 *
	 * @return bool True if one of the publisher's domains matches this site's URL, false otherwise.
	 */
	private static function publisher_domains_match_site( object $publisher ): bool {

		$this_site_url = get_home_url();

		foreach ( self::get_publisher_domains( $publisher ) as $domain ) {
			if ( Utilities::do_domains_match( $domain, $this_site_url ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine whether the publisher's name is close enough to the site's name to link them without asking.
	 *
	 * @param object $publisher The publisher object from the API response.
	 * @param string $site_name The site's name.
	 *
	 * @return bool True if the names match at least NAME_MATCH_THRESHOLD, false otherwise.
	 */
	private static function publisher_name_matches_site( object $publisher, string $site_name ): bool {
		return Utilities::get_name_match_score( $site_name, self::string_from( $publisher->name ?? null ) ) >= self::NAME_MATCH_THRESHOLD;
	}

	/**
	 * Get all of the publisher's domains: its domain, home page URL, aliases, and dev domains.
	 *
	 * @param object $publisher The publisher object from the API response.
	 *
	 * @return array<string> The publisher's domains.
	 */
	private static function get_publisher_domains( object $publisher ): array {

		$config = is_object( $publisher->config ?? null ) ? $publisher->config : (object) array();

		$aliases = is_array( $config->aliases ?? null ) ? $config->aliases : array();

		$all_domains = array_merge(
			array(
				$config->domain ?? '',
				$config->home_page_url ?? '',
			),
			$aliases,
			self::extract_dev_domains_from_publisher_config( $config ),
		);

		$all_domains = array_filter( $all_domains, 'is_string' );
		$all_domains = array_filter( $all_domains );

		return array_values( array_unique( $all_domains ) );
	}

	/**
	 * Build the stored publisher data for the given publisher from the API response.
	 *
	 * @param object $publisher The publisher object from the API response.
	 *
	 * @return object The publisher data to store for this site.
	 */
	private static function build_publisher_data( object $publisher ): object {

		$config = is_object( $publisher->config ?? null ) ? $publisher->config : (object) array();

		return (object) array(
			'id'          => self::string_from( $publisher->id ?? null ),
			'name'        => self::string_from( $publisher->name ?? null ),
			'domain'      => self::string_from( $config->domain ?? null ),
			'dev_domains' => self::extract_dev_domains_from_publisher_config( $config ),
			'description' => self::string_from( $publisher->description ?? null ),
			'category_id' => self::string_from( $publisher->category_id ?? null ),
			'widgets'     => self::extract_widgets_from_publisher_data( $publisher ),
		);
	}

	/**
	 * Get a string value from the API response, which may be missing or of the wrong type.
	 *
	 * @param mixed $value The value from the API response.
	 *
	 * @return string The value as a trimmed string if it is a string or a number, or an empty string otherwise.
	 */
	private static function string_from( mixed $value ): string {
		return is_string( $value ) || is_int( $value ) || is_float( $value ) ? trim( strval( $value ) ) : '';
	}

	/**
	 * Work out how the selected site should be activated, by matching its domain against the enabled publishers.
	 *
	 * A publisher matches if one of its domains (see get_publisher_domains()) is the site's domain, once both are
	 * normalized. If none does and the site looks like a pre-production site, a publisher matches as its production
	 * site if their production match keys are the same (see Utilities::get_production_match_key()). Either way, the
	 * publisher's name must also match the site's name at least NAME_MATCH_THRESHOLD for it to count as a match (and
	 * for the site to be linked to it without asking).
	 *
	 * Unless sharing is allowed, a site can only be linked to a publisher that lists the site's domain (whatever its
	 * name), or that matches it as its production site and that no other site in the network is linked to. So a
	 * network's dev, staging and production sites can share the publisher that lists them all, but the administrator
	 * of one site can't take over another site's publisher. Until the network's map of linked publishers is complete
	 * (see get_publisher_links()), a publisher can't be shared on a production match.
	 *
	 * @param int  $blog_id       Optional ID of the blog/site. Defaults to 0.
	 * @param bool $allow_sharing Optional. Whether the site may be linked to any enabled publisher, including one that
	 *                            doesn't match it or that another site is linked to (for network administrators).
	 *                            Defaults to false.
	 *
	 * @return object With `site_url` (the site's home URL), `match_id` (the publisher whose domain matches, or empty),
	 *                `is_preproduction` (whether the
	 *                site looks like a pre-production site), `production_match_id` (the matching production publisher
	 *                for a pre-production site, or empty), and `publishers` (the publishers the site may be linked to,
	 *                as objects with `id` and `name`, in alphabetical order, including any whose domain matches but
	 *                whose name doesn't).
	 */
	public static function get_activation_matches( int $blog_id = 0, bool $allow_sharing = false ): object {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$site_url  = get_home_url();
		$site_name = get_bloginfo( 'name' );

		$matches = (object) array(
			'site_url'            => $site_url,
			'match_id'            => '',
			'is_preproduction'    => Utilities::is_preproduction_domain( $site_url ),
			'production_match_id' => '',
			'publishers'          => array(),
		);

		$production_match_key = $matches->is_preproduction ? Utilities::get_production_match_key( $site_url ) : '';

		$linked_elsewhere = $allow_sharing ? array() : self::get_publisher_ids_linked_to_other_sites( get_current_blog_id() );

		$links_are_complete = $allow_sharing || self::publisher_links_are_complete();

		foreach ( self::get_publishers_list() as $publisher ) {

			if ( ! is_object( $publisher ) || ! ( $publisher->enabled ?? false ) || ! is_object( $publisher->config ?? null ) ) {
				continue;
			}

			$publisher_id = self::string_from( $publisher->id ?? null );

			if ( '' === $publisher_id ) {
				continue;
			}

			$is_domain_match            = false;
			$is_production_domain_match = false;

			foreach ( self::get_publisher_domains( $publisher ) as $domain ) {
				$is_domain_match            = $is_domain_match || Utilities::do_domains_match( $domain, $site_url );
				$is_production_domain_match = $is_production_domain_match || ( '' !== $production_match_key && Utilities::get_production_match_key( $domain ) === $production_match_key );
			}

			// A site whose domain is one the publisher lists (e.g., as a dev domain) may share it, since only a network
			// administrator can change a site's domain. A guessed production match may not.
			if ( ! $is_domain_match && ( ! $links_are_complete || in_array( $publisher_id, $linked_elsewhere, true ) ) ) {
				continue;
			}

			$name_matches = self::publisher_name_matches_site( $publisher, $site_name );

			$is_match            = $is_domain_match && $name_matches;
			$is_production_match = $is_production_domain_match && $name_matches;

			if ( $is_match && '' === $matches->match_id ) {
				$matches->match_id = $publisher_id;
			}

			if ( $is_production_match && '' === $matches->production_match_id ) {
				$matches->production_match_id = $publisher_id;
			}

			if ( $allow_sharing || $is_domain_match || $is_production_match ) {
				$matches->publishers[] = (object) array(
					'id'   => $publisher_id,
					'name' => self::string_from( $publisher->name ?? null ),
				);
			}
		}

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		usort( $matches->publishers, fn ( $a, $b ) => strcasecmp( $a->name, $b->name ) );

		return $matches;
	}

	/**
	 * Extract the development domains from the publisher config.
	 *
	 * @param object $config The publisher config object.
	 *
	 * @return array The extracted development domains from the publisher config.
	 */
	private static function extract_dev_domains_from_publisher_config( object $config ): array {

		$dev_domains = $config->dev ?? null;

		if ( empty( $dev_domains ) ) {
			return array();
		}

		$dev_domains = is_string( $dev_domains ) ? explode( ',', $dev_domains ) : $dev_domains;
		$dev_domains = is_array( $dev_domains ) ? array_filter( $dev_domains, 'is_string' ) : array();
		$dev_domains = array_map( 'wp_unslash', $dev_domains );
		$dev_domains = array_map( 'sanitize_text_field', $dev_domains );
		$dev_domains = array_map( 'trim', $dev_domains );
		$dev_domains = array_filter( $dev_domains );
		$dev_domains = array_unique( $dev_domains );
		$dev_domains = array_values( $dev_domains );

		$dev_domains = array_map(
			function ( $url ) {

				$parsed_url = wp_parse_url( $url );

				return $parsed_url['host'] ?? $url;
			},
			$dev_domains
		);

		return $dev_domains;
	}

	/**
	 * Retrieve the stored publisher data for the selected site.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return object The stored publisher data (or empty array if not found).
	 */
	public static function get_publisher( int $blog_id = 0 ): object {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$data = get_option( self::PUBLISHER_OPTION );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		$data = is_object( $data ) ? $data : (object) array();

		if ( empty( $data->id ?? null ) && self::should_look_up_publisher( $blog_id ) ) {
			return self::update_publisher( $blog_id );
		}

		return $data;
	}

	/**
	 * Determine whether to search the API for a publisher matching a site that has none linked, which is only done
	 * once per PUBLISHER_LOOKUP_TRANSIENT_DURATION (rather than on every request).
	 *
	 * @param int $blog_id ID of the blog/site (0 on single-site).
	 *
	 * @return bool True if the search should be done now, false if it was done recently.
	 */
	private static function should_look_up_publisher( int $blog_id ): bool {

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$recently_attempted = get_transient( self::PUBLISHER_LOOKUP_TRANSIENT_NAME );

		if ( ! $recently_attempted ) {
			set_transient( self::PUBLISHER_LOOKUP_TRANSIENT_NAME, true, self::PUBLISHER_LOOKUP_TRANSIENT_DURATION );
		}

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return ! $recently_attempted;
	}

	/**
	 * Checks whether a publisher is currently stored for this site.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return bool True if a publisher is currently stored, false otherwise.
	 */
	public static function has_stored_publisher( int $blog_id = 0 ): bool {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$has_stored_publisher = boolval( get_option( self::PUBLISHER_STORED_OPTION ) );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return $has_stored_publisher;
	}

	/**
	 * Get the ID of the publisher stored for the selected site, without searching the API for one when none is (as
	 * get_publisher() does).
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return string The stored publisher ID, or an empty string if none is stored.
	 */
	public static function get_stored_publisher_id( int $blog_id = 0 ): string {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$data = get_option( self::PUBLISHER_OPTION );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return is_object( $data ) ? strval( $data->id ?? '' ) : '';
	}

	/**
	 * Get the IDs of the widgets in the publisher data stored for the selected site, without contacting the API.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return array<string> The widget IDs.
	 */
	public static function get_stored_widget_ids( int $blog_id = 0 ): array {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$data = get_option( self::PUBLISHER_OPTION );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		$widgets = is_object( $data ) && is_object( $data->widgets ?? null ) ? $data->widgets : (object) array();

		$all_widgets = array_merge(
			is_array( $widgets->chat_widgets ?? null ) ? $widgets->chat_widgets : array(),
			is_array( $widgets->search_widgets ?? null ) ? $widgets->search_widgets : array(),
		);

		return array_values( array_filter( array_map( fn ( $widget ) => is_object( $widget ) ? strval( $widget->id ?? '' ) : '', $all_widgets ) ) );
	}

	/**
	 * Delete the stored publisher data for the selected site.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return void
	 */
	public static function delete_publisher( int $blog_id = 0 ): void {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		delete_option( self::PUBLISHER_OPTION );
		delete_option( self::PUBLISHER_STORED_OPTION );

		self::store_publisher_link( get_current_blog_id(), '' );

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}
	}

	/**
	 * Forget which publisher a site is linked to, once the site has been deleted from the network.
	 *
	 * @param int $blog_id ID of the deleted blog/site.
	 *
	 * @return void
	 */
	public static function forget_publisher_link( int $blog_id ): void {
		self::store_publisher_link( $blog_id, '' );
	}

	/**
	 * Record which publisher a site in the network is linked to (an empty ID if it's linked to none), on multisite.
	 *
	 * @param int    $blog_id      ID of the blog/site.
	 * @param string $publisher_id ID of the publisher, or an empty string.
	 *
	 * @return void
	 */
	private static function store_publisher_link( int $blog_id, string $publisher_id ): void {

		if ( ! is_multisite() || empty( $blog_id ) ) {
			return;
		}

		$links = self::get_publisher_links();

		if ( ( $links[ $blog_id ] ?? '' ) === $publisher_id ) {
			return;
		}

		if ( '' === $publisher_id ) {
			unset( $links[ $blog_id ] );
		} else {
			$links[ $blog_id ] = $publisher_id;
		}

		update_site_option( self::PUBLISHER_LINKS_OPTION, $links );
	}

	/**
	 * Get which publisher each site in the network is linked to, on multisite.
	 *
	 * The map is kept as publishers are linked and unlinked, and sites that no longer exist are dropped from it. A
	 * network that doesn't have one yet (e.g., one upgraded from an earlier version of the plugin) has it rebuilt from
	 * every site's stored publisher, a batch of sites per request, so a large network doesn't hold up one request with
	 * them all. A WP-Cron event carries on until it's complete (see publisher_links_are_complete()).
	 *
	 * @return array<int, string> The publisher ID each linked site is linked to, keyed by blog ID.
	 */
	private static function get_publisher_links(): array {

		if ( ! is_multisite() ) {
			return array();
		}

		$links      = get_site_option( self::PUBLISHER_LINKS_OPTION );
		$rebuilt_to = get_site_option( self::PUBLISHER_LINKS_REBUILD_OPTION );

		if ( ! is_array( $links ) ) {
			$links      = array();
			$rebuilt_to = 0;
		}

		$links = array_map( 'strval', $links );

		if ( false !== $rebuilt_to ) {
			$links = self::rebuild_publisher_links( $links, intval( $rebuilt_to ) );
		}

		return self::forget_publisher_links_of_missing_sites( $links );
	}

	/**
	 * Whether the network's map of linked publishers is complete (see get_publisher_links()). It always is on
	 * single-site.
	 *
	 * @return bool True if the map is complete, false if it's still being rebuilt.
	 */
	private static function publisher_links_are_complete(): bool {
		return ! is_multisite() || ( is_array( get_site_option( self::PUBLISHER_LINKS_OPTION ) ) && false === get_site_option( self::PUBLISHER_LINKS_REBUILD_OPTION ) );
	}

	/**
	 * Carry on rebuilding the network's map of linked publishers for up to PUBLISHER_LINKS_REBUILD_SECONDS (from the
	 * WP-Cron event that get_publisher_links() schedules).
	 *
	 * @return void
	 */
	public static function continue_publisher_links_rebuild(): void {

		$started = microtime( true );

		do {
			self::get_publisher_links();
		} while ( ! self::publisher_links_are_complete() && microtime( true ) - $started < self::PUBLISHER_LINKS_REBUILD_SECONDS );
	}

	/**
	 * Add the next batch of the network's sites, after the given one, to the map of linked publishers, and store it.
	 *
	 * If any sites are left, the last site added is stored as how far the rebuild has got, and a WP-Cron event is
	 * scheduled to carry on; otherwise the map is complete, and the event is unscheduled.
	 *
	 * @param array<int, string> $links      The map so far.
	 * @param int                $rebuilt_to ID of the last site already added (0 for none).
	 *
	 * @return array<int, string> The map.
	 */
	private static function rebuild_publisher_links( array $links, int $rebuilt_to ): array {

		$site_ids = get_sites(
			array(
				'fields'     => 'ids',
				'number'     => 0,
				'network_id' => get_current_network_id(),
				'orderby'    => 'id',
				'order'      => 'ASC',
			)
		);

		$site_ids = array_values( array_filter( array_map( 'intval', $site_ids ), fn ( $site_id ) => $site_id > $rebuilt_to ) );

		$batch = array_slice( $site_ids, 0, self::$publisher_links_rebuild_batch_size );

		foreach ( $batch as $site_id ) {

			$publisher = get_blog_option( $site_id, self::PUBLISHER_OPTION );

			$publisher_id = is_object( $publisher ) ? strval( $publisher->id ?? '' ) : '';

			if ( '' === $publisher_id ) {
				unset( $links[ $site_id ] );
			} else {
				$links[ $site_id ] = $publisher_id;
			}
		}

		update_site_option( self::PUBLISHER_LINKS_OPTION, $links );

		if ( count( $site_ids ) > count( $batch ) ) {

			update_site_option( self::PUBLISHER_LINKS_REBUILD_OPTION, end( $batch ) );

			if ( false === wp_next_scheduled( self::PUBLISHER_LINKS_REBUILD_CRON_HOOK ) ) {
				wp_schedule_single_event( time(), self::PUBLISHER_LINKS_REBUILD_CRON_HOOK );
			}
		} else {
			delete_site_option( self::PUBLISHER_LINKS_REBUILD_OPTION );
			wp_clear_scheduled_hook( self::PUBLISHER_LINKS_REBUILD_CRON_HOOK );
		}

		return $links;
	}

	/**
	 * Drop the sites that no longer exist in the network from the map of linked publishers, and store it if any are
	 * dropped. A deleted site is normally forgotten as it's deleted (see forget_publisher_link()), but not if the
	 * request that deleted it didn't load the plugin (e.g., when the plugin isn't network-activated).
	 *
	 * @param array<int, string> $links The map.
	 *
	 * @return array<int, string> The map, without the sites that no longer exist.
	 */
	private static function forget_publisher_links_of_missing_sites( array $links ): array {

		if ( empty( $links ) ) {
			return $links;
		}

		$site_ids = get_sites(
			array(
				'fields'     => 'ids',
				'number'     => 0,
				'network_id' => get_current_network_id(),
				'site__in'   => array_keys( $links ),
			)
		);

		$existing_links = array_intersect_key( $links, array_flip( array_map( 'intval', $site_ids ) ) );

		if ( count( $existing_links ) !== count( $links ) ) {
			update_site_option( self::PUBLISHER_LINKS_OPTION, $existing_links );
		}

		return $existing_links;
	}

	/**
	 * Get the IDs of the publishers that other sites in the network are linked to (none on single-site).
	 *
	 * @param int $blog_id ID of the blog/site whose own publisher isn't counted.
	 *
	 * @return array<string> The publisher IDs.
	 */
	private static function get_publisher_ids_linked_to_other_sites( int $blog_id ): array {

		$links = self::get_publisher_links();

		unset( $links[ $blog_id ] );

		return array_values( array_unique( $links ) );
	}

	/**
	 * Extract the available frontend widgets from the publisher data.
	 *
	 * Question widgets are listed under `question-bar-widgets` in the publisher config; `search-widgets` is the older
	 * key for them, and is still read in case a publisher has any listed there.
	 *
	 * @param object $publisher Publisher data object containing configuration and widgets information.
	 *
	 * @return object
	 */
	private static function extract_widgets_from_publisher_data( object $publisher ): object {

		$widgets = (object) array(
			'chat_widgets'   => array(),
			'search_widgets' => array(),
		);

		$config = $publisher->config ?? null;

		if ( is_object( $config ) ) {

			$config_widgets = $config->widgets ?? null;

			if ( is_object( $config_widgets ) ) {

				$widgets->chat_widgets = self::extract_widgets_from( 'chat', self::get_config_widgets_group( $config_widgets, 'chat-widgets' ) );

				$widgets->search_widgets = array_merge(
					self::extract_widgets_from( 'search', self::get_config_widgets_group( $config_widgets, 'question-bar-widgets' ) ),
					self::extract_widgets_from( 'search', self::get_config_widgets_group( $config_widgets, 'search-widgets' ) ),
				);
			}
		}

		return $widgets;
	}

	/**
	 * Get one group of widgets (e.g., `chat-widgets`) from the publisher's widgets config.
	 *
	 * @param object $config_widgets The `widgets` object from the publisher config.
	 * @param string $group          The key of the widget group.
	 *
	 * @return object The widgets in the group, keyed by widget ID (or an empty object if there are none).
	 */
	private static function get_config_widgets_group( object $config_widgets, string $group ): object {

		$widgets = $config_widgets->{ $group } ?? null;

		return is_object( $widgets ) ? $widgets : (object) array();
	}

	/**
	 * Extract widgets from the given widget config data.
	 *
	 * @param string $widget_type  The type of widget being extracted (e.g., 'chat' or 'search').
	 * @param object $widgets_data Widget config data object.
	 *
	 * @return array<object> Array of extracted widgets.
	 */
	private static function extract_widgets_from( string $widget_type, object $widgets_data ): array {

		$widgets_data = is_object( $widgets_data ) ? get_object_vars( $widgets_data ) : array();

		$output = array();

		if ( is_array( $widgets_data ) ) {
			foreach ( $widgets_data as $widget_id => $widget ) {

				$widget_id = self::string_from( $widget_id );

				if ( is_object( $widget ) && '' !== $widget_id ) {

					$answer_url = self::string_from( $widget->targetUrl ?? null ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- The API returns camelCase property names.

					$answer_path = ! empty( $answer_url ) ? strval( wp_parse_url( $answer_url, PHP_URL_PATH ) ) : '';

					$chat_widget_id = self::maybe_get_chat_widget_id_from( $widget );

					$output[] = (object) array(
						'id'      => $widget_id,
						'type'    => $widget_type,
						'name'    => empty( $answer_path ) ? self::string_from( $widget->name ?? null ) : '/' . trim( $answer_path, '/' ),
						'created' => strtotime( self::string_from( $widget->created ?? null ) ),
						'target'  => empty( $chat_widget_id ) ? $answer_url : $chat_widget_id,
					);
				}
			}
		}

		return $output;
	}

	/**
	 * Try to retrieve the target chat widget ID from the given widget data.
	 *
	 * @param object $widget Widget data object.
	 *
	 * @return string The target chat widget ID if available, empty string otherwise.
	 */
	private static function maybe_get_chat_widget_id_from( object $widget ): string {

		$answer_page = $widget->answerPage ?? null; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- The API returns camelCase property names.

		$chat_widget_id = is_object( $answer_page ) ? self::string_from( $answer_page->chatWidgetId ?? null ) : ''; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- The API returns camelCase property names.

		return ! empty( $chat_widget_id ) ? (string) $chat_widget_id : '';
	}

	/**
	 * Retrieve the stored raw widgets data for the selected site.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return object The stored rawwidgets data (or empty array if not found)
	 */
	public static function get_widgets_raw( int $blog_id = 0 ): object {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$publisher_data = get_option( self::PUBLISHER_OPTION );

		$widgets_data = is_object( $publisher_data ) && is_object( $publisher_data->widgets ?? null ) ? $publisher_data->widgets : null;

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		if ( is_object( $widgets_data ) ) {
			return $widgets_data;
		}

		return (object) array();
	}

	/**
	 * Update the stored Gist Answerscategories data for all sites.
	 *
	 * @return array<mixed> The stored categories data (or empty array if not found).
	 */
	public static function update_categories(): array {

		if ( empty( self::$categories_list_cache ) ) {

			$categories_request = new Categories();

			self::$categories_list_cache = $categories_request->response()->data ?? array();
		}

		$response_data = self::$categories_list_cache;

		$categories = array();

		if ( is_array( $response_data ) ) {
			foreach ( $response_data as $category ) {

				$id   = $category->id ?? '';
				$name = $category->name ?? '';

				if ( ! empty( $id ) && ! empty( $name ) ) {
					$categories[ $id ] = $name;
				}
			}
		}

		if ( is_multisite() ) {
			update_site_option( self::CATEGORIES_OPTION, $categories );
		} else {
			update_option( self::CATEGORIES_OPTION, $categories );
		}

		return is_array( $categories ) ? $categories : array();
	}

	/**
	 * Retrieve the filtered list (i.e., internal categories removed) of Gist Answers categories data for all sites.
	 *
	 * @return array<mixed> The stored categories data (or empty array if not found)
	 */
	public static function get_categories(): array {

		$categories_data = self::get_categories_unfiltered();

		$categories_data = array_filter(
			$categories_data,
			function ( $category_name ) {
				return 'ProRata Internal' !== $category_name &&
					! str_contains( $category_name, '_' );
			},
		);

		natsort( $categories_data );

		return $categories_data;
	}

	/**
	 * Retrieve the stored Gist Answers categories data for all sites.
	 *
	 * @return array<mixed> The stored categories data (or empty array if not found)
	 */
	public static function get_categories_unfiltered(): array {

		if ( is_multisite() ) {
			$categories_data = get_site_option( self::CATEGORIES_OPTION );
		} else {
			$categories_data = get_option( self::CATEGORIES_OPTION );
		}

		if ( ! is_array( $categories_data ) || empty( $categories_data ) ) {
			return self::update_categories();
		}

		return is_array( $categories_data ) ? $categories_data : array();
	}

	/**
	 * Delete the stored Gist Answers categories data for all sites.
	 *
	 * @return void
	 */
	public static function delete_categories(): void {

		if ( is_multisite() ) {
			delete_site_option( self::CATEGORIES_OPTION );
		} else {
			delete_option( self::CATEGORIES_OPTION );
		}
	}

	/**
	 * Retrieve the source of the API token (VIP config, environment variable, constant, or database).
	 *
	 * @return string The source of the API token ('vip', 'environment', 'constant', 'database', or 'undefined').
	 */
	public static function get_api_token_source(): string {

		if ( 'undefined' === self::$api_token_source ) {
			self::get_api_token();
		}

		return self::$api_token_source;
	}
}
