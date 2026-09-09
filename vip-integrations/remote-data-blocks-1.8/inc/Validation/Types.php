<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Validation;

defined( 'ABSPATH' ) || exit();

/**
 * Types class
 *
 * Provides a set of static methods that return values representing the types of
 * data that can be used in a schema.
 *
 * If a method requires a type name, it always matches the method name used to
 * create the type (e.g., `Types::string()` returns the "string" type).
 */
final class Types {
	private const ARGS_PROP = '@args';
	private const NULLABLE_PROP = '@nullable';
	private const PRIMITIVE_PROP = '@primitive';
	private const REF_PROP = '@ref';
	private const SANITIZE_PROP = '@sanitize';
	private const SERIALIZABLE_PROP = '@serializable';
	private const TYPE_PROP = '@type';

	/** @var array<string, array<string, mixed>> */
	private static array $ref_store = [];

	/* === CORE PRIMITIVE TYPES === */
	/* Primitive types do not accept type arguments! */

	public static function any(): array {
		return self::skip_sanitize( self::generate_primitive_type( 'any' ) );
	}

	public static function boolean(): array {
		return self::generate_primitive_type( 'boolean' );
	}

	public static function integer(): array {
		return self::generate_primitive_type( 'integer' );
	}

	public static function null(): array {
		return self::generate_primitive_type( 'null' );
	}

	public static function number(): array {
		return self::generate_primitive_type( 'number' );
	}

	public static function string(): array {
		return self::generate_primitive_type( 'string' );
	}


	/* === EXTENDED STRING PRIMITIVE TYPES === */
	/* Primitive types do not accept type arguments! */

	public static function button_text(): array {
		return self::generate_primitive_type( 'button_text' );
	}

	public static function button_url(): array {
		return self::generate_primitive_type( 'button_url' );
	}

	/**
	 * A currency value in the current locale. Since primitive types do not accept
	 * arguments, this type inherits the locale from the current environment.
	 */
	public static function currency_in_current_locale(): array {
		return self::generate_primitive_type( 'currency_in_current_locale' );
	}

	public static function email_address(): array {
		return self::generate_primitive_type( 'email_address' );
	}

	public static function html(): array {
		return self::generate_primitive_type( 'html' );
	}

	public static function id(): array {
		return self::generate_primitive_type( 'id' );
	}

	public static function image_alt(): array {
		return self::generate_primitive_type( 'image_alt' );
	}

	public static function image_url(): array {
		return self::generate_primitive_type( 'image_url' );
	}

	public static function json_path(): array {
		return self::generate_primitive_type( 'json_path' );
	}

	public static function markdown(): array {
		return self::generate_primitive_type( 'markdown' );
	}

	public static function url(): array {
		return self::generate_primitive_type( 'url' );
	}

	public static function title(): array {
		return self::generate_primitive_type( 'title' );
	}

	public static function uuid(): array {
		return self::generate_primitive_type( 'uuid' );
	}


	/* === TRANSFORMATIVE TYPES === */

	/**
	 * All types are required by default. This transformation is used to make a type nullable / optional.
	 */
	public static function nullable( array $type ): array {
		self::check_type( $type );

		return array_merge( $type, [ self::NULLABLE_PROP => true ] );
	}

	/**
	 * Data is sanitized by default according to its type (e.g., data with a string
	 * type is passed through `sanitize_text_field`). This transformation is used
	 * to exempt a primitive type from sanitization.
	 */
	public static function skip_sanitize( array $type ): array {
		self::check_type( $type );

		if ( ! self::is_primitive( $type ) ) {
			throw new \InvalidArgumentException( 'Sanitization can only be skipped for primitive types.' );
		}

		return array_merge( $type, [ self::SANITIZE_PROP => false ] );
	}


	/* === NON-PRIMITIVE TYPES === */

	public static function const( mixed $value ): array {
		return self::generate_non_primitive_type( 'const', $value );
	}

