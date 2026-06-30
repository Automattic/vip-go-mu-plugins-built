<?php
/**
 * Telemetry Events constants class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central registry of telemetry event names and the bounded enums that
 * accompany them. Mirrors the role of Log_Events for the audit-log layer,
 * but keeps telemetry names snake_case to match the VIP Telemetry library's
 * naming requirement.
 *
 * Helper methods normalize raw audit-log codes into the bounded telemetry
 * enums so an unbounded string can never leak into Pendo.
 */
class Telemetry_Events {

	// Event names.
	const BULK_IMPORT_COMPLETED   = 'bulk_import_completed';
	const SINGLE_IMPORT_COMPLETED = 'single_import_completed';
	const IMPORT_ITEM_FAILED      = 'import_item_failed';
	const ROLLBACK_PERFORMED      = 'rollback_performed';

	// single_import_completed -> outcome enum.
	const SINGLE_OUTCOME_NEW     = 'new';
	const SINGLE_OUTCOME_UPDATED = 'updated';

	// import_item_failed -> session_type enum.
	const SESSION_TYPE_SINGLE = 'single';
	const SESSION_TYPE_BULK   = 'bulk';

	// rollback_performed -> scope enum.
	const ROLLBACK_SCOPE_SESSION = 'session';
	const ROLLBACK_SCOPE_ITEM    = 'item';

	// rollback_performed -> outcome enum.
	const ROLLBACK_OUTCOME_SUCCESS = 'success';
	const ROLLBACK_OUTCOME_PARTIAL = 'partial';
	const ROLLBACK_OUTCOME_FAILED  = 'failed';

	// import_item_failed -> error_code enum fallback when the raw audit
	// code isn't in the allowlist below.
	const ERROR_CODE_UNKNOWN = 'unknown';

	// sync_mode global property fallback when the option is unset on a
	// fresh install (Options::OPTION_SYNC_MODE defaults to '').
	const SYNC_MODE_UNCONFIGURED = 'unconfigured';

	/**
	 * Allowed values for the sync_mode global event property. Mirrors the
	 * three configured modes from Options; anything else falls back to
	 * SYNC_MODE_UNCONFIGURED so the property stays bounded.
	 *
	 * @var list<string>
	 */
	const SYNC_MODE_ALLOWED = array(
		'import',
		'export',
		'bidirectional',
	);

	/**
	 * Allowed values for the import_item_failed error_code property.
	 * Anything not in this list is reported as ERROR_CODE_UNKNOWN so an
	 * unbounded string can't leak into telemetry. Mirrors the per-item
	 * error codes emitted by Post_Import_Service.
	 *
	 * @var list<string>
	 */
	const ERROR_CODE_ALLOWED = array(
		'validation_failed',
		'post_type_not_registered',
		'post_type_capability_denied',
		'fetch_failed',
		'media_download_failed',
		'malformed_media_markup',
		'content_processing_failed',
		'excerpt_sanitization_failed',
		'source_author_not_found',
		'source_author_unresolved',
		'featured_image_import_failed',
		'parent_not_resolved',
		'post_create_failed',
		'post_update_failed',
		'meta_update_failed',
		'terms_update_failed',
		'concurrent_import_blocked',
		'concurrent_import_lost_race',
	);

	/**
	 * Error codes whose per-item failure also carries a media-failure count.
	 *
	 * @var list<string>
	 */
	const MEDIA_ERROR_CODES = array(
		'media_download_failed',
		'malformed_media_markup',
	);

	/**
	 * Normalizes a raw per-item error code into the bounded enum.
	 *
	 * @param string $code Raw action code from the audit log payload.
	 * @return string Allowed error code, or ERROR_CODE_UNKNOWN.
	 */
	public static function normalize_error_code( string $code ): string {
		return in_array( $code, self::ERROR_CODE_ALLOWED, true )
			? $code
			: self::ERROR_CODE_UNKNOWN;
	}

	/**
	 * Normalizes a raw sync_mode option value into the bounded enum so the
	 * global event property never carries the empty string from a fresh
	 * install.
	 *
	 * @param string $mode Raw sync mode value from Options.
	 * @return string Allowed sync mode, or SYNC_MODE_UNCONFIGURED.
	 */
	public static function normalize_sync_mode( string $mode ): string {
		return in_array( $mode, self::SYNC_MODE_ALLOWED, true )
			? $mode
			: self::SYNC_MODE_UNCONFIGURED;
	}

	/**
	 * Normalizes a raw session_type column value into the bounded enum.
	 * Anything other than the single sentinel falls back to bulk, matching
	 * the schema's default and the absent-session edge case.
	 *
	 * @param string $type Raw session_type column value, or empty when the
	 *                     session row is missing.
	 * @return string SESSION_TYPE_SINGLE or SESSION_TYPE_BULK.
	 */
	public static function normalize_session_type( string $type ): string {
		return self::SESSION_TYPE_SINGLE === $type
			? self::SESSION_TYPE_SINGLE
			: self::SESSION_TYPE_BULK;
	}

	/**
	 * Returns whether an error code's per-item failure should carry a
	 * media_failure_count property.
	 *
	 * @param string $code Normalized error code.
	 * @return bool True when the code is media-related.
	 */
	public static function is_media_error_code( string $code ): bool {
		return in_array( $code, self::MEDIA_ERROR_CODES, true );
	}

	/**
	 * Derives the rollback outcome from the deleted, restored, and failed
	 * counts. Success when no failures and at least one row changed; failed
	 * when nothing changed and at least one row failed; partial otherwise
	 * (mixed result or no-op rollback).
	 *
	 * @param int $deleted_count  Number of new posts removed by the rollback.
	 * @param int $restored_count Number of updated posts reverted to their
	 *                            previous version.
	 * @param int $failed_count   Number of items that couldn't be rolled back.
	 * @return string One of the ROLLBACK_OUTCOME_* constants.
	 */
	public static function rollback_outcome(
		int $deleted_count,
		int $restored_count,
		int $failed_count
	): string {
		$changed = $deleted_count + $restored_count;

		if ( 0 === $failed_count && $changed > 0 ) {
			return self::ROLLBACK_OUTCOME_SUCCESS;
		}

		if ( 0 === $changed && $failed_count > 0 ) {
			return self::ROLLBACK_OUTCOME_FAILED;
		}

		return self::ROLLBACK_OUTCOME_PARTIAL;
	}
}
