<?php
/**
 * Endpoint class for retrieving a Gist API embed ticket.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API\Post;

use GistAnswers\API\Endpoint;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Endpoint class for retrieving a Gist API embed ticket.
 */
final class Embed extends Endpoint {

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
		'publisher_id',
		'publisher_group_id',
		'domain_name',
		'api_token',
	);

	/**
	 * Class constructor.
	 *
	 * @param array<mixed> $params Optional parameters for the endpoint request.
	 *
	 * @return void
	 */
	public function __construct( array $params = array() ) {
		parent::__construct( 'POST', 'embed', $params );
	}
}
