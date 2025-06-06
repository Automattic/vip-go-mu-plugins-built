<?php
/**
 * UI: Metadata renderer class.
 *
 * @package Parsely
 * @since   3.3.0
 */

declare(strict_types=1);

namespace Parsely\UI;

use Parsely\Metadata;
use Parsely\Parsely;
use WP_Post;

/**
 * Renders metadata in the WordPress front-end header.
 *
 * @since 3.3.0
 */
final class Metadata_Renderer {
	/**
	 * Instance of Parsely class.
	 *
	 * @var Parsely
	 */
	private $parsely;

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Registers metadata actions.
	 *
	 * @since 3.3.0
	 */
	public function run(): void {
		/**
		 * Filter whether the Parse.ly meta tags should be inserted in the page.
		 *
		 * By default, the tags are inserted.
		 *
		 * @since 3.0.0
		 *
		 * @param bool $insert_metadata True to insert the metadata, false otherwise.
		 */
		if ( apply_filters( 'wp_parsely_should_insert_metadata', true ) ) {
			add_action( 'wp_head', array( $this, 'render_metadata_on_head' ) );
		}
	}

	/**
	 * Renders metadata on site's head using the format from the site's options.
	 *
	 * @since 3.3.0
	 */
	public function render_metadata_on_head(): void {
		$parsely_options = $this->parsely->get_options();
		$this->render_metadata( $parsely_options['meta_type'] );
	}

	/**
	 * Inserts the code for the meta parameter within the head tag.
	 *
	 * @since 3.2.0
	 * @since 3.3.0 Moved from `Parsely` class to `Metadata_Header`.
	 *
	 * @param string $meta_type `json_ld` or `repeated_metas`.
	 */
	public function render_metadata( string $meta_type ): void {
		$parsely_options = $this->parsely->get_options();

		if (
			$this->parsely->site_id_is_missing() ||

			// Chosen not to track logged-in users.
			( ! $parsely_options['track_authenticated_users'] && $this->parsely->is_blog_member_logged_in() ) ||

			// 404 pages are not tracked.
			is_404() ||

			// Search pages are not tracked.
			is_search()
		) {
			return;
		}

		global $post;

		// We can't construct the metadata without a valid post object.
		$parsed_post = get_post( $post );
		if ( ! $parsed_post instanceof WP_Post ) {
			return;
		}

		$metadata = ( new Metadata( $this->parsely ) )->construct_metadata( $parsed_post );

		// Something went wrong - abort.
		if ( ! isset( $metadata['headline'] ) ) {
			return;
		}

		// Insert JSON-LD or repeated metas.
		if ( 'json_ld' === $meta_type ) {
			echo '<script type="application/ld+json" class="wp-parsely-metadata">' . wp_json_encode( $metadata ) . '</script>';
		} else {
			// Assume `meta_type` is `repeated_metas`.
			$parsely_post_type = $this->parsely->convert_jsonld_to_parsely_type( $metadata['@type'] ?? '' );
			$tags              = '';

			// @phpstan-ignore-next-line
			if ( isset( $metadata['keywords'] ) && is_array( $metadata['keywords'] ) ) {
				$tags = implode( ',', $metadata['keywords'] );
			}

			$parsely_metas = array(
				'title'     => $metadata['headline'],
				'link'      => $metadata['url'] ?? '',
				'type'      => $parsely_post_type,
				'image-url' => $metadata['thumbnailUrl'] ?? '',
				'pub-date'  => $metadata['datePublished'] ?? '',
				'section'   => $metadata['articleSection'] ?? '',
				'tags'      => $tags,
			);
			$parsely_metas = array_filter( $parsely_metas, array( $this, 'filter_empty_and_not_string_from_array' ) );

			// Output metas.
			foreach ( $parsely_metas as $parsely_meta_key => $parsely_meta_val ) {
				printf(
					'<meta name="%s" content="%s" />%s',
					esc_attr( 'parsely-' . $parsely_meta_key ),
					esc_attr( $parsely_meta_val ),
					"\n"
				);
			}

			// Output author metas (they can be multiple).
			if ( isset( $metadata['author'] ) ) {
				$parsely_page_authors = wp_list_pluck( $metadata['author'], 'name' );
				$parsely_page_authors = array_filter( $parsely_page_authors, array( $this, 'filter_empty_and_not_string_from_array' ) );

				foreach ( $parsely_page_authors as $parsely_author_name ) {
					printf(
						'<meta name="parsely-author" content="%s" />%s',
						esc_attr( $parsely_author_name ),
						"\n"
					);
				}
			}
		}

		// Add any custom metadata.
		if ( isset( $metadata['custom_metadata'] ) ) {
			echo '<meta name="parsely-metadata" content="' . esc_attr( $metadata['custom_metadata'] ) . '" />';
		}
	}

	/**
	 * Function to be used in `array_filter` to clean up repeated metas.
	 *
	 * @since 2.6.0
	 * @since 3.3.0 Moved from `Parsely` class to `Metadata_Header`.
	 *
	 * @param mixed $value Value to filter from the array.
	 * @return bool True if the variable is not empty, and it's a string.
	 */
	private function filter_empty_and_not_string_from_array( $value ): bool {
		return is_string( $value ) && '' !== $value;
	}
}
