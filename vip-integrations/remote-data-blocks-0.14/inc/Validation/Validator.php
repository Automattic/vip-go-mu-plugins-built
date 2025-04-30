<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Validation;

use RemoteDataBlocks\Config\ArraySerializableInterface;
use RemoteDataBlocks\Validation\Types;
use WP_Error;
use function is_email;

/**
 * Validator class.
 */
final class Validator implements ValidatorInterface {
	public const ACTION_NAME = 'remote_data_blocks_validation_issue';

	public function __construct( private array $schema, private string $entity_name = 'Unknown entity', private string $root_path_name = '$value' ) {}

	public function validate( mixed $data ): bool|WP_Error {
		$validation = $this->check_type( $this->schema, $this->root_path_name, $data );

		if ( is_wp_error( $validation ) ) {
			do_action( self::ACTION_NAME, $validation );
			return $validation;
		}

		return true;
	}

	/**
	 * Validate a value recursively against a schema.
	 *
	 * @param array<string, mixed> $type The schema to validate against.
	 * @param string $path The PHP-syntax path to the value being validated.
	 * @param mixed $value The value to validate.
	 * @return bool|WP_Error Returns true if the data is valid, otherwise a WP_Error.
	 */
	private function check_type( array $type, string $path, mixed $value = null ): bool|WP_Error {
		if ( Types::is_nullable( $type ) && is_null( $value ) ) {
			return true;
		}

		if ( Types::is_primitive( $type ) ) {
			$type_name = Types::get_type_name( $type );
			$result = $this->check_primitive_type( $type_name, $path, $value );

			if ( true === $result ) {
				return true;
			}

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			return $this->create_error( sprintf( 'must be a %s', $type_name ), $path );
		}

		return $this->check_non_primitive_type( $type, $path, $value );
	}

	/**
	 * Validate a non-primitive value against a schema. This method returns true
	 * or a WP_Error object. Never check the return value for truthiness; either
	 * return the value directly or check it with is_wp_error().
	 *
	 * @param array<string, mixed> $type The schema type to validate against.
	 * @param string $path The PHP-syntax path to the value being validated.
	 * @param mixed $value The value to validate.
	 * @return bool|WP_Error Returns true if the data is valid, otherwise a WP_Error.
	 */
	private function check_non_primitive_type( array $type, string $path, mixed $value ): bool|WP_Error {
		switch ( Types::get_type_name( $type ) ) {
			case 'callable':
				if ( is_callable( $value ) ) {
					return true;
				}

				return $this->create_error( 'must be callable', $path );

			case 'const':
				$const_value = Types::get_type_args( $type );
				if ( $const_value === $value ) {
					return true;
				}

				return $this->create_error( sprintf( 'must equal the constant "%s"', $const_value ), $path );

			case 'enum':
				$enum_values = Types::get_type_args( $type );
				if ( in_array( $value, $enum_values, true ) ) {
					return true;
				}

				return $this->create_error( sprintf( 'must be one of the enumerated values: %s', join( ', ', $enum_values ) ), $path );

			case 'instance_of':
				$class_name = Types::get_type_args( $type );
				if ( is_a( $value, $class_name ) ) {
					return true;
				}

				return $this->create_error( sprintf( 'must be an instance of class "%s"', $class_name ), $path );

			case 'list_of':
				if ( ! is_array( $value ) || ! array_is_list( $value ) ) {
					return $this->create_error( 'must be a non-associative array', $path );
				}

				$member_type = Types::get_type_args( $type );

				foreach ( $value as $index => $item ) {
					$child_path = sprintf( '%s[%s]', $path, strval( $index ) );
					$validated = $this->check_type( $member_type, $child_path, $item );
					if ( is_wp_error( $validated ) ) {
						return $validated;
					}
				}

				return true;

			case 'one_of':
				// Keep track of all failed validations. Since one_of is a union type,
				// if none of the types match, we will return all of the errors so that
				// the caller can inspect each of them.
				$errors = [];

				$member_types = Types::get_type_args( $type );
				foreach ( $member_types as $member_type ) {
					$validated = $this->check_type( $member_type, $path, $value );
					if ( true === $validated ) {
						return true;
					}

					$errors[] = $validated;
				}

				$member_type_names = array_map( static function ( array $type ): string {
					return Types::get_type_name( $type );
				}, $member_types );

				return $this->create_error( sprintf( 'must match one of the specified types: %s', join( ', ', $member_type_names ) ), $path, [ 'child_errors' => $errors ] );

			case 'object':
				if ( ! self::check_iterable_object( $value ) ) {
					return $this->create_error( 'must be an associative array', $path );
				}

				foreach ( Types::get_type_args( $type ) as $key => $property_type ) {
					$child_path = sprintf( '%s[\'%s\']', $path, $key );
					$property_value = $this->get_object_key( $value, $key );
					$validated = $this->check_type( $property_type, $child_path, $property_value );
					if ( is_wp_error( $validated ) ) {
						return $validated;
					}
				}

				return true;

			case 'record':
				if ( ! self::check_iterable_object( $value ) ) {
					return $this->create_error( 'must be an associative array', $path );
				}

				$type_args = Types::get_type_args( $type );
				$key_type = $type_args[0];
				$value_type = $type_args[1];

				foreach ( $value as $key => $record_value ) {
					$child_path = sprintf( 'Key %s of %s', $key, $path );
					$validated = $this->check_type( $key_type, $child_path, $key );
					if ( is_wp_error( $validated ) ) {
						return $validated;
					}

					$child_path = sprintf( '%s[\'%s\']', $path, $key );
					$validated = $this->check_type( $value_type, $child_path, $record_value );
					if ( is_wp_error( $validated ) ) {
						return $validated;
					}
				}

				return true;

			case 'ref':
				return $this->check_type( Types::load_ref_type( $type ), $path, $value );

			case 'serialized_config_for':
				if ( ! self::check_iterable_object( $value ) ) {
					return $this->create_error( 'must be an associative array', $path );
				}

				$class_ref = Types::get_type_args( $type );

				if ( ! class_exists( $class_ref ) && ! interface_exists( $class_ref ) ) {
					return $this->create_error( sprintf( 'targets non-existent class "%s"', $class_ref ), $path );
				}

				$implements = class_implements( $class_ref );
				if ( ! in_array( ArraySerializableInterface::class, $implements, true ) ) {
					return $this->create_error( sprintf( 'targets class "%s" that does not implement ArraySerializableInterface', $class_ref ), $path );
				}

				// The config must provide a `__class` property so that we know which
				// class to inflate. This allows values to target subclasses of the
				// specified class and also provides disambiguation when the type is
				// used in a union type (one_of).
				$class_property = ArraySerializableInterface::CLASS_REF_ATTRIBUTE;
				$subclass = $value[ $class_property ] ?? null;
				if ( null === $subclass ) {
					return $this->create_error( sprintf( 'does not provide a %s property', $class_property ), $path );
				}

				if ( ! class_exists( $subclass ) ) {
					return $this->create_error( sprintf( 'targets non-existent subclass "%s"', $subclass ), $path );
				}

				if ( $subclass !== $class_ref && ! is_subclass_of( $subclass, $class_ref, true ) ) {
					return $this->create_error( sprintf( 'targets subclass "%s" that does not match or extend target class "%s"', $subclass, $class_ref ), $path );
				}

				// Done with type validation, update the target class so we can validate
				// the value / config.
				$class_ref = $subclass;

				// Validate the schema for the class we want to instantiate. Call the
				// config prepocessor since some classes inflate their own config.
				$config_validator = new Validator( $class_ref::get_config_schema(), $class_ref, $path );
				$config = $class_ref::preprocess_config( $value );

				return $config_validator->validate( $config );

			case 'string_matching':
				$regex = Types::get_type_args( $type );

				if ( $this->check_primitive_type( 'string', $path, $value ) && $this->check_primitive_type( 'string', $path, $regex ) && preg_match( $regex, $value ) ) {
					return true;
				}

				return $this->create_error( sprintf( 'must match regex "%s"', strval( $regex ) ), $path );

			default:
				return $this->create_error( sprintf( 'is unknown type "%s"', Types::get_type_name( $type ) ), $path );
		}
	}

