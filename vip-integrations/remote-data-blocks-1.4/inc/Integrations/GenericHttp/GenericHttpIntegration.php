<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\GenericHttp;

use RemoteDataBlocks\Snippet\Snippet;

class GenericHttpIntegration {
	/**
	 * Get the code snippets for the Generic HTTP integration.
	 *
	 * @param array $data_source_config The data source configuration.
	 * @return array<Snippet> The block registration snippets.
	 */
	public static function get_code_snippets( array $data_source_config ): array {
		$snippets = [];
		$raw_snippet = file_get_contents( __DIR__ . '/templates/block_registration.template' );

		$code = strtr( $raw_snippet, [
			'{{DATA_SOURCE_UUID}}' => $data_source_config['uuid'],
		] );

		$snippets[] = new Snippet( 'Block registration', $code );

		return $snippets;
	}
}
