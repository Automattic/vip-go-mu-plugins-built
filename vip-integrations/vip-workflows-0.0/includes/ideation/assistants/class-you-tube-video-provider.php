<?php
/**
 * YouTube Video Provider.
 *
 * Searches YouTube via the Data API v3 for relevant video content.
 * Returns video URLs, thumbnails, durations, and channel info.
 *
 * Requires a YouTube Data API v3 key configured via
 * VIP_WORKFLOWS_YOUTUBE_KEY constant or the settings UI.
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
 * You Tube Video Provider.
 */
class YouTubeVideoProvider implements MediaProviderInterface, MediaProviderRequirements {

	private const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
	private const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'youtube';
	}

	/**
	 * Get the display name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'YouTube videos', 'vip-workflows' );
	}

	/**
	 * Check whether the provider is configured.
	 *
	 * @return bool
	 */
	public function is_configured(): bool {
		return ! empty( Credentials::get_instance()->api_key( 'youtube' ) );
	}

	/**
	 * Describe the unmet requirement blocking this provider.
	 *
	 * @since 0.0.1
	 *
	 * @return Requirement
	 */
	public function get_unmet_requirement(): Requirement {
		return RequirementFactory::missing_credential( 'youtube', 'YouTube Data API', array( $this->get_name() ) );
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
			return new WP_Error( 'not_configured', 'YouTube API key not set.' );
		}

		$api_key = Credentials::get_instance()->api_key( 'youtube' );

		$search_url = add_query_arg(
			array(
				'part'       => 'snippet',
				'q'          => $query,
				'type'       => 'video',
				'maxResults' => min( $max_results, 10 ),
				'order'      => 'relevance',
				'key'        => $api_key,
			),
			self::SEARCH_URL
		);

		$response = $this->remote_get( $search_url );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status ) {
			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			return new WP_Error(
				'youtube_api_error',
				$body['error']['message'] ?? "YouTube API returned {$status}"
			);
		}

		$data  = json_decode( wp_remote_retrieve_body( $response ), true );
		$items = $data['items'] ?? array();

		if ( empty( $items ) ) {
			return array();
		}

		$video_ids = array_filter(
			array_map(
				fn( $item ) => $item['id']['videoId'] ?? null,
				$items
			)
		);

		$details = $this->fetch_video_details( $video_ids, $api_key );

		$results = array();
		foreach ( $items as $item ) {
			$video_id = $item['id']['videoId'] ?? '';
			if ( empty( $video_id ) ) {
				continue;
			}

			$detail    = $details[ $video_id ] ?? array();
			$snippet   = $item['snippet'] ?? array();
			$thumbnail = $snippet['thumbnails']['medium']['url']
				?? $snippet['thumbnails']['default']['url']
				?? null;

			$results[] = array(
				'url'          => "https://www.youtube.com/watch?v={$video_id}",
				'title'        => $snippet['title'] ?? '',
				'excerpt'      => $detail['description'] ?? null,
				'source_url'   => "https://www.youtube.com/watch?v={$video_id}",
				'domain'       => 'youtube.com',
				'thumbnail'    => $thumbnail,
				'media_type'   => 'video',
				'duration'     => $detail['duration'] ?? null,
				'channel'      => $detail['channel'] ?? null,
				'width'        => null,
				'height'       => null,
				'provider'     => $this->get_id(),
				'is_generated' => false,
			);
		}

		return $results;
	}

	/**
	 * GET a YouTube API URL. On VIP this goes through vip_safe_wp_remote_get(),
	 * which caps the timeout at 5 seconds and stops calling a host that keeps
	 * timing out; elsewhere (local, Playground, self-hosted) it falls back to
	 * wp_remote_get() with the same timeout.
	 *
	 * @param  string $url The request URL.
	 * @return array|\WP_Error The response, or WP_Error on failure.
	 */
	private function remote_get( string $url ) {
		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			return vip_safe_wp_remote_get( $url, '', 3, 5, 20 );
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get, WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- fallback where the VIP helpers are not loaded; same 5s timeout as on VIP.
		return wp_remote_get( $url, array( 'timeout' => 5 ) );
	}

	/**
	 * Fetch video details (duration, description, channel) in a single batch.
	 *
	 * @param array  $video_ids YouTube video IDs.
	 * @param string $api_key   API key.
	 * @return array<string, array> Map of video_id => { duration, description, channel }.
	 */
	private function fetch_video_details( array $video_ids, string $api_key ): array {
		if ( empty( $video_ids ) ) {
			return array();
		}

		$url = add_query_arg(
			array(
				'part' => 'contentDetails,snippet',
				'id'   => implode( ',', $video_ids ),
				'key'  => $api_key,
			),
			self::VIDEOS_URL
		);

		$response = $this->remote_get( $url );
		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return array();
		}

		$data  = json_decode( wp_remote_retrieve_body( $response ), true );
		$items = $data['items'] ?? array();

		$details = array();
		foreach ( $items as $item ) {
			$id          = $item['id'] ?? '';
			$iso         = $item['contentDetails']['duration'] ?? '';
			$snippet     = $item['snippet'] ?? array();
			$description = trim( $snippet['description'] ?? '' );

			$details[ $id ] = array(
				'duration'    => $this->iso8601_to_readable( $iso ),
				'description' => $description ? $description : null,
				'channel'     => $snippet['channelTitle'] ?? null,
			);
		}

		return $details;
	}

	/**
	 * Convert ISO 8601 duration (PT1H2M30S) to readable format (1:02:30).
	 *
	 * @param string $iso ISO 8601 duration.
	 */
	private function iso8601_to_readable( string $iso ): string {
		if ( empty( $iso ) ) {
			return '';
		}

		try {
			$interval = new \DateInterval( $iso );
		} catch ( \Exception $e ) {
			return '';
		}

		$hours   = $interval->h + ( $interval->d * 24 );
		$minutes = $interval->i;
		$seconds = $interval->s;

		if ( $hours > 0 ) {
			return sprintf( '%d:%02d:%02d', $hours, $minutes, $seconds );
		}

		return sprintf( '%d:%02d', $minutes, $seconds );
	}
}
