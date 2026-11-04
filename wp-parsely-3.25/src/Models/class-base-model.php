<?php
/**
 * Base model class for all Parse.ly models
 *
 * @package Parsely
 * @since   3.16.0
 */

declare(strict_types=1);

namespace Parsely\Models;

/**
 * Base model class for all Parse.ly models.
 *
 * @since 3.16.0
 */
abstract class Base_Model {
	/**
	 * The unique ID of the model.
	 *
	 * @since 3.16.0
	 * @var string The unique ID of the model.
	 */
	public $uid;

	/**
	 * Base model constructor.
	 *
	 * @since 3.16.0
	 */
	public function __construct() {
		$this->uid = $this->generate_uid();
	}

	/**
	 * Returns the unique ID of the model.
	 *
	 * @since 3.16.0
	 *
	 * @return string The unique ID of the model.
	 */
	public function get_uid(): string {
		return $this->uid;
	}

	/**
	 * Generates a unique ID for the model.
	 *
	 * @since 3.16.0
	 *
	 * @return string The generated unique ID.
	 */
	abstract protected function generate_uid(): string;

	/**
	 * Serializes the model to a JSON string.
	 *
	 * @since 3.16.0
	 *
	 * @return string The serialized model.
	 */
	public function serialize(): string {
		$json = wp_json_encode( $this->to_array() );

		if ( false === $json ) {
			$json = '{}';
		}

		return $json;
	}

	/**
	 * Converts the model to an array.
	 *
	 * @since 3.16.0
	 *
	 * @return array<mixed> The model as an array.
	 */
	abstract public function to_array(): array;

	/**
	 * Deserializes a JSON string to a model.
	 *
	 * @since 3.16.0
	 *
	 * @param string $json The JSON string to deserialize.
	 * @return Base_Model The deserialized model.
	 */
	abstract public static function deserialize( string $json ): Base_Model;

	/**
	 * Saves the model to the database.
	 *
	 * @since 3.16.0
	 *
	 * @return bool True if the model was saved successfully, false otherwise.
	 */
	abstract public function save(): bool;
}
