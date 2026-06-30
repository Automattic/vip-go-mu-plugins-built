<?php declare(strict_types = 1);

namespace RemoteDataBlocks\WpdbStorage;

/**
 * Class RemoteDataBlocks\Storage\DataEncryption
 *
 * Class responsible for encrypting and decrypting data. We use this to store sensitive data in the database.
 *
 * Adapted from Google Site Kit plugin.
 *
 * Original License   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @see https://github.com/google/site-kit-wp/blob/e99bed8bfc08869427021bbd47bc57b2c866cc20/includes/Core/Storage/Data_Encryption.php
 * @see https://felix-arntz.me/blog/storing-confidential-data-in-wordpress/
 * 
 * @access private
 * @ignore
 */
final class DataEncryption {

	/**
	 * Key to use for encryption.
	 *
	 */
	private string $key;

	/**
	 * Salt to use for encryption.
	 *
	 */
	private string $salt;

	/**
	 * Constructor.
	 *
	 */
	public function __construct() {
		$this->key = $this->get_default_key();
		$this->salt = $this->get_default_salt();
	}

	/**
	 * Encrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 *
	 * @param string $value Value to encrypt.
	 * @return string|bool Encrypted value, or false on failure.
	 */
	public function encrypt( string $value ): string|bool {
		if ( ! extension_loaded( 'openssl' ) ) {
			return $value;
		}

		$method = 'aes-256-ctr';
		$ivlen = openssl_cipher_iv_length( $method );
		$iv = openssl_random_pseudo_bytes( $ivlen );

		$raw_value = openssl_encrypt( $value . $this->salt, $method, $this->key, 0, $iv );
		if ( ! $raw_value ) {
			return false;
		}

		return base64_encode( $iv . $raw_value );
	}

	/**
	 * Decrypts a value.
	 *
	 * If a user-based key is set, that key is used. Otherwise the default key is used.
	 *
	 *
	 * @param string $raw_value Value to decrypt.
	 * @return string|bool Decrypted value, or false on failure.
	 */
	public function decrypt( string $raw_value ): string|bool {
		if ( ! extension_loaded( 'openssl' ) ) {
			return $raw_value;
		}

		$decoded_value = base64_decode( $raw_value, true );

		if ( false === $decoded_value ) {
			return $raw_value;
		}

		$method = 'aes-256-ctr';
		$ivlen = openssl_cipher_iv_length( $method );
		$iv = substr( $decoded_value, 0, $ivlen );

		$decoded_value = substr( $decoded_value, $ivlen );

		$value = openssl_decrypt( $decoded_value, $method, $this->key, 0, $iv );
		if ( ! $value || substr( $value, - strlen( $this->salt ) ) !== $this->salt ) {
			return false;
		}

		return substr( $value, 0, - strlen( $this->salt ) );
	}

	/**
	 * Gets the default encryption key to use.
	 *
	 *
	 * @return string Default (not user-based) encryption key.
	 */
	private function get_default_key(): string {
		if ( defined( 'REMOTE_DATA_BLOCKS_ENCRYPTION_KEY' ) && '' !== constant( 'REMOTE_DATA_BLOCKS_ENCRYPTION_KEY' ) ) {
			return constant( 'REMOTE_DATA_BLOCKS_ENCRYPTION_KEY' );
		}

		if ( defined( 'LOGGED_IN_KEY' ) && '' !== LOGGED_IN_KEY ) {
			return LOGGED_IN_KEY;
		}

		// If this is reached, you're either not on a live site or have a serious security issue.
		throw new \Exception( 'No default encryption key available.' );
	}

	/**
	 * Gets the default encryption salt to use.
	 *
	 *
	 * @return string Encryption salt.
	 */
	private function get_default_salt(): string {
		if ( defined( 'REMOTE_DATA_BLOCKS_ENCRYPTION_SALT' ) && '' !== constant( 'REMOTE_DATA_BLOCKS_ENCRYPTION_SALT' ) ) {
			return constant( 'REMOTE_DATA_BLOCKS_ENCRYPTION_SALT' );
		}

		if ( defined( 'LOGGED_IN_SALT' ) && '' !== LOGGED_IN_SALT ) {
			return LOGGED_IN_SALT;
		}

		// If this is reached, you're either not on a live site or have a serious security issue.
		throw new \Exception( 'No default encryption salt available.' );
	}
}
