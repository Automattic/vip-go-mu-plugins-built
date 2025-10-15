<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Admin;

/**
 * Renderer class for handling view output and template rendering.
 *
 * @package Automattic\RewriteRulesInspector\Admin
 * @since 1.5.0
 */
final class ViewRenderer {

	/**
	 * Plugin directory path.
	 *
	 * @var string $plugin_dir_path
	 */
	private string $plugin_dir_path;

	/**
	 * Constructor.
	 *
	 * @since 1.5.0
	 * @param string $plugin_dir_path Plugin directory path.
	 */
	public function __construct( string $plugin_dir_path ) {
		$this->plugin_dir_path = $plugin_dir_path;
	}

	/**
	 * Render the main rules view.
	 *
	 * @since 1.5.0
	 * @param array  $rules Array of rewrite rules.
	 * @param array  $permastructs Array of permastructs.
	 * @param object $wp_list_table WordPress list table object.
	 * @param array  $url_test_results Optional URL test results.
	 */
	public function render_rules_view( array $rules, array $permastructs, $wp_list_table, ?array $url_test_results = null, bool $flush_success = false ): void {
		// Bump view stats or do something else on page load.
		do_action( 'rri_view_rewrite_rules', $rules );

		// Determine current tab.
		$has_permastructs = ! empty( $permastructs );
		$default_tab      = 'rules';
		$current_tab      = isset( $_GET['tab'] ) ? sanitize_key( (string) $_GET['tab'] ) : $default_tab;
		if ( ! $has_permastructs && 'permastructs' === $current_tab ) {
			$current_tab = $default_tab;
		}

		?>
		<div class="wrap rri-admin-page">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<nav class="nav-tab-wrapper" aria-label="<?php esc_attr_e( 'Rewrite Rules Inspector sections', 'rewrite-rules-inspector' ); ?>">
				<?php
					$rules_url = add_query_arg( 'tab', 'rules' );
					$rules_cls = 'nav-tab' . ( 'rules' === $current_tab ? ' nav-tab-active' : '' );
					printf(
						'<a href="%1$s" class="%2$s">%3$s</a>',
						esc_url( $rules_url ),
						esc_attr( $rules_cls ),
						esc_html__( 'Rewrite Rules', 'rewrite-rules-inspector' )
					);

					if ( $has_permastructs ) {
						$perma_url = add_query_arg( 'tab', 'permastructs' );
						$perma_cls = 'nav-tab' . ( 'permastructs' === $current_tab ? ' nav-tab-active' : '' );
						printf(
							'<a href="%1$s" class="%2$s">%3$s</a>',
							esc_url( $perma_url ),
							esc_attr( $perma_cls ),
							esc_html__( 'Permastructs', 'rewrite-rules-inspector' )
						);
					}
				?>
			</nav>

			<?php if ( 'rules' === $current_tab ) : ?>
				<div class="rri-section" id="rewrite-rules-section" tabindex="-1">
					<h2 class="screen-reader-text"><?php esc_html_e( 'Rewrite Rules', 'rewrite-rules-inspector' ); ?></h2>
					<?php if ( $flush_success ) : ?>
						<?php $this->render_flush_success_message(); ?>
					<?php endif; ?>
					<?php $this->render_rules_messages( $rules ); ?>
					<?php if ( $url_test_results ) : ?>
						<?php $this->render_url_test_results( $url_test_results ); ?>
					<?php endif; ?>
					<?php $wp_list_table->display(); ?>
				</div>
			<?php elseif ( 'permastructs' === $current_tab && $has_permastructs ) : ?>
				<div class="rri-section" id="permastructs-section" tabindex="-1">
					<h2 class="screen-reader-text"><?php esc_html_e( 'Permastructs', 'rewrite-rules-inspector' ); ?></h2>
					<?php $this->render_permastructs_table( $permastructs ); ?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Render rules-related messages (errors, warnings).
	 *
	 * @since 1.5.0
	 * @param array $rules Array of rewrite rules.
	 */
	private function render_rules_messages( array $rules ): void {
		$missing_count = 0;
		foreach ( $rules as $rule ) {
			if ( 'missing' === $rule['source'] ) {
				++$missing_count;
			}
		}

		$has_filter = isset( $_GET['source'] ) && 'all' !== $_GET['source'];

		if ( empty( $rules ) ) {
			// With a rule source filter active, suppress the top-level notice to keep URL Test Results position consistent.
			if ( ! $has_filter ) {
				$error_message = apply_filters( 'rri_message_no_rules', __( 'No rewrite rules yet, try flushing.', 'rewrite-rules-inspector' ) );
				echo '<div class="rri-notice rri-notice-error" role="status" aria-live="polite"><p>' . wp_kses_post( $error_message ) . '</p></div>';
			}
		} elseif ( $missing_count > 0 ) {
			/* translators: %d: Count of missing rewrite rules */
			$error_message = apply_filters( 'rri_message_missing_rules', sprintf( _n( '%d rewrite rule may be missing, try flushing.', '%d rewrite rules may be missing, try flushing.', $missing_count, 'rewrite-rules-inspector' ), $missing_count ) );
			echo '<div class="rri-notice rri-notice-error" role="status" aria-live="polite"><p>' . wp_kses_post( $error_message ) . '</p></div>';
		}
	}


	/**
	 * Render the permastructs table.
	 *
	 * @since 1.5.0
	 * @param array $permastructs Array of permastructs.
	 */
	private function render_permastructs_table( array $permastructs ): void {
		$template_path = $this->plugin_dir_path . 'views/permastructs-table.php';
		if ( file_exists( $template_path ) ) {
			include $template_path;
		}
	}

	/**
	 * Render URL test results.
	 *
	 * @since 1.5.0
	 * @param array $results URL test results.
	 */
	private function render_url_test_results( array $results ): void {
		?>
		<div class="rri-url-test-results">
			<h3><?php esc_html_e( 'URL Test Results', 'rewrite-rules-inspector' ); ?></h3>
			
			<div class="rri-test-summary">
				<p><strong><?php esc_html_e( 'URL Tested:', 'rewrite-rules-inspector' ); ?></strong> <code><?php echo esc_html( $results['url'] ); ?></code></p>
				<p><strong><?php esc_html_e( 'Path Tested:', 'rewrite-rules-inspector' ); ?></strong> <code><?php echo esc_html( $results['path'] ); ?></code></p>
				
				<?php
					$tested_count = (int) $results['total_rules_tested'];
					$has_filter = isset( $_GET['source'] ) && 'all' !== $_GET['source'];
					// If a filter yields zero rules to test, show a concise message here to keep layout consistent.
					if ( $has_filter && 0 === $tested_count ) : ?>
						<div class="rri-first-match">
							<h4><?php esc_html_e( 'No rewrite rules match the selected rule source.', 'rewrite-rules-inspector' ); ?></h4>
						</div>
					<?php endif; 
					// Only show 404 notice for URLs that would actually result in a 404
					// Skip for homepage, admin URLs, and other special cases
					$tested_path = trim( $results['path'], '/' );
					$is_special_url = empty( $tested_path ) || strpos( $tested_path, 'wp-admin' ) === 0 || strpos( $tested_path, 'wp-content' ) === 0 || strpos( $tested_path, 'wp-includes' ) === 0;
					
					if ( $results['is_404'] && $tested_count > 0 && ! $is_special_url ) : ?>
						<div class="rri-notice rri-notice-error" role="status" aria-live="polite">
							<p><strong><?php esc_html_e( 'Result: 404 Error', 'rewrite-rules-inspector' ); ?></strong></p>
							<p><?php 
								printf(
									/* translators: %d: Number of rules tested */
									esc_html__( 'This URL does not match any of the %d rewrite rules and would result in a 404 error.', 'rewrite-rules-inspector' ),
									$tested_count
								);
							?></p>
						</div>
					<?php elseif ( $results['is_404'] && $tested_count > 0 && $is_special_url ) : ?>
						<div class="rri-notice" role="status" aria-live="polite">
							<p><strong><?php esc_html_e( 'Result: No matching rules', 'rewrite-rules-inspector' ); ?></strong></p>
							<p><?php 
								printf(
									/* translators: %d: Number of rules tested */
									esc_html__( 'This URL does not match any of the %d rewrite rules, but it may be handled by WordPress core routing.', 'rewrite-rules-inspector' ),
									$tested_count
								);
							?></p>
						</div>
					<?php endif; ?>

				<?php if ( ! $results['is_404'] ) : ?>

					<?php if ( $results['first_match'] ) : ?>
						<div class="rri-first-match">
							<h4><?php esc_html_e( 'First Match (WordPress will use this):', 'rewrite-rules-inspector' ); ?></h4>
							<table class="widefat">
								<tr>
									<th><?php esc_html_e( 'Rule Pattern', 'rewrite-rules-inspector' ); ?></th>
									<td><code><?php echo esc_html( $results['first_match']['rule'] ); ?></code></td>
								</tr>
								<tr>
									<th><?php esc_html_e( 'Rewrite Target', 'rewrite-rules-inspector' ); ?></th>
									<td><code><?php echo esc_html( $results['first_match']['rewrite'] ); ?></code></td>
								</tr>
								<tr>
									<th><?php esc_html_e( 'Source', 'rewrite-rules-inspector' ); ?></th>
									<td><?php echo esc_html( $results['first_match']['source'] ); ?></td>
								</tr>
								<?php if ( ! empty( $results['first_match']['query_vars'] ) ) : ?>
									<tr>
										<th><?php esc_html_e( 'Query Variables', 'rewrite-rules-inspector' ); ?></th>
										<td>
											<?php 
											$query_vars = $results['first_match']['query_vars'];
											
											// Handle both string and array formats
											if ( is_string( $query_vars ) ) {
												// Remove index.php? prefix if present
												$query_string = $query_vars;
												if ( strpos( $query_string, 'index.php?' ) === 0 ) {
													$query_string = substr( $query_string, 10 );
												}
												echo '<code>' . esc_html( $query_string ) . '</code>';
											} else {
												// Array format - show key-value pairs, removing index.php? prefix from keys
												foreach ( $query_vars as $key => $value ) : 
													// Remove index.php? prefix from key if present
													$clean_key = $key;
													if ( strpos( $key, 'index.php?' ) === 0 ) {
														$clean_key = substr( $key, 10 );
													}
												?>
													<code><?php echo esc_html( $clean_key ); ?> = <?php echo esc_html( $value ); ?></code><br>
												<?php endforeach;
											}
											?>
										</td>
									</tr>
								<?php endif; ?>
							</table>
						</div>
					<?php endif; ?>

					<?php if ( count( $results['matches'] ) > 1 ) : ?>
						<div class="rri-all-matches">
							<h4><?php esc_html_e( 'Additional Matching Rules:', 'rewrite-rules-inspector' ); ?></h4>
							<p><?php 
								printf(
									/* translators: %d: Number of additional matches */
									esc_html__( 'See the table below for all %d matching rules in priority order.', 'rewrite-rules-inspector' ),
									count( $results['matches'] )
								);
							?></p>
						</div>
					<?php endif; ?>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Show a message when you've successfully flushed your rewrite rules.
	 *
	 * @since 1.5.0
	 */
	public function render_flush_success_message(): void {
		echo '<div class="rri-notice rri-notice-success" role="status" aria-live="polite"><p>' . esc_html__( 'Rewrite rules flushed.', 'rewrite-rules-inspector' ) . '</p></div>';
	}
}
