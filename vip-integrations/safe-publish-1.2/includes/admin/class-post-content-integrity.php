<?php
/**
 * Post content integrity verification
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Verifies that WordPress persisted requested post content unchanged.
 */
final class Post_Content_Integrity {

	/**
	 * Import operation name.
	 *
	 * @var string
	 */
	public const OPERATION_IMPORT = 'import';

	/**
	 * Rollback operation name.
	 *
	 * @var string
	 */
	public const OPERATION_ROLLBACK = 'rollback';

	/**
	 * Verifies content fields present in a post write.
	 *
	 * @param int    $post_id   Persisted post ID.
	 * @param array  $requested Requested post fields.
	 * @param string $operation OPERATION_IMPORT or OPERATION_ROLLBACK.
	 * @return WP_Error|null Error when WordPress changed a content field.
	 */
	public static function verify(
		int $post_id,
		array $requested,
		string $operation
	): ?WP_Error {
		$post = get_post( $post_id );

		if ( null === $post ) {
			return new WP_Error(
				'content_verification_failed',
				__(
					'The post could not be checked after WordPress saved it.',
					'safe-publish'
				),
				array( 'action' => 'content_verification_failed' )
			);
		}

		$field_labels = array(
			'post_content' => __( 'post content', 'safe-publish' ),
			'post_excerpt' => __( 'excerpt', 'safe-publish' ),
		);
		$changed      = array();

		foreach ( $field_labels as $field => $label ) {
			if (
				array_key_exists( $field, $requested )
				&& (string) $requested[ $field ] !== $post->{$field}
			) {
				$changed[ $field ] = $label;
			}
		}

		if ( array() === $changed ) {
			return null;
		}

		$fields = wp_sprintf_l( '%l', array_values( $changed ) );

		if ( self::OPERATION_ROLLBACK === $operation ) {
			$message = sprintf(
				/* translators: %s: List of post fields modified by WordPress. */
				__(
					'Rollback failed because WordPress filtered the restored %s. The post contains WordPress\' filtered version. Ask a user who can save this content to retry.',
					'safe-publish'
				),
				$fields
			);
		} else {
			$message = sprintf(
				/* translators: %s: List of post fields modified by WordPress. */
				__(
					'Import failed because WordPress filtered the requested %s. Ask a user who can save this content to retry, or remove the filtered content at the source.',
					'safe-publish'
				),
				$fields
			);
		}

		return new WP_Error(
			'content_filtered',
			$message,
			array(
				'action' => 'content_filtered',
				'fields' => array_keys( $changed ),
			)
		);
	}
}
