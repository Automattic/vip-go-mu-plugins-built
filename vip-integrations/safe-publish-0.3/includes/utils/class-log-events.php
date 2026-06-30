<?php
/**
 * Log Events constants class.
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
 * Central registry of log event codes referenced by the per-event helper
 * methods on each channel logger (Auth_Logger, Content_Logger, Dispatch_Logger,
 * Export_Logger, Import_Logger, Media_Logger, Reconcile_Logger,
 * Settings_Logger). The constants here are the contract; the helpers enforce
 * the payload shape per event.
 *
 * A channel is a producer subsystem (auth, media import, reference
 * reconciliation), not a content type: imported structures such as tags or
 * categories record degradations as import-channel events and attention-issue
 * types, not new channels.
 */
class Log_Events {
	// Media import events.
	const FEATURED_IMAGE_FETCH_FAILED   = 'FEATURED_IMAGE_FETCH_FAILED';
	const FEATURED_IMAGE_SOURCE_MISSING = 'FEATURED_IMAGE_SOURCE_MISSING';
	const INVALID_ATTACHMENT_ID         = 'INVALID_ATTACHMENT_ID';
	const MEDIA_DOWNLOAD_FAILED         = 'MEDIA_DOWNLOAD_FAILED';
	const MEDIA_SIDELOAD_FAILED         = 'MEDIA_SIDELOAD_FAILED';
	const MEDIA_UNSUPPORTED_FILE_TYPE   = 'MEDIA_UNSUPPORTED_FILE_TYPE';

	// Content fetch events.
	const CONTENT_FETCH_FAILED             = 'CONTENT_FETCH_FAILED';
	const CONTENT_FETCH_INVALID_RESPONSE   = 'CONTENT_FETCH_INVALID_RESPONSE';
	const CONTENT_FETCH_RAW_FIELDS_MISSING = 'CONTENT_FETCH_RAW_FIELDS_MISSING';

	// Auth events.
	const SECRET_NOT_CONFIGURED        = 'SECRET_NOT_CONFIGURED';
	const TIMESTAMP_EXPIRED            = 'TIMESTAMP_EXPIRED';
	const CONTENT_HASH_MISSING         = 'CONTENT_HASH_MISSING';
	const CONTENT_HASH_MISMATCH        = 'CONTENT_HASH_MISMATCH';
	const CONNECTED_URL_NOT_CONFIGURED = 'CONNECTED_URL_NOT_CONFIGURED';
	const SITE_URL_HEADER_MISSING      = 'SITE_URL_HEADER_MISSING';
	const SITE_URL_MISMATCH            = 'SITE_URL_MISMATCH';
	const SIGNATURE_INVALID            = 'SIGNATURE_INVALID';
	const REQUEST_AUTHENTICATED        = 'REQUEST_AUTHENTICATED';
	const REQUEST_ACTION_UNRECOGNIZED  = 'REQUEST_ACTION_UNRECOGNIZED';

	// Permission and auth diagnostic events.
	const AUTHENTICATED_CONTEXT_INSTALLED = 'AUTHENTICATED_CONTEXT_INSTALLED';
	const PERMISSION_CHECK_INTERCEPTED    = 'PERMISSION_CHECK_INTERCEPTED';
	const META_CAP_OVERRIDDEN             = 'META_CAP_OVERRIDDEN';
	const PERMISSION_OVERRIDE_APPLIED     = 'PERMISSION_OVERRIDE_APPLIED';
	const PERMISSION_CALLBACK_OVERRIDDEN  = 'PERMISSION_CALLBACK_OVERRIDDEN';
	const COLLECTION_PARAMS_OVERRIDDEN    = 'COLLECTION_PARAMS_OVERRIDDEN';
	const CONTEXT_ERROR_OVERRIDDEN        = 'CONTEXT_ERROR_OVERRIDDEN';
	const EDIT_CONTEXT_ALLOWED            = 'EDIT_CONTEXT_ALLOWED';
	const PERMISSION_ERROR_INTERCEPTED    = 'PERMISSION_ERROR_INTERCEPTED';

	// Export events.
	const CONTENT_EXPORTED           = 'CONTENT_EXPORTED';
	const EXPORT_REQUEST_ERROR       = 'EXPORT_REQUEST_ERROR';
	const EXPORT_RESPONSE_BAD_STATUS = 'EXPORT_RESPONSE_BAD_STATUS';

	// Non-export dispatch events (list, preview, probe failures).
	const DISPATCH_REQUEST_ERROR       = 'DISPATCH_REQUEST_ERROR';
	const DISPATCH_RESPONSE_BAD_STATUS = 'DISPATCH_RESPONSE_BAD_STATUS';

	// Import session and item lifecycle events.
	const SESSION_ROLLED_BACK         = 'SESSION_ROLLED_BACK';
	const ITEM_ROLLED_BACK            = 'ITEM_ROLLED_BACK';
	const SESSION_ALREADY_ROLLED_BACK = 'SESSION_ALREADY_ROLLED_BACK';
	const ITEM_ALREADY_ROLLED_BACK    = 'ITEM_ALREADY_ROLLED_BACK';
	const SESSION_ROLLBACK_FAILED     = 'SESSION_ROLLBACK_FAILED';
	const ITEM_ROLLBACK_FAILED        = 'ITEM_ROLLBACK_FAILED';
	const SESSION_DELETED             = 'SESSION_DELETED';
	const SESSION_DELETE_FAILED       = 'SESSION_DELETE_FAILED';

	// Security-relevant settings change events.
	const CONNECTED_SITE_URL_CHANGED  = 'CONNECTED_SITE_URL_CHANGED';
	const BASIC_AUTH_USERNAME_CHANGED = 'BASIC_AUTH_USERNAME_CHANGED';
	const BASIC_AUTH_PASSWORD_CHANGED = 'BASIC_AUTH_PASSWORD_CHANGED';
	const SYNC_MODE_CHANGED           = 'SYNC_MODE_CHANGED';

	// Reference reconciliation outcomes (Reconcile_Logger).
	const RECONCILE_RESOLVED      = 'RECONCILE_RESOLVED';
	const RECONCILE_UNRESOLVED    = 'RECONCILE_UNRESOLVED';
	const RECONCILE_TARGET_ABSENT = 'RECONCILE_TARGET_ABSENT';
	const RECONCILE_FAILED        = 'RECONCILE_FAILED';
}
