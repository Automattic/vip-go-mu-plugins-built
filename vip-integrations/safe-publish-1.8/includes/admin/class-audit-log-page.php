<?php
/**
 * Audit Log Page class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Auth\Permissions;
// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Audit Log admin page coordinator.
 *
 * Registers the Audit Log submenu and the audit-events AJAX handler. The
 * page lists rows from all audit log channels with filtering by channel,
 * level, event substring, and date range.
 */
final class Audit_Log_Page {

	/**
	 * Registers the Audit Log as the sole top-level page for audit-only users.
	 *
	 * @return bool Whether the Audit Log replaced the management menu.
	 */
	public static function maybe_add_top_level_page(): bool {
		if (
			current_user_can( Permissions::manage_capability() )
			|| ! current_user_can( Permissions::view_audit_log_capability() )
		) {
			return false;
		}

		add_menu_page(
			__( 'Audit Log', 'safe-publish' ),
			__( 'Safe Publish', 'safe-publish' ),
			Permissions::view_audit_log_capability(),
			self::PAGE_SLUG,
			array( new self(), 'render' ),
			'dashicons-migrate',
			99
		);

		return true;
	}

	use Verifies_Ajax_Request;

	/**
	 * Page slug used by the submenu and asset hook lookups.
	 */
	public const PAGE_SLUG = 'safe-publish-audit-log';

	/**
	 * Channels surfaced by the filter dropdown. The query layer accepts any
	 * value, so unknown filter inputs simply match zero rows; this list is
	 * the UI contract for what's filterable.
	 *
	 * @var string[]
	 */
	public const KNOWN_CHANNELS = array(
		'auth',
		'content',
		'dispatch',
		'export',
		'import',
		'media',
		'reconcile',
		'settings',
	);

	/**
	 * Levels surfaced by the filter dropdown.
	 *
	 * @var string[]
	 */
	public const KNOWN_LEVELS = Audit_Read_Service::KNOWN_LEVELS;

	/**
	 * Registers the submenu under the safe-publish parent and the AJAX
	 * handler, for import-enabled and bidirectional modes.
	 */
	public function init(): void {
		add_action( 'admin_menu', array( $this, 'add_submenu_page' ), 19 );
		add_action( 'admin_enqueue_scripts', array( $this, 'maybe_enqueue_assets' ) );
		add_action( 'wp_ajax_safe_publish_get_audit_events', array( $this, 'ajax_get_audit_events' ) );
	}

	/**
	 * Registers the submenu under the settings-only parent and the AJAX
	 * handler, for export-only and unconfigured modes.
	 */
	public function init_settings_only(): void {
		add_action( 'admin_menu', array( $this, 'add_submenu_page_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'maybe_enqueue_assets' ) );
		add_action( 'wp_ajax_safe_publish_get_audit_events', array( $this, 'ajax_get_audit_events' ) );
	}

	/**
	 * Adds the Audit Log submenu under the safe-publish parent.
	 */
	public function add_submenu_page(): void {
		if ( ! current_user_can( Permissions::manage_capability() ) ) {
			return;
		}

		add_submenu_page(
			'safe-publish',
			__( 'Audit Log', 'safe-publish' ),
			__( 'Audit Log', 'safe-publish' ),
			Permissions::view_audit_log_capability(),
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Adds the Audit Log submenu under the settings parent for the
	 * export-only/unconfigured modes.
	 */
	public function add_submenu_page_settings(): void {
		if ( ! current_user_can( Permissions::manage_capability() ) ) {
			return;
		}

		add_submenu_page(
			Settings_Page::PAGE_SLUG,
			__( 'Audit Log', 'safe-publish' ),
			__( 'Audit Log', 'safe-publish' ),
			Permissions::view_audit_log_capability(),
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Renders the Audit Log admin page.
	 */
	public function render(): void {
		if ( ! current_user_can( Permissions::view_audit_log_capability() ) ) {
			wp_die(
				esc_html__(
					'You do not have sufficient permissions to access this page.',
					'safe-publish'
				)
			);
		}

		?>
		<div class="wrap" id="safe-publish-audit-log-page">
			<h1><?php esc_html_e( 'Audit Log', 'safe-publish' ); ?></h1>

			<div class="safe-publish-admin-container">
				<div class="safe-publish-dataviews-section">
					<div id="safe-publish-audit-log-container">
						<div class="safe-publish-loading">
							<p><?php esc_html_e( 'Loading audit log…', 'safe-publish' ); ?></p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueues the Audit Log page assets when the current admin screen is
	 * the Audit Log submenu. Hooked on `admin_enqueue_scripts` so styles
	 * land in `<head>` rather than being late-injected from `render()`.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function maybe_enqueue_assets( string $hook_suffix ): void {
		if (
			'safe-publish_page_' . self::PAGE_SLUG !== $hook_suffix
			&& 'toplevel_page_' . self::PAGE_SLUG !== $hook_suffix
		) {
			return;
		}

		$this->enqueue_assets();
	}

	/**
	 * Enqueues the Audit Log page assets.
	 */
	private function enqueue_assets(): void {
		Admin_Assets::enqueue_bundle(
			'audit-log',
			'safe-publish-audit-log-script',
			'safe-publish-audit-log-style',
			array(
				'ajaxurl'       => admin_url( 'admin-ajax.php' ),
				'nonce'         => wp_create_nonce( 'safe_publish_ajax_nonce' ),
				'containerId'   => 'safe-publish-audit-log-container',
				'settingsUrl'   => Settings_Page::url(),
				'knownChannels' => self::KNOWN_CHANNELS,
				'knownLevels'   => self::KNOWN_LEVELS,
			)
		);
	}

	/**
	 * AJAX handler returning a paginated, filtered slice of audit log events.
	 *
	 * Request params (all optional):
	 *   - channels[]   string[]  Filter by channels. Unknown values match zero rows.
	 *   - levels[]     string[]  'info', 'warning', and/or 'error'.
	 *   - event_search string    Partial match on the event column.
	 *   - after        string    ISO 8601 datetime or YYYY-MM-DD; lower bound on created_at_gmt.
	 *   - before       string    ISO 8601 datetime or YYYY-MM-DD; upper bound (end-of-day if date-only).
	 *   - page         int       1-based page index.
	 *   - per_page     int       Page size; capped at 100.
	 *
	 * Response: { items: AuditEvent[], total: int }.
	 */
	public function ajax_get_audit_events(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability( Permissions::view_audit_log_capability() );

		// The nonce is checked above; the service sanitizes the request values.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$input = array(
			'channels'     => $_POST['channels'] ?? null,
			'levels'       => $_POST['levels'] ?? null,
			'event_search' => isset( $_POST['event_search'] )
				&& is_string( $_POST['event_search'] )
				? wp_unslash( $_POST['event_search'] ) : null,
			'after'        => isset( $_POST['after'] )
				&& is_string( $_POST['after'] )
				? wp_unslash( $_POST['after'] ) : null,
			'before'       => isset( $_POST['before'] )
				&& is_string( $_POST['before'] )
				? wp_unslash( $_POST['before'] ) : null,
			'page'         => $_POST['page'] ?? null,
			'per_page'     => $_POST['per_page'] ?? null,
		);
		// phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		wp_send_json_success(
			( new Audit_Read_Service() )->get_events( $input )
		);
	}
}
