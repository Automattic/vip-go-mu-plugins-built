<?php

namespace Automattic\ShareADraft;

/**
 * Tells VIP-hosted installs apart from everywhere else.
 *
 * The preview feature itself is pure WordPress and runs anywhere, but a few
 * pieces of the plugin only make sense on the VIP platform: runtime config
 * injected by the VIP Dashboard, and help links pointing at VIP support. Off
 * platform those become noise at best and misdirection at worst, so each is
 * gated on this check rather than shown unconditionally.
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
		 * Controls the VIP-only surfaces: the runtime-config admin notice and the
		 * VIP support links in contextual help. It does not change how preview
		 * links themselves behave.
		 *
		 * @param bool $is_vip Whether a VIP platform constant was detected.
		 */
		return (bool) apply_filters( 'shareadraft_is_vip_platform', $is_vip );
	}
}
