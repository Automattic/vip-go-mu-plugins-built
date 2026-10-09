<?php
/**
 * Plugin Name: Clipisode
 * Description: Collect, curate, and publish user-generated video content.
 * Version: 0.3.0
 * Author: Clipisode
 * Text Domain: clipisode
 * Requires at least: 6.6
 * Requires PHP: 8.1
 */

defined( 'ABSPATH' ) || exit;

define( 'CLIPISODE_VERSION', '0.3.0' );
define( 'CLIPISODE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CLIPISODE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once CLIPISODE_PLUGIN_DIR . 'includes/class-database.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-post-types.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-media.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-composition.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-renderer.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-social-meta.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-admin.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-invitation.php';
require_once CLIPISODE_PLUGIN_DIR . 'includes/class-preview.php';

register_activation_hook( __FILE__, [ Clipisode_Database::class, 'activate' ] );
register_activation_hook( __FILE__, [ Clipisode_Post_Types::class, 'ensure_default_logo_attachment' ] );
register_activation_hook( __FILE__, [ Clipisode_Post_Types::class, 'ensure_default_qr_attachment' ] );
register_activation_hook( __FILE__, function () {
	delete_option( 'rewrite_rules' );
} );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );

/**
 * Auto-flush rewrite rules on plugin version change.
 *
 * Activation hooks fire only on activate/deactivate, not on plugin
 * upgrades that overwrite files in place. The previous registration
 * of rewrite rules (legacy /invitation/ and parallel /clipisode-flow/)
 * was retired in favour of a single configurable-prefix rule routing
 * to the v2 template (see docs/specs/shipped/kill-v1-invitation-flow.md).
 * Without an upgrade-time flush, sites updating from the dual-rule
 * version would keep serving the old hardcoded /clipisode-flow/
 * route until someone manually visited Settings → Permalinks. The
 * version compare here covers that case: if the stored rewrite-
 * version doesn't match CLIPISODE_VERSION, drop the cached rules
 * and update the marker. WordPress will lazily rebuild the rules
 * on the next request.
 */
add_action( 'init', function (): void {
	$stored = get_option( 'clipisode_rewrite_version', '' );
	if ( $stored !== CLIPISODE_VERSION ) {
		delete_option( 'rewrite_rules' );
		update_option( 'clipisode_rewrite_version', CLIPISODE_VERSION, true );
	}
}, 99 );

add_action( 'init', [ Clipisode_Post_Types::class, 'register' ] );
add_action( 'init', [ Clipisode_Database::class, 'maybe_upgrade' ] );
add_action( 'init', [ new Clipisode_Media(), 'register_hooks' ] );
add_action( 'admin_menu', [ new Clipisode_Admin(), 'register_menus' ] );
add_action( 'rest_api_init', [ new Clipisode_REST_API(), 'register_routes' ] );
add_action( 'enqueue_block_assets', [ Clipisode_Post_Types::class, 'enqueue_screen_editor_canvas_styles' ] );
add_action( 'enqueue_block_editor_assets', [ Clipisode_Post_Types::class, 'enqueue_block_editor_extensions' ] );
add_filter( 'block_editor_settings_all', [ Clipisode_Post_Types::class, 'filter_screen_editor_font_settings' ], 10, 2 );
add_filter( 'render_block', [ Clipisode_Post_Types::class, 'filter_flow_block_directives' ], 10, 2 );

add_filter( 'clipisode_themes', function ( array $themes ): array {
	$catalog = Clipisode_Composition::themes();
	if ( is_wp_error( $catalog ) ) {
		throw new RuntimeException( $catalog->get_error_message() );
	}
	foreach ( $catalog as $theme ) {
		$themes[ $theme['id'] ] = [ 'label' => $theme['label'] ];
	}
	return $themes;
} );

add_action( 'enqueue_block_editor_assets', function (): void {
	$screen = get_current_screen();
	if ( ! $screen || $screen->post_type !== 'clipisode_preview' ) {
		return;
	}
	wp_add_inline_script(
		'wp-edit-post',
		'wp.domReady(function(){wp.data.dispatch("core/edit-post").__experimentalSetPreviewDeviceType("Mobile");});'
	);
} );

$clipisode_invitation = new Clipisode_Invitation();
add_action( 'init', [ $clipisode_invitation, 'register_rewrite' ] );
add_filter( 'query_vars', [ $clipisode_invitation, 'add_query_vars' ] );
add_filter( 'template_include', [ $clipisode_invitation, 'template_include' ] );
add_action( 'rest_api_init', [ $clipisode_invitation, 'register_routes' ] );

$clipisode_preview = new Clipisode_Preview();
add_action( 'init', [ $clipisode_preview, 'register_blocks' ] );
add_action( 'init', [ $clipisode_preview, 'register_rewrite' ] );
add_filter( 'query_vars', [ $clipisode_preview, 'add_query_vars' ] );
add_filter( 'template_include', [ $clipisode_preview, 'template_include' ] );
