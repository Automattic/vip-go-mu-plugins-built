<?php
/**
 * Gist Answers WordPress Plugin
 *
 * Integrates Gist.ai with WordPress to sync publisher content, configure answer experiences, and display AI-powered Gist answer widgets on your site.
 *
 * @link               https://gist.ai/
 *
 * @package            GistAnswers
 * @author             ProRata.AI
 * @license            GPLv2
 *
 * @wordpress-plugin
 * Plugin Name:        Gist Answers
 * Plugin URI:         https://gist.ai/
 * Description:        Integrates Gist.ai with WordPress to sync publisher content, configure answer experiences, and display AI-powered Gist answer widgets on your site.
 * Version:            1.0.16
 * Requires at least:  6.8
 * Requires PHP:       8.0
 * Author:             ProRata.AI
 * Author URI:         https://prorata.ai/
 * License:            GPLv2 or later
 * License URI:        https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:        gist-answers
 * Domain Path:        /languages
 */

use GistAnswers\Admin\AdminMain;
use GistAnswers\Admin\MenuItems\ToolsOptions;
use GistAnswers\Frontend\FrontendMain;
use GistAnswers\Model\GistSite;
use GistAnswers\Model\GistWidget;
use GistAnswers\Plugin\Activate;
use GistAnswers\Plugin\CommonMain;
use GistAnswers\Plugin\Deactivate;
use GistAnswers\Plugin\Uninstall;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GIST_ANSWERS_VERSION', '1.0.16' );

define( 'GIST_ANSWERS_BUILD_ENVIRONMENT', 'production' );

define( 'GIST_ANSWERS_PLUGIN_DIR', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'GIST_ANSWERS_PLUGIN_URL', trailingslashit( plugin_dir_url( __FILE__ ) ) );

define(
	'GIST_ANSWERS_IFRAME_ATTRS',
	array(
		'width'       => '100%',
		'height'      => '100%',
		'frameborder' => '0',
		'allow'       => 'clipboard-read; clipboard-write; fullscreen',
	),
);

if ( file_exists( GIST_ANSWERS_PLUGIN_DIR . 'dev-utilities.php' ) ) {
	include_once GIST_ANSWERS_PLUGIN_DIR . 'dev-utilities.php';
}

require_once GIST_ANSWERS_PLUGIN_DIR . 'vendor/autoload.php';

