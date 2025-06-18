<?php
/**
 * Parse.ly Suggestions API Endpoint: Suggest Inbound Links
 *
 * @package Parsely
 * @since   3.19.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use Parsely\Parsely;
use Parsely\Models\Inbound_Smart_Link;
use WP_Error;
/**
 * The endpoint for the Suggest Inbound Links API request.
 *
 * @since 3.19.0
 *
 * @phpstan-type Endpoint_Suggest_Inbound_Links_Options = array{
 *     max_items?: int,
 *     url_exclusion_list?: array<string>,
 *     performance_blending_weight?: float
 * }
 */
class Endpoint_Suggest_Inbound_Links extends Suggestions_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.19.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return '/suggest-inbound-links';
	}

	/**
	 * Gets suggested inbound links for the given URL using the Parse.ly
	 * Content Suggestion API.
	 *
	 * @since 3.19.0
	 *
	 * @param \WP_Post                               $post    The post to get inbound link suggestions for.
	 * @param Endpoint_Suggest_Inbound_Links_Options $options The options to pass to the API request.
	 * @return array<Inbound_Smart_Link>|WP_Error The response from the remote API, or a WP_Error
	 *                                            object if the response is an error.
	 */
	public function get_inbound_links(
		\WP_Post $post,
		$options = array()
	) {
		/**
		 * The Parse.ly canonical URL for the post.
		 *
		 * @var string $post_url
		 */
		$post_url = Parsely::get_canonical_url_from_post( $post );

		$request_body = array(
			'canonical_url' => $post_url,
			'output_config' => array(
				'performance_blending_weight' => $options['performance_blending_weight'] ?? 0.5,
				'max_items'                   => $options['max_items'] ?? 10,
			),
			'title'         => $post->post_title,
			'text'          => wp_strip_all_tags( $post->post_content ),
		);

		if ( isset( $options['url_exclusion_list'] ) && count( $options['url_exclusion_list'] ) > 0 ) {
			$request_body['url_exclusion_list'] = $options['url_exclusion_list'];
		}

		$request_body = apply_filters( 'wp_parsely_suggest_inbound_links_request_body', $request_body, $post, $options );
		$response     = $this->request( 'POST', array(), $request_body );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Convert the links to Inbound_Smart_Link objects.
		$links = array();
		foreach ( $response as $link ) {
			$link = apply_filters( 'wp_parsely_suggest_inbound_links_link', $link );

			$anchor_text_suggestions = $link['anchor_texts'];

			foreach ( $anchor_text_suggestions as $anchor_text_suggestion ) {
				$link_obj = new Inbound_Smart_Link(
					esc_url( $link['source_url'] ),
					esc_attr( $link['title'] ),
					wp_kses_post( $anchor_text_suggestion['text'] ),
					$anchor_text_suggestion['offset']
				);

				// Set the destination to be the current post.
				$link_obj->set_destination_post( $post );

				// Set the source post from the URL.
				$did_set_source = $link_obj->set_source_from_url( $link['source_url'] );

				// If no source post was found or the source post is the same as
				// the destination post, skip to the next link suggestion.
				if ( ! $did_set_source || $link_obj->source_post_id === $post->ID ) {
					break;
				}

				// If the link doesn't have a valid placement, skip to the next
				// anchor text suggestion.
				$valid_placement = $link_obj->has_valid_placement();
				if ( is_wp_error( $valid_placement ) || false === $valid_placement ) {
					continue;
				}

				// Update the UID of the smart link.
				$link_obj->update_uid();

				$links[] = $link_obj;

				// Break after the first valid link.
				break;
			}
		}

		return $links;
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
		/** @var \WP_Post|null $post */
		$post = $args['post'] ?? null;
		/** @var Endpoint_Suggest_Inbound_Links_Options $options */
		$options = $args['options'] ?? array();

		if ( ! ( $post instanceof \WP_Post ) ) {
			return new \WP_Error(
				'parsely_invalid_post',
				__( 'Invalid post.', 'wp-parsely' ),
				array( 'status' => 400 )
			);
		}

		return $this->get_inbound_links( $post, $options );
	}
}
