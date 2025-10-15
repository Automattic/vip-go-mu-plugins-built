<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Core;

/**
 * Service class for handling rewrite rule flushing.
 *
 * @package Automattic\RewriteRulesInspector\Core
 * @since 1.5.0
 */
final class RuleFlush {

	/**
	 * Whether or not users can flush the rewrite rules from this tool.
	 *
	 * @var bool $flushing_enabled
	 */
	private bool $flushing_enabled;

	/**
	 * Capability needed to flush rules.
	 *
	 * @var string $view_cap
	 */
	private string $view_cap;

	/**
	 * Constructor.
	 *
	 * @since 1.5.0
	 * @param bool   $flushing_enabled Whether flushing is enabled.
	 * @param string $view_cap Capability needed to flush rules.
	 */
	public function __construct( bool $flushing_enabled = true, string $view_cap = 'manage_options' ) {
		$this->flushing_enabled = $flushing_enabled;
		$this->view_cap         = $view_cap;
	}

	/**
	 * Allow a user to flush rewrite rules for their site.
	 *
	 * @since 1.5.0
	 * @param string $redirect_url URL to redirect to after flushing.
	 */
	public function flush_rules( string $redirect_url ): void {
		// Check nonce and permissions.
		check_admin_referer( 'flush-rules' );
		if ( ! $this->flushing_enabled || ! current_user_can( $this->view_cap ) ) {
			wp_die( esc_html__( 'You do not have permissions to perform this action.', 'rewrite-rules-inspector' ) );
		}

		$this->perform_flush();
		$this->redirect_after_flush( $redirect_url );
	}

	/**
	 * Perform the actual flush operation.
	 *
	 * @since 1.5.0
	 */
	private function perform_flush(): void {
		wp_cache_delete( 'rewrite_rules', 'options' );
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules
		flush_rewrite_rules( false );
		do_action( 'rri_flush_rules' );
	}

	/**
	 * Redirect after successful flush.
	 *
	 * @since 1.5.0
	 * @param string $redirect_url Base URL to redirect to.
	 */
	private function redirect_after_flush( string $redirect_url ): void {
		$args = [
			'message' => 'flush-success',
		];
		wp_safe_redirect( add_query_arg( $args, $redirect_url ) );
		exit;
	}

	/**
	 * Check if flushing is enabled.
	 *
	 * @since 1.5.0
	 * @return bool True if flushing is enabled.
	 */
	public function is_flushing_enabled(): bool {
		return $this->flushing_enabled;
	}
}
