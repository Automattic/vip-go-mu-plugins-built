<?php declare(strict_types = 1);

namespace RemoteDataBlocks\ExampleApi\Data;

use WP_Error;

class ExampleApiData {
	/**
	 * Hold the API data in memory to avoid repeated calls to wp_json_file_decode.
	 */
	private static array|null|WP_Error $api_data = null;

	/**
	 * Load the example data from a static file. The data is a collection of
	 * records from an Airtable table.
	 */
	public static function get_items(): array|WP_Error {
		if ( is_wp_error( self::$api_data ) ) {
			return self::$api_data;
		}

		if ( is_null( self::$api_data ) ) {
			self::$api_data = wp_json_file_decode( __DIR__ . '/items.json', [ 'associative' => true ] );
		}

		// If $api_data is *still* null, it could not be loaded. Store an error so
		// that we don't attempt endlessly.
		if ( is_null( self::$api_data ) || ! isset( self::$api_data['records'] ) ) {
			self::$api_data = new WP_Error( 'remote-data-blocks-missing-example-api-data', 'Could not load example API data' );
		}

		return self::$api_data;
	}

	/**
	 * Extract a single record from the example table data.
	 *
	 * @param string $item_id The ID of the record to extract.
	 */
	public static function get_item( string $item_id ): array|null|WP_Error {
		$items = self::get_items();

		if ( is_wp_error( $items ) ) {
			return $items;
		}

		foreach ( $items['records'] as $item ) {
			if ( $item['id'] === $item_id ) {
				return $item;
			}
		}

		return null;
	}
}