register_activation_hook( __FILE__, array( Activate::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( Deactivate::class, 'deactivate' ) );
register_uninstall_hook( __FILE__, array( Uninstall::class, 'uninstall' ) );

new CommonMain();

$gist_answers_request_uri = isset( $_SERVER['REQUEST_URI'] ) ? filter_var( wp_unslash( $_SERVER['REQUEST_URI'] ), FILTER_SANITIZE_URL ) : '';

// REST requests use the pretty `/wp-json/` URLs, or `?rest_route=` with plain permalinks.
$gist_answers_is_rest_request = str_contains( wp_unslash( $gist_answers_request_uri ), '/' . rest_get_url_prefix() . '/' ) || isset( $_GET['rest_route'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Only checks whether this is a REST request, to load the admin side, which registers the REST routes.

if (
	is_admin() ||
	wp_doing_ajax() ||
	wp_doing_cron() ||
	$gist_answers_is_rest_request
) {
	new AdminMain();
} else {
	new FrontendMain();
}

/**
 * Global function to render a Gist.ai widget.
 *
 * @param array<mixed> $args The arguments for rendering the widget. Available arguments are:
 *   - 'type' (string): The type of widget to render ('answer' or 'question').
 *   - 'id' (string): The ID of the widget to render (required when type is 'question', optional when type is 'answer').
 *   - 'target' (string): Optional target page slug for an 'answer' widget (ignored for 'question' widgets; if omitted, the current page's slug will be used).
 *   - 'echo' (bool): Whether to echo the widget output (default: true). If false, the function will return the widget output as a string instead of echoing it.
 *
 * @return string|void Returns the widget output as a string if 'echo' is false, otherwise echoes it.
 */
function gist_answers_render_widget( $args = null ) {

	$original_args = $args;

	$args = apply_filters( 'gist_answers_render_widget', $args );

	$args = GistWidget::sanitize_args( $args );

	$type = GistWidget::sanitize_args_type( $args );
	$id   = GistWidget::sanitize_args_id( $args );
	$echo = GistWidget::sanitize_args_echo( $args );

	$original_id = $id;

	$original_target = empty( $args['target'] ?? '' ) ? '' : GistWidget::sanitize_args_target( $args );

	$widget_html = '';

	$gist_site = GistSite::get();

	switch ( $type ) {

		case 'chat':
		case 'answer':
		case 'answers':
			$current_page_slug = GistWidget::sanitize_args_target();

			$target = GistWidget::sanitize_args_target( $args );

			if ( ! $gist_site->chat_widget_id_is_valid( $id ) ) {

				$id = GistWidget::get_chat_widget_id_for_page( $target );

				if ( empty( $id ) ) {

					$target_id = GistWidget::get_chat_widget_id_for_page( $current_page_slug );

					if ( ! empty( $target_id ) ) {
						$id = $target_id;
					}
				}
			}

			if ( $gist_site->chat_widget_id_is_valid( $id ) ) {

				$intended_target = GistWidget::get_page_slug_for_chat_widget_id( $id );

				$widget_code = GistWidget::get_widget_code( $id );

				$widget_js = is_object( $widget_code ) ? ( $widget_code->header_snippet ?? null ) : null;

				$widget_html = is_object( $widget_code ) ? ( $widget_code->body_snippet ?? null ) : null;

				// A widget whose script isn't loaded from an allowed origin can't work, so it isn't shown.
				if ( ! empty( $widget_html ) && ! empty( $widget_js ) && ! FrontendMain::enqueue_chat_widget_js( $widget_js ) ) {
					$widget_html = '';
				}
			}
			break;

		case 'search':
		case 'question':
		case 'questions':
			if ( $gist_site->search_widget_id_is_valid( $id ) ) {

				$widget_code = GistWidget::get_widget_code( $id );

				$widget_js = is_object( $widget_code ) ? ( $widget_code->header_snippet ?? null ) : null;

				$widget_html = is_object( $widget_code ) ? ( $widget_code->body_snippet ?? null ) : null;

				// A widget whose script isn't loaded from an allowed origin can't work, so it isn't shown.
				if ( ! empty( $widget_html ) && ! empty( $widget_js ) && ! FrontendMain::enqueue_search_widget_js( $widget_js ) ) {
					$widget_html = '';
				}
			}
			break;

		default:
			$widget_html = '';
			break;
	}

	$widget_html = apply_filters( 'gist_answers_widget_html', $widget_html, $original_args );

	// The widget markup comes from the Gist API (and the filter above), so it's filtered whether it's echoed or
	// returned (as it is for the shortcode and the blocks), and may not contain scripts.
	$widget_html = wp_kses( strval( $widget_html ), FrontendMain::KSES_ALLOWED_HTML );

	// The console diagnostics are the plugin's own inline scripts, with their messages JSON-encoded.
	$console_html = empty( $widget_html )
		? GistWidget::maybe_get_console_error_for(
			$type,
			$id,
			$target ?? '',
			$target_id ?? '',
			$original_id ?? '',
			$original_target ?? '',
			$current_page_slug ?? '',
			$intended_target ?? '',
		)
		: GistWidget::maybe_get_console_warning_for(
			$type,
			$id,
			$target ?? '',
			$target_id ?? '',
			$original_id ?? '',
			$original_target ?? '',
			$current_page_slug ?? '',
			$intended_target ?? '',
		);

	if ( $echo ) {
		echo wp_kses( $widget_html, FrontendMain::KSES_ALLOWED_HTML ) . wp_kses( $console_html, FrontendMain::KSES_ALLOWED_CONSOLE_HTML );
	} else {
		return $widget_html . wp_kses( $console_html, FrontendMain::KSES_ALLOWED_CONSOLE_HTML );
	}
}

/**
 * Pass-through function for error logging (to include backtraces when indicated).
 *
 * @param string $message The message to log.
 * @param int    $message_type The message type (default 0).
 * @param string $destination The destination for the log message (default empty).
 *
 * @return void
 */
function gist_answers_error_log( string $message, int $message_type = 0, string $destination = '' ): void {

	$message = apply_filters( 'gist_answers_error_log', $message );

	// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_error_log, WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary -- These functions are being used intentionally for logging purposes via a hidden developer panel.
	error_log( $message, $message_type, $destination );

	if ( ToolsOptions::should_log_api_backtraces() ) {

		$backtrace = wp_debug_backtrace_summary( null, 0, false );
		$backtrace = array_map( fn( $line ) => "        $line\n", $backtrace );

		error_log( "Gist Answers API request backtrace:\n" . implode( '', $backtrace ) );
	}
	// phpcs:enable WordPress.PHP.DevelopmentFunctions.error_log_error_log, WordPress.PHP.DevelopmentFunctions.error_log_wp_debug_backtrace_summary
}
