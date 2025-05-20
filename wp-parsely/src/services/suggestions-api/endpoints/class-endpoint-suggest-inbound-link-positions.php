<?php
/**
 * Parse.ly Suggestions API Endpoint: Suggest Inbound Link Positions
 *
 * @package Parsely
 * @since   3.19.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use Parsely\Models\Inbound_Smart_Link;
use Parsely\Parsely;
use WP_Error;

/**
 * The endpoint for the Suggest Inbound Link Positions API request.
 *
 * @since 3.19.0
 *
 * @link https://content-suggestions-api.parsely.net/prod/docs#/prototype/suggest_inbound_link_positions_suggest_inbound_link_positions_post
 *
 * @phpstan-type LinkPositionResponse = array{
 *     anchor_texts: array<array{text: string, offset: int}>,
 *     title: string,
 *     source_url: string,
 *     target_url: string,
 * }
 *
 * @phpstan-type Endpoint_Suggest_Inbound_Link_Positions_Options = array{
 *     performance_blending_weight?: float,
 *     keyword_exclusion_list?: array<string>
 * }
 */
class Endpoint_Suggest_Inbound_Link_Positions extends Suggestions_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.19.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return '/suggest-inbound-link-positions';
	}

	/**
	 * Gets suggested inbound link positions for a given source and destination post using the Parse.ly
	 * Content Suggestion API.
	 *
	 * @since 3.19.0
	 *
	 * @param \WP_Post                                        $source_post    The post where the inbound link will be placed.
	 * @param \WP_Post                                        $destination_post The post where the inbound link will point to.
	 * @param Endpoint_Suggest_Inbound_Link_Positions_Options $options The options to pass to the API request.
	 * @return Inbound_Smart_Link[]|WP_Error The response from the remote API, or a WP_Error
	 *                                            object if the response is an error.
	 */
	public function get_inbound_link_positions(
		\WP_Post $source_post,
		\WP_Post $destination_post,
		$options = array()
	) {
		/**
		 * The Parse.ly canonical URL for the source post.
		 *
		 * @var string $source_post_url
		 */
		$source_post_url = Parsely::get_canonical_url_from_post( $source_post );

		/**
		 * The Parse.ly canonical URL for the destination post.
		 *
		 * @var string $destination_post_url
		 */
		$destination_post_url = Parsely::get_canonical_url_from_post( $destination_post );

		$request_body = array(
			'canonical_url' => $destination_post_url,
			'source_url'    => array( $source_post_url ),
			'title'         => $destination_post->post_title,
			'text'          => wp_strip_all_tags( $destination_post->post_content ),
			'output_config' => array(
				'performance_blending_weight' => $options['performance_blending_weight'] ?? 0.5,
			),
		);

		if ( isset( $options['keyword_exclusion_list'] ) && count( $options['keyword_exclusion_list'] ) > 0 ) {
			$request_body['keyword_exclusion_list'] = $options['keyword_exclusion_list'];
		}

		$request_body = apply_filters( 'wp_parsely_suggest_inbound_link_positions_request_body', $request_body, $source_post, $destination_post );

		$response = $this->request( 'POST', array(), $request_body );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( count( $response ) < 1 ) {
			return new \WP_Error(
				'parsely_no_inbound_link_positions',
				__( 'No inbound link positions found.', 'wp-parsely' ),
				array( 'status' => 404 )
			);
		}

		$suggestions = array();
		/** @var LinkPositionResponse $link */
		$link = $response[0];

		foreach ( $link['anchor_texts'] as $anchor_text_suggestion ) {
			$smart_link = new Inbound_Smart_Link(
				$link['target_url'],
				esc_attr( $link['title'] ),
				wp_kses_post( $anchor_text_suggestion['text'] ),
				$anchor_text_suggestion['offset']
			);

			// Set the source post and update the canonical URL.
			$smart_link->set_source_post( $source_post, $link['source_url'] );

			// Set the destination post.
			$smart_link->set_destination_post( $destination_post );

			$suggestions[] = $smart_link;
		}

		return $suggestions;
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.19.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API.
	 */
	public function call( array $args = array() ) {
		/** @var \WP_Post|null $source_post */
		$source_post = $args['source_post'] ?? null;
		/** @var \WP_Post|null $destination_post */
		$destination_post = $args['destination_post'] ?? null;
		/** @var Endpoint_Suggest_Inbound_Link_Positions_Options $options */
		$options = $args['options'] ?? array();

		if ( ! ( $source_post instanceof \WP_Post ) || ! ( $destination_post instanceof \WP_Post ) ) {
			return new \WP_Error(
				'parsely_invalid_post',
				__( 'Invalid post.', 'wp-parsely' ),
				array( 'status' => 400 )
			);
		}

		return $this->get_inbound_link_positions( $source_post, $destination_post, $options );
	}
}
