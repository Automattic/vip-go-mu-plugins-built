<?php
/**
 * Define important URLs for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use GistAnswers\Admin\MenuItems\ToolsOptions;
use GistAnswers\API\Post\Embed;
use GistAnswers\Model\GistSite;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define important URLs for the Gist Answers plugin.
 */
final class GistURLs {

	private const API_BASE_URL = 'https://cms.gist.ai/api/cms/v1';
	private const CMS_BASE_URL = 'https://cms.gist.ai/pages';

	// The origin of the Gist CDN that widget scripts are loaded from, for this build's environment only.
	private const WIDGET_SCRIPT_ORIGIN = 'https://cdn.gist.ai';

	private const CMS_IFRAME_SUBPATHS = array(
		'sandbox'          => 'sandbox',
		'answers'          => 'gistanswers/channel',
		'content-usage'    => 'analytics/publicationdetails',
		'revenue'          => 'revenue/partnersummary',
		'website-settings' => 'website_settings',
		'questions'        => 'suggested-questions/{publisherId}',
		'widgets'          => 'widgets/site/{publisherId}',
		'widgets-theme'    => 'widgets/site/{publisherId}/theme',
		'widgets-list'     => 'widgets/site/{publisherId}/your-widgets',
	);

	/**
	 * Determine whether the given iframe name is one of the CMS iframes.
	 *
	 * @param string $which The iframe name (e.g., `widgets-list`).
	 *
	 * @return bool True if it is a CMS iframe, false otherwise.
	 */
	public static function is_valid_cms_iframe( string $which ): bool {
		return array_key_exists( $which, self::CMS_IFRAME_SUBPATHS );
	}

	/**
	 * Assemble a complete URL for a given CMS iframe subpath (including the required embed ticket).
	 *
	 * @param string $which   The iframe type (e.g., 'answers', 'content-usage', 'revenue', etc.) to determine the subpath.
	 * @param int    $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return string The complete URL; will be empty if an embed ticket cannot be retrieved.
	 */
	public static function get_cms_iframe_url( string $which, int $blog_id = 0 ): string {

		$iframe_url = '';

		$which = array_key_exists( $which, self::CMS_IFRAME_SUBPATHS ) ? self::CMS_IFRAME_SUBPATHS[ $which ] : null;

		if ( ! empty( $which ) ) {

			$gist_site    = GistSite::get( $blog_id );
			$publisher    = $gist_site->get_publisher();
			$publisher_id = $publisher->id ?? null;

			if ( ! empty( $publisher_id ) ) {

				$api_request = new Embed( array( 'publisher_id' => $publisher_id ) );

				$response_data = $api_request->response()->data ?? null;

				if ( is_object( $response_data ) && ! empty( $response_data->ticket ?? null ) ) {

					$ticket = $response_data->ticket;

					$iframe_url = trailingslashit( self::get_cms_base_url() ) . $which . '?embed=' . rawurlencode( $ticket );
					$iframe_url = str_replace( '{publisherId}', rawurlencode( $publisher_id ), $iframe_url );
				}
			}
		}

		return $iframe_url;
	}

	/**
	 * Get the base URL for the Gist Answers API.
	 *
	 * @return string The API base URL.
	 */
	public static function get_api_base_url(): string {
		return self::maybe_update_environment_url( self::API_BASE_URL );
	}

	/**
	 * Get the base URL for the Gist Answers CMS.
	 *
	 * @return string The CMS base URL.
	 */
	public static function get_cms_base_url(): string {
		return self::maybe_update_environment_url( self::CMS_BASE_URL );
	}

	/**
	 * Get the origin of the Gist CDN that widget scripts may be loaded from: the one for this build's environment
	 * (so a production build doesn't trust the staging or development CDN).
	 *
	 * @return string The origin, e.g. `https://cdn.gist.ai`.
	 */
	public static function get_widget_script_origin(): string {

		// Not through maybe_update_environment_url(), as simulating an API server error mustn't change it.
		if ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE && function_exists( 'gist_answers_update_environment_url' ) ) {
			return gist_answers_update_environment_url( self::WIDGET_SCRIPT_ORIGIN );
		}

		return self::WIDGET_SCRIPT_ORIGIN;
	}

	/**
	 * Maybe update the given environment URL for local development.
	 *
	 * @param string $url The URL to potentially update.
	 *
	 * @return string The updated URL for local development, or the original URL if no update is needed.
	 */
	private static function maybe_update_environment_url( string $url ): string {

		$breaking_suffix = ToolsOptions::should_simulate_api_server_error() ? 'x' : '';

		if ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE && function_exists( 'gist_answers_update_environment_url' ) ) {
			return gist_answers_update_environment_url( $url ) . $breaking_suffix;
		} else {
			return $url . $breaking_suffix;
		}
	}
}
