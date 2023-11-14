<?php
/**
 * Metadata class
 *
 * @package Parsely
 * @since   3.3.0
 */

declare(strict_types=1);

namespace Parsely;

use Parsely\Metadata\Author_Archive_Builder;
use Parsely\Metadata\Category_Builder;
use Parsely\Metadata\Date_Builder;
use Parsely\Metadata\Front_Page_Builder;
use Parsely\Metadata\Page_Builder;
use Parsely\Metadata\Page_For_Posts_Builder;
use Parsely\Metadata\Paginated_Front_Page_Builder;
use Parsely\Metadata\Post_Builder;
use Parsely\Metadata\Tag_Builder;
use WP_Post;

use function Parsely\Utils\get_page_for_posts;
use function Parsely\Utils\get_page_on_front;

/**
 * Generates and inserts metadata readable by the Parse.ly Crawler.
 *
 * @since 1.0.0
 * @since 3.3.0 Logic extracted from Parsely\Parsely class to separate file/class.
 *
 * @phpstan-type Metadata_Attributes array{
 *   '@id'?: string,
 *   '@type'?: string,
 *   headline?: string,
 *   url?: string,
 *   image?: Metadata_Image,
 *   thumbnailUrl?: string,
 *   articleSection?: string,
 *   creator?: string[],
 *   author?: Metadata_Author[],
 *   publisher?: Metadata_Publisher,
 *   keywords?: string[],
 *   dateCreated?: string,
 *   datePublished?: string,
 *   dateModified?: string,
 *   custom_metadata?: string,
 * }
 *
 * @phpstan-type Metadata_Image array{
 *   '@type': 'ImageObject',
 *   url: string,
 * }
 *
 * @phpstan-type Metadata_Author array{
 *   '@type': 'Person',
 *   name: string,
 * }
 *
 * @phpstan-type Metadata_Publisher array{
 *   '@type': 'Organization',
 *   name: string,
 *   logo: string,
 * }
 */
class Metadata {
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
	 * Creates Parse.ly metadata object from post metadata.
	 *
	 * @param WP_Post $post object.
	 * @return Metadata_Attributes
	 */
	public function construct_metadata( WP_Post $post ) {
		$options           = $this->parsely->get_options();
		$queried_object_id = get_queried_object_id();

		if ( is_front_page() ) {
			if ( ! is_paged() ) {
				$builder = new Front_Page_Builder( $this->parsely );
			} else {
				$builder = new Paginated_Front_Page_Builder( $this->parsely );
			}
		} elseif ( 'page' === get_option( 'show_on_front' ) && ! get_page_on_front() ) {
			$builder = new Front_Page_Builder( $this->parsely );
		} elseif (
			is_home() && (
				! ( 'page' === get_option( 'show_on_front' ) && ! get_page_on_front() ) ||
				get_page_for_posts() === $queried_object_id
			)
		) {
			$builder = new Page_For_Posts_Builder( $this->parsely );
		} elseif ( is_author() ) {
			$builder = new Author_Archive_Builder( $this->parsely );
		} elseif ( is_category() || is_post_type_archive() || is_tax() ) {
			$builder = new Category_Builder( $this->parsely );
		} elseif ( is_date() ) {
			$builder = new Date_Builder( $this->parsely );
		} elseif ( is_tag() ) {
			$builder = new Tag_Builder( $this->parsely );
		} elseif ( in_array( get_post_type( $post ), $options['track_post_types'], true ) && Parsely::post_has_trackable_status( $post ) ) {
			$builder = new Post_Builder( $this->parsely, $post );
		} elseif ( in_array( get_post_type( $post ), $options['track_page_types'], true ) && Parsely::post_has_trackable_status( $post ) ) {
			$builder = new Page_Builder( $this->parsely, $post );
		}

		if ( isset( $builder ) ) {
			$parsely_page = $builder->get_metadata();
		} else {
			$parsely_page = array();
		}

		/**
		 * Filters the structured metadata.
		 *
		 * @since 2.5.0
		 * @var mixed
		 *
		 * @param array $parsely_page Existing structured metadata for a page.
		 * @param WP_Post $post Post object.
		 * @param array $options The Parse.ly options.
		 */
		$filtered = apply_filters( 'wp_parsely_metadata', $parsely_page, $post, $options );
		if ( is_array( $filtered ) ) {
			return $filtered;
		}

		return array();
	}
}
