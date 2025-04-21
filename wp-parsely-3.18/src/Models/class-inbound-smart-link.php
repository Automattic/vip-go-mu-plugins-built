<?php
/**
 * Model for Inbound Smart Link.
 *
 * @package Parsely
 * @since   3.16.0
 */

declare( strict_types = 1 );

namespace Parsely\Models;

use DOMDocument;
use ReflectionClass;
use WP_Post;

/**
 * Model for Inbound Smart Link.
 *
 * @since 3.16.0
 */
class Inbound_Smart_Link extends Smart_Link {

	/**
	 * The source post object.
	 *
	 * @since 3.16.0
	 *
	 * @var WP_Post|null The source post.
	 */
	private $source_post;

	/**
	 * The paragraph data.
	 *
	 * @since 3.16.0
	 *
	 * @var array<string,mixed>|null The paragraph data.
	 * @phpstan-var array{paragraph: string, is_first_paragraph: bool, is_last_paragraph: bool}|null
	 */
	private $paragraph_data;

	/**
	 * The post data.
	 *
	 * @since 3.16.0
	 *
	 * @var array<string,mixed>|null The post data.
	 */
	private $post_data;

	/**
	 * Serializes the model to a JSON string, and adds extra data.
	 *
	 * @since 3.16.0
	 *
	 * @return array<mixed> The serialized model.
	 */
	public function to_array(): array {
		$data = parent::to_array();

		$data['post_data'] = $this->get_post_data();

		return $data;
	}

	/**
	 * Checks if the Smart Link is linked to a post.
	 *
	 * @since 3.16.0
	 *
	 * @return bool True if the Smart Link is linked to a post, false otherwise.
	 */
	public function is_linked(): bool {
		$object_exists  = parent::exists();
		$paragraph_data = $this->get_post_data();

		// If the paragraph is empty, we assume that the Smart Link is not linked to a post.
		return $object_exists && '' !== $paragraph_data['paragraph'];
	}

	/**
	 * Gets the post data for the smart link.
	 *
	 * @since 3.16.0
	 *
	 * @return array<mixed> The post data.
	 */
	private function get_post_data(): array {
		if ( null !== $this->post_data ) {
			return $this->post_data;
		}

		if ( null === $this->source_post ) {
			$this->source_post = get_post( $this->source_post_id );
		}

		$post = $this->source_post;

		if ( ! $post instanceof WP_Post ) {
			return array();
		}

		// Get the post content.
		$content = $post->post_content;
		// Get the paragraph that has the smart link UID.
		$paragraph = $this->get_paragraph( $content );

		$author_name = get_the_author();
		if ( '' === $author_name ) {
			// If the author name is empty, use the author login name.
			$author_name = get_the_author_meta( 'user_login', intval( $post->post_author ) );
		}

		$post_type       = get_post_type_object( $post->post_type );
		$post_type_label = '';
		if ( null !== $post_type ) {
			$post_type_label = $post_type->labels->singular_name;
		}

		$this->post_data = array(
			'id'                 => $post->ID,
			'title'              => $post->post_title,
			'type'               => $post_type_label,
			'paragraph'          => $paragraph['paragraph'],
			'permalink'          => get_permalink( $post ),
			'edit_link'          => get_edit_post_link( $post, 'html' ),
			'is_first_paragraph' => $paragraph['is_first_paragraph'],
			'is_last_paragraph'  => $paragraph['is_last_paragraph'],
			'author'             => $author_name,
			'date'               => get_the_date( '', $post ),
			'image'              => get_the_post_thumbnail_url( $post, 'medium' ),
		);

		return $this->post_data;
	}

	/**
	 * Get the HTML paragraph that has the smart link UID.
	 *
	 * @since 3.16.0
	 *
	 * @param string $content The post content.
	 * @return array The paragraph that has the smart link uid, and if it is the first or last paragraph.
	 * @phpstan-return array{paragraph: string, is_first_paragraph: bool, is_last_paragraph: bool}
	 */
	private function get_paragraph( string $content ): array {
		if ( null !== $this->paragraph_data ) {
			return $this->paragraph_data;
		}

		$paragraph = '';
		if ( ! class_exists( 'DOMDocument' ) ) {
			return array(
				'paragraph'          =>
					'<p>' . __( 'Unable to fetch paragraph. DOMDocument is not available.', 'wp-parsely' ) . '</p>',
				'is_first_paragraph' => true,
				'is_last_paragraph'  => true,
			);
		}

		libxml_use_internal_errors( true );

		$dom = new DOMDocument();
		$dom->loadHTML( mb_convert_encoding( $content, 'HTML-ENTITIES', 'UTF-8' ), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );

		$errors = libxml_get_errors();
		if ( count( $errors ) > 0 ) {
			libxml_clear_errors();
			return array(
				'paragraph'          =>
					'<p>' . __( 'Unable to fetch paragraph. Error loading HTML.', 'wp-parsely' ) . '</p>',
				'is_first_paragraph' => true,
				'is_last_paragraph'  => true,
			);
		}

		// Fetch all paragraph tags.
		$paragraphs = $dom->getElementsByTagName( 'p' );

		$is_first_paragraph = true;
		$is_last_paragraph  = false;

		foreach ( $paragraphs as $p ) {
			// Check each anchor tag within the paragraph.
			$anchors = $p->getElementsByTagName( 'a' );
			foreach ( $anchors as $anchor ) {
				// Check if the data-smartlink attribute contains the UID.
				if ( $anchor->hasAttribute( 'data-smartlink' ) && stripos( $anchor->getAttribute( 'data-smartlink' ), $this->uid ) !== false ) {
					// Save the outer HTML of the paragraph.
					$is_first_paragraph = $p === $paragraphs->item( 0 );
					$is_last_paragraph  = $p === $paragraphs->item( $paragraphs->length - 1 );
					$paragraph          = $dom->saveHTML( $p );
					break 2;
				}
			}
		}

		if ( false === $paragraph ) {
			$paragraph = '<p>' . __( 'Unable to fetch paragraph.', 'wp-parsely' ) . '</p>';
		}

		$this->paragraph_data = array(
			'paragraph'          => $paragraph,
			'is_first_paragraph' => $is_first_paragraph,
			'is_last_paragraph'  => $is_last_paragraph,
		);

		return $this->paragraph_data;
	}

	/**
	 * Creates a new instance of an Inbound Smart Link from a Smart Link object.
	 *
	 * This is used to convert a Smart Link object to an Inbound Smart Link object.
	 *
	 * @since 3.16.0
	 *
	 * @param Smart_Link $smart_link The Smart Link object.
	 * @return Inbound_Smart_Link The Inbound Smart Link object.
	 */
	public static function from_smart_link( Smart_Link $smart_link ): Inbound_Smart_Link {
		$inbound_smart_link = new self( '', '', '', 0 );
		$reflection_class   = new ReflectionClass( $smart_link );

		foreach ( $reflection_class->getProperties() as $property ) {
			// Make the property accessible.
			$property->setAccessible( true );
			$value = $property->getValue( $smart_link );
			// Copy the property value.
			$property->setValue( $inbound_smart_link, $value );
		}

		return $inbound_smart_link;
	}
}
