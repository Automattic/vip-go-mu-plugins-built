<?php
/**
 * Endpoint class for retrieving publisher groups from the Gist API.
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
 * Endpoint class for retrieving publisher groups from the Gist API.
 */
final class PublisherGroups extends Endpoint {

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
	);

	/**
	 * Class constructor.
	 *
	 * @param string|null $publisher_group_id Optional publisher group ID to be retrieved.
	 * @param string      $validate_token     Optional API token for validation.
	 *
	 * @return void
	 */
	public function __construct( ?string $publisher_group_id = null, string $validate_token = '' ) {

		$params = $publisher_group_id ? array( 'id' => $publisher_group_id ) : array();

		parent::__construct(
			'GET',
			array(
				'publisher_groups',
				'publisher_groups/{id}',
			),
			$params,
			$validate_token,
		);

		do_action( 'gist_answers_get_publisher_groups', $publisher_group_id, $this->response() );
	}
}
