<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config;

use RemoteDataBlocks\Sanitization\Sanitizer;
use RemoteDataBlocks\Validation\Validator;
use RemoteDataBlocks\Validation\ValidatorInterface;
use WP_Error;

defined( 'ABSPATH' ) || exit();

/**
 * ArraySerializable class
 */
abstract class ArraySerializable implements ArraySerializableInterface {
	final private function __construct( protected array $config ) {}

	protected function get_or_call_from_config( string $property_name, mixed ...$callable_args ): mixed {
		$config_value = $this->config[ $property_name ] ?? null;

		if ( is_callable( $config_value ) ) {
			return call_user_func_array( $config_value, $callable_args );
		}

		return $config_value;
	}

	/**
	 * @inheritDoc
	 */
	final public static function from_array( array $config, ?ValidatorInterface $validator = null ): static|WP_Error {
		$subclass = static::get_implementor( $config );
		if ( null !== $subclass ) {
			return $subclass::from_array( $config, $validator );
		}

		$config = static::preprocess_config( $config );
		if ( is_wp_error( $config ) ) {
			return $config;
		}

		$schema = static::get_config_schema();

		$validator = $validator ?? new Validator( $schema, static::class );
		$validated = $validator->validate( $config );

		if ( is_wp_error( $validated ) ) {
			return $validated;
		}

		$sanitizer = new Sanitizer( $schema );
		$sanitized = $sanitizer->sanitize( $config );

		return new static( $sanitized );
	}

	/**
	 * @inheritDoc
	 */
	public function to_array(): array {
		return array_merge( $this->config, [ self::CLASS_REF_ATTRIBUTE => static::class ] );
	}

	/**
	 * @inheritDoc
	 */
	public static function preprocess_config( array $config ): array|WP_Error {
		return $config;
	}

	/**
	 * The config can provide a `__class` property that indicates that we should
	 * inflate using a specific implementor class.
	 */
	protected static function get_implementor( array $config ): ?string {
		$subclass = $config[ self::CLASS_REF_ATTRIBUTE ] ?? null;

		if (
			null === $subclass ||
			static::class === $subclass ||
			! class_exists( $subclass ) ||
			! in_array( ArraySerializableInterface::class, class_implements( $subclass ), true )
		) {
			return null;
		}

		return $subclass;
	}

	/**
	 * @inheritDoc
	 */
	abstract public static function get_config_schema(): array;
}
