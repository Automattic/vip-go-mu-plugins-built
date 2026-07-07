<?php
/**
 * Admin notice for the source-site scoping backfill.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Source_Site_Url_Backfill;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Surfaces a dismissible notice when the one-time source-site backfill could
 * not attribute prior imports to a single source.
 *
 * Source_Site_Url_Backfill sets the needs-attention state when a destination's
 * import history spans more than one source. Dismissal is recorded per user.
 */
final class Source_Backfill_Notice {

	use Verifies_Ajax_Request;

	/**
	 * Plugin screens the notice may render on. admin_notices fires on every
	 * admin page, so unrelated screens are skipped.
	 */
	private const PLUGIN_SCREEN_IDS = array(
		'toplevel_page_safe-publish',
		'toplevel_page_safe-publish-settings',
		'safe-publish_page_safe-publish-settings',
		'safe-publish_page_safe-publish-exports',
	);

	/**
	 * Registers the notice and its dismiss handler.
	 */
	public function init(): void {
		add_action( 'admin_notices', array( $this, 'render_notice' ) );
		add_action(
			'wp_ajax_safe_publish_dismiss_backfill_notice',
			array( $this, 'ajax_dismiss' )
		);
	}

	/**
	 * Renders the notice for users who can act on it and have not dismissed it.
	 */
	public function render_notice(): void {
		if ( ! current_user_can( 'manage_options' )
			|| ! Source_Site_Url_Backfill::needs_attention()
		) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen || ! in_array( $screen->id, self::PLUGIN_SCREEN_IDS, true ) ) {
			return;
		}

		$dismissed = get_user_meta(
			get_current_user_id(),
			Source_Site_Url_Backfill::NOTICE_DISMISSED_META,
			true
		);
		if ( '' !== (string) $dismissed ) {
			return;
		}

		$message = __(
			'Safe Publish: some previously imported content could not be matched to its source automatically and may not be recognized on re-import. Re-import the affected content, or contact support.',
			'safe-publish'
		);

		$nonce = wp_create_nonce( 'safe_publish_ajax_nonce' );

		?>
		<div
			class="notice notice-warning is-dismissible safe-publish-backfill-notice"
			data-safe-publish-nonce="<?php echo esc_attr( $nonce ); ?>"
		>
			<p><?php echo esc_html( $message ); ?></p>
		</div>
		<script>
			( function () {
				var notice = document.querySelector( '.safe-publish-backfill-notice' );
				if ( ! notice ) {
					return;
				}
				notice.addEventListener( 'click', function ( event ) {
					if ( ! event.target.classList.contains( 'notice-dismiss' ) ) {
						return;
					}
					var body = new FormData();
					body.append( 'action', 'safe_publish_dismiss_backfill_notice' );
					body.append( 'nonce', notice.dataset.safePublishNonce );
					fetch( ajaxurl, { method: 'POST', body: body, credentials: 'same-origin' } );
				} );
			} )();
		</script>
		<?php
	}

	/**
	 * Records that the current user dismissed the notice.
	 */
	public function ajax_dismiss(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$user_id = get_current_user_id();
		if ( $user_id > 0 ) {
			update_user_meta(
				$user_id,
				Source_Site_Url_Backfill::NOTICE_DISMISSED_META,
				'1'
			);
		}

		wp_send_json_success();
	}
}
