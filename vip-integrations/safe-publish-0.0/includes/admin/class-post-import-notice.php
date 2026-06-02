<?php
/**
 * Post-import admin notice class.
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
 * Persistent admin notice surfaced after a bulk import completes.
 *
 * Stores a per-user transient with the just-finished session's id and counts,
 * then renders a notice on subsequent admin page loads with a deep-link into
 * the Imports page filtered to that batch. Dismiss is best-effort (the X is
 * native WP behavior plus an AJAX cleanup).
 */
final class Post_Import_Notice {

	use Verifies_Ajax_Request;

	/**
	 * Transient key prefix; the user id is appended so each user sees their
	 * own most recent batch.
	 */
	private const TRANSIENT_PREFIX = 'safe_publish_post_import_notice_';

	/**
	 * Transient TTL.
	 */
	private const TRANSIENT_TTL = HOUR_IN_SECONDS;

	/**
	 * Registers the admin notice + AJAX dismiss handler.
	 */
	public function init(): void {
		add_action( 'admin_notices', array( $this, 'render_notice' ) );
		add_action( 'wp_ajax_safe_publish_dismiss_import_notice', array( $this, 'ajax_dismiss' ) );
	}

	/**
	 * Records that a bulk import just finished for the current user.
	 *
	 * @param int $session_id Session id of the import that completed.
	 * @param int $total      Total items processed.
	 * @param int $successful Items created or updated successfully.
	 * @param int $failed     Items that errored.
	 */
	public static function record(
		int $session_id,
		int $total,
		int $successful,
		int $failed
	): void {
		$user_id = get_current_user_id();
		if ( 0 === $user_id ) {
			return;
		}

		set_transient(
			self::transient_key( $user_id ),
			array(
				'session_id' => $session_id,
				'total'      => $total,
				'successful' => $successful,
				'failed'     => $failed,
			),
			self::TRANSIENT_TTL
		);
	}

	/**
	 * Plugin screens on which the notice (and its inline dismiss script) is
	 * allowed to render. `admin_notices` fires on every admin page, so we
	 * gate to avoid leaking the script onto unrelated screens.
	 */
	private const PLUGIN_SCREEN_IDS = array(
		'toplevel_page_safe-publish',
		'safe-publish_page_safe-publish-imports',
		'safe-publish_page_safe-publish-exports',
		'safe-publish_page_safe-publish-settings',
	);

	/**
	 * Renders the notice when a recorded batch exists for the current user.
	 */
	public function render_notice(): void {
		$user_id = get_current_user_id();
		if ( 0 === $user_id || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen || ! in_array( $screen->id, self::PLUGIN_SCREEN_IDS, true ) ) {
			return;
		}

		$data = get_transient( self::transient_key( $user_id ) );
		if ( ! is_array( $data ) || ! isset( $data['session_id'] ) ) {
			return;
		}

		$session_id = (int) $data['session_id'];
		$total      = (int) ( $data['total'] ?? 0 );
		$successful = (int) ( $data['successful'] ?? 0 );
		$failed     = (int) ( $data['failed'] ?? 0 );

		$link = add_query_arg(
			array(
				'page'  => 'safe-publish-imports',
				'batch' => $session_id,
			),
			admin_url( 'admin.php' )
		);

		$message = sprintf(
			/* translators: 1: successful count, 2: total count */
			__( 'Last import: %1$d of %2$d posts imported.', 'safe-publish' ),
			$successful,
			$total
		);

		if ( $failed > 0 ) {
			$message .= ' ' . sprintf(
				/* translators: %d: failed count */
				__( '%d failed.', 'safe-publish' ),
				$failed
			);
		}

		$nonce = wp_create_nonce( 'safe_publish_ajax_nonce' );

		?>
		<div
			class="notice notice-info is-dismissible safe-publish-post-import-notice"
			data-safe-publish-nonce="<?php echo esc_attr( $nonce ); ?>"
		>
			<p>
				<?php echo esc_html( $message ); ?>
				<a href="<?php echo esc_url( $link ); ?>">
					<?php esc_html_e( 'View imports', 'safe-publish' ); ?>
				</a>
			</p>
		</div>
		<script>
			( function () {
				var notice = document.querySelector( '.safe-publish-post-import-notice' );
				if ( ! notice ) {
					return;
				}
				notice.addEventListener( 'click', function ( event ) {
					if ( ! event.target.classList.contains( 'notice-dismiss' ) ) {
						return;
					}
					var body = new FormData();
					body.append( 'action', 'safe_publish_dismiss_import_notice' );
					body.append( 'nonce', notice.dataset.safePublishNonce );
					fetch( ajaxurl, { method: 'POST', body: body, credentials: 'same-origin' } );
				} );
			} )();
		</script>
		<?php
	}

	/**
	 * AJAX handler that clears the current user's post-import notice transient.
	 */
	public function ajax_dismiss(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$user_id = get_current_user_id();
		if ( $user_id > 0 ) {
			delete_transient( self::transient_key( $user_id ) );
		}

		wp_send_json_success();
	}

	/**
	 * Builds the per-user transient key.
	 *
	 * @param int $user_id WordPress user id.
	 * @return string Transient key.
	 */
	private static function transient_key( int $user_id ): string {
		return self::TRANSIENT_PREFIX . $user_id;
	}
}
