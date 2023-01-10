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
	 * @return stdClass|WPError stdClass containing the data or a WP_Error
	 *                          object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		$this->total_views = absint( $request->get_param( 'total_views' ) );
		$request->offsetUnset( 'total_views' ); // Remove param from request.
		return $this->get_data( $request );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @since 3.6.0
	 *
	 * @param array<string, mixed> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( array $response ): array {
		$referrers_types = $this->generate_referrer_types_data( $response );
		$direct_views    = absint( preg_replace( '/\D/', '', $referrers_types->direct->views ) );
		$referrers_top   = $this->generate_referrers_data( 5, $response, $direct_views );

		$result = array(
			'top'   => $referrers_top,
			'types' => $referrers_types,
		);

		return $result;
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
			$result->$key->views = 0;
		}

		// Set views and views totals.
		foreach ( $response as $referrer_data ) {
			// Point by reference to the item to be processed, and set it to 0
			// when needed in order to avoid potential PHP warnings.
			$current_type_views =& $result->{ $referrer_data->type }->views;
			if ( ! isset( $current_type_views ) ) {
				$current_type_views = 0;
			}

			// Set the values.
			$current_type_views   += $referrer_data->metrics->referrers_views;
			$total_referrer_views += $referrer_data->metrics->referrers_views;
		}

		// Add direct and total views to the object.
		$result->direct->views = $this->total_views - $total_referrer_views;
		$result->totals->views = $this->total_views;

		// Remove referrer types without views.
		foreach ( $referrer_type_keys as $key ) {
			if ( 0 === $result->$key->views ) {
				unset( $result->$key );
			}
		}

		// Set percentage values and format numbers.
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
		int $limit, array $response, int $direct_views
	): stdClass {
		$temp_views     = array();
		$totals         = 0;
		$referrer_count = count( $response );

		// Set views and views totals.
		$loop_count = $referrer_count > $limit ? $limit : $referrer_count;
		for ( $i = 0; $i < $loop_count; $i++ ) {
			$data           = $response[ $i ];
			$referrer_views = $data->metrics->referrers_views;

			$temp_views[ $data->name ] = $referrer_views;
			$totals                   += $referrer_views;
		}

		// If applicable, add the direct views.
		if ( $direct_views >= $referrer_views ) {
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
			$result->$key->views = $value;
		}
		$result->totals->views = $totals;

		// Set percentages values and format numbers.
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

	/**
	 * Determines if there are enough permissions to call the endpoint.
	 *
	 * @since 3.6.0
	 *
	 * @return bool
	 */
	public function permission_callback(): bool {
		// Unauthenticated.
		return true;
	}
}
