<?php
/**
 * Endpoint class for creating a Gist Answers publisher (i.e., website).
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
 * Endpoint class for creating a Gist Answers publisher (i.e., website).
 */
final class Publishers extends Endpoint {

	/**
	 * Required parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array(
		'publisher',
		'site',
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
	 * @param string $name          Name of site/publisher to be created.
	 * @param string $description   Description of the site/publisher.
	 * @param string $domain        Domain of the site/publisher.
	 * @param string $location      Geographic location of the site/publisher.
	 * @param string $category_id   Gist Answers category ID of the site.
	 * @param string $posts_url     The WordPress REST API posts endpoint for the site.
	 * @param string $url_type      The type of the posts URL (must be `WPV2`).
	 * @param string $home_page_url Optional home page URL of the site/publisher.
	 * @param string $dev_url       Optional development URL of the site/publisher (i.e., this WordPress site's URL,
	 *                              when it differs from the home page URL).
	 *
	 * @return void
	 */
	public function __construct(
		string $name,
		string $description,
		string $domain,
		string $location,
		string $category_id,
		string $posts_url,
		string $url_type,
		string $home_page_url = '',
		string $dev_url = '',
	) {

		$config = array(
			'domain'   => $domain,
			'location' => $location,
		);

		if ( ! empty( $home_page_url ) ) {
			$config['home_page_url'] = $home_page_url;
		}

		if ( ! empty( $dev_url ) ) {
			$config['dev'] = $dev_url;
		}

		parent::__construct(
			'POST',
			'publishers',
			array(
				'publisher' => array(
					'name'        => $name,
					'description' => $description,
					'config'      => $config,
					'category_id' => $category_id,
				),
				'site'      => array(
					'url'  => $posts_url,
					'type' => $url_type,
				),
			),
		);

		do_action( 'gist_answers_post_publishers', $name, $description, $domain, $location, $category_id, $posts_url, $url_type, $this->response(), $home_page_url, $dev_url );
	}
}
