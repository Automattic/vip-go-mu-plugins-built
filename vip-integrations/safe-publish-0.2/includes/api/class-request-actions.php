<?php
/**
 * Request Actions constants class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Declared intent labels for destination → source REST calls.
 *
 * Every outbound destination request carries one of these values in the
 * X-Safe-Publish-Action header (signed into the HMAC payload). The source
 * uses them to route dispatch outcomes — only IMPORT and MEDIA_IMPORT
 * count as real exports for the export audit channel.
 */
final class Request_Actions {

	/**
	 * Collection / discovery fetch (e.g. recent posts, post types).
	 */
	const LIST_ITEMS = 'list';

	/**
	 * Single-resource fetch for UI display (e.g. diff preview). User may
	 * discard without importing.
	 */
	const PREVIEW = 'preview';

	/**
	 * Authentication / connectivity probe. Response is consulted for status
	 * only and otherwise discarded.
	 */
	const PROBE = 'probe';

	/**
	 * Single-post fetch performed as part of a real import or update.
	 */
	const IMPORT = 'import';

	/**
	 * Featured-media fetch performed as part of a real media import.
	 */
	const MEDIA_IMPORT = 'media-import';

	/**
	 * Returns true when the value matches a known action constant.
	 *
	 * @param string $action Declared action value.
	 * @return bool
	 */
	public static function is_valid( string $action ): bool {
		return in_array( $action, self::all(), true );
	}

	/**
	 * Returns true when the action represents a real content export
	 * (import or media-import) — i.e. the destination is committing the
	 * fetched content locally, not just browsing or previewing.
	 *
	 * @param string $action Declared action value.
	 * @return bool
	 */
	public static function is_export( string $action ): bool {
		return self::IMPORT === $action || self::MEDIA_IMPORT === $action;
	}

	/**
	 * Returns the full set of known action constants.
	 *
	 * @return string[]
	 */
	public static function all(): array {
		return array(
			self::LIST_ITEMS,
			self::PREVIEW,
			self::PROBE,
			self::IMPORT,
			self::MEDIA_IMPORT,
		);
	}
}
