<?php
/**
 * Legacy credential backend.
 *
 * Reads keys from the plugin's original encrypted `vip_workflows_api_keys`
 * option. Used only when the WordPress Connectors API is unavailable (e.g. WP
 * older than 6.9, or 6.9 without Gutenberg 23.0+). Mirrors the AES-256-CBC
 * scheme of the soon-to-be-removed ApiKeysController so existing stored keys
 * keep resolving during and after the migration.
 *
 * @package VIPWorkflows\AI
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Resolves keys from the legacy encrypted option store.
 */
final class LegacyCredentialBackend implements CredentialBackend {

	/**
	 * Option storing the encrypted key map.
	 */
	private const OPTION_NAME = 'vip_workflows_api_keys';

	/**
	 * Cipher used by the legacy store.
	 */
	private const CIPHER = 'aes-256-cbc';

	/**
	 * Logical service id => option slug in the legacy store.
	 */
	private const SERVICE_SLUGS = array(
		'openai'    => 'openai_key',
		'anthropic' => 'anthropic_key',
		'google'    => 'google_key',
		'tavily'    => 'tavily_key',
		'youtube'   => 'youtube_key',
	);

	/**
	 * Get the API key for a service from the legacy encrypted option.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $service Logical service id.
	 * @return string The decrypted key, or '' when unset/unknown.
	 */
	public function get_api_key( string $service ): string {
		$slug = self::SERVICE_SLUGS[ $service ] ?? '';
		if ( '' === $slug ) {
			return '';
		}

		$keys = get_option( self::OPTION_NAME, array() );
		if ( ! is_array( $keys ) ) {
			return '';
		}

		return self::decrypt( (string) ( $keys[ $slug ] ?? '' ) );
	}

	/**
	 * Decrypt a stored value (IV prepended, base64-encoded).
	 *
	 * @param  string $encrypted Encrypted value.
	 * @return string Plaintext, or '' on failure.
	 */
	private static function decrypt( string $encrypted ): string {
		if ( '' === $encrypted ) {
			return '';
		}

		$key = wp_salt( 'auth' );
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		$data = base64_decode( $encrypted, true );

		if ( false === $data || strlen( $data ) < 17 ) {
			return '';
		}

		$iv         = substr( $data, 0, 16 );
		$ciphertext = substr( $data, 16 );
		$decrypted  = openssl_decrypt( $ciphertext, self::CIPHER, $key, OPENSSL_RAW_DATA, $iv );

		return false === $decrypted ? '' : $decrypted;
	}
}
