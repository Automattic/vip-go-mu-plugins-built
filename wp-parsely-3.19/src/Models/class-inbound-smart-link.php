<?php
/**
 * Model for Inbound Smart Link.
 *
 * @package Parsely
 * @since   3.16.0
 */

declare( strict_types = 1 );

namespace Parsely\Models;

use Masterminds\HTML5;
use Parsely\Parsely;
use Parsely\Utils\Utils;
use ReflectionClass;
use WP_Post;
use WP_Error;

use const Parsely\PARSELY_CACHE_GROUP;

/**
 * Model for Inbound Smart Link.
 *
 * @since 3.16.0
 *
 * @phpstan-type ParagraphData array{
 *     paragraph: string,
 *     is_first_paragraph: bool,
 *     is_last_paragraph: bool,
 *     paragraph_offset: int
 * }
 *
 * @phpstan-type SmartLinkPostData array{
 *     id: int,
 *     title: string,
 *     type: array{
 *         name: string,
 *         label: string,
 *         rest: string,
 *     },
 *     paragraph: string,
 *     is_first_paragraph: bool,
 *     is_last_paragraph: bool,
 *     paragraph_offset: int,
 *     permalink: string,
 *     parsely_canonical_url: string,
 *     edit_link: string,
 *     author: string,
 *     date: string,
 *     image: string,
 * }
 */
class Inbound_Smart_Link extends Smart_Link {
	/**
	 * Allowed HTML tags that can contain a smart link.
	 *
	 * @since 3.19.0
	 *
	 * @var array<string> The allowed tags.
	 */
	private const ALLOWED_TAGS = array( 'p', 'ul' );

	/**
	 * The paragraph data.
	 *
	 * @since 3.16.0
	 *
	 * @var ParagraphData|null The paragraph data.
	 */
	private $paragraph_data;

	/**
	 * The post data.
	 *
	 * @since 3.16.0
	 *
	 * @var SmartLinkPostData|null The post data.
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

		// If the smart link is not applied, check if it has a valid placement.
		if ( ! $this->is_applied() ) {
			$has_valid_placement = $this->has_valid_placement( true );

			if ( is_wp_error( $has_valid_placement ) ) {
				$data['validation'] = array(
					'valid'  => false,
					'reason' => $has_valid_placement->get_error_message(),
				);
			} else {
				$data['validation'] = array(
					'valid' => true,
				);
			}
		}

		// If the smart link is applied, check if it is a link replacement.
		if ( $this->is_applied() ) {
			$previous_link_attributes = get_post_meta( $this->smart_link_id, '_traffic_boost_original_link_attributes', true );
			if ( '' !== $previous_link_attributes ) {
				$data['is_link_replacement'] = true;
			}
		}

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
		$object_exists = parent::exists();
		if ( ! $object_exists ) {
			return false;
		}

		if ( ! $this->source_post instanceof WP_Post ) {
			return false;
		}

		$post_content = $this->source_post->post_content;

		// If the post content does not contain the Smart Link UID, it is not
		// linked to a post.
		if ( strpos( $post_content, $this->uid ) === false ) {
			return false;
		}

		return true;
	}

	/**
	 * Checks if the Smart Link has a valid placement.
	 *
	 * @since 3.19.0
	 *
	 * @param bool $wp_error Whether to return a WP_Error object if the Smart Link has an invalid placement.
	 * @param bool $allow_duplicate_links Whether to allow duplicate links.
	 * @return bool|\WP_Error True if the Smart Link has a valid placement, WP_Error on failure if
	 *                        $wp_error is true, false otherwise.
	 */
	public function has_valid_placement( bool $wp_error = false, bool $allow_duplicate_links = false ) {
		if ( null === $this->source_post ) {
			$this->source_post = get_post( $this->source_post_id );
		}

		$post = $this->source_post;

		if ( ! $post instanceof WP_Post ) {
			if ( $wp_error ) {
				return new \WP_Error( 'traffic_boost_invalid_post', __( 'Invalid post', 'wp-parsely' ) );
			}

			return false;
		}

		// If the post content contains the smart link href, it is not valid.
		if ( ! $allow_duplicate_links && strpos( $post->post_content, $this->href ) !== false ) {
			if ( $wp_error ) {
				return new \WP_Error( 'traffic_boost_invalid_post', __( 'The link is already linked to this post.', 'wp-parsely' ) );
			}

			return false;
		}

		$paragraph = $this->get_paragraph( $post );

		if ( is_wp_error( $paragraph ) ) {
			if ( $wp_error ) {
				return $paragraph;
			}

			return false;
		}

		return true;
	}

	/**
	 * Checks if the smart link is a link replacement.
	 *
	 * @since 3.19.0
	 *
	 * @return bool True if the smart link is a link replacement, false otherwise.
	 */
	public function did_replace_link(): bool {
		if ( ! $this->is_applied() ) {
			return false;
		}

		return metadata_exists( 'post', $this->smart_link_id, '_traffic_boost_original_link_attributes' );
	}

