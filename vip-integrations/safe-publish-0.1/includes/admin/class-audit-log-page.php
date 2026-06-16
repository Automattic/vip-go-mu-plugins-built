<?php
/**
 * Audit Log Page class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Audit_Log_Table;
use Safe_Publish\Utils\Datetime_Sanitizer;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Audit Log admin page coordinator.
 *
 * Registers the Audit Log submenu and the audit-events AJAX handler. The
 * page lists rows from all audit log channels with filtering by channel,
 * level, event substring, and date range. Gated to dev environments only
 * while per-post import lifecycle coverage is incomplete; the table
 * populates in every environment so the data can be inspected via direct
 * DB access.
 */
final class Audit_Log_Page {

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
		'settings',
	);

	/**
	 * Levels surfaced by the filter dropdown.
	 *
	 * @var string[]
	 */
	public const KNOWN_LEVELS = array( 'info', 'error' );

	/**
	 * Maximum rows the AJAX handler will return in one page.
	 */
	private const MAX_PER_PAGE = 100;

	/**
	 * Default page size when the request omits per_page.
	 */
	private const DEFAULT_PER_PAGE = 25;

	/**
	 * Registers the submenu under the safe-publish parent and the AJAX
	 * handler, for import-enabled and bidirectional modes. Dev only.
	 */
	public function init(): void {
		if ( ! self::is_dev_environment() ) {
			return;
		}

		add_action( 'admin_menu', array( $this, 'add_submenu_page' ), 19 );
		add_action( 'admin_enqueue_scripts', array( $this, 'maybe_enqueue_assets' ) );
		add_action( 'wp_ajax_safe_publish_get_audit_events', array( $this, 'ajax_get_audit_events' ) );
	}

	/**
	 * Registers the submenu under the settings-only parent and the AJAX
	 * handler, for export-only and unconfigured modes. Dev only.
	 */
	public function init_settings_only(): void {
		if ( ! self::is_dev_environment() ) {
			return;
		}

		add_action( 'admin_menu', array( $this, 'add_submenu_page_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'maybe_enqueue_assets' ) );
		add_action( 'wp_ajax_safe_publish_get_audit_events', array( $this, 'ajax_get_audit_events' ) );
	}

	/**
	 * Whether the audit log UI should be available in this environment.
	 *
	 * @return bool True on dev installs (matches the value set in
	 *              .wp-env.json and the safe-publish-local-dev mu-plugin).
	 */
	private static function is_dev_environment(): bool {
		return 'development' === wp_get_environment_type();
	}

	/**
	 * Adds the Audit Log submenu under the safe-publish parent.
	 */
	public function add_submenu_page(): void {
		add_submenu_page(
			'safe-publish',
			__( 'Audit Log', 'safe-publish' ),
			__( 'Audit Log', 'safe-publish' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Adds the Audit Log submenu under the safe-publish-settings parent for
	 * the export-only/unconfigured modes.
	 */
	public function add_submenu_page_settings(): void {
		add_submenu_page(
			'safe-publish-settings',
			__( 'Audit Log', 'safe-publish' ),
			__( 'Audit Log', 'safe-publish' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * Renders the Audit Log admin page.
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
		if ( 'safe-publish_page_' . self::PAGE_SLUG !== $hook_suffix ) {
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
				'restNonce'     => wp_create_nonce( 'wp_rest' ),
				'containerId'   => 'safe-publish-audit-log-container',
				'settingsUrl'   => admin_url( 'admin.php?page=safe-publish-settings' ),
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
	 *   - levels[]     string[]  'info' and/or 'error'.
	 *   - event_search string    Partial match on the event column.
	 *   - after        string    ISO 8601 datetime or YYYY-MM-DD; lower bound on created_at_gmt.
	 *   - before       string    ISO 8601 datetime or YYYY-MM-DD; upper bound (end-of-day if date-only).
	 *   - page         int       1-based page index.
	 *   - per_page     int       Page size; capped at MAX_PER_PAGE.
	 *
	 * Response: { items: AuditEvent[], total: int }.
	 */
	public function ajax_get_audit_events(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- nonce checked above.
		$query_args = $this->build_query_args( $_POST );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$rows  = Audit_Log_Table::get_events( $query_args );
		$total = Audit_Log_Table::count( $query_args );

		$items = array_map(
			static function ( array $row ): array {
				$data    = is_array( $row['data'] ) ? $row['data'] : array();
				$created = (string) $row['created_at_gmt'];

				return array(
					'id'                 => (int) $row['id'],
					'channel'            => (string) $row['channel'],
					'level'              => (string) $row['level'],
					'event'              => (string) $row['event'],
					'date'               => str_replace( ' ', 'T', $created ) . 'Z',
					'actor_user_id'      => isset( $data['actor_user_id'] ) ? (int) $data['actor_user_id'] : 0,
					'actor_display_name' => isset( $data['actor_display_name'] ) ? (string) $data['actor_display_name'] : '',
					'actor_source'       => isset( $data['actor_source'] ) ? (string) $data['actor_source'] : '',
					// Cast to object so empty payloads serialize as `{}` (JSON
					// object), matching the AuditEvent.data type the React side
					// expects rather than the `[]` PHP emits for empty arrays.
					'data'               => (object) $data,
				);
			},
			$rows
		);

		wp_send_json_success(
			array(
				'items' => $items,
				'total' => $total,
			)
		);
	}

	/**
	 * Translates raw request input into Audit_Log_Table query args. Drops
	 * filters that resolve to empty so the SQL stays minimal and the index
	 * on `created_at_gmt` can serve the unfiltered default view.
	 *
	 * @param array $input Raw $_POST (already nonce-verified).
	 * @return array Args suitable for Audit_Log_Table::get_events()/count().
	 */
	private function build_query_args( array $input ): array {
		$args = array();

		$channels = isset( $input['channels'] ) && is_array( $input['channels'] )
			? array_values( array_filter( array_map( 'sanitize_key', $input['channels'] ) ) )
			: array();
		if ( ! empty( $channels ) ) {
			$args['channel'] = $channels;
		}

		$levels = isset( $input['levels'] ) && is_array( $input['levels'] )
			? array_values( array_intersect( array_map( 'sanitize_key', $input['levels'] ), self::KNOWN_LEVELS ) )
			: array();
		if ( ! empty( $levels ) ) {
			$args['level'] = $levels;
		}

		if ( ! empty( $input['event_search'] ) && is_string( $input['event_search'] ) ) {
			$args['event_type'] = sanitize_text_field( wp_unslash( $input['event_search'] ) );
		}

		$after_raw  = isset( $input['after'] )
			? sanitize_text_field( wp_unslash( $input['after'] ) )
			: '';
		$before_raw = isset( $input['before'] )
			? sanitize_text_field( wp_unslash( $input['before'] ) )
			: '';

		$after  = Datetime_Sanitizer::sanitize_iso_datetime( $after_raw, false );
		$before = Datetime_Sanitizer::sanitize_iso_datetime( $before_raw, true );

		if ( is_string( $after ) ) {
			$args['after_gmt'] = $after;
		}

		if ( is_string( $before ) ) {
			$args['before_gmt'] = $before;
		}

		$per_page = isset( $input['per_page'] ) ? absint( $input['per_page'] ) : self::DEFAULT_PER_PAGE;
		$per_page = min( max( $per_page, 1 ), self::MAX_PER_PAGE );

		$page = isset( $input['page'] ) ? max( absint( $input['page'] ), 1 ) : 1;

		$args['limit']  = $per_page;
		$args['offset'] = ( $page - 1 ) * $per_page;

		return $args;
	}
}
