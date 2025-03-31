<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Validation;

use RemoteDataBlocks\Config\ArraySerializableInterface;
use RemoteDataBlocks\Validation\Types;
use RemoteDataBlocks\Logging\LoggerManager;
use WP_Error;
use function is_email;

/**
 * Validator class.
 */
final class Validator implements ValidatorInterface {
	public function __construct( private array $schema, private string $description = 'Validator' ) {}

	public function validate( mixed $data ): bool|WP_Error {
		$validation = $this->check_type( $this->schema, $data );

		if ( is_wp_error( $validation ) ) {
			$error_message = sprintf( '[%s] %s', $this->description, $validation->get_error_message() );

			$child_error = $validation->get_error_data()['child'] ?? null;
			while ( is_wp_error( $child_error ) ) {
				$error_message .= sprintf( '; %s', $child_error->get_error_message() );
				$child_error = $child_error->get_error_data()['child'] ?? null;
			}

			LoggerManager::instance()->error( $error_message );
			return $validation;
		}

		return true;
	}

	/**
	 * Validate a value recursively against a schema.
	 *
	 * @param array<string, mixed> $type The schema to validate against.
	 * @param mixed $value The value to validate.
	 * @return bool|WP_Error Returns true if the data is valid, otherwise a WP_Error.
	 */
	private function check_type( array $type, mixed $value = null ): bool|WP_Error {
		if ( Types::is_nullable( $type ) && is_null( $value ) ) {
			return true;
		}

		if ( Types::is_primitive( $type ) ) {
			$type_name = Types::get_type_name( $type );
			$result = $this->check_primitive_type( $type_name, $value );

			if ( true === $result ) {
				return true;
			}

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			return $this->create_error( sprintf( 'Value must be a %s', $type_name ), $value );
		}

		return $this->check_non_primitive_type( $type, $value );
	}

