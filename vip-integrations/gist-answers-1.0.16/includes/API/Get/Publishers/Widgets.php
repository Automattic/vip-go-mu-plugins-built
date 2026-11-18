<?php
/**
 * Endpoint class for retrieving publisher widgets from the Gist API.
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
 * Endpoint class for retrieving publisher widgets from the Gist API.
 */
final class Widgets extends Endpoint {

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
		'widget_id',
	);

	/**
	 * Class constructor.
	 *
	 * @param string $publisher_id The ID of the publisher for which to retrieve widgets.
	 * @param string $widget_id    Optional ID of the widget to retrieve.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id, string $widget_id = '' ) {

		$params = array(
			'id' => $publisher_id,
		);

		if ( ! empty( $widget_id ) ) {
			$params['widget_id'] = $widget_id;
		}

		parent::__construct(
			'GET',
			array(
				'publishers/{id}/widgets',
				'publishers/{id}/widgets/{widget_id}',
			),
			$params,
		);

		do_action( 'gist_answers_get_publishers_widgets', $publisher_id, $widget_id, $this->response() );
	}
}
