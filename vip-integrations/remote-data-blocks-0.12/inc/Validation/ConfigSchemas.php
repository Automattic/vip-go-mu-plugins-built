<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Validation;

use RemoteDataBlocks\Validation\Types;
use RemoteDataBlocks\Config\DataSource\HttpDataSourceInterface;
use RemoteDataBlocks\Config\Query\HttpQueryInterface;
use RemoteDataBlocks\Config\Query\QueryInterface;
use RemoteDataBlocks\Config\QueryRunner\QueryRunnerInterface;
use RemoteDataBlocks\Editor\BlockManagement\ConfigRegistry;

/**
 * ConfigSchemas class.
 */
final class ConfigSchemas {
	public static function get_remote_data_block_config_schema(): array {
		static $schema = null;

		if ( null === $schema ) {
			$schema = self::generate_remote_data_block_config_schema();
		}

		return $schema;
	}

	public static function get_graphql_query_config_schema(): array {
		static $schema = null;

		if ( null === $schema ) {
			$schema = self::generate_graphql_query_config_schema();
		}

		return $schema;
	}

	public static function get_http_data_source_config_schema(): array {
		static $schema = null;

		if ( null === $schema ) {
			$schema = self::generate_http_data_source_config_schema();
		}

		return $schema;
	}

	public static function get_http_data_source_service_config_schema(): array {
		static $schema = null;

		if ( null === $schema ) {
			$schema = self::generate_http_data_source_service_config_schema();
		}

		return $schema;
	}

	public static function get_http_query_config_schema(): array {
		static $schema = null;

		if ( null === $schema ) {
			$schema = self::generate_http_query_config_schema();
		}

		return $schema;
	}

	public static function get_remote_data_block_attribute_config_schema(): array {
		static $schema = null;

		if ( null === $schema ) {
			$schema = self::generate_remote_data_block_attribute_config_schema();
		}

		return $schema;
	}

	private static function generate_remote_data_block_config_schema(): array {
		return Types::object( [
			'icon' => Types::nullable( Types::string() ),
			'instructions' => Types::nullable( Types::string() ),
			'patterns' => Types::nullable(
				Types::list_of(
					Types::object( [
						'html' => Types::html(),
						'role' => Types::nullable( Types::enum( 'inner_blocks' ) ),
						'title' => Types::string(),
					] )
				)
			),
			'render_query' => Types::object( [
				'query' => Types::one_of(
					Types::instance_of( QueryInterface::class ),
					Types::serialized_config_for( HttpQueryInterface::class ),
				),
			] ),
			'selection_queries' => Types::nullable(
				Types::list_of(
					Types::object( [
						'display_name' => Types::nullable( Types::string() ),
						'query' => Types::one_of(
							Types::instance_of( QueryInterface::class ),
							Types::serialized_config_for( HttpQueryInterface::class ),
						),
						'type' => Types::enum(
							ConfigRegistry::LIST_QUERY_KEY,
							ConfigRegistry::SEARCH_QUERY_KEY
						),
					] )
				)
			),
			'overrides' => Types::nullable(
				Types::list_of(
					Types::object( [
						'name' => Types::string(),
						'display_name' => Types::string(),
						'help_text' => Types::nullable( Types::string() ),
					] ),
				)
			),
			'title' => Types::string(),
		] );
	}

	private static function generate_graphql_query_config_schema(): array {
		return Types::merge_object_types(
			self::get_http_query_config_schema(),
			Types::object( [
				'graphql_query' => Types::string(),
				'request_method' => Types::nullable( Types::enum( 'GET', 'POST' ) ),
			] )
		);
	}

	private static function generate_http_data_source_config_schema(): array {
		return Types::object( [
			'display_name' => Types::string(),
			'endpoint' => Types::string(),
			'image_url' => Types::nullable( Types::image_url() ),
			'request_headers' => Types::nullable(
				Types::one_of(
					Types::callable(),
					Types::record( Types::string(), Types::string() ),
				)
			),
			'service' => Types::string(),
			'service_config' => Types::record( Types::string(), Types::any() ),
			'uuid' => Types::nullable( Types::uuid() ),
		] );
	}

