<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Editor;

use VIPRealTimeCollaboration\Compatibility\Compatibility;
use WP_Error;
use function add_action;
use function get_post_meta;
use function register_meta;
use function update_post_meta;

defined( 'ABSPATH' ) || exit();

/**
 * Handles the persistence of CRDT documents for supported sync objects. For
 * now, this is limited to posts.
 */
final class CrdtPersistence {
	const CRDT_DOC_VERSION = 1;
	const POST_META_KEY = 'vip_rtc_crdt_doc';

	public function __construct() {
		add_action( 'init', [ $this, 'register_meta' ], 999, 0 );
	}

	public function register_meta(): void {
		foreach ( Compatibility::get_supported_post_types() as $post_type ) {
			register_meta(
				'post',
				self::POST_META_KEY,
				[
					'auth_callback' => '__return_false',
					'object_subtype' => $post_type,
					'revisions_enabled' => true,
					'show_in_rest' => false,
					'single' => true,
					'type' => 'array',
				]
			);
		}
	}

	/**
	 * Retrieves the serialized CRDT document from post meta.
	 *
	 * @param int $post_id The ID of the post.
	 * @param int $expected_version The expected version of the CRDT document.
	 * @return string|null The serialzied CRDT document or null if not found.
	 */
	public function get_crdt_doc( int $post_id, int $expected_version ): ?string {
		/**
		 * @var array{
		 *   doc: string,
		 *   version: int,
		 * }
		 */
		$meta_value = get_post_meta( $post_id, self::POST_META_KEY, true );

		if ( ! $this->validate_meta_value( $meta_value, $expected_version ) ) {
			return null;
		}

		return $meta_value['doc'] ?? null;
	}

	/**
	 * Updates the CRDT document in post meta.
	 *
	 * @param int $post_id The ID of the post.
	 * @param string $crdt_doc The serialized CRDT document to save.
	 * @param int $version The version of the CRDT document.
	 * @param bool $is_initial_update Whether this is the initial update of the CRDT document.
	 * @return string|WP_Error The latest CRDT doc, or WP_Error if updating failed.
	 */
	public function update_crdt_doc( int $post_id, string $crdt_doc, int $version, bool $is_initial_update ): string|WP_Error {
		if ( self::CRDT_DOC_VERSION !== $version ) {
			return new WP_Error(
				'vip_rtc_update_crdt_doc_failed',
				__( 'Invalid CRDT document version.', 'vip-real-time-collaboration' )
			);
		}

		// If this is the initial update, we want to avoid a race condition where
		// two peers try to establish the initial CRDT doc at the same time.
		if ( true === $is_initial_update ) {
			$existing_crdt_doc = $this->get_crdt_doc( $post_id, $version );

			if ( null !== $existing_crdt_doc ) {
				// If the CRDT document already exists, we do not want to overwrite it.
				return $existing_crdt_doc;
			}
		}

		$meta_value = [
			'doc' => $crdt_doc,
			'version' => self::CRDT_DOC_VERSION,
		];

		update_post_meta( $post_id, self::POST_META_KEY, $meta_value );

		return $crdt_doc;
	}

	/**
	 * Validate the CRDT document.
	 *
	 * @param mixed $value The value to validate.
	 * @return bool True if valid, false if invalid.
	 */
	public function validate_crdt_doc( mixed $value ): bool {
		if ( ! is_string( $value ) || empty( $value ) ) {
			return false;
		}

		// Ensure the CRDT document is a valid Base64-encoded string.
		if ( false === base64_decode( $value, true ) ) {
			return false;
		}

		// Additional validation logic for CRDT document can be added here.

		return true;
	}

	/**
	 * Validate the meta value for the CRDT document.
	 *
	 * @param mixed $meta_value The meta value to validate.
	 * @param int $expected_version The expected version of the CRDT document.
	 * @return bool True if valid, false if invalid.
	 */
	protected function validate_meta_value( mixed $meta_value, int $expected_version ): bool {
		// Ensure the meta value is an array with the expected structure.
		if ( ! is_array( $meta_value ) ) {
			return false;
		}

		// Validate the CRDT document.
		if ( true !== self::validate_crdt_doc( $meta_value['doc'] ?? null ) ) {
			return false;
		}

		// Compare the version against the current version.
		if ( ! isset( $meta_value['version'] ) || self::CRDT_DOC_VERSION !== $meta_value['version'] ) {
			return false;
		}

		// Compare the version against the expected version.
		if ( $meta_value['version'] !== $expected_version ) {
			return false;
		}

		return true;
	}
}