	/**
	 * Validate a primitive value against a schema. This method returns true
	 * or a WP_Error object. Never check the return value for truthiness; either
	 * return the value directly or check it with is_wp_error().
	 *
	 * @param string $type_name The string name of the schema type to validate against.
	 * @param string $path The PHP-syntax path to the value being validated.
	 * @param mixed $value The value to validate.
	 * @return bool|WP_Error Returns true if the data is valid, otherwise a WP_Error.
	 */
	private function check_primitive_type( string $type_name, string $path, mixed $value ): bool|WP_Error {
		switch ( $type_name ) {
			case 'any':
				return true;
			case 'boolean':
				return is_bool( $value );
			case 'integer':
				return is_int( $value );
			case 'null':
				return is_null( $value );
			case 'number':
				return is_numeric( $value );
			case 'string':
				return is_string( $value );

			case 'currency_in_current_locale':
				return is_string( $value ) || is_numeric( $value );

			case 'email_address':
				return false !== is_email( $value );

			case 'html':
			case 'image_alt':
			case 'markdown':
			case 'title':
				return is_string( $value );

			case 'button_text':
			case 'id':
				return is_string( $value ) && ! empty( $value );

			case 'json_path':
				return is_string( $value ) && str_starts_with( $value, '$' );

			case 'button_url':
			case 'image_url':
			case 'url':
				return false !== filter_var( $value, FILTER_VALIDATE_URL );

			case 'uuid':
				return wp_is_uuid( $value );

			default:
				return $this->create_error( sprintf( 'is unknown type "%s"', $type_name ), $path );
		}
	}

	/*
	 * While an "object" in name, we expect this type to be implemented as an
	 * associative array since this is typically how humans represent objects in
	 * literal PHP code.
	 */
	public static function check_iterable_object( mixed $value ): bool {
		return is_array( $value ) && ( ! array_is_list( $value ) || empty( $value ) );
	}

	private function create_error( string $message, string $path, array $context = [] ): WP_Error {
		return new WP_Error( 'invalid_type', esc_html( sprintf( '%s %s', $path, $message ) ), [
			'context' => $context,
			'entity' => $this->entity_name,
			'level' => 'error',
			'path' => $path,
		] );
	}

	private function get_object_key( mixed $data, string|int $key ): mixed {
		return is_array( $data ) && array_key_exists( $key, $data ) ? $data[ $key ] : null;
	}
}
