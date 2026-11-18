<?php
/**
 * Endpoint class for retrieving cthe public API token for a partner-level channel from the Gist API.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Get\PublisherGroups\Channels;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for retrieving the public API token for a partner-level channel from the Gist API.
 */
final class Token extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array(
		'id',
		'channel_id',
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
	 * @param string $channel_id         The ID of the channel.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_group_id, string $channel_id ) {

		parent::__construct(
			'GET',
			'publisher_groups/{id}/channels/{channel_id}/token',
			array(
				'id'         => $publisher_group_id,
				'channel_id' => $channel_id,
			),
		);

		do_action( 'gist_answers_get_publisher_groups_channels_token', $publisher_group_id, $channel_id, $this->response() );
	}
}
