<?php
/**
 * Endpoint class for retrieving publishers from the Gist API.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Get;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for retrieving publishers from the Gist API.
 */
final class Publishers extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array();

	/**
	 * Optional parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $optional_params = array(
		'id',
		'offset',
		'limit',
		'search',
	);

	/**
	 * The largest response body (in bytes) accepted from the endpoint: the list covers every publisher the API
	 * token can see, so it is allowed to be larger than most.
	 *
	 * @var int
	 */
	protected int $max_response_bytes = 8 * MB_IN_BYTES;

	/**
	 * Class constructor.
	 *
	 * @param string $publisher_id Optional ID of the publisher to retrieve.
	 * @param int    $offset       Optional number of publishers to skip. Defaults to 0.
	 * @param int    $limit        Optional maximum number of publishers to retrieve. Defaults to -1 (no limit).
	 * @param string $search       Optional search term to filter publishers (case-insensitive). Defaults to an empty string.
	 *
	 * @return void
	 */
	public function __construct(
		string $publisher_id = '',
		int $offset = 0,
		int $limit = -1,
		string $search = '',
	) {

		$params = ! empty( $publisher_id ) ? array( 'id' => $publisher_id ) : array();

		parent::__construct(
			'GET',
			array(
				'publishers',
				'publishers/{id}',
			),
			array_merge(
				$params,
				array(
					'offset' => $offset,
					'limit'  => $limit,
					'search' => $search,
				),
			)
		);

		do_action( 'gist_answers_get_publishers', $publisher_id, $this->response() );
	}
}
