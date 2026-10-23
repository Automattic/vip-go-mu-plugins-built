<?php

namespace Automattic\ShareADraft;

/**
 * Tells VIP-hosted installs apart from everywhere else.
 *
 * The preview feature itself is pure WordPress and runs anywhere, but the help
 * links pointing at VIP support only make sense on the VIP platform. Off
 * platform they would be misdirection, so they are gated on this check rather
 * than shown unconditionally. Runtime config is not gated here: it is read
 * wherever its constant is defined.
 *
 * `VIP_GO_APP_ENVIRONMENT` is defined on every VIP environment, including the
 * local `vip dev-env` (where it is `local`), which is exactly the set of places
 * that has a Dashboard behind it. `WPCOM_IS_VIP_ENV` is checked as a fallback
 * for older platform builds.
 */
final class Platform {
	/**
	 * Whether this install is running on WordPress VIP (including a local
	 * `vip dev-env`).
	 */
	public static function is_vip(): bool {
		$is_vip = defined( 'VIP_GO_APP_ENVIRONMENT' ) || defined( 'WPCOM_IS_VIP_ENV' );

		/**
		 * Filters whether the plugin treats this install as VIP-hosted.
		 *
		 * Controls the VIP-only surface: the VIP support links in contextual
		 * help. It does not change how preview links themselves behave, nor
		 * whether runtime config is read.
		 *
		 * @param bool $is_vip Whether a VIP platform constant was detected.
		 */
		return (bool) apply_filters( 'shareadraft_is_vip_platform', $is_vip );
	}
}
