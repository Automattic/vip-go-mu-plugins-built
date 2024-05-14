<?php
/**
 * Front Page Metadata Builder class
 *
 * @package Parsely
 * @since 3.4.0
 */

declare(strict_types=1);

namespace Parsely\Metadata;

use Parsely\Parsely;
use WP_Post;
use WP_User;

use function Parsely\Utils\get_default_category;

/**
 * Abstract class that implements modular builders for Metadata.
 *
 * It should be extended in subclasses that implement a particular page view to render
 * metadata for. Specifically, the `get_metadata()` method should be implemented.
 *
 * @since 1.0.0
 * @since 3.3.0 Logic extracted from Parsely\Parsely class to separate file/class.
 *
 * @phpstan-import-type Parsely_Options from Parsely
 */
abstract class Metadata_Builder {
	/**
	 * Instance of Parsely class.
	 *
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * Array holding the metadata keys and values.
	 *
	 * @var array<string, mixed>
	 */
	protected $metadata = array();

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Generates the metadata object by calling the build_* methods and
	 * returns the value.
	 *
	 * @since 3.4.0
	 *
	 * @return array<string, mixed>
	 */
	abstract public function get_metadata(): array;

	/**
	 * Builds basic metadata present in all pages.
	 *
	 * @since 3.4.0
	 */
	protected function build_basic(): void {
		$this->metadata['@context'] = 'https://schema.org';
		$this->metadata['@type']    = 'WebPage';
	}

	/**
	 * Populates the url field in the metadata object.
	 *
	 * @since 3.4.0
	 */
	protected function build_url(): void {
		$this->metadata['url'] = $this->get_current_url();
	}

	/**
	 * Populates the @type field in the metadata object.
	 *
	 * @param WP_Post $post The post/page for which to populate the field.
	 * @param string  $parsely_type Parse.ly post type. Can be 'post' or 'non-post'.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 */
	protected function build_type( WP_Post $post, string $parsely_type ): void {
		$default_type = 'post' === $parsely_type ? 'NewsArticle' : 'WebPage';

		/**
		 * Filters the JSON-LD @type.
		 *
		 * @since 2.5.0
		 *
		 * @param string $jsonld_type JSON-LD @type value, default is NewsArticle.
		 * @param int $id Post ID.
		 * @param string $post_type The Post type in WordPress.
		 */
		$type            = apply_filters( 'wp_parsely_post_type', $default_type, $post->ID, $post->post_type );
		$supported_types = $this->parsely->get_all_supported_types();

		// Validate type before passing it further as an invalid type will not be recognized by Parse.ly.
		if ( ! in_array( $type, $supported_types, true ) ) {
			$error = sprintf(
			/* translators: 1: JSON @type like NewsArticle, 2: URL */
				__( '@type %1$s is not supported by Parse.ly. Please use a type mentioned in %2$s', 'wp-parsely' ),
				$type,
				'https://docs.parse.ly/metadata-jsonld/#distinguishing-between-posts-and-non-posts-pages'
			);
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
			trigger_error( esc_html( $error ), E_USER_WARNING );
			$type = $default_type;
		}

		$this->metadata['@type'] = $type;
	}

	/**
	 * Populates the mainEntityOfPage field in the metadata object.
	 *
	 * @param string $build_url_type Parse.ly post type to use for building the
	 *                               URL. Can be 'post' or 'non-post'.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 */
	protected function build_main_entity( string $build_url_type ): void {
		$this->metadata['mainEntityOfPage'] = array(
			'@type' => 'WebPage',
			'@id'   => $this->get_current_url( $build_url_type ),
		);
	}

	/**
	 * Populates the author and creator fields in the metadata object.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param WP_Post $post The post/page for which to populate the fields.
	 */
	protected function build_author( WP_Post $post ): void {
		$authors        = $this->get_author_names( $post );
		$author_objects = array();
		foreach ( $authors as $author ) {
			$author_tag       = array(
				'@type' => 'Person',
				'name'  => $author,
			);
			$author_objects[] = $author_tag;
		}
		$this->metadata['author']  = $author_objects;
		$this->metadata['creator'] = $authors;
	}

