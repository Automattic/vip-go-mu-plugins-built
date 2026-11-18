<?php
/**
 * Endpoint class for retrieving publisher channels from the Gist API.
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
 * Endpoint class for retrieving publisher channels from the Gist API.
 */
final class Channels extends Endpoint {

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
		'channel_id',
	);

	/**
	 * Class constructor.
	 *
	 * @param string $publisher_id The ID of the publisher.
	 * @param string $channel_id   The ID of the channel (optional).
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id, string $channel_id = '' ) {

		$params = array(
			'id' => $publisher_id,
		);

		if ( ! empty( $channel_id ) ) {
			$params['channel_id'] = $channel_id;
		}

		parent::__construct(
			'GET',
			array(
				'publishers/{id}/channels',
				'publishers/{id}/channels/{channel_id}',
			),
			$params,
		);

		do_action( 'gist_answers_get_publishers_channels', $publisher_id, $channel_id, $this->response() );
	}
}