	public static function enum( string ...$values ): array {
		if ( ! is_array( $values ) || empty( $values ) ) {
			throw new \InvalidArgumentException( 'An enum type must provide an array of at least one value.' );
		}

		return self::generate_non_primitive_type( 'enum', $values );
	}

	public static function instance_of( string $instance_ref ): array {
		return self::generate_non_primitive_type( 'instance_of', $instance_ref );
	}

	public static function list_of( array $member_type ): array {
		self::check_type( $member_type );

		$allowed_non_primitive_member_types = [ 'const', 'enum', 'instance_of', 'object', 'record', 'string_matching' ];
		$is_primitive = self::is_primitive( $member_type );
		$member_type_name = self::get_type_name( $member_type );

		if ( ! $is_primitive && ! in_array( $member_type_name, $allowed_non_primitive_member_types, true ) ) {
			throw new \InvalidArgumentException( sprintf( "Invalid member type '%s' for list_of.", esc_html( $member_type_name ) ) );
		}

		return self::generate_non_primitive_type( 'list_of', $member_type );
	}

	// This type is equivalent to an `any` type with exclusions.
	public static function not( array ...$array_of_excluded_types ): array {
		foreach ( $array_of_excluded_types as $type ) {
			self::check_type( $type );
		}

		return self::generate_non_primitive_type( 'not', $array_of_excluded_types );
	}

	public static function object( array $properties ): array {
		return self::generate_non_primitive_type( 'object', $properties );
	}

	public static function one_of( array ...$member_types ): array {
		foreach ( $member_types as $member_type ) {
			self::check_type( $member_type );

			$allowed_non_primitive_member_types = [
				'callable',
				'const',
				'enum',
				'instance_of',
				'object',
				'record',
				'ref',
				'serialized_config_for',
				'string_matching',
			];
			$is_primitive = self::is_primitive( $member_type );
			$member_type_name = self::get_type_name( $member_type );

			if ( ! $is_primitive && ! in_array( $member_type_name, $allowed_non_primitive_member_types, true ) ) {
				throw new \InvalidArgumentException( sprintf( "Invalid member type '%s' for one_of.", esc_html( $member_type_name ) ) );
			}
		}

		return self::generate_non_primitive_type( 'one_of', $member_types );
	}

	public static function record( array $key_type, array $value_type ): array {
		self::check_type( $key_type );
		self::check_type( $value_type );

		$allowed_key_types = [ 'integer', 'string' ];
		$key_type_name = self::get_type_name( $key_type );
		if ( ! in_array( $key_type_name, $allowed_key_types, true ) ) {
			throw new \InvalidArgumentException( sprintf( "Invalid key type '%s' for record.", esc_html( $key_type_name ) ) );
		}

		return self::generate_non_primitive_type( 'record', [ $key_type, $value_type ] );
	}

	// This type indicates that the value is a serialized array that can be used
	// to inflate a class instance, e.g., HttpQuery::from_array( $value ).
	public static function serialized_config_for( string $class_ref ): array {
		if ( ! class_exists( $class_ref ) ) {
			throw new \InvalidArgumentException( sprintf( "Class '%s' does not exist.", esc_html( $class_ref ) ) );
		}

		return self::generate_non_primitive_type( 'serialized_config_for', $class_ref );
	}

	public static function string_matching( string $regex ): array {
		return self::generate_non_primitive_type( 'string_matching', $regex );
	}


	/* === UNSERIALIZABLE TYPES === */

	public static function callable(): array {
		return self::generate_unserializable_type( 'callable' );
	}


	/* === REFERENCE TYPES === */

	/**
	 * Create a reference to a type that can be used later.
	 *
	 * @see use_ref()
	 */
	public static function create_ref( string $ref, array $type ): array {
		self::check_type( $type );

		$allowed_types = [ 'object' ];
		$type_name = self::get_type_name( $type );

		if ( ! in_array( $type_name, $allowed_types, true ) ) {
			throw new \InvalidArgumentException( sprintf( "Cannot create ref for '%s' type.", esc_html( $type_name ) ) );
		}

		self::$ref_store[ $ref ] = $type;

		return array_merge( $type, [ self::REF_PROP => $ref ] );
	}