	/**
	 * Populates the publisher field in the metadata object.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 */
	protected function build_publisher(): void {
		$this->metadata['publisher'] = array(
			'@type' => 'Organization',
			'name'  => get_bloginfo( 'name' ),
			'logo'  => $this->parsely->get_options()['logo'],
		);
	}

	/**
	 * Populates all the fields related to time in the metadata object.
	 *
	 * @param WP_Post $post The post/page for which to populate the field.
	 *
	 * @since 3.0.2
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 */
	protected function build_metadata_post_times( WP_Post $post ): void {
		$date_format      = 'Y-m-d\TH:i:s\Z';
		$post_created_gmt = get_post_time( $date_format, true, $post );

		if ( false === $post_created_gmt ) {
			return;
		}

		$this->metadata['dateCreated']   = $post_created_gmt;
		$this->metadata['datePublished'] = $post_created_gmt;
		$this->metadata['dateModified']  = $post_created_gmt;

		$post_modified_gmt = get_post_modified_time( $date_format, true, $post );

		if ( false !== $post_modified_gmt && $post_modified_gmt > $post_created_gmt ) {
			$this->metadata['dateModified'] = $post_modified_gmt;
		}
	}

	/**
	 * Populates the articleSection field in the metadata object.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param WP_Post $post The post/page for which to populate the field.
	 */
	protected function build_article_section( WP_Post $post ): void {
		$this->metadata['articleSection'] = $this->get_category_name( $post, $this->parsely->get_options() );
	}

	/**
	 * Populates the keywords field in the metadata object.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param WP_Post $post The post/page for which to populate the field.
	 */
	protected function build_keywords( WP_Post $post ): void {
		$options = $this->parsely->get_options();
		$tags    = $this->get_tags( $post->ID );
		if ( $options['cats_as_tags'] ) {
			$tags = array_merge( $tags, $this->get_categories( $post->ID ) );
			// add custom taxonomy values.
			$tags = array_merge( $tags, $this->get_custom_taxonomy_values( $post ) );
		}
		// The function 'mb_strtolower' is not enabled by default in php, so this check
		// falls back to the native php function 'strtolower' if necessary.
		if ( function_exists( 'mb_strtolower' ) ) {
			$lowercase_callback = 'mb_strtolower';
		} else {
			$lowercase_callback = 'strtolower';
		}
		if ( $options['lowercase_tags'] ) {
			$tags = array_map( $lowercase_callback, $tags );
		}

		/**
		 * Filters the post tags that are used as metadata keywords.
		 *
		 * @since 1.8.0
		 *
		 * @param array<string> $tags Post tags.
		 * @param int $ID Post ID.
		 */
		$tags = apply_filters( 'wp_parsely_post_tags', $tags, $post->ID );
		$tags = array_map( array( $this, 'clean_value' ), $tags );

		$this->metadata['keywords'] = array_values( array_unique( $tags ) );
	}

	/**
	 * Populates the thumbnailUrl field in the metadata object.
	 *
	 * @param WP_Post $post The post/page for which to populate the field.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 */
	protected function build_thumbnail_url( WP_Post $post ): void {
		$thumb_url = get_the_post_thumbnail_url( $post, 'thumbnail' );
		if ( ! is_string( $thumb_url ) ) {
			$thumb_url = '';
		}
		$this->metadata['thumbnailUrl'] = $thumb_url;
	}

	/**
	 * Populates the image field in the metadata object.
	 *
	 * @param WP_Post $post The post/page for which to populate the field.
	 *
	 * @since 3.4.0
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 */
	protected function build_image( WP_Post $post ): void {
		$image_url = get_the_post_thumbnail_url( $post, 'full' );
		if ( ! is_string( $image_url ) ) {
			$image_url = '';
		}
		$this->metadata['image'] = array(
			'@type' => 'ImageObject',
			'url'   => $image_url,
		);
	}

	/**
	 * Sanitizes string content.
	 *
	 * @since 2.6.0
	 * @since 3.4.0 Moved to class-metadata-builder.
	 *
	 * @param string|null $val The content you'd like sanitized.
	 * @return string
	 */
	protected function clean_value( ?string $val ): string {
		if ( null === $val ) {
			return '';
		}

		return trim( wp_strip_all_tags( str_replace( array( "\n", "\r" ), '', $val ) ) );
	}

