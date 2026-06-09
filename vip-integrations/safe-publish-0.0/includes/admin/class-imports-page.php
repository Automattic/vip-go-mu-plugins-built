<?php
/**
 * Imports Page class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Imports admin page and enqueues its bundle.
 *
 * The PHP side only outputs the wrapper + mount container and seeds initial
 * state (ajaxurl, nonces, initial tab) via the inline `safePublishAdminData`
 * global. The tab UI, data fetching, and listing live entirely in React
 * (see `ImportsApp.tsx`).
 */
final class Imports_Page {

	/**
	 * Renders the admin page.
	 */
	public function render(): void {
		?>
		<div class="wrap" id="safe-publish-imports-page">
			<h1><?php esc_html_e( 'Imports', 'safe-publish' ); ?></h1>

			<div class="safe-publish-admin-container">
				<div class="safe-publish-dataviews-section">
					<div id="safe-publish-imports-container">
						<div class="safe-publish-loading">
							<p><?php esc_html_e( 'Loading imports…', 'safe-publish' ); ?></p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueues the Imports page assets.
	 */
	public function enqueue_assets(): void {
		if ( ! is_admin() ) {
			return;
		}

		// Read ?tab=... from the URL so React can pre-apply it without an
		// extra roundtrip. ?batch=N is read directly client-side so a
		// tab-switch re-mount picks up an in-page Clear that updated the URL
		// but not this inline global.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$initial_tab_raw = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : '';
		$initial_tab     = in_array( $initial_tab_raw, array( 'posts', 'failures' ), true )
			? $initial_tab_raw
			: 'posts';

		// Same global the Source Posts page and the shared modals/diff hooks
		// read, so Update/Diff/Delete work here without page-specific wiring.
		Admin_Assets::enqueue_bundle(
			'imports',
			'safe-publish-imports-script',
			'safe-publish-imports-style',
			array(
				'ajaxurl'        => admin_url( 'admin-ajax.php' ),
				'settingsUrl'    => admin_url( 'admin.php?page=safe-publish-settings' ),
				'sourcePostsUrl' => admin_url( 'admin.php?page=safe-publish' ),
				'homeUrl'        => home_url(),
				'nonce'          => wp_create_nonce( 'safe_publish_ajax_nonce' ),
				'restNonce'      => wp_create_nonce( 'wp_rest' ),
				'containerId'    => 'safe-publish-imports-container',
				'initialTab'     => $initial_tab,
			)
		);
	}
}
