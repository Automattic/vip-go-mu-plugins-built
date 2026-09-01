<?php
/**
 * Admin interface.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Admin;

use VIPWorkflows\ModuleInterface;
use VIPWorkflows\Plugin;
use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Database\Schema;
use VIPWorkflows\Workflow\PostTypeManager;

/**
 * Admin menu and pages handler.
 */
class Admin implements ModuleInterface {

	/**
	 * Top-level menu icon: the `replace` icon from @wordpress/icons, encoded as
	 * a base64 SVG data URI. Fill is the default admin-menu icon color so it
	 * sits alongside core icons. Mirrors the AdminPage header icon default.
	 */
	private const MENU_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBmaWxsPSIjYTdhYWFkIiBkPSJNMTYgMTBoNGMuNiAwIDEtLjQgMS0xVjVjMC0uNi0uNC0xLTEtMWgtNGMtLjYgMC0xIC40LTEgMXY0YzAgLjYuNCAxIDEgMXptLTggNEg0Yy0uNiAwLTEgLjQtMSAxdjRjMCAuNi40IDEgMSAxaDRjLjYgMCAxLS40IDEtMXYtNGMwLS42LS40LTEtMS0xem0xMC0yLjZMMTQuNSAxNWwxLjEgMS4xIDEuNy0xLjdjLS4xIDEuMS0uMyAyLjMtLjkgMi45LS4zLjMtLjcuNS0xLjMuNWgtNC41djEuNUgxNWMuOSAwIDEuNy0uMyAyLjMtLjkgMS0xIDEuMy0yLjcgMS40LTRsMS44IDEuOCAxLjEtMS4xLTMuNi0zLjd6TTYuOCA5LjdjLjEtMS4xLjMtMi4zLjktMi45LjQtLjQuOC0uNiAxLjMtLjZoNC41VjQuOEg5Yy0uOSAwLTEuNy4zLTIuMy45LTEgMS0xLjMgMi43LTEuNCA0TDMuNSA4bC0xIDFMNiAxMi42IDkuNSA5bC0xLTEtMS43IDEuN3oiLz48L3N2Zz4=';

	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'admin';
	}

	/**
	 * Initialize admin.
	 */
	public function init(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_menu', array( $this, 'cleanup_menu' ), 999 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'admin_notices', array( $this, 'render_region_review_notice' ) );
		add_action( 'admin_init', array( $this, 'maybe_dismiss_region_review_notice' ) );
		add_action( 'pre_get_posts', array( $this, 'filter_posts_by_workflow' ) );
		add_action( 'restrict_manage_posts', array( $this, 'render_workflow_filter' ) );

		// Initialize sub-components.
		$sub_components = array(
			new PostsColumns(),
			new DashboardWidget(),
			new Settings(),
		);

		foreach ( $sub_components as $component ) {
			$component->init();
		}
	}

	/**
	 * Filter posts list by workflow sequence and status.
	 *
	 * @param \WP_Query $query The query.
	 */
	public function filter_posts_by_workflow( \WP_Query $query ): void {
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen || 'edit' !== $screen->base ) {
			return;
		}

		// Single combined param "{sequence_id}:{stage_key}" (or "{sequence_id}" for
		// all stages) so the filter dropdown needs no cascading JS.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$selection = isset( $_GET['vip_workflows_stage'] ) ? sanitize_text_field( wp_unslash( $_GET['vip_workflows_stage'] ) ) : '';
		if ( '' === $selection ) {
			return;
		}

		$parts        = explode( ':', $selection, 2 );
		$sequence_id = (int) $parts[0];
		$status_key   = isset( $parts[1] ) ? sanitize_key( $parts[1] ) : '';

		if ( ! $sequence_id ) {
			return;
		}

		$repository = new SequenceRepository();
		$sequence  = $repository->find( $sequence_id );

		if ( ! $sequence ) {
			return;
		}

		if ( $status_key ) {
			// Filter to a specific workflow stage. StageQuery scopes by sequence +
			// stage meta and preserves the screen's own post_type / other query vars.
			\VIPWorkflows\Workflow\StageQuery::apply_to_admin_query( $query, $sequence, $status_key );
		} else {
			// No specific stage — all posts in this workflow.
			$existing = $query->get( 'meta_query' );
			if ( ! is_array( $existing ) ) {
				$existing = array();
			}
			$args = \VIPWorkflows\Workflow\StageQuery::in_any_workflow( $sequence, array( 'meta_query' => $existing ) );
			$query->set( 'meta_query', $args['meta_query'] );
		}
	}

	/**
	 * Render the workflow-stage filter dropdown on the posts list table.
	 *
	 * Single combined-value select ("{sequence_id}:{stage_key}") so sequence
	 * disambiguation and stage selection need no cascading JavaScript.
	 */
	public function render_workflow_filter(): void {
		$screen = get_current_screen();
		if ( ! $screen || 'edit' !== $screen->base ) {
			return;
		}

		// Workflow sequences only: phase sequences have no stages to filter by,
		// and inherit the `post` post-type default, so they would render as an
		// empty optgroup here.
		$repository = new SequenceRepository();
		$sequences = array_filter(
			$repository->get_workflow_sequences( array( 'status' => 'active' ) ),
			fn( $bp ) => in_array( $screen->post_type, $bp->get_post_types(), true )
		);
		if ( empty( $sequences ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$current = isset( $_GET['vip_workflows_stage'] ) ? sanitize_text_field( wp_unslash( $_GET['vip_workflows_stage'] ) ) : '';

		echo '<select name="vip_workflows_stage">';
		printf( '<option value="">%s</option>', esc_html__( 'All workflow stages', 'vip-workflows' ) );

		foreach ( $sequences as $bp ) {
			printf( '<optgroup label="%s">', esc_attr( $bp->name ) );

			printf(
				'<option value="%1$d" %2$s>%3$s</option>',
				(int) $bp->id,
				selected( $current, (string) $bp->id, false ),
				esc_html(
					/* translators: %s: sequence (workflow) name. */
					sprintf( __( 'All in %s', 'vip-workflows' ), $bp->name )
				)
			);

			foreach ( $bp->get_statuses() as $status ) {
				$value = $bp->id . ':' . $status['key'];
				printf(
					'<option value="%1$s" %2$s>%3$s</option>',
					esc_attr( $value ),
					selected( $current, $value, false ),
					esc_html( $status['label'] ?? $status['key'] )
				);
			}

			echo '</optgroup>';
		}

		echo '</select>';
	}

	/**
	 * Register admin menu.
	 */
	public function register_menu(): void {
		if ( current_user_can( 'edit_others_posts' ) ) {
			// Editors+ get My Dashboard as landing page.
			add_menu_page(
				__( 'Workflows', 'vip-workflows' ),
				__( 'Workflows', 'vip-workflows' ),
				'edit_posts',
				'vip-workflows',
				array( $this, 'render_my_dashboard_page' ),
				self::MENU_ICON,
				30
			);

			// My Dashboard - first submenu for editors.
			add_submenu_page(
				'vip-workflows',
				__( 'My Dashboard', 'vip-workflows' ),
				__( 'My Dashboard', 'vip-workflows' ),
				'edit_posts',
				'vip-workflows-my-dashboard',
				array( $this, 'render_my_dashboard_page' )
			);

			// Kanban board - available to all who can edit posts.
			add_submenu_page(
				'vip-workflows',
				__( 'Kanban', 'vip-workflows' ),
				__( 'Kanban', 'vip-workflows' ),
				'edit_posts',
				'vip-workflows-kanban',
				array( $this, 'render_kanban_page' )
			);

			// Calendar - available to all who can edit posts.
			add_submenu_page(
				'vip-workflows',
				__( 'Calendar', 'vip-workflows' ),
				__( 'Calendar', 'vip-workflows' ),
				'edit_posts',
				'vip-workflows-calendar',
				array( $this, 'render_calendar_page' )
			);

			// Ideation page - the creative workspace for story ideas.
			if ( Plugin::experiment_enabled( 'ideation' ) ) {
				add_submenu_page(
					'vip-workflows',
					__( 'Ideation', 'vip-workflows' ),
					__( 'Ideation', 'vip-workflows' ),
					'edit_posts',
					'vip-workflows-ideation',
					array( $this, 'render_ideation_page' )
				);
			}

			add_submenu_page(
				'vip-workflows',
				__( 'Sequences', 'vip-workflows' ),
				__( 'Sequences', 'vip-workflows' ),
				'manage_options',
				'vip-workflows-sequences',
				array( $this, 'render_sequences_page' )
			);

			add_submenu_page(
				'vip-workflows',
				__( 'Audit Log', 'vip-workflows' ),
				__( 'Audit Log', 'vip-workflows' ),
				Settings::can_user_view_audit_log() ? 'edit_others_posts' : 'manage_options',
				'vip-workflows-audit-log',
				array( $this, 'render_audit_log_page' )
			);

			add_submenu_page(
				'vip-workflows',
				__( 'Notifications', 'vip-workflows' ),
				__( 'Notifications', 'vip-workflows' ),
				'manage_options',
				'vip-workflows-notifications',
				array( $this, 'render_notifications_page' )
			);

			add_submenu_page(
				'vip-workflows',
				__( 'Agents', 'vip-workflows' ),
				__( 'Agents', 'vip-workflows' ),
				'manage_options',
				'vip-workflows-agents',
				array( $this, 'render_agents_page' )
			);

			add_submenu_page(
				'vip-workflows',
				__( 'Tools', 'vip-workflows' ),
				__( 'Tools', 'vip-workflows' ),
				'manage_options',
				'vip-workflows-tools',
				array( $this, 'render_tools_page' )
			);
		} elseif ( current_user_can( 'edit_posts' ) ) {
			// Authors get My Dashboard as landing page.
			add_menu_page(
				__( 'Workflows', 'vip-workflows' ),
				__( 'Workflows', 'vip-workflows' ),
				'edit_posts',
				'vip-workflows',
				array( $this, 'render_my_dashboard_page' ),
				self::MENU_ICON,
				30
			);

			// My Dashboard submenu for authors.
			add_submenu_page(
				'vip-workflows',
				__( 'My Dashboard', 'vip-workflows' ),
				__( 'My Dashboard', 'vip-workflows' ),
				'edit_posts',
				'vip-workflows-my-dashboard',
				array( $this, 'render_my_dashboard_page' )
			);

			// Ideation for authors.
			if ( Plugin::experiment_enabled( 'ideation' ) ) {
				add_submenu_page(
					'vip-workflows',
					__( 'Ideation', 'vip-workflows' ),
					__( 'Ideation', 'vip-workflows' ),
					'edit_posts',
					'vip-workflows-ideation',
					array( $this, 'render_ideation_page' )
				);
			}
		}
	}

	/**
	 * Render the React app mount point inside the standard wp-admin canvas.
	 *
	 * Every core admin page renders the same root element; the React app reads
	 * the `?page=` query parameter to decide which screen to mount. Shared
	 * (public static) so the Settings page, which registers its own render
	 * callback, emits structurally identical markup from one source of truth.
	 *
	 * The `<hr class="wp-header-end">` is the anchor wp-admin relocates notices
	 * to. `admin-header.php` opens `#wpbody-content` and fires `admin_notices` /
	 * `all_admin_notices` before the page callback runs, so at parse time every
	 * notice is a block sibling *above* this `.wrap`. `wp-admin/js/common.js`
	 * then moves them with `insertAfter( $( '.wp-header-end' ) )`, falling back
	 * to the first `h1`/`h2` inside `.wrap`. Without an anchor neither match:
	 * this screen's `h1` is rendered by React into `#vip-workflows-root`, which
	 * is still empty when that ready handler runs, so notices are left stranded
	 * above the app. The `<hr>` is core's own marker for exactly this, is
	 * layout-neutral (`visibility: hidden; margin: -2px 0 0` in common.css), and
	 * adds no second heading to compete with the one React renders.
	 */
	public static function render_app_root(): void {
		echo '<div class="wrap"><hr class="wp-header-end"><div id="vip-workflows-root" class="vip-workflows-admin-wrap"></div></div>';
	}

	/**
	 * Render My Dashboard page.
	 */
	public function render_my_dashboard_page(): void {
		self::render_app_root();
	}

	/**
	 * Render Kanban board page.
	 */
	public function render_kanban_page(): void {
		self::render_app_root();
	}

	/**
	 * Render Calendar page.
	 */
	public function render_calendar_page(): void {
		self::render_app_root();
	}

	/**
	 * Render ideation page.
	 */
	public function render_ideation_page(): void {
		self::render_app_root();
	}

	/**
	 * Clean up and order the menu after all menus are registered.
	 *
	 * The native wp-admin submenu now provides all navigation (the custom React
	 * sidebar was removed). WordPress submenus are a flat list, so we order the
	 * items to approximate the previous grouping: "Main" workflow surfaces first,
	 * then "System" configuration screens, then third-party "Integrations" pages.
	 */
	public function cleanup_menu(): void {
		global $submenu;

		// Remove the auto-added "Workflows" submenu (has same slug as parent).
		remove_submenu_page( 'vip-workflows', 'vip-workflows' );

		if ( ! isset( $submenu['vip-workflows'] ) ) {
			return;
		}

		// Canonical ordering weight per core slug. Lower sorts earlier. Any
		// unlisted (third-party) page falls into the trailing Integrations group.
		$order = array(
			// Main.
			'vip-workflows-my-dashboard'  => 10,
			'vip-workflows-kanban'        => 11,
			'vip-workflows-calendar'      => 12,
			'vip-workflows-ideation'      => 13,
			// System.
			'vip-workflows-sequences'    => 30,
			'vip-workflows-notifications' => 31,
			'vip-workflows-agents'        => 32,
			'vip-workflows-tools'         => 33,
			'vip-workflows-audit-log'     => 34,
			'vip-workflows-settings'      => 36,
		);

		$weight_for = static function ( array $item ) use ( $order ): int {
			$slug = $item[2];
			if ( isset( $order[ $slug ] ) ) {
				return $order[ $slug ];
			}
			// Everything else is a third-party integration page.
			return 40;
		};

		// usort is stable in PHP 8.0+, so items with the same weight keep their
		// registration order.
		// Sort the plugin's own submenu in place. usort reindexes the array to
		// 0..n-1, so the result is already a clean sequential list (no
		// array_values() needed).
		usort(
			$submenu['vip-workflows'],
			static function ( array $a, array $b ) use ( $weight_for ): int {
				return $weight_for( $a ) <=> $weight_for( $b );
			}
		);
	}

	/**
	 * Enqueue admin scripts and styles.
	 * Loads on all VIP Workflows pages, including plugin-registered submenus.
	 *
	 * @param string $hook_suffix Current page hook.
	 */
	public function enqueue_scripts( string $hook_suffix ): void {
		// Only load on core VIP Workflows pages. Every core page hook contains
		// "vip-workflows" (the parent is `toplevel_page_vip-workflows`, submenus
		// are `workflows_page_vip-workflows-*`). Third-party plugin pages render
		// their own content natively and do not load our bundle.
		if ( ! str_contains( $hook_suffix, 'vip-workflows' ) ) {
			return;
		}

		$localize_data = array(
			'apiUrl'      => rest_url( 'vip-workflows/v1' ),
			'nonce'       => wp_create_nonce( 'wp_rest' ),
			'currentUser' => array(
				'id'        => get_current_user_id(),
				'canManage' => current_user_can( 'edit_others_posts' ),
			),
			'roles'       => $this->get_available_roles(),
			'experiments' => $this->get_experiment_flags(),
		);

		if (
			str_contains( $hook_suffix, 'vip-workflows-tools' )
			|| str_contains( $hook_suffix, 'vip-workflows-agents' )
		) {
			$localize_data['skills'] = $this->load_skill_files();
		}

		$asset_file = VIP_WORKFLOWS_PLUGIN_DIR . 'build/admin.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			$this->render_build_required_notice();
			return;
		}

		$asset = include $asset_file;

		// WPDS design tokens. Shared with the classic screens, which need the same
		// definitions without any of the bundle around them — hence AdminStyles.
		AdminStyles::enqueue_design_tokens( $asset['version'] );

		// DataViews styles, copied from the pinned @wordpress/dataviews package at
		// build time (they cannot be bundled — see webpack.config.js).
		wp_enqueue_style(
			'vip-workflows-dataviews',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/dataviews.css',
			array( 'wp-components' ),
			$asset['version']
		);
		wp_style_add_data( 'vip-workflows-dataviews', 'rtl', 'replace' );

		wp_enqueue_style(
			'vip-workflows-admin',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/admin.css',
			array( 'wp-components', AdminStyles::TOKENS_HANDLE, 'vip-workflows-dataviews' ),
			$asset['version']
		);

		wp_enqueue_style(
			'vip-workflows-admin-components',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/style-admin.css',
			array( 'vip-workflows-admin' ),
			$asset['version']
		);

		wp_enqueue_script(
			'vip-workflows-admin',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/admin.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_localize_script( 'vip-workflows-admin', 'vipWorkflowsAdmin', $localize_data );
	}

	/**
	 * Show notice when build is required.
	 */
	private function render_build_required_notice(): void {
		add_action(
			'admin_notices',
			function () {
				?>
			<div class="notice notice-error">
				<p>
					<strong><?php esc_html_e( 'VIP Workflows:', 'vip-workflows' ); ?></strong>
				<?php esc_html_e( 'Assets not built. Run: cd wp-content/plugins/vip-workflows && npm install && npm run build', 'vip-workflows' ); ?>
				</p>
			</div>
				<?php
			}
		);
	}

	/**
	 * Query arg carrying the region-review notice dismissal.
	 */
	private const REGION_REVIEW_DISMISS_ARG = 'vip_workflows_dismiss_region_review';

	/**
	 * The Sequence editor URL for one recorded sequence.
	 *
	 * @param  array $sequence One REGION_REVIEW_OPTION record.
	 * @return string
	 */
	private static function region_review_edit_url( array $sequence ): string {
		return add_query_arg(
			array(
				'page' => 'vip-workflows-sequences',
				'id'   => (int) ( $sequence['id'] ?? 0 ),
			),
			admin_url( 'admin.php' )
		);
	}

	/**
	 * Tell admins what the upgrade did to their sequences, and what it could not do.
	 *
	 * The 2.17.0 migration backfills sequences stored before stages carried a `status`
	 * region; the 2.19.0 migration replays the rows it had to give up on, collapsing a
	 * stage that arrived holding two transitions to one target.
	 * Two outcomes need announcing, and they are different problems, so the notice
	 * keeps them apart rather than folding both into one list:
	 *
	 * - **Repaired, please confirm.** The migration can prove the publish region from
	 *   a legacy `publish` flag, but for anything else it seats the stage in the
	 *   least-privileged `draft` region, because nothing in the stored config says
	 *   otherwise; and a second transition to a target the stage already reached was
	 *   removed. Both are safe — such a stage can never publish by accident, and the
	 *   surviving transition still reaches the same target — but both change
	 *   behavior. A sequence with no publish-region stage cannot publish at all, and
	 *   a post moved to its final stage stays a draft with no error; a removed
	 *   transition takes its label, roles, required tools and notifications with it.
	 * - **Could not be repaired.** The row was left exactly as stored, which means it
	 *   still has no regions and every read that touches them throws. Nothing but an
	 *   author editing it will fix that, so it is stated as the failure it is.
	 *
	 * Announcing both is the point. Leaving the operator to discover either one is the
	 * silent broken promise the repair exists to end — and a row that vanished into
	 * `error_log` was exactly that.
	 */
	public function render_region_review_notice(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$sequences = get_option( Schema::REGION_REVIEW_OPTION );

		if ( empty( $sequences ) || ! is_array( $sequences ) ) {
			return;
		}

		$records = array_filter( $sequences, 'is_array' );
		$failed  = array_filter( $records, fn( $s ) => ! empty( $s['error'] ) );
		$changed = array_filter( $records, fn( $s ) => empty( $s['error'] ) );

		$dismiss_url = wp_nonce_url(
			add_query_arg( self::REGION_REVIEW_DISMISS_ARG, '1' ),
			self::REGION_REVIEW_DISMISS_ARG
		);

		if ( ! empty( $failed ) ) :
			?>
		<div class="notice notice-error">
			<p>
				<strong><?php esc_html_e( 'VIP Workflows:', 'vip-workflows' ); ?></strong>
				<?php esc_html_e( 'These sequences could not be upgraded and are not usable until someone fixes them in the Sequence editor. Their stages still have no status region, so any post that reaches one will fail.', 'vip-workflows' ); ?>
			</p>
			<ul style="list-style: disc; margin-left: 2em;">
				<?php foreach ( $failed as $sequence ) : ?>
					<li>
						<a href="<?php echo esc_url( self::region_review_edit_url( $sequence ) ); ?>"><?php echo esc_html( (string) ( $sequence['name'] ?? '' ) ); ?></a>
						— <?php echo esc_html( (string) $sequence['error'] ); ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
			<?php
		endif;

		if ( ! empty( $changed ) ) :
			?>
		<div class="notice notice-warning">
			<p>
				<strong><?php esc_html_e( 'VIP Workflows:', 'vip-workflows' ); ?></strong>
					<?php esc_html_e( 'This upgrade gave every workflow stage a status region, and made a stage hold at most one transition per target. These sequences had to be changed to fit. The changes are safe, but they change how the sequences behave — please confirm them in the Sequence editor.', 'vip-workflows' ); ?>
			</p>
			<ul style="list-style: disc; margin-left: 2em;">
				<?php foreach ( $changed as $sequence ) : ?>
					<?php
					$stage_keys = array_map( 'strval', (array) ( $sequence['stage_keys'] ?? array() ) );
					$dropped    = (array) ( $sequence['dropped'] ?? array() );
					?>
					<li>
						<a href="<?php echo esc_url( self::region_review_edit_url( $sequence ) ); ?>"><?php echo esc_html( (string) ( $sequence['name'] ?? '' ) ); ?></a>
						<?php if ( ! empty( $stage_keys ) ) : ?>
							—
							<?php
							echo esc_html(
								sprintf(
									/* translators: %s: comma-separated stage keys. */
									__( 'stages placed in Draft: %s.', 'vip-workflows' ),
									implode( ', ', $stage_keys )
								)
							);
							?>
						<?php endif; ?>
						<?php if ( ! empty( $dropped ) ) : ?>
							<strong>
							<?php
							echo esc_html(
								sprintf(
									/* translators: %s: comma-separated transitions. */
									__( 'Transitions removed, because the sequence was stored with a stage holding two to the same target. Their roles, required tools and notifications went with them: %s.', 'vip-workflows' ),
									implode( ', ', array_map( array( self::class, 'describe_dropped_transition' ), $dropped ) )
								)
							);
							?>
							</strong>
						<?php endif; ?>
						<?php if ( empty( $sequence['reaches_publish'] ) ) : ?>
							<strong><?php esc_html_e( 'This sequence has no stage in the Publish region, so it cannot publish posts until you set one.', 'vip-workflows' ); ?></strong>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
			<?php
		endif;
		?>
		<div class="notice notice-info">
			<p>
				<a href="<?php echo esc_url( $dismiss_url ); ?>"><?php esc_html_e( 'Dismiss these VIP Workflows upgrade notices', 'vip-workflows' ); ?></a>
			</p>
		</div>
		<?php
	}

	/**
	 * One removed transition, named so an admin can find the stage on the canvas.
	 *
	 * The target is named rather than only the stage, because the transition that
	 * survived the collapse still reaches it — what was lost is that edge's own
	 * roles, required tools and notifications, not the destination.
	 *
	 * @param  array $dropped `{ from, to }` as recorded by the migration.
	 * @return string
	 */
	private static function describe_dropped_transition( array $dropped ): string {
		return sprintf(
			/* translators: 1: source stage key, 2: target stage key. */
			__( '%1$s → %2$s', 'vip-workflows' ),
			(string) ( $dropped['from'] ?? '' ),
			(string) ( $dropped['to'] ?? '' )
		);
	}

	/**
	 * Delete the region-review record when an admin dismisses the notice.
	 *
	 * Dismissal is an explicit acknowledgement, so it is nonce-protected and
	 * capability-checked rather than driven by a bare query arg.
	 */
	public function maybe_dismiss_region_review_notice(): void {
		if ( ! isset( $_GET[ self::REGION_REVIEW_DISMISS_ARG ] ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		check_admin_referer( self::REGION_REVIEW_DISMISS_ARG );

		delete_option( Schema::REGION_REVIEW_OPTION );

		wp_safe_redirect( remove_query_arg( array( self::REGION_REVIEW_DISMISS_ARG, '_wpnonce' ) ) );
		exit;
	}

	/**
	 * Render sequences page.
	 */
	public function render_sequences_page(): void {
		self::render_app_root();
	}

	/**
	 * Render the Audit Log page.
	 */
	public function render_audit_log_page(): void {
		// Check access.
		if ( ! Settings::can_user_view_audit_log() ) {
			wp_die( esc_html__( 'You do not have permission to view the audit log.', 'vip-workflows' ) );
		}

		self::render_app_root();
	}

	/**
	 * Get available WordPress roles for transition permissions.
	 *
	 * @return array Array of roles with slug and name.
	 */
	private function load_skill_files(): array {
		$skills = array();
		$map    = array(
			'agent'                => 'skills/create-agent/SKILL.md',
			'tool'                 => 'skills/create-tool/SKILL.md',
			'notification-channel' => 'skills/create-notification-channel/SKILL.md',
		);

		foreach ( $map as $type => $relative_path ) {
			$path = VIP_WORKFLOWS_PLUGIN_DIR . $relative_path;
			if ( file_exists( $path ) ) {
				$skills[ $type ] = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			}
		}

		return $skills;
	}

	/**
	 * Get enabled state for all registered experiments, keyed by experiment ID.
	 *
	 * @return array<string, bool>
	 */
	private function get_experiment_flags(): array {
		$registry = Plugin::get_instance()->get_experiment_registry();

		$flags = array();
		foreach ( array_keys( $registry->get_all() ) as $experiment_id ) {
			$flags[ $experiment_id ] = $registry->is_enabled( $experiment_id );
		}

		return $flags;
	}

	/**
	 * Get the available roles.
	 *
	 * @return array
	 */
	private function get_available_roles(): array {
		$wp_roles = wp_roles();
		$roles    = array();

		foreach ( $wp_roles->roles as $slug => $role ) {
			$roles[] = array(
				'slug' => $slug,
				'name' => translate_user_role( $role['name'] ),
			);
		}

		return $roles;
	}

	/**
	 * Render Agents page.
	 */
	public function render_agents_page(): void {
		self::render_app_root();
	}

	/**
	 * Render Tools page.
	 */
	public function render_tools_page(): void {
		self::render_app_root();
	}

	/**
	 * Render Notifications page.
	 */
	public function render_notifications_page(): void {
		self::render_app_root();
	}
}
