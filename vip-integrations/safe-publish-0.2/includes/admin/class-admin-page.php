<?php
/**
 * Admin Page class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Options;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin Page Class.
 */
final class Admin_Page {

	/**
	 * Renders the admin page.
	 */
	public function render(): void {
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		?>
		<div class="wrap" id="safe-publish-admin-page">
			<h1><?php esc_html_e( 'Manage', 'safe-publish' ); ?></h1>

			<div class="safe-publish-admin-container">
				<div class="safe-publish-dataviews-section">
					<h2>
					<?php
					if ( ! empty( $source_site_url ) ) {
						$display_host = preg_replace(
							'#^https?://#i',
							'',
							untrailingslashit( $source_site_url )
						);
						printf(
							/* translators: %s: source site host */
							esc_html__( 'Posts from %s', 'safe-publish' ),
							esc_html( $display_host )
						);
					} else {
						esc_html_e( 'Posts from Source Site', 'safe-publish' );
					}
					?>
				</h2>

					<?php if ( empty( $source_site_url ) ) : ?>
						<div class="notice notice-warning">
							<p>
								<?php
								printf(
									/* translators: %s: Settings page URL */
									esc_html__( 'Please configure the connected site URL in the %s to see posts.', 'safe-publish' ),
									'<a href="' . esc_url( admin_url( 'admin.php?page=safe-publish-settings' ) ) . '">' . esc_html__( 'settings page', 'safe-publish' ) . '</a>'
								);
								?>
							</p>
						</div>
					<?php else : ?>
						<div id="safe-publish-posts-container">
							<div class="safe-publish-loading">
								<p><?php esc_html_e( 'Loading posts…', 'safe-publish' ); ?></p>
							</div>
						</div>
					<?php endif; ?>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueues admin assets.
	 */
	public function enqueue_assets(): void {
		if ( ! is_admin() ) {
			return;
		}

		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		$initial_state  = isset( $_GET['state'] ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			? sanitize_key( (string) $_GET['state'] ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.ValidatedSanitizedInput.MissingUnslash
			: 'all';
		$allowed_states = array( 'all', 'available', 'up-to-date', 'outdated', 'failed' );
		if ( ! in_array( $initial_state, $allowed_states, true ) ) {
			$initial_state = 'all';
		}

		$repository   = new History_Repository();
		$orphan_count = $repository->count_orphan_failures();

		Admin_Assets::enqueue_bundle(
			'posts',
			'safe-publish-admin-posts-script',
			'safe-publish-admin-posts-style',
			array(
				'ajaxurl'       => admin_url( 'admin-ajax.php' ),
				'settingsUrl'   => admin_url( 'admin.php?page=safe-publish-settings' ),
				'nonce'         => wp_create_nonce( 'safe_publish_ajax_nonce' ),
				'sourceSiteUrl' => $source_site_url,
				'homeUrl'       => home_url(),
				'containerId'   => 'safe-publish-posts-container',
				'initialState'  => $initial_state,
				'orphanCount'   => $orphan_count,
			)
		);
	}
}
