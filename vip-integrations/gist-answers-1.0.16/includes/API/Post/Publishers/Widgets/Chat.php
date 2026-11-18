<?php
/**
 * Endpoint class for submitting a page URL for use as an answer page in Gist.ai.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Post\Publishers\Widgets;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for submitting a page URL for use as an answer page in Gist.ai.
 */
final class Chat extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array(
		'id',
		'targetUrl',
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
	 * @param string $publisher_id The publisher ID for the request.
	 * @param string $target_url   The URL of the newly created answer page.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id, string $target_url ) {

		parent::__construct(
			'POST',
			'publishers/{id}/widgets/chat',
			array(
				'id'        => $publisher_id,
				'targetUrl' => $target_url,
			),
		);

		do_action( 'gist_answers_post_publishers_widgets_chat', $publisher_id, $target_url, $this->response() );
	}
}
