<?php
/**
 * Exports Page class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Audit_Log_Table;
use Safe_Publish\Utils\Options;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Exports admin page coordinator.
 *
 * Registers the Exports submenu and the export-events AJAX handler. The page
 * lists rows from the audit log's export channel. Visible when the site is
 * configured to export, or when historical export events remain from a prior
 * configuration.
 */
final class Exports_Page {

	use Verifies_Ajax_Request;

	/**
	 * Page slug used by the submenu and asset hook lookups.
	 */
	public const PAGE_SLUG = 'safe-publish-exports';

	/**
	 * Registers the Exports submenu under the Safe Publish parent and the
	 * shared AJAX handler. Used by import-enabled and bidirectional modes.
	 */
	public function init(): void {
		add_action( 'admin_menu', array( $this, 'add_submenu_page' ), 18 );
		add_action( 'wp_ajax_safe_publish_get_export_events', array( $this, 'ajax_get_export_events' ) );
	}

	/**
	 * Registers the Exports submenu under the settings-only parent and the
	 * shared AJAX handler. Used by export-only mode where the top-level slug
	 * is `safe-publish-settings`.
	 */
	public function init_export_only(): void {
		add_action( 'admin_menu', array( $this, 'add_submenu_page_settings' ) );
		add_action( 'wp_ajax_safe_publish_get_export_events', array( $this, 'ajax_get_export_events' ) );
	}

	/**
	 * Adds the Exports submenu under the safe-publish parent.
	 *
	 * Skipped when there's no export config and no historical events, so the
	 * page only appears once it has something to show.
	 */
	public function add_submenu_page(): void {
		if ( ! self::is_visible() ) {
			return;
		}

		add_submenu_page(
			'safe-publish',
			__( 'Exports', 'safe-publish' ),
			__( 'Exports', 'safe-publish' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Adds the Exports submenu under the safe-publish-settings parent for the
	 * export-only mode.
	 */
	public function add_submenu_page_settings(): void {
		if ( ! self::is_visible() ) {
			return;
		}

		add_submenu_page(
			'safe-publish-settings',
			__( 'Exports', 'safe-publish' ),
			__( 'Exports', 'safe-publish' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Renders the Exports admin page.
	 */
	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die(
				esc_html__(
					'You do not have sufficient permissions to access this page.',
					'safe-publish'
				)
			);
		}

		$this->enqueue_assets();

		?>
		<div class="wrap" id="safe-publish-exports-page">
			<h1><?php esc_html_e( 'Exports', 'safe-publish' ); ?></h1>

			<div class="safe-publish-admin-container">
				<div class="safe-publish-dataviews-section">
					<div id="safe-publish-exports-container">
						<div class="safe-publish-loading">
							<p><?php esc_html_e( 'Loading exports…', 'safe-publish' ); ?></p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueues the Exports page assets.
	 */
	private function enqueue_assets(): void {
		Admin_Assets::enqueue_bundle(
			'exports',
			'safe-publish-exports-script',
			'safe-publish-exports-style',
			array(
				'ajaxurl'     => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( 'safe_publish_ajax_nonce' ),
				'restNonce'   => wp_create_nonce( 'wp_rest' ),
				'containerId' => 'safe-publish-exports-container',
				'settingsUrl' => admin_url( 'admin.php?page=safe-publish-settings' ),
			)
		);
	}

	/**
	 * Returns whether the Exports page should be visible.
	 *
	 * True when the site exports content, or when historical export events
	 * exist from a prior configuration so the operator can still inspect them.
	 *
	 * @return bool Whether the Exports page is visible.
	 */
	public static function is_visible(): bool {
		$sync_mode = get_option( Options::OPTION_SYNC_MODE, '' );

		if ( in_array( $sync_mode, array( Options::SYNC_MODE_EXPORT, Options::SYNC_MODE_BIDIRECTIONAL ), true ) ) {
			return true;
		}

		return Audit_Log_Table::count( array( 'channel' => 'export' ) ) > 0;
	}

	/**
	 * AJAX handler returning the most recent export events.
	 *
	 * Gates on `is_visible()` so the endpoint follows the same contract as the
	 * submenu — available only when the Exports page is. The capability check
	 * already keeps unauthenticated callers out; this is defense-in-depth and
	 * keeps the surface area in sync with the UI.
	 */
	public function ajax_get_export_events(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		if ( ! self::is_visible() ) {
			wp_send_json_error( __( 'Exports are not available on this site.', 'safe-publish' ), 404 );
		}

		$rows = Audit_Log_Table::get_events(
			array(
				'channel' => 'export',
				'limit'   => 100,
			)
		);

		$events = array_map(
			static function ( array $row ): array {
				$data    = $row['data'];
				$created = (string) $row['created_at_gmt'];

				return array(
					'id'                   => (int) $row['id'],
					'date'                 => str_replace( ' ', 'T', $created ) . 'Z',
					'level'                => $row['level'],
					'event'                => $row['event'],
					'actor_user_id'        => (int) $data['actor_user_id'],
					'actor_display_name'   => (string) $data['actor_display_name'],
					'actor_source'         => (string) $data['actor_source'],
					'destination_site_url' => (string) $data['destination_site_url'],
					'post_ids'             => array_map( 'intval', (array) ( $data['post_ids'] ?? array() ) ),
					'post_count'           => isset( $data['post_count'] ) ? (int) $data['post_count'] : count( $data['post_ids'] ?? array() ),
				);
			},
			$rows
		);

		wp_send_json_success( $events );
	}
}
