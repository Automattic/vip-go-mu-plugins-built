<?php
/**
 * Endpoints: Parse.ly `/referrers/post/detail` API proxy endpoint class
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use stdClass;
use WP_REST_Request;
use WP_Error;

use function Parsely\Utils\convert_to_positive_integer;

/**
 * Configures the `/referrers/post/detail` REST API endpoint.
 *
 * @since 3.6.0
 */
final class Referrers_Post_Detail_API_Proxy extends Base_API_Proxy {
	/**
	 * Count of total views.
	 *
	 * @var int
	 */
	private $total_views = 0;

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.6.0
	 */
	public function run(): void {
		$this->register_endpoint( '/referrers/post/detail' );
	}

	/**
	 * Cached "proxy" to the Parse.ly `/referrers/post/detail` API endpoint.
	 *
	 * @since 3.6.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		$total_views = $request->get_param( 'total_views' ) ?? '0';

		if ( ! is_string( $total_views ) ) {
			$total_views = '0';
		}

		$this->total_views = convert_to_positive_integer( $total_views );
		$request->offsetUnset( 'total_views' ); // Remove param from request.
		return $this->get_data( $request );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @since 3.6.0
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( $response ): array {
		$referrers_types = $this->generate_referrer_types_data( $response );
		$direct_views    = convert_to_positive_integer(
			$referrers_types->direct->views ?? '0'
		);
		$referrers_top   = $this->generate_referrers_data( 5, $response, $direct_views );

		return array(
			'top'   => $referrers_top,
			'types' => $referrers_types,
		);
	}

	/**
	 * Generates the referrer types data.
	 *
	 * Referrer types are:
	 * - `social`:   Views coming from social media.
	 * - `search`:   Views coming from search engines.
	 * - `other`:    Views coming from other referrers, like external websites.
	 * - `internal`: Views coming from linking pages of the same website.
	 *
	 * Returned object properties:
	 * - `views`:          The number of views.
	 * - `viewPercentage`: The number of views as a percentage, compared to the
	 *                     total views of all referrer types.
	 *
	 * @since 3.6.0
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return stdClass The generated data.
	 */
	private function generate_referrer_types_data( array $response ): stdClass {
		$result               = new stdClass();
		$total_referrer_views = 0; // Views from all referrer types combined.

		// Set referrer type order as it is displayed in the Parse.ly dashboard.
		$referrer_type_keys = array( 'social', 'search', 'other', 'internal', 'direct' );
		foreach ( $referrer_type_keys as $key ) {
			$result->$key = (object) array( 'views' => 0 );
		}

		// Set views and views totals.
		foreach ( $response as $referrer_data ) {
			/**
			 * Variable.
			 *
			 * @var int
			 */
			$current_views         = $referrer_data->metrics->referrers_views ?? 0;
			$total_referrer_views += $current_views;

			/**
			 * Variable.
			 *
			 * @var string
			 */
			$current_key = $referrer_data->type ?? '';
			if ( '' !== $current_key ) {
				if ( ! isset( $result->$current_key->views ) ) {
					$result->$current_key = (object) array( 'views' => 0 );
				}

				$result->$current_key->views += $current_views;
			}
		}

		// Add direct and total views to the object.
		$result->direct->views = $this->total_views - $total_referrer_views;
		$result->totals        = (object) array( 'views' => $this->total_views );

		// Remove referrer types without views.
		foreach ( $referrer_type_keys as $key ) {
			if ( 0 === $result->$key->views ) {
				unset( $result->$key );
			}
		}

		// Set percentage values and format numbers.
		// @phpstan-ignore-next-line.
		foreach ( $result as $key => $value ) {
			// Set and format percentage values.
			$result->{ $key }->viewsPercentage = $this->get_i18n_percentage(
				absint( $value->views ),
				$this->total_views
			);

			// Format views values.
			$result->{ $key }->views = number_format_i18n( $result->{ $key }->views );
		}

		return $result;
	}

	/**
	 * Generates the top referrers data.
	 *
	 * Returned object properties:
	 * - `views`:          The number of views.
	 * - `viewPercentage`: The number of views as a percentage, compared to the
	 *                     total views of all referrer types.
	 * - `datasetViewsPercentage: The number of views as a percentage, compared
	 *                            to the total views of the current dataset.
	 *
	 * @since 3.6.0
	 *
	 * @param int             $limit The limit of returned referrers.
	 * @param array<stdClass> $response The response received by the proxy.
	 * @param int             $direct_views The count of direct views.
	 * @return stdClass The generated data.
	 */
	private function generate_referrers_data(
		int $limit,
		array $response,
		int $direct_views
	): stdClass {
		$temp_views     = array();
		$totals         = 0;
		$referrer_count = count( $response );

		// Set views and views totals.
		$loop_count = $referrer_count > $limit ? $limit : $referrer_count;
		for ( $i = 0; $i < $loop_count; $i++ ) {
			$data = $response[ $i ];

			/**
			 * Variable.
			 *
			 * @var int
			 */
			$referrer_views = $data->metrics->referrers_views ?? 0;
			$totals        += $referrer_views;
			if ( isset( $data->name ) ) {
				$temp_views[ $data->name ] = $referrer_views;
			}
		}

		// If applicable, add the direct views.
		if ( isset( $referrer_views ) && $direct_views >= $referrer_views ) {
			$temp_views['direct'] = $direct_views;
			$totals              += $direct_views;
			arsort( $temp_views );
			if ( count( $temp_views ) > $limit ) {
				$totals -= array_pop( $temp_views );
			}
		}

		// Convert temporary array to result object and add totals.
		$result = new stdClass();
		foreach ( $temp_views as $key => $value ) {
			$result->$key = (object) array( 'views' => $value );
		}
		$result->totals = (object) array( 'views' => $totals );

		// Set percentages values and format numbers.
		// @phpstan-ignore-next-line.
		foreach ( $result as $key => $value ) {
			// Percentage against all referrer views, even those not included
			// in the dataset due to the $limit argument.
			$result->{ $key }->viewsPercentage = $this
				->get_i18n_percentage( absint( $value->views ), $this->total_views );

			// Percentage against the current dataset that is limited due to the
			// $limit argument.
			$result->{ $key }->datasetViewsPercentage = $this
				->get_i18n_percentage( absint( $value->views ), $totals );

			// Format views values.
			$result->{ $key }->views = number_format_i18n( $result->{ $key }->views );
		}

		return $result;
	}

	/**
	 * Returns the passed number compared to the passed total, in an
	 * internationalized percentage format.
	 *
	 * @since 3.6.0
	 *
	 * @param int $number The number to be calculated as a percentage.
	 * @param int $total The total number to compare against.
	 * @return string|false The internationalized percentage or false on error.
	 */
	private function get_i18n_percentage( int $number, int $total ) {
		if ( 0 === $total ) {
			return false;
		}

		return number_format_i18n( $number / $total * 100, 2 );
	}
}