	/**
	 * Gets the URL of the current PHP script.
	 *
	 * A fall-back implementation to determine permalink.
	 *
	 * @since 3.0.0 $parsely_type Default parameter changed to `non-post`.
	 * @since 3.4.0 Moved to class-metadata-builder.
	 *
	 * @param string $parsely_type Optional. Parse.ly post type you're interested in, either 'post'
	 *                             or 'non-post'. Default is 'non-post'.
	 * @param int    $post_id      Optional. ID of the post you want to get the URL for. Default is
	 *                             0, which means the global `$post` is used.
	 * @return string
	 */
	protected function get_current_url( string $parsely_type = 'non-post', int $post_id = 0 ): string {
		if ( 'post' === $parsely_type ) {
			$permalink = (string) get_permalink( $post_id );

			/**
			 * Filters the permalink for a post.
			 *
			 * @since 1.14.0
			 * @since 2.5.0  Added $post_id.
			 *
			 * @param string $permalink    The permalink URL or false if post does not exist.
			 * @param string $parsely_type Parse.ly type ("post" or "non-post").
			 * @param int    $post_id      ID of the post you want to get the URL for. May be 0, so
			 *                             $permalink will be for the global $post.
			 */
			$url = apply_filters( 'wp_parsely_permalink', $permalink, $parsely_type, $post_id );
		} else {
			$request_uri = isset( $_SERVER['REQUEST_URI'] )
				? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
				: '';

			$url = home_url( $request_uri );
		}

		$options = $this->parsely->get_options();
		return $options['force_https_canonicals']
			? str_replace( 'http://', 'https://', $url )
			: str_replace( 'https://', 'http://', $url );
	}

	/**
	 * Returns a properly cleaned category/taxonomy value and will optionally
	 * use the top-level category/taxonomy value, if so instructed via the
	 * use_top_level_cats option.
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param WP_Post         $post_obj The object for the post.
	 * @param Parsely_Options $parsely_options The parsely options.
	 * @return string Cleaned category name for the post in question.
	 */
	private function get_category_name( WP_Post $post_obj, $parsely_options ): string {
		$taxonomy_dropdown_choice = get_the_terms( $post_obj->ID, $parsely_options['custom_taxonomy_section'] );
		// Get top-level taxonomy name for chosen taxonomy and assign to $parent_name; it will be used
		// as the category value if 'use_top_level_cats' option is checked.
		// Assign as the default category name if no value is checked for the chosen taxonomy.
		$category_name = get_cat_name( get_default_category() );
		if ( false !== $taxonomy_dropdown_choice && ! is_wp_error( $taxonomy_dropdown_choice ) ) {
			if ( $parsely_options['use_top_level_cats'] ) {
				$first_term = array_shift( $taxonomy_dropdown_choice );
				if ( null !== $first_term ) {
					$term_name = $this->get_top_level_term( $first_term->term_id, $first_term->taxonomy );
				}
			} else {
				$term_name = $this->get_bottom_level_term( $post_obj->ID, $parsely_options['custom_taxonomy_section'] );
			}

			if ( isset( $term_name ) && is_string( $term_name ) && 0 < strlen( $term_name ) ) {
				$category_name = $term_name;
			}
		}

		/**
		 * Filters the constructed category name.
		 *
		 * @since 1.8.0
		 *
		 * @param string  $category    Category name.
		 * @param WP_Post $post_obj    Post object.
		 * @param array<string, mixed> $parsely_options The Parsely options.
		 */
		$category_name = apply_filters( 'wp_parsely_post_category', $category_name, $post_obj, $parsely_options );

		return $this->clean_value( $category_name );
	}

	/**
	 * Returns the top-most category/taxonomy value in a hierarchy given a
	 * taxonomy value's ID.
	 *
	 * (WordPress calls taxonomy values 'terms').
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param int    $term_id       The ID of the top level term.
	 * @param string $taxonomy_name The name of the taxonomy.
	 * @return string|false $parent The top level name of the category/taxonomy.
	 */
	private function get_top_level_term( int $term_id, string $taxonomy_name ) {
		$parent = get_term_by( 'id', $term_id, $taxonomy_name );

		while ( false !== $parent && isset( $parent->parent ) && 0 !== $parent->parent ) {
			$parent = get_term_by( 'id', $parent->parent, $taxonomy_name );
		}

		return $parent->name ?? false;
	}

