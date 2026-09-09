<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\QueryRunner;

use JsonPath\JsonObject;
use RemoteDataBlocks\Formatting\FieldFormatter;
use RemoteDataBlocks\Sanitization\Sanitizer;

defined( 'ABSPATH' ) || exit();

/**
 * QueryResponseParser class
 */
final class QueryResponseParser {
	/**
	 * Get a field value based on its type. This should be a primitive type.
	 *
	 * @param mixed $field_value The field value.
	 * @param string $type_name The field type.
	 * @return mixed The sanitized field value.
	 */
	private function get_field_value( mixed $field_value, string $type_name ): mixed {
		if ( null === $field_value ) {
			return null;
		}

		$sanitized_value = Sanitizer::sanitize_primitive_type( $type_name, $field_value );

		// Some fields get formatted based on their type.
		switch ( $type_name ) {
			case 'currency_in_current_locale':
				return FieldFormatter::format_currency( $sanitized_value, null, null );

			case 'markdown':
				return FieldFormatter::format_markdown( $sanitized_value );
		}

		return $sanitized_value;
	}

	/**
	 * Parse the response data, adhering to the output schema defined by the query.
	 * Note that "schema" here refers to the simple array structure defined by the
	 * query's "output_schema" config field. This is not the more formal grammar
	 * used to validate the query's config (including the output schema itself).
	 *
	 * This method is recursive.
	 *
	 * @param mixed $data Response data.
	 * @param array $schema The schema to parse the response data.
	 * @param array $raw_response_data The raw response data from QueryRunner#get_raw_response_data.
	 * @return null|array<int, array{
	 *   result: array{
	 *     name: string,
	 *     type: string,
	 *     value: string,
	 *   },
	 * }>
	 */
	public function parse( mixed $data, array $schema, array $raw_response_data = [] ): mixed {
		$json_obj = $data instanceof JsonObject ? $data : new JsonObject( $data );
		$is_collection = $schema['is_collection'] ?? false;
		$default_path = $is_collection ? '$[*]' : '$';
		$value = $json_obj->get( $schema['path'] ?? $default_path );

		if ( is_array( $schema['type'] ?? null ) ) {
			$value = $this->parse_response_objects( $value, $schema['type'], $raw_response_data ) ?? [];
		} elseif ( is_string( $schema['type'] ?? null ) ) {
			if ( $is_collection ) {
				$value = array_map( function ( $item ) use ( $schema ) {
					return $this->get_field_value( $item ?? $schema['default_value'] ?? null, $schema['type'] );
				}, $value );
			} else {
				$value = [ $this->get_field_value( $value[0] ?? $schema['default_value'] ?? null, $schema['type'] ) ];
			}
		} else {
			$value = [];
		}

		return $is_collection ? $value : $value[0] ?? null;
	}

	private function parse_response_objects( mixed $objects, array $type, array $raw_response_data ): array {
		if ( ! is_array( $objects ) ) {
			return [];
		}

		// Loop over the provided objects and parse it according to the provided schema type.
		return array_map( function ( $object ) use ( $type, $raw_response_data ) {
			$json_obj = new JsonObject( $object );
			$result = [];

			// Loop over the defined fields in the schema type and extract the values from the object.
			foreach ( $type as $field_name => $mapping ) {
				// Skip null values.
				if ( null === $mapping ) {
					continue;
				}

				// A generate function accepts the current object and returns the field value.
				if ( isset( $mapping['generate'] ) && is_callable( $mapping['generate'] ) ) {
					$field_value = call_user_func( $mapping['generate'], json_decode( $json_obj->getJson(), true ), $raw_response_data );
				} else {
					$field_schema = array_merge( $mapping, [ 'path' => $mapping['path'] ?? "$.{$field_name}" ] );
					$field_value = $this->parse( $json_obj, $field_schema );
				}

				// A format function accepts the field value and formats it.
				if ( isset( $mapping['format'] ) && is_callable( $mapping['format'] ) ) {
					$field_value = call_user_func( $mapping['format'], $field_value );
				}

				$result[ $field_name ] = [
					'name' => $mapping['name'] ?? $field_name,
					// Convert complex types to string representation.
					'type' => is_string( $mapping['type'] ) ? $mapping['type'] : 'object',
					'value' => $field_value,
				];
			}

			// Nest result property to reserve additional meta in the future. Ensure
			// that each result has an entity ID.
			return [
				'result' => $result,
				'uuid' => wp_generate_uuid4(),
			];
		}, $objects );
	}
}
