<?php
/**
 * Endpoint class for submitting a post URL for ingestion into Gist.ai.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Post\Publishers;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for submitting a post URL for ingestion into Gist.ai.
 */
final class Ingest extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array(
		'id',
		'url',
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
	 * @param string $url          The URL of the post to be ingested.
	 *
	 * @return void
	 */
	public function __construct( string $publisher_id, string $url ) {

		parent::__construct(
			'POST',
			'publishers/{id}/ingest',
			array(
				'id'  => $publisher_id,
				'url' => $url,
			)
		);

		do_action( 'gist_answers_post_publishers_ingest', $publisher_id, $url, $this->response() );
	}
}
