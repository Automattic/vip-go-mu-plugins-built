<?php
/**
 * Endpoint class for retrieving messages of a publisher group from the Gist API.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Get\PublisherGroups;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for retrieving messages of a publisher group from the Gist API.
 */
final class Messages extends Endpoint {

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
	 * @param string $publisher_group_id The ID of the publisher group.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_group_id ) {

		parent::__construct(
			'GET',
			'publisher_groups/{id}/messages',
			array(
				'id' => $publisher_group_id,
			),
		);

		do_action( 'gist_answers_get_publisher_groups_messages', $publisher_group_id, $this->response() );
	}
}