	/**
	 * Validate a non-primitive value against a schema. This method returns true
	 * or a WP_Error object. Never check the return value for truthiness; either
	 * return the value directly or check it with is_wp_error().
	 *
	 * @param array<string, mixed> $type The schema type to validate against.
	 * @param mixed $value The value to validate.
	 * @return bool|WP_Error Returns true if the data is valid, otherwise a WP_Error.
	 */
	private function check_non_primitive_type( array $type, mixed $value ): bool|WP_Error {
		switch ( Types::get_type_name( $type ) ) {
			case 'callable':
				if ( is_callable( $value ) ) {
					return true;
				}

				return $this->create_error( 'Value must be callable', $value );

			case 'const':
				if ( Types::get_type_args( $type ) === $value ) {
					return true;
				}

				return $this->create_error( 'Value must be the constant', $value );

			case 'enum':
				if ( in_array( $value, Types::get_type_args( $type ), true ) ) {
					return true;
				}

				return $this->create_error( 'Value must be one of the enumerated values', $value );

			case 'instance_of':
				if ( is_a( $value, Types::get_type_args( $type ) ) ) {
					return true;
				}

				return $this->create_error( 'Value must be an instance of the specified class', $value );

			case 'list_of':
				if ( ! is_array( $value ) || ! array_is_list( $value ) ) {
					return $this->create_error( 'Value must be a non-associative array', $value );
				}

				$member_type = Types::get_type_args( $type );

				foreach ( $value as $item ) {
					$validated = $this->check_type( $member_type, $item );
					if ( is_wp_error( $validated ) ) {
						return $this->create_error( 'Value must be a list of the specified type', $item, $validated );
					}
				}

				return true;

			case 'one_of':
				// Keep track of all failed validations. Since one_of is a union type,
				// if none of the types match, we will return all of the errors so that
				// the caller can inspect each of them.
				$errors = [];

				foreach ( Types::get_type_args( $type ) as $member_type ) {
					$validated = $this->check_type( $member_type, $value );
					if ( true === $validated ) {
						return true;
					}

					$errors[] = $validated;
				}

				$error = new WP_Error( 'invalid_one_of_type', 'Validation errors for each of the specified types', [ 'errors' => $errors ] );

				return $this->create_error( 'Value must be one of the specified types', $value, $error );

			case 'object':
				if ( ! self::check_iterable_object( $value ) ) {
					return $this->create_error( 'Value must be an associative array', $value );
				}

				foreach ( Types::get_type_args( $type ) as $key => $property_type ) {
					$property_value = $this->get_object_key( $value, $key );
					$validated = $this->check_type( $property_type, $property_value );
					if ( is_wp_error( $validated ) ) {
						return $this->create_error( 'Object must have valid property', $key, $validated );
					}
				}

				return true;

			case 'record':
				if ( ! self::check_iterable_object( $value ) ) {
					return $this->create_error( 'Value must be an associative array', $value );
				}

				$type_args = Types::get_type_args( $type );
				$key_type = $type_args[0];
				$value_type = $type_args[1];

				foreach ( $value as $key => $record_value ) {
					$validated = $this->check_type( $key_type, $key );
					if ( is_wp_error( $validated ) ) {
						return $this->create_error( 'Record must have valid key', $key );
					}

					$validated = $this->check_type( $value_type, $record_value );
					if ( is_wp_error( $validated ) ) {
						return $this->create_error( 'Record must have valid value', $record_value, $validated );
					}
				}

				return true;

			case 'ref':
				return $this->check_type( Types::load_ref_type( $type ), $value );

			case 'serialized_config_for':
				if ( ! self::check_iterable_object( $value ) ) {
					return $this->create_error( 'Value must be an associative array', $value );
				}

				$class_ref = Types::get_type_args( $type );

				if ( ! class_exists( $class_ref ) && ! interface_exists( $class_ref ) ) {
					return $this->create_error( 'Class does not exist', $class_ref );
				}

				$implements = class_implements( $class_ref );
				if ( ! in_array( ArraySerializableInterface::class, $implements, true ) ) {
					return $this->create_error( 'Class does not implement ArraySerializableInterface', $class_ref );
				}

				// The config must provide a `__class` property so that we know which
				// class to inflate. This allows values to target subclasses of the
				// specified class and also provides disambiguation when the type is
				// used in a union type (one_of).
				$subclass = $value[ ArraySerializableInterface::CLASS_REF_ATTRIBUTE ] ?? null;
				if ( null === $subclass ) {
					return $this->create_error( 'Value does not provide a __class property', $class_ref );
				}

				$class_description = sprintf( 'Class %s specified by %s property', $subclass, ArraySerializableInterface::CLASS_REF_ATTRIBUTE );

				if ( ! class_exists( $subclass ) ) {
					return $this->create_error( $class_description . ' does not exist', $subclass );
				}

				if ( $subclass !== $class_ref && ! is_subclass_of( $subclass, $class_ref, true ) ) {
					return $this->create_error( $class_description . ' must match or be a subclass of the target class', $subclass );
				}

				// Done with type validation, update the target class so we can validate
				// the value / config.
				$class_ref = $subclass;

				// Validate the schema for the class we want to instantiate. Call the
				// config prepocessor since some classes inflate their own config.
				$config_validator = new Validator( $class_ref::get_config_schema(), $class_ref );
				$config = $class_ref::preprocess_config( $value );

				return $config_validator->validate( $config );

			case 'string_matching':
				$regex = Types::get_type_args( $type );

				if ( $this->check_primitive_type( 'string', $value ) && $this->check_primitive_type( 'string', $regex ) && preg_match( $regex, $value ) ) {
					return true;
				}

				return $this->create_error( 'Value must match the specified regex', $value );

			default:
				return $this->create_error( 'Unknown type', Types::get_type_name( $type ) );
		}
	}

	private function check_primitive_type( string $type_name, mixed $value ): bool|WP_Error {
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
				return $this->create_error( 'Unknown type', $type_name );
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

	private function create_error( string $message, mixed $value, ?WP_Error $child_error = null ): WP_Error {
		$serialized_value = is_string( $value ) || is_numeric( $value ) ? strval( $value ) : wp_json_encode( $value );
		$message = sprintf( '%s: %s', esc_html( $message ), $serialized_value );
		return new WP_Error( 'invalid_type', $message, [ 'child' => $child_error ] );
	}

	private function get_object_key( mixed $data, string|int $key ): mixed {
		return is_array( $data ) && array_key_exists( $key, $data ) ? $data[ $key ] : null;
	}
}
