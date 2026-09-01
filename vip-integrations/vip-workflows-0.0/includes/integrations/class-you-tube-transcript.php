<?php
/**
 * YouTube Transcript Fetcher.
 *
 * Retrieves auto-generated or manual captions from YouTube videos
 * using the Innertube player API (no OAuth required). The transcript
 * is returned as plain text for LLM summarization.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * You Tube Transcript.
 */
class YouTubeTranscript {

	private const PLAYER_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';

	/**
	 * Allowed hosts for caption-track URLs returned by YouTube's player API.
	 */
	private const CAPTION_ALLOWED_HOSTS = array(
		'youtube.com',
		'youtube-nocookie.com',
		'googlevideo.com',
	);

	/**
	 * Extract a YouTube video ID from a URL.
	 *
	 * @param string $url YouTube URL in any common format.
	 * @return string|null Video ID or null if not a YouTube URL.
	 */
	public static function extract_video_id( string $url ): ?string {
		if ( preg_match( '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url, $m ) ) {
			return $m[1];
		}
		if ( preg_match( '/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/', $url, $m ) ) {
			return $m[1];
		}
		return null;
	}

	/**
	 * Fetch the transcript for a YouTube video.
	 *
	 * @param string $video_id  YouTube video ID (11 characters).
	 * @param string $lang_pref Preferred language code (default 'en').
	 * @return string|WP_Error Plain text transcript, or WP_Error on failure.
	 */
	public static function fetch( string $video_id, string $lang_pref = 'en' ): string|WP_Error {
		$caption_url = self::get_caption_url( $video_id, $lang_pref );
		if ( is_wp_error( $caption_url ) ) {
			return $caption_url;
		}

		$transcript_url = $caption_url . '&fmt=json3';

		$response = SsrfGuard::remote_get_allowlisted(
			$transcript_url,
			array(
				// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- transcript fetch runs during an editor-initiated AI summarization expected to take time.
				'timeout'    => 15,
				'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			),
			'youtube-transcript-caption',
			self::CAPTION_ALLOWED_HOSTS
		);

		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'transcript_fetch_failed', $response->get_error_message() );
		}

		if ( wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return new WP_Error( 'transcript_fetch_failed', 'YouTube returned non-200 for caption track.' );
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( empty( $data['events'] ) ) {
			return new WP_Error( 'no_transcript', 'Caption track returned no events.' );
		}

		return self::events_to_text( $data['events'] );
	}

	/**
	 * Get the caption track base URL from YouTube's Innertube player API.
	 *
	 * @param string $video_id  YouTube video ID.
	 * @param string $lang_pref Preferred language code.
	 * @return string|WP_Error Caption base URL, or error.
	 */
	private static function get_caption_url( string $video_id, string $lang_pref ): string|WP_Error {
		$body = wp_json_encode(
			array(
				'context' => array(
					'client' => array(
						'clientName'    => 'WEB',
						'clientVersion' => '2.20240101.00.00',
					),
				),
				'videoId' => $video_id,
			)
		);

		$response = SsrfGuard::remote_post_allowlisted(
			self::PLAYER_URL,
			array(
				// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- transcript fetch runs during an editor-initiated AI summarization expected to take time.
				'timeout'    => 15,
				'headers'    => array( 'Content-Type' => 'application/json' ),
				'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'body'       => $body,
			),
			'youtube-innertube',
			self::CAPTION_ALLOWED_HOSTS
		);

		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'innertube_failed', $response->get_error_message() );
		}

		if ( wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return new WP_Error( 'innertube_failed', 'Innertube API returned non-200.' );
		}

		$data   = json_decode( wp_remote_retrieve_body( $response ), true );
		$tracks = $data['captions']['playerCaptionsTracklistRenderer']['captionTracks'] ?? array();

		if ( empty( $tracks ) ) {
			return new WP_Error( 'no_captions', 'This video has no captions available.' );
		}

		return self::select_track( $tracks, $lang_pref );
	}

	/**
	 * Select the best caption track. Prefers manual captions over auto-generated,
	 * and the requested language over others.
	 *
	 * @param array  $tracks    Caption tracks from the player response.
	 * @param string $lang_pref Preferred language prefix.
	 * @return string|WP_Error Base URL of the selected track.
	 */
	private static function select_track( array $tracks, string $lang_pref ): string|WP_Error {
		$preferred_manual = null;
		$preferred_auto   = null;
		$any_manual       = null;
		$any_auto         = null;

		foreach ( $tracks as $track ) {
			$lang          = $track['languageCode'] ?? '';
			$is_auto       = isset( $track['kind'] ) && 'asr' === $track['kind'];
			$lang_matches  = str_starts_with( $lang, $lang_pref );

			if ( $lang_matches && ! $is_auto && ! $preferred_manual ) {
				$preferred_manual = $track['baseUrl'] ?? null;
			} elseif ( $lang_matches && $is_auto && ! $preferred_auto ) {
				$preferred_auto = $track['baseUrl'] ?? null;
			} elseif ( ! $is_auto && ! $any_manual ) {
				$any_manual = $track['baseUrl'] ?? null;
			} elseif ( $is_auto && ! $any_auto ) {
				$any_auto = $track['baseUrl'] ?? null;
			}
		}

		$url = $preferred_manual ?? $preferred_auto ?? $any_manual ?? $any_auto;

		if ( ! $url ) {
			return new WP_Error( 'no_usable_track', 'No usable caption track found.' );
		}

		return $url;
	}

	/**
	 * Convert JSON3 caption events to plain text.
	 *
	 * @param array $events Caption events from the JSON3 response.
	 * @return string Joined transcript text.
	 */
	private static function events_to_text( array $events ): string {
		$lines = array();

		foreach ( $events as $event ) {
			if ( empty( $event['segs'] ) ) {
				continue;
			}

			$line = '';
			foreach ( $event['segs'] as $seg ) {
				$line .= $seg['utf8'] ?? '';
			}

			$line = trim( $line );
			if ( '' !== $line && "\n" !== $line ) {
				$lines[] = $line;
			}
		}

		return implode( ' ', $lines );
	}
}
