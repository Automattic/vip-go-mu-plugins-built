<?php

namespace Automattic\ShareADraft;

/**
 * Warns administrators when the JavaScript assets have not been built.
 *
 * build/ is deliberately not committed: releases build it in CI (see
 * release.yml), so a missing build only ever happens in a development
 * checkout. Without this notice that failure mode is silent — the enqueues
 * skip a missing build rather than fatal, so the editor panel and parts of
 * the Preview Links screen are simply not there, with nothing saying why.
 * One banner naming the command is cheaper than the head-scratching.
 */
final class BuildNotice {
	public function register(): void {
		add_action( 'admin_notices', [ $this, 'maybe_render' ] );
	}

	public function maybe_render(): void {
		// Every entry point is produced by the same build command, so one
		// asset file stands in for the lot.
		if ( file_exists( plugin_dir_path( VIP_SHAREADRAFT_FILE ) . 'build/index.asset.php' ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		printf(
			'<div class="notice notice-warning"><p>%s</p><p><code>npm install &amp;&amp; npm run build</code></p></div>',
			esc_html__( 'Share a Draft: the JavaScript assets have not been built, so the editor panel and parts of the Preview Links screen are missing. From the plugin directory, run:', 'shareadraft' )
		);
	}
}
