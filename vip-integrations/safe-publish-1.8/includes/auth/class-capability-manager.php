<?php
/**
 * Safe Publish capability installation and mapping
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Auth;

use Safe_Publish\Utils\Meta_Key_Matcher;
use Safe_Publish\Utils\Options;

/**
 * Installs Safe Publish capabilities, their implication rules, and the
 * tracking meta guard.
 */
final class Capability_Manager {

	/**
	 * Version of the role grants installed on each site.
	 */
	private const VERSION = '1';

	/**
	 * Per-site option recording the installed role-grant version.
	 */
	private const VERSION_OPTION = 'safe_publish_capabilities_version';

	/**
	 * Registers capability mapping and performs per-site upgrade migration.
	 */
	public static function init(): void {
		add_filter(
			'user_has_cap',
			array( self::class, 'map_capabilities' ),
			10,
			2
		);
		add_filter(
			'map_meta_cap',
			array( self::class, 'map_tracking_meta_capabilities' ),
			10,
			4
		);
		self::maybe_install();
	}

	/**
	 * Restricts tracking meta edits to management-capability holders, whatever
	 * the auth_post_meta filters allow; imports and the diff preview trust it.
	 *
	 * @param string[]   $caps    Primitive capabilities the check requires.
	 * @param string     $cap     Capability being checked.
	 * @param int|string $user_id User ID; map_meta_cap does not enforce int.
	 * @param array      $args    Post ID and meta key.
	 * @return string[] The given capabilities, plus do_not_allow when denied.
	 */
	public static function map_tracking_meta_capabilities(
		array $caps,
		string $cap,
		int|string $user_id,
		array $args
	): array {
		$meta_key = $args[1] ?? null;

		if (
			in_array(
				$cap,
				array( 'add_post_meta', 'edit_post_meta', 'delete_post_meta' ),
				true
			)
			&& is_string( $meta_key )
			&& ! user_can( (int) $user_id, Permissions::manage_capability() )
			// Compare keys as stored: Callers may pass them slashed.
			&& Meta_Key_Matcher::matches(
				(string) wp_unslash( $meta_key ),
				Options::TRACKING_META_KEYS
			)
		) {
			$caps[] = 'do_not_allow';
		}

		return $caps;
	}

	/**
	 * Grants the default role capabilities when their version is outdated.
	 */
	public static function maybe_install(): void {
		if ( self::VERSION === get_option( self::VERSION_OPTION ) ) {
			return;
		}

		self::install();
	}

	/**
	 * Grants both capabilities to the Administrator role on the current site.
	 */
	public static function install(): void {
		$administrator = get_role( 'administrator' );

		if ( null === $administrator ) {
			return;
		}

		$administrator->add_cap( Permissions::MANAGE_CAPABILITY );
		$administrator->add_cap( Permissions::VIEW_AUDIT_LOG_CAPABILITY );
		update_option( self::VERSION_OPTION, self::VERSION, false );

		$current_user = wp_get_current_user();
		if ( $current_user->exists() ) {
			$current_user->get_role_caps();
		}
	}

	/**
	 * Maps the default legacy grant and management-to-audit implication.
	 *
	 * A filtered management resolver remains authoritative, so manage_options
	 * implies the first-class capability only under the default contract.
	 *
	 * @param array    $allcaps User's complete primitive capability map.
	 * @param string[] $caps    Primitive capabilities being checked.
	 * @return array Filtered capability map.
	 */
	public static function map_capabilities( array $allcaps, array $caps ): array {
		if (
			! in_array( Permissions::MANAGE_CAPABILITY, $caps, true )
			&& ! in_array( Permissions::VIEW_AUDIT_LOG_CAPABILITY, $caps, true )
		) {
			return $allcaps;
		}

		$management_capability = Permissions::manage_capability();
		if (
			Permissions::MANAGE_CAPABILITY === $management_capability
			&& true === ( $allcaps['manage_options'] ?? false )
		) {
			$allcaps[ Permissions::MANAGE_CAPABILITY ] = true;
		}

		if ( true === ( $allcaps[ $management_capability ] ?? false ) ) {
			$allcaps[ Permissions::VIEW_AUDIT_LOG_CAPABILITY ] = true;
		}

		return $allcaps;
	}
}