	/**
	 * Gets the post data for the smart link.
	 *
	 * @since 3.16.0
	 *
	 * @return SmartLinkPostData The post data.
	 */
	private function get_post_data(): array {
		/**
		 * Empty post data.
		 *
		 * @var SmartLinkPostData
		 */
		$empty_post_data = array(
			'id'                    => 0,
			'title'                 => '',
			'type'                  => array(
				'name'  => '',
				'label' => '',
				'rest'  => '',
			),
			'paragraph'             => '',
			'is_first_paragraph'    => false,
			'is_last_paragraph'     => false,
			'paragraph_offset'      => 0,
			'permalink'             => '',
			'parsely_canonical_url' => '',
			'edit_link'             => '',
			'author'                => '',
			'date'                  => '',
			'image'                 => '',
		);

		if ( null !== $this->post_data ) {
			return $this->post_data;
		}

		if ( null === $this->source_post ) {
			$this->source_post = get_post( $this->source_post_id );
		}

		$post = $this->source_post;
		if ( ! $post instanceof WP_Post ) {
			return $empty_post_data;
		}

		// Get the paragraph that has the smart link UID.
		$paragraph = $this->get_paragraph( $post );

		if ( is_wp_error( $paragraph ) ) {
			/** @var ParagraphData */
			$error_paragraph = array(
				'paragraph'          => '<p>' . $paragraph->get_error_message() . '</p>',
				'is_first_paragraph' => false,
				'is_last_paragraph'  => false,
				'paragraph_offset'   => 0,
			);
			$paragraph       = $error_paragraph;
		}

		$author_name = get_the_author();
		if ( '' === $author_name ) {
			// If the author name is empty, use the author login name.
			$author_name = get_the_author_meta( 'user_login', intval( $post->post_author ) );
		}

		$post_type = get_post_type_object( $post->post_type );
		if ( null === $post_type ) {
			return $empty_post_data;
		}

		$post_type_label = $post_type->labels->singular_name;

		$rest_endpoint  = $post_type->rest_namespace . '/';
		$rest_endpoint .= false === $post_type->rest_base ? $post->post_type : $post_type->rest_base;

		$this->post_data = array(
			'id'                    => $post->ID,
			'title'                 => $post->post_title,
			'type'                  => array(
				'name'  => $post->post_type,
				'label' => $post_type_label,
				'rest'  => $rest_endpoint,
			),
			'paragraph'             => $paragraph['paragraph'],
			'paragraph_offset'      => $paragraph['paragraph_offset'],
			'permalink'             => get_permalink( $post ),
			'parsely_canonical_url' => Parsely::get_canonical_url_from_post( $post ),
			'edit_link'             => get_edit_post_link( $post, 'html' ) !== null ? get_edit_post_link( $post, 'html' ) : '',
			'is_first_paragraph'    => $paragraph['is_first_paragraph'],
			'is_last_paragraph'     => $paragraph['is_last_paragraph'],
			'author'                => $author_name,
			'date'                  => (string) ( get_the_date( '', $post ) !== false ? get_the_date( '', $post ) : '' ),
			'image'                 => get_the_post_thumbnail_url( $post, 'medium' ) !== false ? get_the_post_thumbnail_url( $post, 'medium' ) : '',
		);

		return $this->post_data;
	}

