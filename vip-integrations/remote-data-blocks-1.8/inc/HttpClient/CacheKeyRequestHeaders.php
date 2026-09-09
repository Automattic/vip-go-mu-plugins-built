<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

final class CacheKeyRequestHeaders {
	private const DEFAULT_HEADERS = [ 'Authorization', 'Cache-Control' ];

	/**
	 * Merge the given header list with DEFAULT_HEADERS, removing case-insensitive duplicates.
	 *
	 * @param array<string> $headers Request header names to merge with DEFAULT_HEADERS.
	 * @return array<string> Merged request header names.
	 */
	public static function merge( array $headers ): array {
		$merged_headers = self::DEFAULT_HEADERS;
		$seen_headers = array_fill_keys(
			array_map( 'strtolower', self::DEFAULT_HEADERS ),
			true
		);

		foreach ( $headers as $header ) {
			$normalized_header = strtolower( $header );
			if ( isset( $seen_headers[ $normalized_header ] ) ) {
				continue;
			}

			$seen_headers[ $normalized_header ] = true;
			$merged_headers[] = $header;
		}

		return $merged_headers;
	}
}
