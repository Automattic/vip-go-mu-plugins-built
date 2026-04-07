<?php
/**
 * Post data trait, that provides methods to handle post data and the itm_source
 * parameter
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Stats;

use Parsely\Parsely;
use Parsely\Utils\Utils;
use stdClass;
use WP_REST_Request;

/**
 * Post data trait, that provides methods to handle post data and the itm_source
 * parameter.
 *
 * @since 3.17.0
 */
trait Post_Data_Trait {
	/**
	 * The itm_source of the post's URL.
	 *
	 * @since 3.17.0
	 *
	 * @var string $itm_source
	 */
	private $itm_source;

	/**
	 * Sets the itm_source value.
	 *
	 * @since 3.17.0
	 *
	 * @param string $source The source of the item.
	 */
	private function set_itm_source( string $source ): void {
		$this->itm_source = $source;
	}

	/**
	 * Sets the itm_source value from the request, if it exists.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 */
	private function set_itm_source_from_request( WP_REST_Request $request ): void {
		$source = $request->get_param( 'itm_source' );
		if ( null !== $source ) {
			$this->set_itm_source( $source );
		}
	}

	/**
	 * Returns the itm_source parameter arguments, to be used in the REST API
	 * route registration.
	 *
	 * @since 3.17.0
	 *
	 * @return array<string, mixed>
	 */
	private function get_itm_source_param_args(): array {
		return array(
			'itm_source' => array(
				'description' => __( 'The source of the item.', 'wp-parsely' ),
				'type'        => 'string',
				'required'    => false,
			),
		);
	}

	/**
	 * Extracts the post data from the passed object.
	 *
	 * Should only be used with endpoints that return post data.
	 *
	 * @since 3.10.0
	 * @since 3.17.0 Moved from the `Base_API_Proxy` class.
	 *
	 * @param array<mixed> $item The object to extract the data from.
	 * @return array<string, mixed> The extracted data.
	 */
	protected function extract_post_data( array $item ): array {
		$data = array();

		if ( isset( $item['author'] ) ) {
			$data['author'] = $item['author'];
		}

		if ( isset( $item['metrics']['views'] ) ) {
			$data['views'] = number_format_i18n( $item['metrics']['views'] );
		}

		if ( isset( $item['metrics']['visitors'] ) ) {
			$data['visitors'] = number_format_i18n( $item['metrics']['visitors'] );
		}

		if ( isset( $item['metrics']['recirculation_rate'] ) ) {
			$data['recirculationRate'] = number_format_i18n( $item['metrics']['recirculation_rate'], 3 );
		}

		// The avg_engaged metric can be in different locations depending on the
		// endpoint and passed sort/url parameters.
		$avg_engaged = $item['metrics']['avg_engaged'] ?? $item['avg_engaged'] ?? null;
		if ( null !== $avg_engaged ) {
			$data['avgEngaged'] = Utils::get_formatted_duration( (float) $avg_engaged );
		}

		if ( isset( $item['pub_date'] ) ) {
			$data['date'] = wp_date( Utils::get_date_format(), strtotime( $item['pub_date'] ) );
		}

		if ( isset( $item['title'] ) ) {
			$data['title'] = $item['title'];
		}

		// Handle the campaign metrics, if they exist.
		if ( isset( $item['campaign_metrics'] ) && is_array( $item['campaign_metrics'] ) ) {
			$data['campaign'] = array();

			if ( isset( $item['campaign_metrics']['views'] ) ) {
				$data['campaign']['views'] = number_format_i18n( $item['campaign_metrics']['views'] );
			}

			if ( isset( $item['campaign_metrics']['visitors'] ) ) {
				$data['campaign']['visitors'] = number_format_i18n( $item['campaign_metrics']['visitors'] );
			}

			if ( isset( $item['campaign_metrics']['recirculation_rate'] ) ) {
				$data['campaign']['recirculationRate'] = number_format_i18n( $item['campaign_metrics']['recirculation_rate'], 3 );
			}

			if ( isset( $item['campaign_metrics']['avg_engaged'] ) ) {
				$data['campaign']['avgEngaged'] = Utils::get_formatted_duration( (float) $item['campaign_metrics']['avg_engaged'] );
			}
		}

		if ( isset( $item['url'] ) ) {
			$site_id  = $this->parsely->get_site_id();
			$post_id  = Utils::get_post_id_by_url( $item['url'] );
			$post_url = Parsely::get_url_with_itm_source( $item['url'], null );

			// If we have a post ID, update the post canonical URL.
			if ( 0 !== $post_id ) {
				Parsely::set_canonical_url( $post_id, $post_url );
			}

			if ( Utils::parsely_is_https_supported() ) {
				$post_url = str_replace( 'http://', 'https://', $post_url );
			}

			$data['rawUrl']  = $post_url;
			$data['dashUrl'] = Parsely::get_dash_url( $site_id, $post_url );
			$data['id']      = Parsely::get_url_with_itm_source( $post_url, null ); // Unique.
			$data['postId']  = $post_id; // Might not be unique.
			$data['url']     = Parsely::get_url_with_itm_source( $post_url, $this->itm_source );

			// Set thumbnail URL, falling back to the Parse.ly thumbnail if needed.
			$thumbnail_url = get_the_post_thumbnail_url( $post_id, 'thumbnail' );
			if ( false !== $thumbnail_url ) {
				$data['thumbnailUrl'] = $thumbnail_url;
			} elseif ( isset( $item['thumb_url_medium'] ) ) {
				$data['thumbnailUrl'] = $item['thumb_url_medium'];
			}
		}

		return $data;
	}
}
