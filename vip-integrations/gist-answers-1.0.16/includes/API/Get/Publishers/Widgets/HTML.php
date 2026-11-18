<?php
/**
 * Endpoint class for retrieving the HTML for a specific chat widget from the Gist API.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Get\Publishers\Widgets;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for retrieving the HTML for a specific chat widget from the Gist API.
 */
final class HTML extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array(
		'id',
		'widget_id',
	);

	/**
	 * Optional parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $optional_params = array();

	/**
	 * The largest response body (in bytes) accepted from the endpoint: a widget's code is only a few snippets.
	 *
	 * @var int
	 */
	protected int $max_response_bytes = 256 * KB_IN_BYTES;

	/**
	 * Class constructor.
	 *
	 * @param string $publisher_id The ID of the publisher.
	 * @param string $widget_id    The ID of the widget.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id, string $widget_id ) {

		parent::__construct(
			'GET',
			'publishers/{id}/widgets/{widget_id}/html',
			array(
				'id'        => $publisher_id,
				'widget_id' => $widget_id,
			),
		);

		do_action( 'gist_answers_get_publishers_widgets_html', $publisher_id, $widget_id, $this->response() );
	}
}
