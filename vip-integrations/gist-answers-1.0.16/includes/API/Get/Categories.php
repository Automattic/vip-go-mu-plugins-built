<?php
/**
 * Endpoint class for retrieving categories from the Gist API.
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
 * Endpoint class for retrieving categories from the Gist API.
 */
final class Categories extends Endpoint {

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
	protected array $optional_params = array();

	/**
	 * Class constructor.
	 *
	 * @return void
	 */
	public function __construct() {

		parent::__construct( 'GET', 'categories', array() );

		do_action( 'gist_answers_get_categories', $this->response() );
	}
}
