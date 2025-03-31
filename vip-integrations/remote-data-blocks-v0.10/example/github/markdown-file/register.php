<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GitHub;

use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Integrations\GitHub\GitHubDataSource;

require_once __DIR__ . '/github-query-runner.php';
require_once __DIR__ . '/markdown-links.php';

function register_github_file_as_html_block(): void {
	// Note: This repository is public, so GitHub's API does not require authorization.
	$service_config = [
		'__version' => 1,
		'display_name' => 'Automattic/remote-data-blocks#trunk',
		'ref' => 'trunk',
		'repo_owner' => 'Automattic',
		'repo_name' => 'remote-data-blocks',
	];

	$block_title = sprintf( 'GitHub Markdown File (%s/%s)', $service_config['repo_owner'], $service_config['repo_name'] );
	$file_extension = '.md';
	$github_data_source = GitHubDataSource::from_array( [ 'service_config' => $service_config ] );

	$github_get_file_as_html_query = HttpQuery::from_array( [
		'data_source' => $github_data_source,
		'endpoint' => function ( array $input_variables ) use ( $service_config ): string {
			return sprintf(
				'https://api.github.com/repos/%s/%s/contents/%s?ref=%s',
				$service_config['repo_owner'],
				$service_config['repo_name'],
				$input_variables['file_path'],
				$service_config['ref']
			);
		},
		'input_schema' => [
			'file_path' => [
				'name' => 'File Path',
				'type' => 'string',
			],
		],
		'output_schema' => [
			'is_collection' => false,
			'type' => [
				'file_content' => [
					'name' => 'File Content',
					'generate' => static function ( array $response_data ): string {
						$file_content = $response_data['content'] ?? '';
						$file_path = $response_data['path'] ?? '';

						// Update the markdown links so that they point to the correct location.
						return update_markdown_links( $file_content, $file_path );
					},
					'type' => 'html',
				],
				'file_path' => [
					'name' => 'File Path',
					'path' => '$.path',
					'type' => 'string',
				],
			],
		],
		'request_headers' => [
			// This request header instructs GitHub's API to convert the Markdown to HTML.
			'Accept' => 'application/vnd.github.html+json',
		],
		// A custom query runner allows us to work with raw HTML responses (instead of JSON).
		'query_runner' => new GitHubQueryRunner(),
	] );

	$github_get_list_files_query = HttpQuery::from_array( [
		'data_source' => $github_data_source,
		'input_schema' => [
			'file_extension' => [
				'name' => 'File Extension',
				'type' => 'string',
			],
		],
		'output_schema' => [
			'is_collection' => true,
			'path' => sprintf( '$.tree[?(@.path =~ /\\.%s$/)]', ltrim( $file_extension, '.' ) ),
			'type' => [
				'file_path' => [
					'name' => 'File Path',
					'path' => '$.path',
					'type' => 'string',
				],
				'sha' => [
					'name' => 'SHA',
					'path' => '$.sha',
					'type' => 'string',
				],
				'size' => [
					'name' => 'Size',
					'path' => '$.size',
					'type' => 'integer',
				],
				'url' => [
					'name' => 'URL',
					'path' => '$.url',
					'type' => 'string',
				],
			],
		],
	] );

	register_remote_data_block( [
		'title' => $block_title,
		'render_query' => [
			'query' => $github_get_file_as_html_query,
		],
		'selection_queries' => [
			[
				'query' => $github_get_list_files_query,
				'type' => 'list',
			],
		],
		'overrides' => [
			[
				'name' => 'github_file_path',
				'display_name' => __( 'Use GitHub file path from URL', 'rdb-example' ),
				'help_text' => __( 'Enable this override when using this block on the /gh/ page.', 'rdb-example' ),
			],
		],
		'patterns' => [
			[
				'html' => file_get_contents( __DIR__ . '/inc/patterns/file-render.html' ),
				'role' => 'inner_blocks', // Bypass the pattern selection step.
				'title' => 'GitHub File Render',
			],
		],
	] );
}
add_action( 'init', __NAMESPACE__ . '\\register_github_file_as_html_block' );

function handle_github_file_path_override(): void {
	// This rewrite targets a page with the slug "gh", which must be created.
	add_rewrite_rule( '^gh/(.+)/?', 'index.php?pagename=gh&file_path=$matches[1]', 'top' );

	// Add the "file_path" query variable to the list of recognized query variables.
	add_filter( 'query_vars', function ( array $query_vars ): array {
		$query_vars[] = 'file_path';
		return $query_vars;
	}, 10, 1 );

	// Filter the query input variables to inject the "file_path" value from the
	// URL. Note that the override must match the override name defined in the
	// block registration above.
	add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides ): array {
		if ( true === in_array( 'github_file_path', $enabled_overrides, true ) ) {
			$file_path = get_query_var( 'file_path' );

			if ( ! empty( $file_path ) ) {
				$input_variables['file_path'] = $file_path;
			}
		}

		return $input_variables;
	}, 10, 2 );
}
add_action( 'init', __NAMESPACE__ . '\\handle_github_file_path_override' );
