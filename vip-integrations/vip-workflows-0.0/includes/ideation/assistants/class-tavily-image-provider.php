<?php
/**
 * Tavily Image Provider.
 *
 * Runs image-focused queries through Tavily's search API to find
 * relevant photographs and visuals for ideation.
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
 * Tavily Image Provider.
 */
class TavilyImageProvider implements MediaProviderInterface, MediaProviderRequirements {

	private const API_URL = 'https://api.tavily.com/search';

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'tavily-images';
	}

	/**
	 * Get the display name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'Web Images (Tavily)', 'vip-workflows' );
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
	 * Shares the `tavily` credential with the video provider, so both resolve to
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
	public function search_media( string $query, int $max_results = 8, array $context = array() ) {
		if ( ! $this->is_configured() ) {
			return new WP_Error( 'not_configured', 'Tavily API key not set.' );
		}

		$queries = $this->build_image_queries( $query, $context );
		$api_key = Credentials::get_instance()->api_key( 'tavily' );

		$all_images = array();
		$seen_urls  = array();

		foreach ( $queries as $image_query ) {
			if ( count( $all_images ) >= $max_results ) {
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
							'api_key'        => $api_key,
							'query'          => $image_query,
							'max_results'    => 5,
							'include_images' => true,
							'search_depth'   => 'basic',
						)
					),
				)
			);

			if ( is_wp_error( $response ) ) {
				continue;
			}

			$data = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( empty( $data ) ) {
				continue;
			}

			$images  = $data['images'] ?? array();
			$results = $data['results'] ?? array();

			foreach ( $images as $index => $image_url ) {
				if ( count( $all_images ) >= $max_results ) {
					break;
				}

				if ( empty( $image_url ) || isset( $seen_urls[ $image_url ] ) ) {
					continue;
				}

				$seen_urls[ $image_url ] = true;

				$source_result = $results[ $index ] ?? array();
				$source_url    = $source_result['url'] ?? null;
				$domain        = '';
				if ( $source_url ) {
					$parsed = wp_parse_url( $source_url );
					$domain = $parsed['host'] ?? '';
				}

				$all_images[] = array(
					'url'          => $image_url,
					'title'        => $source_result['title'] ?? $image_query,
					'excerpt'      => $source_result['content'] ?? null,
					'source_url'   => $source_url,
					'domain'       => $domain,
					'thumbnail'    => null,
					'media_type'   => 'image',
					'duration'     => null,
					'width'        => null,
					'height'       => null,
					'provider'     => $this->get_id(),
					'is_generated' => false,
				);
			}
		}

		return $all_images;
	}

	/**
	 * Build the image queries.
	 *
	 * @param string $query Search query.
	 * @param array  $context context.
	 * @return array
	 */
	private function build_image_queries( string $query, array $context ): array {
		$seed_analysis = $context['seed_analysis'] ?? array();
		$queries       = array();

		$queries[] = $query . ' photos';

		$entities = $seed_analysis['entities'] ?? array();
		$people   = $entities['people'] ?? array();
		$places   = $entities['places'] ?? array();

		if ( ! empty( $people ) ) {
			$queries[] = implode( ' ', array_slice( $people, 0, 2 ) ) . ' photo';
		}
		if ( ! empty( $places ) ) {
			$queries[] = implode( ' ', array_slice( $places, 0, 2 ) ) . ' photos';
		}

		$tags = $seed_analysis['tags'] ?? array();
		if ( count( $tags ) >= 2 ) {
			$queries[] = implode( ' ', array_slice( $tags, 0, 3 ) ) . ' images';
		}

		return array_slice( $queries, 0, 3 );
	}
}