	/**
	 * Get the HTML paragraph that has the smart link UID.
	 *
	 * @since 3.16.0
	 *
	 * @param \WP_Post $post The post.
	 * @return ParagraphData|\WP_Error The paragraph that has the smart link UID,
	 *                                 and if it is the first or last paragraph.
	 */
	private function get_paragraph( \WP_Post $post ) {
		/* phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
		if ( null !== $this->paragraph_data ) {
			return $this->paragraph_data;
		}

		if ( ! class_exists( 'DOMDocument' ) ) {
			return new \WP_Error( 'traffic_boost_dom_not_available', __( 'DOMDocument is not available', 'wp-parsely' ) );
		}

		// Initialize the HTML parser.
		libxml_use_internal_errors( true );
		$temp_doc    = new \DOMDocument();
		$html_parser = new HTML5(
			array(
				'target_document' => $temp_doc,
				'disable_html_ns' => true,
			)
		);

		$source_post_has_blocks = has_blocks( $post );
		$content                = $post->post_content;

		// Post that are not using the block editor do not have paragraphs,
		// and use new lines to separate paragraphs.
		if ( ! $source_post_has_blocks ) {
			// Generate the array of paragraphs from the post content.
			$paragraphs = explode( "\n\n", $content );

			// Convert the array of paragraphs to a DOMDocument.
			$dom = new \DOMDocument();
			foreach ( $paragraphs as $paragraph ) {
				$fragment = $dom->createDocumentFragment();

				// Wrap the paragraph in a div tag and parse it as HTML.
				// We need to use div instead of p, because it is semantically incorrect to have
				// block elements inside paragraph tags.
				$wrapped_content = '<div>' . $paragraph . '</div>';
				$fragment->appendXML( $wrapped_content );

				// Append the fragment to the document.
				$dom->appendChild( $fragment );

				// Ignore errors parsing the HTML.
				libxml_clear_errors();
			}

			// Fetch all div tags (paragraphs).
			$paragraphs = $dom->getElementsByTagName( 'div' );
		} else {
			// Otherwise, just parse the content as HTML.
			$dom      = $html_parser->loadHTML( $content );
			$fragment = $dom->createDocumentFragment();

			// When loading the HTML, it is wrapped in a html tag.
			// So we need to get the child nodes of the html tag.
			$html_element = $dom->getElementsByTagName( 'html' )->item( 0 );
			if ( null === $html_element ) {
				return new \WP_Error( 'traffic_boost_html_not_found', __( 'HTML element not found in parsed content', 'wp-parsely' ) );
			}
			$elements = $html_element->childNodes;

			// Append the child nodes to the fragment.
			foreach ( iterator_to_array( $elements ) as $element ) {
				if ( $element instanceof \DOMElement ) {
					$fragment->appendChild( $element );
				}
			}
			$paragraphs = $fragment->childNodes;
		}

		$is_first_paragraph = true;
		$is_last_paragraph  = false;
		$paragraph          = null;
		$paragraph_offset   = 0;

		// Counts the global offset of the link text in the post content.
		$offset_count = 0;

		/** @var \DOMElement $p The paragraph element. */
		foreach ( $paragraphs as $p ) {
			// If the smart link is applied, we need to find the paragraph that contains the smart link.
			if ( $this->is_applied() ) {
				// Check each anchor tag within the paragraph.
				$anchors = $p->getElementsByTagName( 'a' );
				/** @var \DOMElement $anchor The anchor element. */
				foreach ( $anchors as $anchor ) {
					// Check if the data-smartlink attribute contains the UID.
					if ( $anchor->hasAttribute( 'data-smartlink' ) && stripos( $anchor->getAttribute( 'data-smartlink' ), $this->uid ) !== false ) {
						// Save the outer HTML of the paragraph.
						$is_first_paragraph = $p === $paragraphs->item( 0 );
						$is_last_paragraph  = $p === $paragraphs->item( $paragraphs->length - 1 );
						$paragraph          = $html_parser->saveHTML( $p );
						break 2;
					}
				}
			} elseif ( strpos( $p->textContent, $this->text ) !== false ) {
				// If the smart link is not applied, we need to find the paragraph that contains the
				// smart link text, and with the correct offset.

				/**
				 * Counts the local offset of the link text in the paragraph content.
				 *
				 * @var int
				 */
				$paragraph_offset = 0;

				// Loop each occurrence of the link text in the paragraph content.
				$text_pos = 0;
				// phpcs:ignore Generic.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition
				while ( ( $text_pos = strpos( $p->textContent, $this->text, $text_pos ) ) !== false ) {
					// If the global offset is the same as the offset of the link text in the paragraph, we found the paragraph.
					if ( $offset_count === $this->offset ) {
						$is_first_paragraph = $p === $paragraphs->item( 0 );
						$is_last_paragraph  = $p === $paragraphs->item( $paragraphs->length - 1 );

						// Check if the paragraph node is one of the allowed tags.
						if ( ! in_array( $p->nodeName, self::ALLOWED_TAGS, true ) ) {
							return new \WP_Error( 'traffic_boost_invalid_offset', __( 'The selection is not within a valid paragraph.', 'wp-parsely' ) );
						}

						$paragraph = $html_parser->saveHTML( $p );

						// Find the text node containing our target text.
						$text_node = $this->find_text_node( $p, $this->text, $paragraph_offset );
						if ( null === $text_node ) {
							return new \WP_Error( 'traffic_boost_text_node_not_found', __( 'Text node not found', 'wp-parsely' ) );
						}

						// Validate the link placement.
						$validation_result = $this->validate_link_placement( $text_node, $this->text );
						if ( is_wp_error( $validation_result ) ) {
							libxml_clear_errors();
							return $validation_result;
						}

						break 2;
					}
					++$text_pos;
					++$offset_count;
					++$paragraph_offset;
				}
			}
		}

		if ( null === $paragraph ) {
			return new \WP_Error( 'traffic_boost_paragraph_not_found', __( 'Paragraph not found.', 'wp-parsely' ) );
		}

		// If the post is not using the block editor, unwrap the paragraph from the paragraph tags.
		if ( ! $source_post_has_blocks ) {
			// Remove the paragraph tags from the paragraph.
			$paragraph = preg_replace( '/(^<div>)|(<\/div>$)/', '', $paragraph );
		}

		/** @var string $paragraph The paragraph that has the smart link UID. */
		/** @var int $paragraph_offset The offset of the smart link in the paragraph. */
		$this->paragraph_data = array(
			'paragraph'          => $paragraph,
			'is_first_paragraph' => $is_first_paragraph,
			'is_last_paragraph'  => $is_last_paragraph,
			'paragraph_offset'   => $paragraph_offset,
		);

		libxml_clear_errors();
		return $this->paragraph_data;
		/* phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
	}

	/**
	 * Sets the source post from a URL.
	 *
	 * @since 3.19.0
	 *
	 * @param string $url The URL.
	 */
	public function set_source_from_url( string $url ): bool {
		$source_post_id = Utils::get_post_id_by_url( $url );

		if ( 0 !== $source_post_id ) {
			// Set the source post and update the canonical URL.
			$this->set_source_post_id( $source_post_id );
			return true;
		}

		return false;
	}

	/**
	 * Recursively searches for text nodes containing the specified text.
	 *
	 * @since 3.19.0
	 *
	 * @param \DOMNode $node        The node to search in.
	 * @param string   $search_text The text to search for.
	 * @param int      $offset      The offset of the occurrence to find.
	 * @return \DOMNode|null The text node if found, null otherwise.
	 */
	private function find_text_node( \DOMNode $node, string $search_text, int $offset ) {
		/* phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
		// If the node is a text node, check if it contains the search text.
		if ( XML_TEXT_NODE === $node->nodeType ) {
			if ( strpos( $node->textContent, $search_text ) !== false ) {
				if ( 0 === $offset ) {
					return $node;
				}
				--$offset;
			}
		}

		// If the node has child nodes, recursively search for the text node.
		if ( $node->hasChildNodes() ) {
			/** @var \DOMNode $child */
			foreach ( $node->childNodes as $child ) {
				$result = $this->find_text_node( $child, $search_text, $offset );
				if ( null !== $result ) {
					return $result;
				}
			}
		}

		// If the text node is not found, return null.
		return null;
		/* phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
	}

	/**
	 * Validates if a text node can have a link placed around it.
	 *
	 * Checks if the node is inside a link and if so, only allows the operation
	 * if it's replacing the entire link.
	 *
	 * @since 3.19.0
	 *
	 * @param \DOMNode $node        The node to validate.
	 * @param string   $search_text The text that will be linked.
	 * @return array{valid: bool, replace_node?: \DOMElement|null}|\WP_Error Validation result.
	 */
	private function validate_link_placement( \DOMNode $node, string $search_text ) {
		/* phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
		$current = $node;
		while ( $current ) {
			// If the current node is an anchor tag.
			if ( 'a' === $current->nodeName ) {
				// If the current node is not the direct parent of our text node, it means
				// it's trying to create a nested link, so we need to return an error.
				if ( $current !== $node->parentNode ) {
					return new \WP_Error(
						'traffic_boost_invalid_link_placement',
						__( 'Cannot create nested links. The text is already part of another link.', 'wp-parsely' )
					);
				}

				// Check if the entire link text matches the search text. If not, throw
				// an error, because it's trying to create a nested link.
				if ( trim( $current->textContent ) !== trim( $search_text ) ) {
					return new \WP_Error(
						'traffic_boost_invalid_link_placement',
						__( 'Cannot create nested links. The text is already part of another link.', 'wp-parsely' )
					);
				}

				// Check if the link is already linked to this smart link.
				if ( $current instanceof \DOMElement &&
					strpos( $current->getAttribute( 'href' ), $this->get_link_href() ) !== false ) {
					return new \WP_Error(
						'traffic_boost_invalid_link_placement',
						__( 'The current link is already linked to this Smart Link.', 'wp-parsely' )
					);
				}

				// Since the link is valid, return the current node to be replaced.
				return array(
					'valid'        => true,
					'replace_node' => $current instanceof \DOMElement ? $current : null,
				);
			}
			$current = $current->parentNode;
		}

		// If no anchor tag was found, the link placement is valid.
		return array( 'valid' => true );
		/* phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
	}

	/**
	 * Finds the smart link anchor element in the paragraph that has the data-smartlink attribute set
	 * to the smart link UID.
	 *
	 * @since 3.19.0
	 *
	 * @param \DOMDocument $node The node to search in.
	 * @return \DOMElement|false The smart link anchor element if found, false otherwise.
	 */
	private function find_smart_link_anchor( $node ) {
		$xpath = new \DOMXPath( $node );

		// Query for any 'a' element that has a data-smartlink attribute matching our UID.
		$query            = sprintf( '//a[@data-smartlink="%s"]', esc_attr( $this->uid ) );
		$smart_link_nodes = $xpath->query( $query, $node );

		// Return false if no matching nodes were found.
		if ( false === $smart_link_nodes || 0 === $smart_link_nodes->length ) {
			return false;
		}

		// Return the first matching node.
		/** @var \DOMElement $first_node */
		$first_node = $smart_link_nodes->item( 0 );

		return $first_node;
	}

	/**
	 * Applies the inbound smart link to the post.
	 *
	 * @since 3.19.0
	 *
	 * @return bool|\WP_Error True if the inbound smart link was applied, WP_Error on failure.
	 */
	public function apply() {
		/* phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
		if ( $this->is_applied() ) {
			return new \WP_Error( 'traffic_boost_already_applied', __( 'Smart Link already applied', 'wp-parsely' ) );
		}

		if ( ! class_exists( 'DOMDocument' ) ) {
			return new \WP_Error( 'traffic_boost_dom_not_available', __( 'DOMDocument is not available', 'wp-parsely' ) );
		}

		// Get the source post.
		$source_post = $this->source_post;
		if ( null === $source_post ) {
			$source_post = get_post( $this->source_post_id );
		}

		if ( null === $source_post ) {
			return new \WP_Error( 'traffic_boost_source_post_not_found', __( 'Source post not found', 'wp-parsely' ) );
		}

		$source_post_content = $source_post->post_content;

		// Find the paragraph that contains the link text.
		$paragraph_data = $this->get_paragraph( $source_post );

		if ( is_wp_error( $paragraph_data ) ) {
			return $paragraph_data;
		}

		$paragraph        = $paragraph_data['paragraph'];
		$paragraph_offset = $paragraph_data['paragraph_offset'];

		// Initialize the HTML parser.
		$temp_doc    = new \DOMDocument();
		$html_parser = new HTML5(
			array(
				'target_document' => $temp_doc,
				'disable_html_ns' => true,
			)
		);
		libxml_use_internal_errors( true );

		// Load the paragraph HTML into a DOMDocument.
		$paragraph_fragment = $html_parser->loadHTMLFragment( $paragraph );

		$errors = libxml_get_errors();

		// If there are errors parsing the paragraph HTML, return an error.
		if ( count( $errors ) > 0 ) {
			libxml_clear_errors();
			return new \WP_Error( 'traffic_boost_error_parsing_html', __( 'Error parsing the paragraph HTML', 'wp-parsely' ), $errors );
		}

		// Find the text node containing our target text at the specified offset.
		$text_node = $this->find_text_node( $paragraph_fragment, $this->text, $paragraph_offset );

		if ( null === $text_node ) {
			libxml_clear_errors();
			return new \WP_Error( 'traffic_boost_text_not_found', __( 'No text found in paragraph', 'wp-parsely' ) );
		}

		// Validate the link placement, to ensure we're not creating nested links and to
		// determine if we're replacing an existing link or creating a new one.
		$validation_result = $this->validate_link_placement( $text_node, $this->text );

		// Validation failed, return an error.
		if ( is_wp_error( $validation_result ) ) {
			libxml_clear_errors();
			return $validation_result;
		}

		// Store the smart link node, so we can use it later to find the line that contains the smart link.
		$smart_link_node = null;

		// If we're replacing an existing link, handle differently.
		if ( isset( $validation_result['replace_node'] ) ) {
			// Store the original link attributes, so we can restore them if the link gets deleted.
			/** @var \DOMAttr[] $attributes */
			$attributes               = $validation_result['replace_node']->attributes;
			$original_link_attributes = array();
			foreach ( $attributes as $attribute ) {
				$original_link_attributes[ $attribute->name ] = $attribute->value;
			}
			update_post_meta( $this->smart_link_id, '_traffic_boost_original_link_attributes', $original_link_attributes );

			$existing_link = $validation_result['replace_node'];

			// If there is an existing smart link UID, we need to delete it.
			$existing_smart_link_uid = $existing_link->getAttribute( 'data-smartlink' );
			if ( '' !== $existing_smart_link_uid ) {
				$smart_link = self::get_smart_link( $existing_smart_link_uid, $this->source_post_id );
				if ( $smart_link->exists() ) {
					$smart_link->delete();
				}
			}

			// Update the existing link.
			$existing_link->setAttribute( 'href', $this->get_link_href() );
			$existing_link->setAttribute( 'data-smartlink', $this->uid );
			$existing_link->setAttribute( 'title', $this->title );
			$smart_link_node = $existing_link;
		} else { // If not replacing an existing link, create a new link.
			// Get the position of the text within this specific text node.
			$text_content = $text_node->textContent;
			$target_pos   = strpos( $text_content, $this->text );

			if ( false === $target_pos ) {
				libxml_clear_errors();
				return new \WP_Error( 'traffic_boost_text_not_found', __( 'Link text not found at specified offset', 'wp-parsely' ) );
			}

			// Create the smart link anchor element.
			$smart_link_anchor = $temp_doc->createElement( 'a' );
			$smart_link_anchor->setAttribute( 'href', $this->get_link_href() );
			$smart_link_anchor->setAttribute( 'data-smartlink', $this->uid );
			$smart_link_anchor->setAttribute( 'title', $this->title );
			$smart_link_anchor->textContent = $this->text;
			$smart_link_node                = $smart_link_anchor;
			// Split the text node into before and after parts.
			$before_text = substr( $text_content, 0, $target_pos );
			$after_text  = substr( $text_content, $target_pos + strlen( $this->text ) );

			// Create text nodes for before and after parts.
			$before_node = $temp_doc->createTextNode( $before_text );
			$after_node  = $temp_doc->createTextNode( $after_text );

			if ( null === $text_node->parentNode ) {
				libxml_clear_errors();
				return new \WP_Error( 'traffic_boost_text_node_parent_not_found', __( 'Text node parent not found', 'wp-parsely' ) );
			}

			// Replace the original text node with our three new nodes.
			$text_node->parentNode->insertBefore( $before_node, $text_node );
			$text_node->parentNode->insertBefore( $smart_link_anchor, $text_node );
			$text_node->parentNode->insertBefore( $after_node, $text_node );
			$text_node->parentNode->removeChild( $text_node );
		}

		// To avoid unwanted replacements, we'll be focusing only on the single line where the link is being inserted.
		// Get the line that contains the smart link.
		$line_with_smart_link = $this->find_line_with_text(
			$html_parser->saveHTML( $paragraph_fragment ), // The full paragraph HTML with the smart link.
			$html_parser->saveHTML( $smart_link_node ) // The smart link anchor HTML.
		);

		// Get the original line where the smart link will be inserted.
		$original_line = $this->find_original_line( $source_post_content, $line_with_smart_link );

		if ( '' === $original_line ) {
			return new \WP_Error( 'traffic_boost_original_line_not_found', __( 'Could not find the original line containing the link text', 'wp-parsely' ) );
		}

		// Replace the original line with the new HTML.
		$source_post_content = str_replace( $original_line, $line_with_smart_link, $source_post_content );

		// Backup the original post content and paragraph in a post meta, for rollback purposes.
		$revisions = wp_get_post_revisions( $source_post->ID, array( 'posts_per_page' => 1 ) );
		if ( count( $revisions ) > 0 ) {
			// Get the latest revision ID.
			/** @var \WP_Post $latest_revision */
			$latest_revision = array_shift( $revisions );
			update_post_meta( $this->smart_link_id, '_traffic_boost_source_post_revision', $latest_revision->ID );
		} else {
			// If revisions are disabled, store the original content.
			update_post_meta( $this->smart_link_id, '_traffic_boost_source_original_post_content', $source_post->post_content );
		}

		// Always backup the original paragraph, before the link was applied.
		update_post_meta( $this->smart_link_id, '_traffic_boost_source_original_paragraph', $paragraph );

		// Update the post content.
		$updated_post = wp_update_post(
			array(
				'ID'           => $this->source_post_id,
				'post_content' => $source_post_content,
			),
			true
		);

		if ( is_wp_error( $updated_post ) && ! $this->is_ignorable_update_error( $updated_post ) ) {
			return $updated_post;
		}

		// Flush the caches for the smart link.
		$this->flush_all_cache();

		// Set the applied flag to true.
		$this->set_status( Smart_Link_Status::APPLIED );

		// Save the smart link.
		$this->save();

		return true;
		/* phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
	}

	/**
	 * Removes an inbound smart link from the post, and deletes the smart link by default.
	 *
	 * @since 3.19.0
	 *
	 * @param bool $restore_original_link Whether to restore the original link, if it was replaced.
	 * @param bool $delete_smart_link Whether to delete the smart link after removing it from the post.
	 * @return bool|\WP_Error True if the inbound smart link was deleted, WP_Error on failure.
	 */
	public function remove( $restore_original_link = false, $delete_smart_link = true ) {
		/* phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
		// If the smart link is not applied, we can just delete it.
		if ( ! $this->is_applied() ) {
			if ( $delete_smart_link ) {
				return $this->delete();
			}

			return true;
		}

		if ( ! class_exists( 'DOMDocument' ) ) {
			return new \WP_Error( 'traffic_boost_dom_not_available', __( 'DOMDocument is not available', 'wp-parsely' ) );
		}

		$source_post = $this->source_post;
		if ( null === $source_post ) {
			$source_post = get_post( $this->source_post_id );
		}

		if ( null === $source_post ) {
			return new \WP_Error( 'traffic_boost_source_post_not_found', __( 'Source post not found', 'wp-parsely' ) );
		}

		$source_post_content = $source_post->post_content;

		// Initialize the HTML parser.
		$html_parser = new HTML5(
			array(
				'disable_html_ns' => true,
			)
		);

		libxml_use_internal_errors( true );

		// Load the paragraph HTML into a DOMDocument.
		$content_dom = $html_parser->loadHTML( $source_post_content );

		$errors = libxml_get_errors();

		// If there are errors parsing the paragraph HTML, return an error.
		if ( count( $errors ) > 0 ) {
			libxml_clear_errors();
			return new \WP_Error( 'traffic_boost_error_parsing_html', __( 'Error parsing the paragraph HTML', 'wp-parsely' ), $errors );
		}

		// Remove the anchor element with the smart link UID.
		$smart_link_anchor = $this->find_smart_link_anchor( $content_dom );

		if ( false === $smart_link_anchor ) {
			return new \WP_Error( 'traffic_boost_smart_link_anchor_not_found', __( 'Smart Link anchor not found', 'wp-parsely' ) );
		}

		$original_paragraph_html = $html_parser->saveHTML( $smart_link_anchor->parentNode );

		// Get the parent node of the smart link anchor.
		$parent_node = $smart_link_anchor->parentNode;
		if ( null === $parent_node ) {
			return new \WP_Error( 'traffic_boost_parent_node_not_found', __( 'Parent node not found', 'wp-parsely' ) );
		}

		// Get the original link attributes, if they exist.
		$previous_link_attributes = get_post_meta( $this->smart_link_id, '_traffic_boost_original_link_attributes', true );

		// If the smart link replaced an existing link, restore the original link.
		if ( $restore_original_link && is_array( $previous_link_attributes ) ) {
			$original_link              = $content_dom->createElement( 'a' );
			$original_link->textContent = $smart_link_anchor->textContent;

			foreach ( $previous_link_attributes as $attribute => $value ) {
				if ( '' !== $value ) {
					$original_link->setAttribute( $attribute, $value );
				}
			}

			// Remove the previous link attributes meta.
			delete_post_meta( $this->smart_link_id, '_traffic_boost_original_link_attributes' );

			// Replace the smart link anchor with the original link.
			$parent_node->replaceChild( $original_link, $smart_link_anchor );
		} else {
			// If the smart link did not replace an existing link, we need to remove the smart link anchor.
			// Create a text node with the original text.
			$text_node = $content_dom->createTextNode( $smart_link_anchor->textContent );

			// Replace the smart link anchor with the text node.
			$parent_node->replaceChild( $text_node, $smart_link_anchor );
		}

		// Get the modified HTML.
		$paragraph_html = $html_parser->saveHTML( $parent_node );

		// Replace the paragraph with the new HTML.
		$source_post_content = str_replace( $original_paragraph_html, $paragraph_html, $source_post_content );

		// Update the post content.
		$updated_post = wp_update_post(
			array(
				'ID'           => $this->source_post_id,
				'post_content' => $source_post_content,
			),
			true
		);

		if ( is_wp_error( $updated_post ) && ! $this->is_ignorable_update_error( $updated_post ) ) {
			return $updated_post;
		}

		// Flush the cache for the post.
		$this->flush_all_cache();

		// Set the applied flag to false.
		$this->set_status( Smart_Link_Status::PENDING );

		// Delete the smart link.
		if ( $delete_smart_link ) {
			return $this->delete();
		}

		return true;
		/* phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
	}

	/**
	 * Updates the text of the smart link.
	 *
	 * @since 3.19.0
	 *
	 * @param string $new_text The new text of the smart link.
	 * @param int    $offset The offset of the text to update.
	 * @param bool   $restore_original_link Whether to restore the original link, if it was replaced.
	 * @return bool|\WP_Error True if the smart link was updated, WP_Error on failure.
	 */
	public function update_link_text( string $new_text, int $offset, bool $restore_original_link = false ) {
		global $wpdb;

		// To make sure the smart link is updated in a single atomic operation, start a transaction.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query( 'START TRANSACTION' );

		// Remove the existing smart link from the post.
		$deleted = $this->remove( $restore_original_link, false );

		if ( is_wp_error( $deleted ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->query( 'ROLLBACK' );
			return $deleted;
		}

		// Update the text of the smart link.
		$this->text   = $new_text;
		$this->offset = $offset;

		// Clean-up local caches.
		$this->paragraph_data = null;
		$this->post_data      = null;
		$this->source_post    = null;

		// Apply the new smart link to the post.
		$applied = $this->apply();

		if ( is_wp_error( $applied ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->query( 'ROLLBACK' );
			return $applied;
		}

		// Commit the transaction.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query( 'COMMIT' );
		return $applied;
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

		// Make sure the source post ID is set.
		$inbound_smart_link->set_source_post_id( $smart_link->source_post_id );

		return $inbound_smart_link;
	}

	/**
	 * Gets the existing inbound smart links for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID.
	 * @return array<Inbound_Smart_Link> The existing inbound smart links.
	 */
	public static function get_existing_suggestions( int $post_id ): array {
		// Get pending (suggestions) inbound smart links for the post.
		$smart_links = self::get_inbound_smart_links( $post_id, Smart_Link_Status::PENDING );

		return $smart_links;
	}

	/**
	 * Gets the number of pending inbound smart link suggestions for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID.
	 * @return int The number of pending inbound smart links.
	 */
	public static function get_suggestions_count( int $post_id ): int {
		$cache_key = self::get_suggestions_count_cache_key( $post_id );
		$count     = wp_cache_get( $cache_key, PARSELY_CACHE_GROUP );

		if ( false !== $count && is_numeric( $count ) ) {
			return (int) $count;
		}

		$args = array(
			'post_type'      => 'parsely_smart_link',
			'posts_per_page' => 0,
			'fields'         => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			'tax_query'      => array(
				'relation' => 'AND',
				array(
					'taxonomy'         => 'smart_link_destination',
					'field'            => 'slug',
					'include_children' => false,
					'terms'            => (string) $post_id,
				),
				array(
					'taxonomy'         => 'smart_link_status',
					'field'            => 'slug',
					'include_children' => false,
					'terms'            => Smart_Link_Status::PENDING,
				),
			),
		);

		$query = new \WP_Query( $args );

		wp_cache_set( $cache_key, $query->found_posts, PARSELY_CACHE_GROUP, DAY_IN_SECONDS );

		return $query->found_posts;
	}

	/**
	 * Deletes all pending (not applied) inbound smart links suggestions for a given post.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID.
	 * @return array<string,int> The results of the deletion.
	 */
	public static function delete_pending_suggestions( int $post_id ): array {
		// Get all posts of type parsely_smart_link that have the destination taxonomy set to the post_id
		// and the smart_link_status set to pending.
		$args = array(
			'post_type'      => 'parsely_smart_link',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			'tax_query'      => array(
				'relation' => 'AND',
				array(
					'taxonomy'         => 'smart_link_destination',
					'field'            => 'slug',
					'include_children' => false,
					'terms'            => (string) $post_id,
				),
				array(
					'taxonomy'         => 'smart_link_status',
					'field'            => 'slug',
					'include_children' => false,
					'terms'            => Smart_Link_Status::PENDING,
				),
			),
		);

		$query = new \WP_Query( $args );

		$results = array(
			'success' => 0,
			'failed'  => 0,
		);

		foreach ( $query->posts as $post ) {
			if ( ! is_int( $post ) ) {
				++$results['failed'];
				continue;
			}

			$smart_link = self::get_smart_link_by_id( $post );

			if ( false === $smart_link ) {
				++$results['failed'];
				continue;
			}

			if ( $smart_link->delete() ) {
				++$results['success'];
			} else {
				++$results['failed'];
			}
		}

		// Flush the cache for the post.
		self::flush_cache_by_post_id( $post_id );

		return $results;
	}

	/**
	 * Gets the inbound smart links for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param int    $post_id The ID of the post.
	 * @param string $status The status of the smart links to get.
	 * @return array<self> The inbound smart links.
	 */
	public static function get_inbound_smart_links( int $post_id, string $status = Smart_Link_Status::ALL ): array {
		$inbound_smart_links = parent::get_inbound_smart_links( $post_id, $status );

		return array_map(
			function ( Smart_Link $smart_link ) {
				return self::from_smart_link( $smart_link );
			},
			$inbound_smart_links
		);
	}

	/**
	 * Gets an inbound smart link by its ID.
	 *
	 * @since 3.19.0
	 *
	 * @param int $smart_link_id The ID of the smart link.
	 * @return self|false The inbound smart link, or false if not found.
	 */
	public static function get_smart_link_by_id( int $smart_link_id ) {
		$smart_link = parent::get_smart_link_by_id( $smart_link_id );
		if ( false === $smart_link ) {
			return false;
		}

		return self::from_smart_link( $smart_link );
	}

	/**
	 * Gets an inbound smart link by its source and destination posts.
	 *
	 * @since 3.19.0
	 *
	 * @param int $source_post_id The ID of the source post.
	 * @param int $destination_post_id The ID of the destination post.
	 * @return self|false The inbound smart link, or false if not found.
	 */
	public static function get_smart_link_by_source_and_destination( int $source_post_id, int $destination_post_id ) {
		$args = array(
			'post_type'      => 'parsely_smart_link',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			'tax_query'      => array(
				array(
					'taxonomy'         => 'smart_link_destination',
					'field'            => 'slug',
					'include_children' => false,
					'terms'            => (string) $destination_post_id,
				),
				array(
					'taxonomy'         => 'smart_link_source',
					'field'            => 'slug',
					'include_children' => false,
					'terms'            => (string) $source_post_id,
				),
			),
		);

		$query = new \WP_Query( $args );

		if ( 0 === $query->post_count ) {
			return false;
		}

		/** @var int $post_id */
		$post_id = $query->posts[0];

		return self::get_smart_link_by_id( $post_id );
	}

	/**
	 * Finds the line containing the specified text in the HTML.
	 *
	 * @since 3.19.0
	 *
	 * @param string $html HTML to search through.
	 * @param string $text Text to search for.
	 * @return string The line containing the text.
	 */
	private function find_line_with_text( string $html, string $text ): string {
		$lines = explode( "\n", $html );
		foreach ( $lines as $line ) {
			if ( strpos( $line, $text ) !== false ) {
				return $line;
			}
		}

		return '';
	}

	/**
	 * Finds the original line for the search line in the original text.
	 *
	 * This is used to find which line in the original text should be replaced with the new
	 * line, that includes the smart link.
	 *
	 * @since 3.19.0
	 *
	 * @param string $original_text The original text.
	 * @param string $search_line The line to search through.
	 * @return string The original line.
	 */
	private function find_original_line( string $original_text, string $search_line ): string {
		$lines = explode( "\n", $original_text );
		foreach ( $lines as $original_line ) {
			if ( $original_line === $search_line ) {
				return $original_line;
			}

			// If the lines are the same, without HTML tags, return the original line.
			if ( $this->is_the_same_line( $original_line, $search_line ) ) {
				return $original_line;
			}
		}

		return '';
	}

	/**
	 * Compares two strings to check if they are equal when ignoring HTML and formatting.
	 *
	 * @since 3.19.0
	 *
	 * @param string $line1 First line to compare.
	 * @param string $line2 Second line to compare.
	 * @return bool True if lines are the same, false otherwise.
	 */
	private function is_the_same_line( string $line1, string $line2 ): bool {
		// Strip HTML tags.
		$text1 = wp_strip_all_tags( $line1 );
		$text2 = wp_strip_all_tags( $line2 );

		// Normalize whitespace.
		$text1 = preg_replace( '/\s+/', ' ', trim( $text1 ) );
		$text2 = preg_replace( '/\s+/', ' ', trim( $text2 ) );

		if ( null === $text1 || null === $text2 ) {
			return false;
		}

		// Convert to lowercase.
		$text1 = strtolower( $text1 );
		$text2 = strtolower( $text2 );

		// Decode HTML entities.
		$text1 = html_entity_decode( $text1 );
		$text2 = html_entity_decode( $text2 );

		return $text1 === $text2;
	}

	/**
	 * Flushes the cache for the post.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID.
	 */
	protected static function flush_cache_by_post_id( int $post_id ): void {
		parent::flush_cache_by_post_id( $post_id );

		$cache_key = self::get_suggestions_count_cache_key( $post_id );
		wp_cache_delete( $cache_key, PARSELY_CACHE_GROUP );
	}

	/**
	 * Checks if a WP_Error from wp_update_post() is ignorable.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_Error $error The error to check.
	 * @return bool True if the error is ignorable, false otherwise.
	 */
	private function is_ignorable_update_error( WP_Error $error ): bool {
		// The 'invalid_page_template' error can be returned from wp_update_post()
		// if the saved page template is a custom type that no longer exists.
		// This error is returned *after* the post has been updated with a new smart
		// link, so we can safely ignore it.
		//
		// The post will use the 'default' page template if a custom type
		// doesn't exist anyway.
		if ( 'invalid_page_template' === $error->get_error_code() ) {
			return true;
		}

		return false;
	}

	/**
	 * Gets the cache key for the traffic boost suggestions count.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID.
	 * @return string The cache key.
	 */
	private static function get_suggestions_count_cache_key( int $post_id ): string {
		return sprintf( 'traffic-boost-suggestions-count-%d', $post_id );
	}
}
