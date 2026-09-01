<?php
/**
 * Shared admin stylesheet enqueues.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Admin;

/**
 * One owner for the stylesheet handles more than one admin surface needs.
 *
 * The plugin has two kinds of admin screen. Its own pages render a React app and
 * load the built bundle (see Admin::enqueue_scripts()). The classic screens — the
 * "My Workflow" dashboard widget and the posts-list Workflow column — render from
 * PHP and load none of it, which is why their styling used to be echoed inline
 * where no linter or token audit could reach it.
 *
 * Both kinds need the WPDS token definitions, so the handle and the path to them
 * live here rather than being spelled out at each call site.
 */
final class AdminStyles {

	/**
	 * Handle for the WPDS design-token definitions.
	 */
	public const TOKENS_HANDLE = 'vip-workflows-wpds-tokens';

	/**
	 * Handle for the classic-screen stylesheet.
	 */
	public const CLASSIC_HANDLE = 'vip-workflows-classic-admin';

	/**
	 * Enqueue the WPDS design tokens.
	 *
	 * Copied from the pinned @wordpress/theme package at build time (a
	 * `@wordpress/*` request cannot be bundled — see webpack.config.js). It
	 * declares every --wpds-* custom property at runtime, so token-driven CSS
	 * resolves real values instead of the build-time PostCSS fallbacks — which
	 * the classic stylesheet carries only as a fallback. WP 7.0 declares no
	 * --wpds-* of its own, so this file is what makes them resolve at all.
	 *
	 * @param string $version Version to cache-bust with.
	 */
	public static function enqueue_design_tokens( string $version ): void {
		wp_enqueue_style(
			self::TOKENS_HANDLE,
			VIP_WORKFLOWS_PLUGIN_URL . 'build/wpds-design-tokens.css',
			array(),
			$version
		);
	}

	/**
	 * Enqueue the styles for the classic wp-admin screens.
	 *
	 * Built like every other stylesheet here, from its own CSS-only webpack
	 * entry (see webpack.config.js). The classic screens load none of our
	 * bundles, so there is no JS for it to ride in on — but building it is still
	 * what minifies it and injects the PostCSS token fallbacks, which raw src/
	 * CSS never gets. It also depends on the tokens above for every value it
	 * uses, so the fallbacks are a second line rather than the only one.
	 *
	 * Call this from the screen that renders the markup, so each surface keeps
	 * its own screen condition.
	 */
	public static function enqueue_classic(): void {
		self::enqueue_design_tokens( VIP_WORKFLOWS_VERSION );

		wp_enqueue_style(
			self::CLASSIC_HANDLE,
			VIP_WORKFLOWS_PLUGIN_URL . 'build/classic-admin.css',
			array( self::TOKENS_HANDLE ),
			VIP_WORKFLOWS_VERSION
		);
		// The build emits classic-admin-rtl.css beside it; this is how every
		// other built stylesheet here picks its RTL variant up.
		wp_style_add_data( self::CLASSIC_HANDLE, 'rtl', 'replace' );
	}
}
