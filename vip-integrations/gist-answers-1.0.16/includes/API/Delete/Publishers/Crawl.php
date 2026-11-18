<?php
/**
 * Endpoint class for stopping the crawl for a publisher from the Gist API.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Delete\Publishers;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for stopping the crawl for a publisher from the Gist API.
 */
final class Crawl extends Endpoint {

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
	protected array $optional_params = array();

	/**
	 * Class constructor.
	 *
	 * @param string $publisher_id The ID of the publisher.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id ) {

		parent::__construct(
			'DELETE',
			'publishers/{id}/crawl',
			array(
				'id' => $publisher_id,
			),
		);

		do_action( 'gist_answers_delete_publishers_crawl', $publisher_id, $this->response() );
	}
}
