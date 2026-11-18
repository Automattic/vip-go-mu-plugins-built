<?php
/**
 * Endpoint class for retrieving publisher sites from the Gist API.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Get\Publishers;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for retrieving publisher sites from the Gist API.
 */
final class Sites extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array(
		'id',
	);

	/**
	 * Optional parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $optional_params = array(
		'site_id',
	);

	/**
	 * Class constructor.
	 *
	 * @param string $publisher_id The ID of the publisher for which to retrieve sites.
	 * @param string $site_id      Optional ID of the site to retrieve.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id, string $site_id = '' ) {

		$params = array(
			'id' => $publisher_id,
		);

		if ( ! empty( $site_id ) ) {
			$params['site_id'] = $site_id;
		}

		parent::__construct(
			'GET',
			array(
				'publishers/{id}/sites',
				'publishers/{id}/sites/{site_id}',
			),
			$params,
		);

		do_action( 'gist_answers_get_publishers_sites', $publisher_id, $site_id, $this->response() );
	}
}
