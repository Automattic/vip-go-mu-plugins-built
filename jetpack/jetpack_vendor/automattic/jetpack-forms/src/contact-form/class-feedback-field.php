<?php
/**
 * Feedback_Field class.
 *
 * @package automattic/jetpack-forms
 */

namespace Automattic\Jetpack\Forms\ContactForm;

/**
 * Feedback field class.
 *
 * Represents the submitted form data of an individual field.
 */
class Feedback_Field {

	/**
	 * The key of the field.
	 *
	 * @var string
	 */
	private $key;

	/**
	 * The label of the field.
	 *
	 * @var string
	 */
	private $label;

	/**
	 * The value of the field.
	 *
	 * @var mixed
	 */
	private $value;

	/**
	 * The type of the field.
	 *
	 * @var string
	 */
	private $type;

	/**
	 * Additional metadata for the field.
	 *
	 * @var array
	 */
	private $meta;

	/**
	 * Constructor.
	 *
	 * @param string $key   The key of the field.
	 * @param mixed  $label The label of the field. Non-string values will be converted to empty string.
	 * @param mixed  $value The value of the field.
	 * @param string $type  The type of the field (default is 'basic').
	 * @param array  $meta  Additional metadata for the field (default is an empty array).
	 */
	public function __construct( $key, $label, $value, $type = 'basic', $meta = array() ) {
		$this->key   = $key;
		$this->label = is_string( $label ) ? html_entity_decode( $label, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) : '';
		$this->value = $value;
		$this->type  = $type;
		$this->meta  = $meta;
	}

	/**
	 * Get the value of the field.
	 *
	 * @return string
	 */
	public function get_key() {
		return $this->key;
	}

	/**
	 * Get the label of the field.
	 *
	 * @param string $context The context in which the label is being rendered (default is 'default').
	 * @param int    $count   The count of the label occurrences (default is 1).
	 *
	 * @return string
	 */
	public function get_label( $context = 'default', $count = 1 ) {

		$postfix = $count > 1 ? " ({$count})" : '';

		if ( 'api' === $context ) {
			if ( empty( $this->label ) ) {
				return __( 'Field', 'jetpack-forms' ) . $postfix;
			}

			return $this->label . $postfix;
		}

		return $this->label . $postfix;
	}

	/**
	 * Get the value of the field.
	 *
	 * @return mixed
	 */
	public function get_value() {
		return $this->value;
	}

	/**
	 * Get the value of the field for rendering.
	 *
	 * @param string $context The context in which the value is being rendered (default is 'default').
	 *
	 * @return string
	 */
	public function get_render_value( $context = 'default' ) {
		switch ( $context ) {
			case 'api':
				return $this->get_render_api_value();
			case 'default':
			default:
				return $this->get_render_default_value();
		}
	}

	/**
	 * Get the default value of the field for rendering.
	 *
	 * @return string
	 */
	private function get_render_default_value() {
		if ( $this->is_of_type( 'file' ) ) {
			$files = array();
			foreach ( $this->value['files'] as &$file ) {
				if ( ! isset( $file['size'] ) || ! isset( $file['file_id'] ) ) {
					// this shouldn't happen, todo: log this
					continue;
				}
				$file_name = $file['name'] ?? __( 'Attached file', 'jetpack-forms' );
				$file_size = isset( $file['size'] ) ? size_format( $file['size'] ) : '';
				$files[]   = $file_name . ' (' . $file_size . ')';
			}
			return implode( ', ', $files );
		}

		if ( is_array( $this->value ) ) {
			return implode( ', ', $this->value );
		}

		return $this->value;
	}

	/**
	 * Get the value of the field for the API.
	 *
	 * @return string
	 */
	private function get_render_api_value() {

		if ( $this->is_of_type( 'file' ) ) {
			$files = array();
			foreach ( $this->value['files'] as &$file ) {
				if ( ! isset( $file['size'] ) || ! isset( $file['file_id'] ) ) {
					// this shouldn't happen, todo: log this
					continue;
				}
				$file_id                = absint( $file['file_id'] );
				$file['file_id']        = $file_id;
				$file['size']           = size_format( $file['size'] );
				$file['url']            = apply_filters( 'jetpack_unauth_file_download_url', '', $file_id );
				$file['is_previewable'] = $this->is_previewable_file( $file );
				$files[]                = $file;
			}
			$this->value['files'] = $files;
			return $this->value;
		}

		if ( is_array( $this->value ) ) {
			// If the value is an array, we can return it as a JSON string.
			return implode( ', ', $this->value );
		}
		// This method is deprecated, use render_value instead.
		return $this->value;
	}
	/**
	 * Check if the field is of a specific type.
	 *
	 * @param string $type The type to check against.
	 *
	 * @return bool True if the field is of the specified type, false otherwise.
	 */
	public function is_of_type( $type ) {
		return $this->type === $type;
	}

	/**
	 * Check if the field should be compiled.
	 *
	 * @return bool
	 */
	public function compile_field() {
		return $this->get_meta_key_value( 'render' ) === false;
	}

	/**
	 * Get the type of the field.
	 *
	 * @return string
	 */
	public function get_type() {
		return $this->type;
	}

	/**
	 * Get the meta array of the field.
	 *
	 * @return array
	 */
	public function get_meta() {
		return $this->meta;
	}

	/**
	 * Get a specific meta value by key.
	 *
	 * @param string $meta_key The key of the meta to retrieve.
	 *
	 * @return mixed|null Returns the value of the meta key if it exists, null otherwise.
	 */
	public function get_meta_key_value( $meta_key ) {
		if ( isset( $this->meta[ $meta_key ] ) ) {
			return $this->meta[ $meta_key ];
		}
		return null;
	}

	/**
	 * Get the serialized representation of the field.
	 *
	 * @return array
	 */
	public function serialize() {
		return array(
			'key'   => $this->get_key(),
			'label' => $this->get_label(),
			'value' => $this->get_value(),
			'type'  => $this->get_type(),
			'meta'  => $this->get_meta(),
		);
	}
	/**
	 * Create a Feedback_Field object from serialized data.
	 *
	 * @param array $data The serialized data.
	 *
	 * @return Feedback_Field|null Returns a Feedback_Field object or null if the data is invalid.
	 */
	public static function from_serialized( $data ) {
		if ( ! is_array( $data ) || ! isset( $data['key'] ) || ! isset( $data['value'] ) || ! isset( $data['label'] ) ) {
			return null;
		}

		return new self(
			$data['key'],
			$data['label'],
			$data['value'],
			$data['type'] ?? 'basic',
			$data['meta'] ?? array()
		);
	}

	/**
	 * Check if the field has a file
	 *
	 * @return bool
	 */
	public function has_file() {
		if ( $this->is_of_type( 'file' ) ) {
			if ( ! isset( $this->value['files'] ) || ! is_array( $this->value['files'] ) ) {
				return false;
			}
			return count( $this->value['files'] ) > 0;
		}

		return false;
	}

	/**
	 * Checks if the file is previewable based on its type or extension.
	 *
	 * @param array $file File data.
	 * @return bool True if the file is previewable, false otherwise.
	 */
	private function is_previewable_file( $file ) {
		$file_type = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );
		// Check if the file is previewable based on its type or extension.
		// Note: This is a simplified check and does not match if the file is allowed to be uploaded by the server.
		$previewable_types = array( 'jpg', 'jpeg', 'png', 'gif', 'webp' );
		return in_array( $file_type, $previewable_types, true );
	}
}