	/**
	 * Refer to an already created type (allows recursive types).
	 *
	 * @see create_ref()
	 */
	public static function use_ref( string $ref ): array {
		return self::generate_unserializable_type( 'ref', $ref );
	}


	/* === HELPER METHODS === */
	/* These methods operate on types, not values! For data validation, use a Validator. */

	private static function check_type( mixed $type ): void {
		if ( ! is_array( $type ) || ! isset( $type[ self::TYPE_PROP ] ) || ! is_string( $type[ self::TYPE_PROP ] ) ) {
			throw new \InvalidArgumentException( sprintf( 'A type must be an associative array with a %s property', esc_html( self::TYPE_PROP ) ) );
		}
	}

	public static function get_type_args( array $type ): mixed {
		self::check_type( $type );

		if ( self::is_primitive( $type ) ) {
			throw new \InvalidArgumentException( 'Primitive types cannot have arguments.' );
		}

		return $type[ self::ARGS_PROP ] ?? null;
	}

	public static function get_type_name( array $type ): string {
		self::check_type( $type );

		return $type[ self::TYPE_PROP ];
	}

	public static function is_nullable( array $type ): bool {
		self::check_type( $type );

		return $type[ self::NULLABLE_PROP ] ?? false;
	}

	public static function is_primitive( array $type ): bool {
		self::check_type( $type );

		return $type[ self::PRIMITIVE_PROP ] ?? false;
	}

	public static function is_sanitizable( array $type ): bool {
		self::check_type( $type );

		return $type[ self::SANITIZE_PROP ] ?? true;
	}

	public static function is_serializable( array $type ): bool {
		self::check_type( $type );

		return $type[ self::SERIALIZABLE_PROP ] ?? true;
	}

	private static function is_type( string $type_name, array ...$types_to_check ): bool {
		return array_reduce( $types_to_check, function ( bool $carry, array $type ) use ( $type_name ): bool {
			self::check_type( $type );

			return $carry && self::get_type_name( $type ) === $type_name;
		}, true );
	}

	private static function generate_primitive_type( string $type_name ): array {
		return [
			self::PRIMITIVE_PROP => true,
			self::TYPE_PROP => $type_name,
		];
	}

	private static function generate_non_primitive_type( string $type_name, mixed $type_args = null ): array {
		return [
			self::ARGS_PROP => $type_args,
			self::PRIMITIVE_PROP => false,
			self::TYPE_PROP => $type_name,
		];
	}

	private static function generate_unserializable_type( string $type_name, mixed $type_args = null ): array {
		return [
			self::ARGS_PROP => $type_args,
			self::PRIMITIVE_PROP => false,
			self::SERIALIZABLE_PROP => false,
			self::TYPE_PROP => $type_name,
		];
	}

	/**
	 * Internal library use only. Types stay as references until they are needed
	 * for data validation.
	 */
	public static function load_ref_type( array $ref_type ): array {
		self::check_type( $ref_type );

		if ( ! self::is_type( 'ref', $ref_type ) ) {
			throw new \InvalidArgumentException( 'Provided type is not a ref type.' );
		}

		$ref = self::get_type_args( $ref_type );
		if ( ! isset( self::$ref_store[ $ref ] ) ) {
			throw new \InvalidArgumentException( sprintf( "Unknown ref '%s'.", esc_html( $ref ) ) );
		}

		return self::$ref_store[ $ref ];
	}

	public static function merge_object_types( array ...$types ): array {
		if ( ! self::is_type( 'object', ...$types ) ) {
			throw new \InvalidArgumentException( 'Provided types are not all object types.' );
		}

		$merged_properties = array_reduce( $types, function ( array $carry, array $type ): array {
			return array_merge( $carry, self::get_type_args( $type ) );
		}, [] );

		return self::object( $merged_properties );
	}
}
