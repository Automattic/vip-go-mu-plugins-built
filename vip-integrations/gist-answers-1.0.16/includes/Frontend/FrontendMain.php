<?php
/**
 * Frontend initialization class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Frontend;

use GistAnswers\Plugin\GistURLs;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Frontend initialization class for the Gist Answers plugin.
 */
final class FrontendMain {

	/**
	 * The HTML allowed in a widget's markup, as supplied by the Gist API. Scripts aren't allowed: the widget's script
	 * is enqueued separately, from an allowed host (see get_widget_script_src()).
	 *
	 * @var array<string, array<string, bool>>
	 */
	public const KSES_ALLOWED_HTML = array(
		'div'                => array(
			'class' => true,
		),
		'gist-chat-widget'   => array(
			'api-key'                => true,
			'user-id'                => true,
			'ref-name'               => true,
			'enable-theme-detection' => true,
			'id'                     => true,
		),
		'gist-search-widget' => array(
			'api-key'                => true,
			'user-id'                => true,
			'target-url'             => true,
			'ref-name'               => true,
			'enable-theme-detection' => true,
			'id'                     => true,
		),
	);

	/**
	 * The HTML allowed in the plugin's own console diagnostics (see GistWidget::get_console_script()).
	 *
	 * @var array<string, array<string, bool>>
	 */
	public const KSES_ALLOWED_CONSOLE_HTML = array(
		'script' => array(),
	);

	/**
	 * Filter for the origins a widget's script may be loaded from (by default, only the Gist CDN for the plugin's own
	 * build environment; see GistURLs::get_widget_script_origin()).
	 *
	 * @var string
	 */
	public const WIDGET_SCRIPT_ORIGINS_FILTER = 'gist_answers_widget_script_origins';

	/**
	 * Stores a list of chat widget JS files that have been enqueued.
	 *
	 * @var string[]
	 */
	private static array $chat_widget_js_enqueued = array();

	/**
	 * Stores a list of search widget JS files that have been enqueued.
	 *
	 * @var string[]
	 */
	private static array $search_widget_js_enqueued = array();

	/**
	 * Class constructor.
	 *
	 * @return void
	 */
	public function __construct() {

		$this->enqueue_frontend_css();
		$this->enqueue_frontend_js();

		$this->register_widget_shortcode();
	}

	/**
	 * Enqueue frontend assets.
	 *
	 * @return void
	 */
	private function enqueue_frontend_css(): void {
		add_action(
			'wp_enqueue_scripts',
			function () {
				wp_enqueue_style( 'gist-answers-main', GIST_ANSWERS_PLUGIN_URL . 'public/css/main.css', array(), GIST_ANSWERS_VERSION );
			},
		);
	}

	/**
	 * Enqueue frontend JS.
	 *
	 * @return void
	 */
	private function enqueue_frontend_js(): void {
		add_action(
			'wp_enqueue_scripts',
			function () {
				wp_enqueue_script( 'gist-answers-main', GIST_ANSWERS_PLUGIN_URL . 'public/js/main.js', array( 'jquery' ), GIST_ANSWERS_VERSION, true );
			},
		);
	}

	/**
	 * Enqueue chat widget JS.
	 *
	 * @param string $js_snippet The script tag for the chat widget JS file, as supplied by the Gist API.
	 *
	 * @return bool True if the script is enqueued, false if it isn't loaded from an allowed origin.
	 */
	public static function enqueue_chat_widget_js( string $js_snippet ): bool {

		$js_src = self::get_widget_script_src( $js_snippet );

		if ( '' === $js_src ) {
			return false;
		}

		if ( ! in_array( $js_src, self::$chat_widget_js_enqueued, true ) ) {

			wp_enqueue_script_module( 'gist-answers-chat-widget', $js_src, array(), GIST_ANSWERS_VERSION, array( 'in_footer' => true ) );

			self::$chat_widget_js_enqueued[] = $js_src;
		}

		return true;
	}

	/**
	 * Enqueue search widget JS.
	 *
	 * @param string $js_snippet The script tag for the search widget JS file, as supplied by the Gist API.
	 *
	 * @return bool True if the script is enqueued, false if it isn't loaded from an allowed origin.
	 */
	public static function enqueue_search_widget_js( string $js_snippet ): bool {

		$js_src = self::get_widget_script_src( $js_snippet );

		if ( '' === $js_src ) {
			return false;
		}

		if ( ! in_array( $js_src, self::$search_widget_js_enqueued, true ) ) {

			wp_enqueue_script_module( 'gist-answers-search-widget', $js_src, array(), GIST_ANSWERS_VERSION, array( 'in_footer' => true ) );

			self::$search_widget_js_enqueued[] = $js_src;
		}

		return true;
	}

	/**
	 * Get the URL of a widget's script from its script tag, as long as it's loaded from an allowed origin (only the
	 * Gist CDN for the plugin's own build environment, unless the `gist_answers_widget_script_origins` filter adds
	 * others), from a plain path.
	 *
	 * @param string $js_snippet The script tag for the widget's JS file, as supplied by the Gist API.
	 *
	 * @return string The script's URL, or an empty string if there is none, or it isn't loaded from an allowed origin.
	 */
	public static function get_widget_script_src( string $js_snippet ): string {

		$js_src = Utilities::get_script_tag_src( $js_snippet );

		$url_parts = wp_parse_url( $js_src );

		if ( ! is_array( $url_parts ) || empty( $url_parts['scheme'] ) || empty( $url_parts['host'] ) || isset( $url_parts['user'] ) || isset( $url_parts['pass'] ) ) {
			return '';
		}

		// The path may not climb out of the CDN's folders (with dot segments, backslashes, or their encoded forms).
		$path = strval( $url_parts['path'] ?? '' );

		if ( ! str_starts_with( $path, '/' ) || 1 === preg_match( '#(^|/)\.\.?(/|$)|\\\\|%(2e|2f|5c)#i', $path ) ) {
			return '';
		}

		$origin = strtolower( $url_parts['scheme'] . '://' . $url_parts['host'] ) . ( isset( $url_parts['port'] ) ? ':' . $url_parts['port'] : '' );

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$allowed_origins = apply_filters( self::WIDGET_SCRIPT_ORIGINS_FILTER, array( GistURLs::get_widget_script_origin() ) );

		$allowed_origins = is_array( $allowed_origins ) ? array_map( fn ( $allowed_origin ) => strtolower( untrailingslashit( strval( $allowed_origin ) ) ), $allowed_origins ) : array();

		return in_array( $origin, $allowed_origins, true ) ? $js_src : '';
	}

	/**
	 * Add the Gist Answers widget shortcode.
	 *
	 * @return void
	 */
	public function register_widget_shortcode(): void {
		add_shortcode(
			'gist_answers_render_widget',
			function ( $atts, $content, $shortcode_tag ) {

				$atts = shortcode_atts(
					array(
						'type'   => null,
						'id'     => null,
						'target' => null,
						'echo'   => null, // This will be ignored; the shortcode will always return the HTML instead of echoing it.
					),
					$atts,
					$shortcode_tag,
				);

				return gist_answers_render_widget(
					array(
						'type'   => $atts['type'],
						'id'     => $atts['id'],
						'target' => $atts['target'],
						'echo'   => false,
					)
				);
			}
		);
	}
}
