<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\DataBinding;

use RemoteDataBlocks\Config\Query\QueryInterface;

use function add_filter;
use function add_query_arg;
use function get_query_var;

defined( 'ABSPATH' ) || exit();

class Pagination {
	private static string $variable_name = 'rdb-pagination';

	public static function init(): void {
		add_filter( 'query_vars', [ __CLASS__, 'register_query_var' ], 10, 1 );

		/**
		 * Filter the name of the query variable used for pagination.
		 *
		 * @param string $query_var_name The name of the query variable.
		 */
		self::$variable_name = apply_filters(
			'remote_data_blocks_pagination_query_var_name',
			'rdb-pagination'
		);
	}

	public static function create_query_var( string $config_id, array $pagination_input_variables ): string {
		$value = [
			$config_id => $pagination_input_variables,
		];

		return add_query_arg( self::$variable_name, self::encode_query_var( $value ) );
	}

	private static function decode_query_var( string $query_var_string ): array {
		return json_decode( base64_decode( $query_var_string ), true ) ?? [];
	}

	private static function encode_query_var( array $query_var_value ): string {
		return base64_encode( wp_json_encode( $query_var_value ) );
	}

	public static function get_pagination_input_variables_for_current_request( QueryInterface $query, ?string $config_id ): array {
		$untrusted_variables = self::decode_query_var( get_query_var( self::$variable_name, '' ) );

		if ( empty( $untrusted_variables ) || ! is_array( $untrusted_variables ) ) {
			return [];
		}

		// The query var value is an associative array.
		//
		// The keys are configuration IDs as persisted by the remote data block
		// attribute. The values that are an associative array of input variables.
		$untrusted_variables = $untrusted_variables[ $config_id ] ?? [];

		if ( empty( $untrusted_variables ) || ! is_array( $untrusted_variables ) ) {
			return [];
		}

		// Only accept pagination input variables that are defined in this query's
		// input schema.
		$input_schema = $query->get_input_schema();
		$input_variables = [];
		$pagination_input_variable_types = [
			'ui:pagination_cursor',
			'ui:pagination_cursor_next',
			'ui:pagination_cursor_previous',
			'ui:pagination_offset',
			'ui:pagination_page',
			'ui:pagination_per_page',
		];

		foreach ( $input_schema as $slug => $input ) {
			if ( ! in_array( $input['type'] ?? null, $pagination_input_variable_types, true ) ) {
				continue;
			}

			if ( ! array_key_exists( $slug, $untrusted_variables ) ) {
				continue;
			}

			$value = $untrusted_variables[ $slug ];

			if ( ! is_string( $value ) && ! is_int( $value ) ) {
				continue;
			}

			$input_variables[ $slug ] = $value;
		}

		return $input_variables;
	}

	public static function format_pagination_data_for_query_response( array|null $pagination_data, array $query_input_schema, array $input_variables ): array {
		// If the input schema is empty, it does not support pagination.
		if ( empty( $query_input_schema ) ) {
			return [];
		}

		// Find the appropriate pagination variables from the input schema.
		$cursor_variable = null;
		$cursor_next_variable = null;
		$cursor_previous_variable = null;
		$offset_variable = null;
		$page_variable = null;
		$per_page_variable = null;

		// Inspect the input schema to find the pagination variables.
		foreach ( $query_input_schema as $slug => $input ) {
			$type = $input['type'] ?? '';
			if ( 'ui:pagination_cursor' === $type ) {
				$cursor_variable = $slug;
			} elseif ( 'ui:pagination_cursor_next' === $type ) {
				$cursor_next_variable = $slug;
			} elseif ( 'ui:pagination_cursor_previous' === $type ) {
				$cursor_previous_variable = $slug;
			} elseif ( 'ui:pagination_offset' === $type ) {
				$offset_variable = $slug;
			} elseif ( 'ui:pagination_page' === $type ) {
				$page_variable = $slug;
			} elseif ( 'ui:pagination_per_page' === $type ) {
				$per_page_variable = $slug;
			}
		}

		// Default pagination values
		$current_per_page = $input_variables[ $per_page_variable ] ?? 10;
		$pagination_input_variables = [];
		$pagination_type = 'NONE';
		$total_items = $pagination_data['total_items'] ?? null;

		// These are the input variables that will be targeted for basic
		// pagination types.
		$pagination_input_variable_targets = [
			'offset' => $offset_variable,
			'page' => $page_variable,
			'per_page' => $per_page_variable,
		];

		// For each pagination type, define the input variables used to
		// navigate to the previous or next page. This will allow the
		// pagination helper block to provide links to those pages.
		if ( $cursor_variable ) {
			$pagination_type = 'CURSOR_SIMPLE';

			if ( isset( $pagination_data['cursor_next'] ) ) {
				$pagination_input_variables['next_page'] = [
					$cursor_variable => $pagination_data['cursor_next'],
				];
			}

			if ( isset( $pagination_data['cursor_previous'] ) ) {
				$pagination_input_variables['previous_page'] = [
					$cursor_variable => $pagination_data['cursor_previous'],
				];
			}
		} elseif ( $cursor_next_variable && $cursor_previous_variable ) {
			$pagination_type = 'CURSOR';

			if ( isset( $pagination_data['cursor_next'] ) ) {
				$pagination_input_variables['next_page'] = [
					$cursor_next_variable => $pagination_data['cursor_next'],
				];
			}

			if ( isset( $pagination_data['cursor_previous'] ) ) {
				$pagination_input_variables['previous_page'] = [
					$cursor_previous_variable => $pagination_data['cursor_previous'],
				];
			}
		} elseif ( $offset_variable ) {
			$pagination_type = 'OFFSET';
			$current_offset = $input_variables[ $offset_variable ] ?? 0;

			if ( null === $total_items || $current_offset + $current_per_page < $total_items ) {
				$pagination_input_variables['next_page'] = [
					$offset_variable => $current_offset + $current_per_page,
				];
			}

			if ( $current_offset >= $current_per_page ) {
				$pagination_input_variables['previous_page'] = [
					$offset_variable => $current_offset - $current_per_page,
				];
			}
		} elseif ( $page_variable ) {
			$pagination_type = 'PAGE';
			$current_page = $input_variables[ $page_variable ] ?? 1;
			$total_pages = $total_items ? ceil( $total_items / $current_per_page ) : null;

			if ( null === $total_pages || $current_page < $total_pages ) {
				$pagination_input_variables['next_page'] = [
					$page_variable => $current_page + 1,
				];
			}

			if ( $current_page > 1 ) {
				$pagination_input_variables['previous_page'] = [
					$page_variable => $current_page - 1,
				];
			}
		}

		if ( 'NONE' === $pagination_type ) {
			return [];
		}

		return [
			'input_variables' => $pagination_input_variables,
			'input_variable_targets' => $pagination_input_variable_targets,
			'per_page' => $current_per_page,
			'total_items' => $total_items,
			'type' => $pagination_type,
		];
	}

	public static function register_query_var( array $query_vars ): array {
		$query_vars[] = self::$variable_name;
		return $query_vars;
	}
}
