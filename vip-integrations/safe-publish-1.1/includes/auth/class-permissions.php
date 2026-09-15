<?php
/**
 * Safe Publish permission contract.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Auth;

/**
 * Resolves capabilities used by Safe Publish.
 *
 * Management operations and abilities must use manage_capability(). Per-post
 * reads keep their content-level checks: Safe_Publish_API requires the post
 * type's edit_posts capability only without the management capability, and
 * always requires edit_post for the mapped local post.
 */
final class Permissions {

	/**
	 * Capability for Safe Publish management access.
	 */
	public const MANAGE_CAPABILITY = 'manage_safe_publish';

	/**
	 * Capability for read-only Audit Log access.
	 */
	public const VIEW_AUDIT_LOG_CAPABILITY = 'view_safe_publish_audit_log';

	/**
	 * Returns the capability required for Safe Publish management operations.
	 *
	 * @return string Management capability.
	 */
	public static function manage_capability(): string {
		$default = self::MANAGE_CAPABILITY;

		/**
		 * Filters the capability required for Safe Publish management operations.
		 *
		 * @param string $capability Management capability.
		 */
		$capability = apply_filters(
			'safe_publish_manage_capability',
			$default
		);

		// Use the secure default when a callback violates the documented contract.
		return is_string( $capability ) && '' !== $capability
			? $capability
			: $default;
	}

	/**
	 * Returns the capability required to read the Safe Publish Audit Log.
	 *
	 * @return string Audit Log capability.
	 */
	public static function view_audit_log_capability(): string {
		return self::VIEW_AUDIT_LOG_CAPABILITY;
	}
}