	/**
	 * Returns the bottom-most category/taxonomy value in a hierarchy given a
	 * post ID.
	 *
	 * (WordPress calls taxonomy values 'terms').
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param int    $post_id       The post id you're interested in.
	 * @param string $taxonomy_name The name of the taxonomy.
	 * @return string Name of the custom taxonomy.
	 */
	private function get_bottom_level_term( int $post_id, string $taxonomy_name ): string {
		$terms = get_the_terms( $post_id, $taxonomy_name );

		if ( ! is_array( $terms ) ) {
			return '';
		}

		$term_ids = wp_list_pluck( $terms, 'term_id' );
		$parents  = array_filter( wp_list_pluck( $terms, 'parent' ) );

		// Get array of IDs of terms which are not parents.
		$term_ids_not_parents = array_diff( $term_ids, $parents );
		// Get corresponding term objects, which are mapped to array index keys.
		$terms_not_parents = array_intersect_key( $terms, $term_ids_not_parents );
		// remove array index keys.
		$terms_not_parents_cleaned = array_values( $terms_not_parents );

		if ( isset( $terms_not_parents_cleaned[0] ) ) {
			// If you assign multiple child terms in a custom taxonomy, will only return the first.
			return $terms_not_parents_cleaned[0]->name;
		}

		return '';
	}

	/**
	 * Retrieves all the authors for a post as an array. Can include multiple
	 * authors if the Co-Authors Plus plugin is in use.
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param WP_Post $post The post object.
	 * @return array<string>
	 */
	private function get_author_names( WP_Post $post ): array {
		$authors = $this->get_coauthor_names( $post->ID );
		if ( 0 === count( $authors ) ) {
			$post_author = get_user_by( 'id', $post->post_author );
			if ( false !== $post_author ) {
				$authors = array( $post_author );
			}
		}

		/**
		 * Filters the list of author WP_User objects for a post.
		 *
		 * @since 1.14.0
		 *
		 * @param array<WP_User> $authors One or more authors as WP_User objects.
		 * @param WP_Post        $post    Post object.
		 */
		$authors = apply_filters( 'wp_parsely_pre_authors', $authors, $post );

		// Getting the author name for each author.
		$authors = array_map( array( $this, 'get_author_name' ), $authors );

		/**
		 * Filters the list of author names for a post.
		 *
		 * @since 1.14.0
		 *
		 * @param array<string> $authors One or more author names.
		 * @param WP_Post       $post    Post object.
		 */
		$authors = apply_filters( 'wp_parsely_post_authors', $authors, $post );

		return array_map( array( $this, 'clean_value' ), $authors );
	}

	/**
	 * Returns a list of coauthors for a post assuming the Co-Authors Plus plugin
	 * is installed.
	 *
	 * Borrowed from
	 * https://github.com/Automattic/Co-Authors-Plus/blob/master/template-tags.php#L3-35
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param int $post_id The ID of the post.
	 * @return array<WP_User> List of coauthors, or an empty array if the Co-Authors Plus plugin is not active.
	 */
	private function get_coauthor_names( int $post_id ): array {
		$coauthors = array();
		if ( class_exists( 'coauthors_plus' ) ) {
			global $post, $post_ID, $coauthors_plus;

			if ( $post_id <= 0 && $post_ID ) {
				$post_id = $post_ID;
			}

			if ( ! $post_id && $post ) {
				$post_id = $post->ID;
			}

			if ( $post_id ) {
				$coauthor_terms = get_the_terms( $post_id, $coauthors_plus->coauthor_taxonomy );

				if ( is_array( $coauthor_terms ) ) {
					foreach ( $coauthor_terms as $coauthor ) {
						$coauthor_slug = preg_replace( '#^cap-#', '', $coauthor->slug );
						$post_author   = $coauthors_plus->get_coauthor_by( 'user_nicename', $coauthor_slug );
						// In case the user has been deleted while plugin was deactivated.
						if ( false !== $post_author ) {
							$coauthors[] = new WP_User( $post_author );
						}
					}
				} elseif ( ! $coauthors_plus->force_guest_authors ) {
					if ( $post && $post_id === $post->ID ) {
						$post_author = get_userdata( $post->post_author );
					}
					if ( isset( $post_author ) && false !== $post_author ) {
						$coauthors[] = $post_author;
					}
				}
				// The empty else case is because if we force guest authors, we don't ever care what value wp_posts.post_author has.
			}
		}
		return $coauthors;
	}

