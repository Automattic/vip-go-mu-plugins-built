<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Core;

/**
 * Service class for handling file export functionality.
 *
 * @package Automattic\RewriteRulesInspector\Core
 * @since 1.5.0
 */
final class FileExport {

	/**
	 * Capability needed to download files.
	 *
	 * @var string $view_cap
	 */
	private string $view_cap;

	/**
	 * Constructor.
	 *
	 * @since 1.5.0
	 * @param string $view_cap Capability needed to download files.
	 */
	public function __construct( string $view_cap = 'manage_options' ) {
		$this->view_cap = $view_cap;
	}

	/**
	 * Process a user's request to download a set of the rewrite rules.
	 *
	 * Prompts a download of the current set of rules as a text file by
	 * setting the header. Respects current filter rules.
	 *
	 * @since 1.5.0
	 * @param array $rewrite_rules Array of rewrite rules to export.
	 */
	public function download_rules( array $rewrite_rules ): void {
		// Check nonce and permissions.
		check_admin_referer( 'download-rules' );
		if ( ! current_user_can( $this->view_cap ) ) {
			wp_die( esc_html__( 'You do not have permissions to perform this action.', 'rewrite-rules-inspector' ) );
		}

		// Get the rewrite rules and prompt the user to download them.
		// File is saved as YYYYMMDD.themename.rewriterules.txt.
		$theme_name = sanitize_key( get_option( 'stylesheet' ) );
		$filename   = gmdate( 'Ymd' ) . '.' . $theme_name . '.rewriterules.txt';
		
		$this->set_download_headers( $filename );
		$this->output_rules_content( $rewrite_rules );
	}

	/**
	 * Set HTTP headers for file download.
	 *
	 * @since 1.5.0
	 * @param string $filename The filename for the download.
	 */
	private function set_download_headers( string $filename ): void {
		header( 'Content-Type: text/plain' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
	}

	/**
	 * Output the rules content for download.
	 *
	 * @since 1.5.0
	 * @param array $rewrite_rules Array of rewrite rules to export.
	 */
	private function output_rules_content( array $rewrite_rules ): void {
		$rules_to_export = [];
		foreach ( $rewrite_rules as $rule => $data ) {
			$rules_to_export[ $rule ] = $data['rewrite'];
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped,WordPress.PHP.DevelopmentFunctions.error_log_var_export
		echo var_export( $rules_to_export, true );
		exit;
	}
}