	private static function generate_http_data_source_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'auth' => Types::nullable(
				Types::object( [
					'add_to' => Types::nullable( Types::enum( 'header', 'query' ) ),
					'key' => Types::nullable( Types::skip_sanitize( Types::string() ) ),
					'type' => Types::enum( 'basic', 'bearer', 'api-key', 'none' ),
					'value' => Types::skip_sanitize( Types::string() ),
				] )
			),
			'display_name' => Types::string(),
			'endpoint' => Types::url(),
		] );
	}

	private static function generate_http_query_config_schema(): array {
		return Types::object( [
			'cache_ttl' => Types::nullable( Types::one_of( Types::callable(), Types::integer(), Types::null() ) ),
			'data_source' => Types::one_of(
				Types::instance_of( HttpDataSourceInterface::class ),
				Types::serialized_config_for( HttpDataSourceInterface::class ),
			),
			'endpoint' => Types::nullable( Types::one_of( Types::callable(), Types::url() ) ),
			'image_url' => Types::nullable( Types::image_url() ),
			// NOTE: The "input schema" for a query is not a formal schema like the
			// ones generated by this class. It is a simple flat map of string keys and
			// primitive values that can be encoded as a PHP associative array or
			// another serializable data structure like JSON.
			'input_schema' => Types::nullable(
				Types::record(
					Types::string(),
					Types::object( [
						// TODO: The default value type should match the type specified for
						// the current field, but we have no grammar to represent this (refs
						// are global, not scoped). We could create a Types::matches_sibling
						// helper to handle this, or just do it ad hoc when we validate the
						// input schema.
						'default_value' => Types::nullable( Types::any() ),
						'name' => Types::nullable( Types::string() ),
						// NOTE: These values are string references to the "core primitive
						// types" from our formal schema. Referencing these types allows us
						// to use the same validation and sanitization logic.
						//
						// There are also special types that are not core primitives, with
						// accompanying notes.
						'type' => Types::enum(
							'boolean',
							'id',
							'integer',
							'null',
							'number',
							'string',
							// Special non-primitive types
							//
							// An array of IDs, to be handled by the query (e.g., a query can
							// implode an array of IDs into a comma-separated list and map it
							// to a query parameter).
							'id:list',
							// A string that represents an input field to refine the query results.
							'ui:input',
							// A string that represents search query input. An input variable
							// with this type must be present for the query to be considered a
							// search query.
							'ui:search_input',
							//
							// An integer that represents the requested offset for paginated
							// results. Providing this input variable enables offset-based
							// pagination.
							//
							// Note that a `total_items` pagination variable is also required
							// for pagination to be enabled.
							'ui:pagination_offset',
							//
							// An integer that represents the requested page of paginated
							// results. Providing this input variable enables page-based
							// pagination.
							//
							// Note that a `total_items` pagination variable is also required
							// for pagination to be enabled.
							'ui:pagination_page',
							//
							// An integer that represents the number of items to request in
							// paginated results. This variable can be used in any pagination
							// scheme. Often, this variable is named `limit` or `count`.
							'ui:pagination_per_page',
							//
							// A string that represents the pagination cursor used to request
							// the next or previous page. Both must be specified to opt-in to
							// cursor-based pagination, with corresponding fields defined in
							// the `pagination_schema`.
							//
							// If specified, these variables take precedence over page-based
							// and offset-based pagination variables.
							'ui:pagination_cursor_next',
							'ui:pagination_cursor_previous',
							//
							// Some APIs provide a single pagination cursor that is used for
							// both previous and next pages. If specified, this variable
							// takes precedence over next and previous cursor variables.
							'ui:pagination_cursor',
						),
						'required' => Types::nullable( Types::boolean() ),
					] ),
				)
			),
			// NOTE: The "output schema" for a query is not a formal schema like the
			// ones generated by this class. It is, however, more complex than the
			// "input schema" so that it can represent nested data structures.
			//
			// Since we want this "schema" to be serializable and simple to use, we
			// have created our own shorthand syntax that effectively maps to our more
			// formal types. The formal schema below describes this shorthand syntax.
			//
			// This allows most "output schemas" to be represented as a PHP associative
			// array or another serializable data structure like JSON (unless it uses
			// unseriazable types like closures).
			'output_schema' => Types::create_ref(
				'FIELD_SCHEMA',
				Types::object( [
					// @see Note above about default value type.
					'default_value' => Types::nullable( Types::any() ),
					'format' => Types::nullable( Types::callable() ),
					'generate' => Types::nullable( Types::callable() ),
					'is_collection' => Types::nullable( Types::boolean() ),
					'name' => Types::nullable( Types::string() ),
					'path' => Types::nullable( Types::json_path() ),
					'type' => Types::one_of(
						// NOTE: These values are string references to all of the primitive
						// types from our formal schema. Referencing these types allows us to
						// use the same validation and sanitization logic for both. This list
						// must not contain non-primitive types, because this simple syntax
						// cannot accept type arguments.
						Types::enum(
							'boolean',
							'integer',
							'null',
							'number',
							'string',
							'button_text',
							'button_url',
							'currency_in_current_locale',
							'email_address',
							'html',
							'id',
							'image_alt',
							'image_url',
							'markdown',
							'title',
							// 'json_path' is omitted since it likely has no user utility.
							'url',
							'uuid',
						),
						Types::record( Types::string(), Types::use_ref( 'FIELD_SCHEMA' ) ), // Nested schema!
					),
				] ),
			),
			// NOTE: The "pagination schema" for a query is not a formal schema like
			// the ones generated by this class. It is a simple object structure that
			// defines how the query response can inform subsequent requests for
			// paginated data.
			'pagination_schema' => Types::nullable(
				Types::object( [
					// This field provides an integer representing the total number of
					// items available in paginated results. Either this field or
					// `has_next_page` must be defined in order to enable pagination.
					'total_items' => Types::nullable(
						Types::object( [
							'generate' => Types::nullable( Types::callable() ),
							'name' => Types::nullable( Types::string() ),
							'path' => Types::nullable( Types::json_path() ),
							'type' => Types::enum( 'integer' ),
						] ),
					),
					// This field provides a pagination cursor for the next page of
					// paginated results, or a null value if there is no next page. This
					// field must be defined in order to enable cursor-based pagination.
					'cursor_next' => Types::nullable(
						Types::object( [
							'generate' => Types::nullable( Types::callable() ),
							'name' => Types::nullable( Types::string() ),
							'path' => Types::nullable( Types::json_path() ),
							'type' => Types::enum( 'string' ),
						] ),
					),
					// This field provides a pagination cursor for the previous page of
					// paginated results, or a null value if there is no previous page. This
					// field must be defined in order to enable cursor-based pagination.
					'cursor_previous' => Types::nullable(
						Types::object( [
							'generate' => Types::nullable( Types::callable() ),
							'name' => Types::nullable( Types::string() ),
							'path' => Types::nullable( Types::json_path() ),
							'type' => Types::enum( 'string' ),
						] ),
					),
					// This field provides a boolean indicating if there is a next page of
					// paginated results. This is helpful if the API does not provide a
					// total number of items.
					'has_next_page' => Types::nullable(
						Types::object( [
							'generate' => Types::nullable( Types::callable() ),
							'name' => Types::nullable( Types::string() ),
							'path' => Types::nullable( Types::json_path() ),
							'type' => Types::enum( 'boolean' ),
						] )
					),
				] )
			),
			'preprocess_response' => Types::nullable( Types::callable() ),
			'query_runner' => Types::nullable( Types::instance_of( QueryRunnerInterface::class ) ),
			'request_body' => Types::nullable(
				Types::one_of(
					Types::callable(),
					Types::object( [] ),
				)
			),
			'request_headers' => Types::nullable(
				Types::one_of(
					Types::callable(),
					Types::record( Types::string(), Types::string() ),
				)
			),
			'request_method' => Types::nullable( Types::enum( 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' ) ),
		] );
	}

	private static function generate_remote_data_block_attribute_config_schema(): array {
		return Types::object( [
			'blockName' => Types::string(),
			'enabledOverrides' => Types::list_of( Types::string() ),
			'metadata' => Types::record(
				Types::string(),
				Types::object( [
					'name' => Types::string(),
					'type' => Types::string(),
					'value' => Types::any(),
				] )
			),
			'pagination' => Types::nullable(
				Types::object( [
					'cursorNext' => Types::nullable( Types::string() ),
					'cursorPrevious' => Types::nullable( Types::string() ),
					'hasNextPage' => Types::nullable( Types::boolean() ),
					'totalItems' => Types::nullable( Types::integer() ),
				] ),
			),
			'queryInputs' => Types::list_of( Types::record( Types::string(), Types::any() ) ),
			'queryKey' => Types::nullable( Types::string() ),
			'resultId' => Types::nullable( Types::string() ),
			'results' => Types::list_of(
				Types::object( [
					'result' => Types::record(
						Types::string(),
						Types::object( [
							'name' => Types::string(),
							'type' => Types::string(),
							'value' => Types::any(),
						] )
					),
					'uuid' => Types::uuid(),
				] )
			),
		] );
	}
}