	/**
	 * Determines author name from display name, falling back to firstname
	 * lastname, then nickname and finally the nicename.
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param ?WP_User $author The author of the post.
	 * @return string An author name.
	 */
	private function get_author_name( ?WP_User $author ): string {
		// Gracefully handle situation where no author is available.
		if ( null === $author ) {
			return '';
		}

		if ( '' !== $author->display_name ) {
			return $author->display_name;
		}

		$author_name = $author->user_firstname . ' ' . $author->user_lastname;
		if ( ' ' !== $author_name ) {
			return $author_name;
		}

		if ( '' !== $author->nickname ) {
			return $author->nickname;
		}

		if ( '' !== $author->user_nicename ) {
			return $author->user_nicename;
		}

		return '';
	}

	/**
	 * Returns the tags associated with this page or post.
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param int $post_id   The ID of the post you're trying to get tags for.
	 * @return array<string> The tags of the post represented by the post id.
	 */
	private function get_tags( int $post_id ): array {
		/**
		 * Variable.
		 *
		 * @var array<\WP_Term|null>|\WP_Error
		 */
		$post_tags = wp_get_post_tags( $post_id );
		$tags      = array();

		if ( ! is_wp_error( $post_tags ) ) {
			foreach ( $post_tags as $wp_tag ) {
				if ( null !== $wp_tag ) {
					$tags[] = $wp_tag->name;
				}
			}
		}

		return $tags;
	}

	/**
	 * Returns an array of all the child categories for the current post.
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param int    $post_id   The ID of the post you're trying to get categories for.
	 * @param string $delimiter What character will delimit the categories.
	 * @return array<string> All the child categories of the current post.
	 */
	private function get_categories( int $post_id, string $delimiter = '/' ): array {
		$tags = array();
		foreach ( get_the_category( $post_id ) as $category ) {
			$hierarchy = get_category_parents( $category->term_id, false, $delimiter );
			if ( ! is_wp_error( $hierarchy ) ) {
				$tags[] = rtrim( $hierarchy, '/' );
			}
		}
		// Take last element in the hierarchy, a string representing the full
		// parent->child tree, and split it into individual category names.
		$last_tag = end( $tags );
		if ( false !== $last_tag ) {
			$tags = explode( '/', $last_tag );
		}

		// Remove default category name from tags if needed.
		$default_category_name = get_cat_name( get_default_category() );
		return array_diff( $tags, array( $default_category_name ) );
	}

	/**
	 * Gets all term names from all custom taxonomies assigned to a post.
	 *
	 * @since 3.3.0 Moved to class-metadata.
	 * @since 3.4.0 Moved to class-post-builder.
	 * @since 3.14.0 Moved from `Post_Builder` to `Metadata_Builder`.
	 *
	 * @param WP_Post $post_obj The post object to find the terms for.
	 * @return array<string> Term names.
	 */
	private function get_custom_taxonomy_values( WP_Post $post_obj ): array {
		// Filter out default WordPress taxonomies.
		$all_taxonomies = array_diff(
			get_taxonomies(),
			array( 'post_tag', 'nav_menu', 'author', 'link_category', 'post_format' )
		);

		/**
		 * Filters the taxonomies.
		 *
		 * @since 3.11.0
		 *
		 * @param array<string> $all_taxonomies Taxonomies.
		 * @param WP_Post $post_obj    Post object.
		 */
		$all_taxonomies = apply_filters( 'wp_parsely_custom_taxonomies', $all_taxonomies, $post_obj );
		$all_values     = array();

		foreach ( $all_taxonomies as $taxonomy ) {
			$custom_taxonomy_objects = get_the_terms( $post_obj->ID, $taxonomy );
			if ( is_array( $custom_taxonomy_objects ) ) {
				foreach ( $custom_taxonomy_objects as $custom_taxonomy_object ) {
					$all_values[] = $custom_taxonomy_object->name;
				}
			}
		}

		return $all_values;
	}
}
