<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GitHub;

use RemoteDataBlocks\Config\Query\HttpQueryInterface;
use RemoteDataBlocks\Config\QueryRunner\QueryRunner;
use WP_Error;

defined( 'ABSPATH' ) || exit();

/**
 * Custom query runner that process custom processing for GitHub API responses
 * that return HTML / Markdown instead of JSON. This also provides custom
 * processing to adjust embedded links.
 *
 * Data fetching and caching is still delegated to the parent QueryRunner class.
 */
class GitHubQueryRunner extends QueryRunner {
	private string $default_file_extension = '.md';

	public function execute( HttpQueryInterface $query, array $input_variables ): array|WP_Error {
		$input_variables['file_path'] = $this->ensure_file_extension( $input_variables['file_path'] );

		return parent::execute( $query, $input_variables );
	}

	/**
	 * @inheritDoc
	 *
	 * The API response is raw HTML, so we return an object construct containing
	 * the HTML as a property.
	 */
	protected function deserialize_response( string $raw_response_data, array $input_variables ): array {
		return [
			'content' => $raw_response_data,
			'path' => $input_variables['file_path'],
		];
	}

	private function ensure_file_extension( string $file_path ): string {
		return str_ends_with( $file_path, $this->default_file_extension ) ? $file_path : $file_path . $this->default_file_extension;
	}
}
