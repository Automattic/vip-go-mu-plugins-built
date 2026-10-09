<?php

namespace Automattic\ShareADraft;

/**
 * Enqueues the block-editor script that adds the "Generate preview link" panel.
 *
 * The script is built by @wordpress/scripts into build/. If it has not been
 * built yet, enqueuing is skipped rather than fatal, so the plugin still loads
 * cleanly in an unbuilt checkout.
 */
final class EditorAssets {
	private const HANDLE = 'shareadraft-editor';

	/**
	 * Whether central IP ranges are configured in the VIP Dashboard, so the
	 * Generate modal can say they already apply to every link.
	 */
	private bool $has_central_ip_ranges;

	/**
	 * Whether the site-wide switch is off, so both modals can warn that links —
	 * including newly generated ones — will not work until it is re-enabled.
	 */
	private bool $links_disabled;

	public function __construct( bool $has_central_ip_ranges = false, bool $links_disabled = false ) {
		$this->has_central_ip_ranges = $has_central_ip_ranges;
		$this->links_disabled        = $links_disabled;
	}

	public function register(): void {
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue' ] );
	}

	public function enqueue(): void {
		$base       = plugin_dir_path( VIP_SHAREADRAFT_FILE );
		$asset_file = $base . 'build/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		// $asset_file is derived solely from the plugin's own directory and a
		// hard-coded, build-generated filename, never from user input, so the
		// variable include is safe.
		/** @var mixed $asset */
		$asset = require $asset_file; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
		if ( ! is_array( $asset ) ) {
			return;
		}

		/** @var list<non-empty-string> $dependencies */
		$dependencies = isset( $asset['dependencies'] ) && is_array( $asset['dependencies'] )
			? $asset['dependencies']
			: [];
		$version      = isset( $asset['version'] ) && is_string( $asset['version'] )
			? $asset['version']
			: VIP_SHAREADRAFT_VERSION;

		wp_enqueue_script(
			self::HANDLE,
			plugins_url( 'build/index.js', VIP_SHAREADRAFT_FILE ),
			$dependencies,
			$version,
			true
		);

		// The third argument is required: without it WordPress only looks in
		// wp-content/languages/plugins/, and this plugin ships its catalogues
		// itself. The JSON filenames hash the enqueued path (build/index.js),
		// which is why `composer i18n` scans build/ rather than src/.
		wp_set_script_translations( self::HANDLE, 'shareadraft', $base . 'languages' );

		// Hand the editor the same expiration options the endpoint validates,
		// and which optional restrictions this site offers, so the modals only
		// render fields the endpoint would accept.
		$data = wp_json_encode(
			[
				'expirationOptions'  => PreviewRestController::expiration_options(),
				'defaultExpiration'  => PreviewRestController::default_expiration(),
				'maxUsesLimit'       => PreviewRestController::max_uses_limit(),
				'hasCentralIpRanges' => $this->has_central_ip_ranges,
				'linksDisabled'      => $this->links_disabled,
				'ipAllowlistEnabled' => Features::ip_allowlist_enabled(),
				'recipientsEnabled'  => Features::recipients_enabled(),
			]
		);

		if ( false !== $data ) {
			wp_add_inline_script( self::HANDLE, 'window.shareADraft = ' . $data . ';', 'before' );
		}
	}
}
