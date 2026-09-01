<?php
/**
 * Dashboard widget for workflow.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Admin;

use VIPWorkflows\Plugin;
use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Workflow\StagePalette;

/**
 * Adds "My Workflow" widget to WordPress dashboard.
 */
class DashboardWidget {


	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		add_action( 'wp_dashboard_setup', array( $this, 'register_widget' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueue the widget's styles on the dashboard.
	 *
	 * The dashboard loads none of the plugin's built admin assets, so the styles
	 * have to be asked for here. `index.php` is the hook suffix of every screen
	 * that runs `wp_dashboard_setup` — the site, network and user dashboards —
	 * and of no other screen, so it is exactly the set of screens that can render
	 * the widget.
	 *
	 * @param string $hook_suffix Current admin page.
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		if ( 'index.php' !== $hook_suffix ) {
			return;
		}

		AdminStyles::enqueue_classic();
	}

	/**
	 * Register the dashboard widget.
	 */
	public function register_widget(): void {
		wp_add_dashboard_widget(
			'vip_workflows_my_work',
			__( 'My Workflow', 'vip-workflows' ),
			array( $this, 'render_widget' )
		);
	}

	/**
	 * Render the widget content.
	 */
	public function render_widget(): void {
		$current_user_id = get_current_user_id();
		$repository      = new SequenceRepository();
		// Workflow sequences only: the widget counts posts per stage, and phase
		// sequences have no stages.
		$sequences      = $repository->get_workflow_sequences( array( 'status' => 'active' ) );
		$status_manager  = Plugin::get_instance()->get_status_manager();

		if ( empty( $sequences ) || ! $status_manager ) {
			?>
			<p class="vip-workflows-dashboard__empty">
			<?php esc_html_e( 'No workflows configured.', 'vip-workflows' ); ?>
			</p>
			<?php
			return;
		}

		// Collect all post types that have workflows.
		$workflow_post_types = array();
		foreach ( $sequences as $sequence ) {
			$workflow_post_types = array_merge( $workflow_post_types, $sequence->get_post_types() );
		}
		$workflow_post_types = array_unique( $workflow_post_types );

		// Get posts authored by current user in workflow statuses.
		$my_posts = get_posts(
			array(
				'author'         => $current_user_id,
				'post_type'      => $workflow_post_types,
				'post_status'    => 'any',
				'posts_per_page' => 10,
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);

		// Filter to only posts with workflow status.
		$workflow_posts = array();
		foreach ( $my_posts as $post ) {
			$sequence = $status_manager->get_sequence_for_post( $post->ID );
			if ( $sequence ) {
				$status = $status_manager->get_current_status( $post->ID );
				if ( $status ) {
					$workflow_posts[] = array(
						'post'      => $post,
						'sequence' => $sequence,
						'status'    => $status,
					);
				}
			}
		}
		?>
		<div class="vip-workflows-dashboard">
			<h4><?php esc_html_e( 'My Content in Workflow', 'vip-workflows' ); ?></h4>
		<?php if ( empty( $workflow_posts ) ) : ?>
				<p class="vip-workflows-dashboard__empty">
			<?php esc_html_e( 'No content currently in workflow.', 'vip-workflows' ); ?>
				</p>
			<?php else : ?>
				<ul class="vip-workflows-dashboard__list">
				<?php foreach ( array_slice( $workflow_posts, 0, 5 ) as $item ) : ?>
						<li>
							<a href="<?php echo esc_url( get_edit_post_link( $item['post']->ID ) ); ?>">
						<?php echo esc_html( $item['post']->post_title ? $item['post']->post_title : __( '(no title)', 'vip-workflows' ) ); ?>
							</a>
							<?php // The pill's text and its wash are both the stage's own color; the stylesheet owns everything else. ?>
							<span
								class="vip-workflows-dashboard__status"
								style="--vip-workflows-stage-color: <?php echo esc_attr( $item['status']['color'] ?? StagePalette::DEFAULT_COLOR ); ?>"
							>
					<?php echo esc_html( $item['status']['label'] ?? $item['status']['key'] ); ?>
							</span>
						</li>
				<?php endforeach; ?>
				</ul>
			<?php endif; ?>

		<?php
		// Show summary by sequence.
		?>
			<h4><?php esc_html_e( 'Workflow Summary', 'vip-workflows' ); ?></h4>
			<div class="vip-workflows-dashboard__summary">
		<?php foreach ( $sequences as $sequence ) : ?>
			<?php
			$total = array_sum( \VIPWorkflows\Workflow\StageQuery::counts_by_stage( $sequence ) );
			?>
					<div class="vip-workflows-dashboard__sequence">
						<strong><?php echo esc_html( $sequence->name ); ?></strong>
						<span class="vip-workflows-dashboard__count"><?php echo (int) $total; ?></span>
					</div>
		<?php endforeach; ?>
			</div>

			<p class="vip-workflows-dashboard__actions">
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=vip-workflows' ) ); ?>" class="button">
		<?php esc_html_e( 'View Dashboard', 'vip-workflows' ); ?>
				</a>
			</p>
		</div>
		<?php
		// The widget's styles live in src/entries/classic-admin.css, enqueued by
		// enqueue_assets() above.
	}
}
