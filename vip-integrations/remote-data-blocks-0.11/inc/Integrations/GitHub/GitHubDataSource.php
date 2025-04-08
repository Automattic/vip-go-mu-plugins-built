<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\GitHub;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Validation\Types;

class GitHubDataSource extends HttpDataSource {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_GITHUB_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

	protected static function get_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'display_name' => Types::string(),
			'repo_owner' => Types::string(),
			'repo_name' => Types::string(),
			'ref' => Types::string(),
		] );
	}

	protected static function map_service_config( array $service_config ): array {
		return [
			'display_name' => $service_config['display_name'],
			'endpoint' => sprintf(
				'https://api.github.com/repos/%s/%s/git/trees/%s?recursive=1',
				$service_config['repo_owner'],
				$service_config['repo_name'],
				$service_config['ref']
			),
			'request_headers' => [
				'Accept' => 'application/vnd.github+json',
			],
		];
	}
}
