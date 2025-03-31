<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Sanitization;

use RemoteDataBlocks\Validation\Types;
use RemoteDataBlocks\Validation\Validator;

/**
 * Sanitizer class.
 */
class Sanitizer implements SanitizerInterface {
	/**
	 * @inheritDoc
	 */
	public function __construct( private array $schema ) {}

	public function sanitize( mixed $data ): mixed {
		return $this->sanitize_type( $this->schema, $data );
	}

	/**
	 * Sanitize a value recursively against a schema.
	 *
	 * @param array<string, mixed> $type The schema to sanitize against.
	 * @param mixed $value The value to sanitize.
	 * @return mixed Sanitized value.
	 */
	private function sanitize_type( array $type, mixed $value = null ): mixed {
		if ( ! Types::is_sanitizable( $type ) ) {
			return $value;
		}

		if ( Types::is_nullable( $type ) && empty( $value ) ) {
			return null;
		}

		if ( Types::is_primitive( $type ) ) {
			return self::sanitize_primitive_type( Types::get_type_name( $type ), $value );
		}

		return $this->sanitize_non_primitive_type( $type, $value );
	}

	private function sanitize_non_primitive_type( array $type, mixed $value ): mixed {
		// Not all types support sanitization. We sanitize what we can.
		switch ( Types::get_type_name( $type ) ) {
			case 'const':
				return Types::get_type_args( $type );

			case 'list_of':
				if ( ! is_array( $value ) || ! array_is_list( $value ) ) {
					return [];
				}

				$member_type = Types::get_type_args( $type );
				return array_map( function ( mixed $item ) use ( $member_type ): mixed {
					return $this->sanitize_type( $member_type, $item );
				}, $value );

			case 'object':
				if ( ! Validator::check_iterable_object( $value ) ) {
					return [];
				}

				$sanitized_object = [];
				foreach ( Types::get_type_args( $type ) as $key => $value_type ) {
					$sanitized_object[ $key ] = $this->sanitize_type( $value_type, $this->get_object_key( $value, $key ) );
				}

				return $sanitized_object;

			case 'record':
				if ( ! Validator::check_iterable_object( $value ) ) {
					return [];
				}

				$type_args = Types::get_type_args( $type );
				$key_type = $type_args[0];
				$value_type = $type_args[1];

				foreach ( $value as $key => $record_value ) {
					$sanitized_key = $this->sanitize_type( $key_type, $key );
					$sanitized_record_value = $this->sanitize_type( $value_type, $record_value );
					$value[ $sanitized_key ] = $sanitized_record_value;
				}

				return $value;

			case 'string_matching':
				$regex = Types::get_type_args( $type );
				if ( preg_match( $regex, strval( $value ) ) ) {
					return $value;
				}

				return null;

			default:
				return $value;
		}
	}

	public static function sanitize_primitive_type( string $type_name, mixed $value ): mixed {
		// If the value is an array, just take the first element.
		if ( is_array( $value ) ) {
			return self::sanitize_primitive_type( $type_name, $value[0] ?? null );
		}

		// Not all types support sanitization. We sanitize what we can.
		switch ( $type_name ) {
			case 'boolean':
				return (bool) $value;

			case 'integer':
				return intval( $value );

			case 'null':
				return null;

			case 'string':
				return sanitize_text_field( strval( $value ) );

			case 'button_text':
			case 'html':
			case 'id':
			case 'image_alt':
			case 'json_path':
			case 'markdown':
			case 'uuid':
				return strval( $value );

			case 'email_address':
				return sanitize_email( $value );

			case 'button_url':
			case 'image_url':
			case 'url':
				return sanitize_url( strval( $value ) );

			default:
				return $value;
		}
	}

	private function get_object_key( mixed $data, string $key ): mixed {
		return is_array( $data ) && array_key_exists( $key, $data ) ? $data[ $key ] : null;
	}
}
