<?php
/**
 * Author Archive Page Metadata Builder class
 *
 * @package Parsely
 * @since 3.4.0
 */

declare(strict_types=1);

namespace Parsely\Metadata;

use WP_User;
use stdClass;

use function Parsely\Utils\get_string_query_var;

/**
 * Implements abstract Metadata Builder class to generate the metadata array
 * for an author archive page.
 *
 * @since 3.4.0
 */
class Author_Archive_Builder extends Metadata_Builder {
	/**
	 * Generates the metadata object by calling the build_* methods and
	 * returns the value.
	 *
	 * @since 3.4.0
	 *
	 * @return array<string, mixed>
	 */
	public function get_metadata(): array {
		$this->build_basic();
		$this->build_headline();
		$this->build_url();

		return $this->metadata;
	}

	/**
	 * Populates the `headline` field in the metadata object. Integrates with
	 * the Co-Authors Plus plugin if it is installed and activated.
	 *
	 * @since 3.4.0
	 */
	private function build_headline(): void {
		// Use the author's username as a display name fallback.
		$author_username     = get_string_query_var( 'author_name' );
		$author_display_name = $author_username;

		// Attempt to get the author from the Co-Authors Plus plugin or from
		// WordPress core if this fails.
		$author = $this->get_display_name_from_coauthors( $author_username );
		if ( false === $author ) {
			$author = get_user_by( 'slug', $author_username );
			if ( false === $author ) {
				$author_id = get_query_var( 'author' );
				if ( is_numeric( $author_id ) ) {
					$author = get_userdata( (int) $author_id );
				}
			}
		}

		// Set the display name and populate the metadata.
		if ( true === is_object( $author ) && isset( $author->display_name ) ) {
			$author_display_name = $author->display_name;
		}
		$this->metadata['headline'] = $this->clean_value(
			/* translators: %s: Author name. */
			sprintf( __( 'Author - %s', 'wp-parsely' ), $author_display_name )
		);
	}

	/**
	 * Returns the author's display name using the Co-Authors Plus plugin when
	 * it is installed and activated.
	 *
	 * Note: The object that gets returned for Guest Authors is not of the
	 * `WP_User` type, but it contains a display_name property.
	 *
	 * @since 3.6.0
	 *
	 * @param string $author_username The author's username.
	 * @return WP_User|stdClass|false The object or false on failure.
	 */
	private function get_display_name_from_coauthors( string $author_username ) {
		if ( class_exists( 'coauthors_plus' ) ) {
			global $coauthors_plus;
			return $coauthors_plus->get_coauthor_by( 'user_nicename', $author_username );
		}

		return false;
	}
}
