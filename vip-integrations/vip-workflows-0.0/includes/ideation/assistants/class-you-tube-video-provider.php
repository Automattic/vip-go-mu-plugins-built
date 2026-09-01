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
		return __( 'YouTube Videos', 'vip-workflows' );
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

		// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- editor-initiated ideation assistant request expected to take time.
		$response = wp_remote_get( $search_url, array( 'timeout' => 15 ) );
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

		// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- editor-initiated ideation assistant request expected to take time.
		$response = wp_remote_get( $url, array( 'timeout' => 10 ) );
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
