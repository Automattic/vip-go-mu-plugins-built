<?php
/**
 * Tavily Video Provider.
 *
 * Searches for video content through Tavily by scoping queries to
 * video platforms (YouTube, Vimeo). Returns video URLs with thumbnails.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\AI\Credentials;
use VIPWorkflows\Abilities\Requirement;
use VIPWorkflows\Abilities\RequirementFactory;
use WP_Error;

/**
 * Tavily Video Provider.
 */
class TavilyVideoProvider implements MediaProviderInterface, MediaProviderRequirements {

	private const API_URL = 'https://api.tavily.com/search';

	private const VIDEO_DOMAINS = array(
		'youtube.com',
		'youtu.be',
		'vimeo.com',
	);

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'tavily-videos';
	}

	/**
	 * Get the display name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'Web Videos (Tavily)', 'vip-workflows' );
	}

	/**
	 * Check whether the provider is configured.
	 *
	 * @return bool
	 */
	public function is_configured(): bool {
		return ! empty( Credentials::get_instance()->api_key( 'tavily' ) );
	}

	/**
	 * Describe the unmet requirement blocking this provider.
	 *
	 * Shares the `tavily` credential with the image provider, so both resolve to
	 * one requirement id and the card renders a single row naming both.
	 *
	 * @since 0.0.1
	 *
	 * @return Requirement
	 */
	public function get_unmet_requirement(): Requirement {
		return RequirementFactory::missing_credential( 'tavily', 'Tavily', array( $this->get_name() ) );
	}

	/**
	 * Check whether the provider generates media.
	 *
	 * @return bool
	 */
	public function is_generative(): bool {
		return false;
	}

	/**
	 * Search for media.
	 *
	 * @param string $query Search query.
	 * @param int    $max_results max results.
	 * @param array  $context context.
	 */
	public function search_media( string $query, int $max_results = 6, array $context = array() ) {
		if ( ! $this->is_configured() ) {
			return new WP_Error( 'not_configured', 'Tavily API key not set.' );
		}

		$queries = $this->build_video_queries( $query, $context );
		$api_key = Credentials::get_instance()->api_key( 'tavily' );

		$all_videos = array();
		$seen_urls  = array();

		foreach ( $queries as $video_query ) {
			if ( count( $all_videos ) >= $max_results ) {
				break;
			}

			$response = wp_remote_post(
				self::API_URL,
				array(
					// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- editor-initiated ideation assistant request expected to take time.
					'timeout' => 20,
					'headers' => array( 'Content-Type' => 'application/json' ),
					'body'    => wp_json_encode(
						array(
							'api_key'           => $api_key,
							'query'             => $video_query,
							'max_results'       => 5,
							'include_images'    => true,
							'search_depth'      => 'basic',
							'include_domains'   => self::VIDEO_DOMAINS,
						)
					),
				)
			);

			if ( is_wp_error( $response ) ) {
				continue;
			}

			$data = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( empty( $data['results'] ) ) {
				continue;
			}

			foreach ( $data['results'] as $result ) {
				if ( count( $all_videos ) >= $max_results ) {
					break;
				}

				$url = $result['url'] ?? '';
				if ( empty( $url ) || isset( $seen_urls[ $url ] ) ) {
					continue;
				}

				$seen_urls[ $url ] = true;

				$parsed = wp_parse_url( $url );
				$domain = $parsed['host'] ?? '';

				$all_videos[] = array(
					'url'          => $url,
					'title'        => $result['title'] ?? $video_query,
					'excerpt'      => $result['content'] ?? null,
					'source_url'   => $url,
					'domain'       => $domain,
					'thumbnail'    => $this->extract_thumbnail( $url, $data['images'] ?? array() ),
					'media_type'   => 'video',
					'duration'     => null,
					'width'        => null,
					'height'       => null,
					'provider'     => $this->get_id(),
					'is_generated' => false,
				);
			}
		}

		return $all_videos;
	}

	/**
	 * Build the video queries.
	 *
	 * @param string $query Search query.
	 * @param array  $context context.
	 * @return array
	 */
	private function build_video_queries( string $query, array $context ): array {
		$seed_analysis = $context['seed_analysis'] ?? array();
		$queries       = array();

		$queries[] = $query . ' video';

		$entities = $seed_analysis['entities'] ?? array();
		$people   = $entities['people'] ?? array();

		if ( ! empty( $people ) ) {
			$queries[] = implode( ' ', array_slice( $people, 0, 2 ) ) . ' interview video';
		}

		$tags = $seed_analysis['tags'] ?? array();
		if ( count( $tags ) >= 2 ) {
			$queries[] = implode( ' ', array_slice( $tags, 0, 3 ) ) . ' video explainer';
		}

		return array_slice( $queries, 0, 2 );
	}

	/**
	 * Try to extract a thumbnail for a video URL.
	 *
	 * For YouTube, we can construct the thumbnail URL directly.
	 * Otherwise, try to match from the Tavily images array.
	 *
	 * @param string $url URL.
	 * @param array  $tavily_images Tavily image results.
	 */
	private function extract_thumbnail( string $url, array $tavily_images ): ?string {
		$video_id = $this->extract_youtube_id( $url );
		if ( $video_id ) {
			return "https://img.youtube.com/vi/{$video_id}/mqdefault.jpg";
		}

		return $tavily_images[0] ?? null;
	}

	/**
	 * Extract youtube id.
	 *
	 * @param string $url URL.
	 * @return ?string
	 */
	private function extract_youtube_id( string $url ): ?string {
		$parsed = wp_parse_url( $url );
		$host   = $parsed['host'] ?? '';

		if ( str_contains( $host, 'youtu.be' ) ) {
			return ltrim( $parsed['path'] ?? '', '/' );
		}

		if ( str_contains( $host, 'youtube.com' ) ) {
			parse_str( $parsed['query'] ?? '', $params );
			return $params['v'] ?? null;
		}

		return null;
	}
}
