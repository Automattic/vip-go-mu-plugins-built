<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config;

use RemoteDataBlocks\Validation\ValidatorInterface;
use WP_Error;

interface ArraySerializableInterface {
	final public const CLASS_REF_ATTRIBUTE = '__class';

	/**
	 * Creates an instance of the class from an array representation.
	 *
	 * This static method is used to construct an object of the implementing class
	 * using data provided in an array format. It's particularly useful for
	 * deserialization or when creating objects from structured data (e.g., JSON).
	 *
	 * @param array<string, mixed> $config An associative array containing the configuration or data needed to create an instance of the class.
	 * @param ValidatorInterface|null $validator An optional validator instance to use for validating the configuration.
	 * @return mixed Returns a new instance of the implementing class.
	 */
	public static function from_array( array $config, ?ValidatorInterface $validator ): static|WP_Error;

	/**
	 * This method will be called by ::from_array() to prior to validating the
	 * config. This allows you to modify the config before it's validated, perhaps
	 * because you want to inflate it with additional or computed values.
	 *
	 * @param array<string, mixed> $config The configuration to process.
	 * @return array<string, mixed> The processed configuration.
	 */
	public static function preprocess_config( array $config ): array|WP_Error;

	/**
	 * Provides the schema that will be use the validate the config passed to
	 * from_array().
	 *
	 * @return array An associative array representing the configuration schema.
	 */
	public static function get_config_schema(): array;

	/**
	 * Converts the current object to an array representation.
	 *
	 * This method serializes the object's state into an array format. It's useful
	 * for data persistence, API responses, or any scenario where the object needs
	 * to be represented as a simple array structure.
	 *
	 * @return array<string, mixed> An associative array representing the object's current state.
	 */
	public function to_array(): array;
}
