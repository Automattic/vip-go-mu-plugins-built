<?php
/**
 * Smart Link model: Represents a smart link suggestion returned by the Smart
 * Linking API
 *
 * @package Parsely
 * @since   3.16.0
 */

declare(strict_types=1);

namespace Parsely\Models;

use InvalidArgumentException;

/**
 * Smart Link class.
 *
 * Represents a smart link suggestion returned by the Smart Linking API.
 *
 * @since 3.16.0
 */
class Smart_Link extends Base_Model {
	/**
	 * The internal ID of the smart link custom post type object.
	 *
	 * @since 3.16.0
	 * @var int The ID of the smart link.
	 */
	private $smart_link_id = 0;

	/**
	 * The post ID of the suggested link (link source).
	 *
	 * @since 3.16.0
	 * @var int The post ID of the suggested link, 0 if not set.
	 */
	public $source_post_id = 0;

	/**
	 * The post ID of the link destination.
	 *
	 * @since 3.16.0
	 * @var int The post ID of the link destination, 0 if not set.
	 */
	public $destination_post_id = 0;

	/**
	 * The post type of the suggested link.
	 *
	 * @since 3.16.0
	 * @var string The post type of the suggested link.
	 */
	public $destination_post_type = 'external';

	/**
	 * The URL of the suggested link.
	 *
	 * @since 3.16.0
	 * @var string The URL of the suggested link.
	 */
	protected $href;

	/**
	 * The title of the suggested link.
	 *
	 * @since 3.16.0
	 * @var string The title of the suggested link.
	 */
	public $title;

	/**
	 * The text of the suggested link.
	 *
	 * @since 3.16.0
	 * @var string The text of the suggested link.
	 */
	public $text;

	/**
	 * The offset/position for the suggested link.
	 *
	 * @since 3.16.0
	 * @var int The offset/position for the suggested link.
	 */
	public $offset;

	/**
	 * The unique ID of the suggested link.
	 *
	 * @since 3.16.0
	 * @var string The unique ID of the suggested link.
	 */
	public $uid;

	/**
	 * Whether the link has been applied.
	 *
	 * @since 3.16.0
	 * @var bool Whether the link has been applied.
	 */
	public $applied = false;

	/**
	 * Whether the smart link exists on the database.
	 *
	 * @since 3.16.0
	 * @var bool Whether the link exists.
	 */
	private $exists = false;

	/**
	 * Smart Link constructor.
	 *
	 * @since 3.16.0
	 *
	 * @param string $href The URL of the suggested link.
	 * @param string $title The title of the suggested link.
	 * @param string $text The text of the suggested link.
	 * @param int    $offset The offset/position for the suggested link.
	 * @param int    $post_id The post ID of the suggested link.
	 */
	public function __construct(
		string $href,
		string $title,
		string $text,
		int $offset,
		int $post_id = 0
	) {
		$this->set_href( $href );
		$this->title          = $title;
		$this->text           = $text;
		$this->offset         = $offset;
		$this->source_post_id = $post_id;

		parent::__construct();
	}

	/**
	 * Gets the smart link post object by UID.
	 *
	 * @since 3.16.0
	 *
	 * @param string $uid The UID of the smart link.
	 * @return int The ID of the smart link post object.
	 */
	private function get_smart_link_object_by_uid( string $uid ): int {
		$cached = wp_cache_get( $uid . $this->source_post_id, 'wp_parsely_smart_link_id' );
		if ( is_int( $cached ) && 0 !== $cached ) {
			return $cached;
		}

		$smart_links = new \WP_Query(
			array(
				'post_type'      => 'parsely_smart_link',
				'fields'         => 'ids', // Only get the post IDs to improve performance.
				'posts_per_page' => 1,
				'title'          => $uid,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array(
					array(
						'taxonomy'         => 'smart_link_source',
						'include_children' => false, // Performance optimization.
						'field'            => 'name',
						'terms'            => (string) $this->source_post_id,
					),
				),
			)
		);

		if ( $smart_links->have_posts() && is_int( $smart_links->posts[0] ) ) {
			wp_cache_set(
				$uid . $this->source_post_id,
				$smart_links->posts[0],
				'wp_parsely_smart_link_id'
			);
			return $smart_links->posts[0];
		}

		return 0;
	}

	/**
	 * Loads the smart link post object.
	 *
	 * @since 3.16.0
	 *
	 * @return bool True if the smart link was loaded successfully, false otherwise.
	 */
	private function load(): bool {
		if ( 0 === $this->smart_link_id ) {
			// Try to get the smart link id from the UID.
			$this->smart_link_id = $this->get_smart_link_object_by_uid( $this->uid );
			if ( 0 === $this->smart_link_id ) {
				$this->exists = false;
				return false;
			}
		}

		$smart_link = get_post( $this->smart_link_id );

		if ( null === $smart_link ) {
			$this->exists = false;
			return false;
		}

		$this->exists  = true;
		$this->applied = true;

		$this->uid = $smart_link->post_title;

		// Load the Smart Link properties from the post meta.
		$this->title  = $this->get_string_meta( '_smart_link_title' );
		$this->href   = $this->get_string_meta( '_smart_link_href' );
		$this->text   = $this->get_string_meta( '_smart_link_text' );
		$this->offset = $this->get_int_meta( '_smart_link_offset' );

		// Load the source post ID.
		$source_terms = wp_get_post_terms( $this->smart_link_id, 'smart_link_source' );
		if ( ! is_wp_error( $source_terms ) && count( $source_terms ) > 0 ) {
			$source_term          = $source_terms[0];
			$this->source_post_id = (int) $source_term->name;
		}

		// Load the destination post ID.
		$destination_terms = wp_get_post_terms( $this->smart_link_id, 'smart_link_destination' );
		if ( ! is_wp_error( $destination_terms ) && count( $destination_terms ) > 0 ) {
			$destination_term = $destination_terms[0];
			if ( 'external' !== $destination_term->slug ) {
				$this->destination_post_id = (int) $destination_term->name;
			}
		}

		// If the destination post ID is not set, try to get it from the URL.
		if ( 0 === $this->destination_post_id ) {
			$this->destination_post_id = $this->get_post_id_by_url( $this->href );
		}

		// Get the post type of the destination post.
		$post_type = get_post_type( $this->destination_post_id );
		if ( false !== $post_type ) {
			$post_type_object = get_post_type_object( $post_type );
			if ( null !== $post_type_object ) {
				$this->destination_post_type = $post_type_object->labels->singular_name;
			}
		} else {
			$this->destination_post_type = 'external';
		}

		return true;
	}

	/**
	 * Saves the smart link to the post meta.
	 *
	 * @since 3.16.0
	 *
	 * @return bool True if the smart link was saved successfully, false otherwise.
	 */
	public function save(): bool {
		if ( 0 === $this->source_post_id ) {
			return false;
		}

		if ( ! $this->exists() ) {
			// Create the post object.
			$post_id = wp_insert_post(
				array(
					'post_type'   => 'parsely_smart_link',
					'post_title'  => $this->uid,
					'post_status' => 'publish',
				)
			);

			if ( 0 === $post_id ) {
				return false;
			}

			$this->smart_link_id = $post_id;
			wp_cache_set( $this->uid . $this->source_post_id, $post_id, 'wp_parsely_smart_link_id' );
		}

		// Update UID.
		wp_update_post(
			array(
				'ID'         => $this->smart_link_id,
				'post_title' => $this->uid,
			)
		);

		// Update the smart link meta.
		$meta = array(
			'_smart_link_title'  => $this->title,
			'_smart_link_href'   => $this->href,
			'_smart_link_text'   => $this->text,
			'_smart_link_offset' => $this->offset,
		);
		foreach ( $meta as $key => $value ) {
			update_post_meta( $this->smart_link_id, $key, $value );
		}

		// Add the source term.
		wp_set_post_terms( $this->smart_link_id, (string) $this->source_post_id, 'smart_link_source' );

		// Add the destination term.
		if ( 0 !== $this->destination_post_id ) {
			wp_set_post_terms( $this->smart_link_id, (string) $this->destination_post_id, 'smart_link_destination' );
		} else {
			wp_set_post_terms( $this->smart_link_id, 'external', 'smart_link_destination' );
		}

		$this->applied = true;
		$this->exists  = true;

		return true;
	}

	/**
	 * Removes the smart link from the database.
	 *
	 * @since 3.16.0
	 *
	 * @return bool True if the smart link was removed successfully, false otherwise.
	 */
	public function delete(): bool {
		if ( 0 === $this->smart_link_id ) {
			return false;
		}

		// Delete the post object.
		$deleted = wp_delete_post( $this->smart_link_id, true );

		if ( false !== $deleted && null !== $deleted && is_a( $deleted, 'WP_Post' ) ) {
			$this->smart_link_id = 0;
			$this->exists        = false;
			wp_cache_delete( $this->uid . $this->source_post_id, 'wp_parsely_smart_link_id' );
			return true;
		}

		return false;
	}

	/**
	 * Checks if the smart link is saved in the database.
	 *
	 * @since 3.16.0
	 *
	 * @return bool True if the smart link exists, false otherwise.
	 */
	public function exists(): bool {
		if ( $this->exists ) {
			return true;
		}

		// Try to find a smart link with the same UID.
		$smart_link_id = $this->get_smart_link_object_by_uid( $this->uid );

		if ( 0 !== $smart_link_id ) {
			$this->exists        = true;
			$this->smart_link_id = $smart_link_id;
			return true;
		}

		$this->exists        = false;
		$this->smart_link_id = 0;
		return false;
	}

	/**
	 * Gets a string meta value from the smart link post.
	 *
	 * @since 3.16.0
	 *
	 * @param string $meta_key The meta key to get the value for.
	 * @param string $default_value The default value to return if the meta value is not a string.
	 * @return string The meta value.
	 */
	private function get_string_meta( string $meta_key, string $default_value = '' ): string {
		$meta_value = get_post_meta( $this->smart_link_id, $meta_key, true );
		return is_string( $meta_value ) ? $meta_value : $default_value;
	}

	/**
	 * Gets an integer meta value from the smart link post.
	 *
	 * @since 3.16.0
	 *
	 * @param string $meta_key The meta key to get the value for.
	 * @param int    $default_value The default value to return if the meta value is not an integer.
	 * @return int The meta value.
	 */
	private function get_int_meta( string $meta_key, int $default_value = 0 ): int {
		$meta_value = get_post_meta( $this->smart_link_id, $meta_key, true );
		return is_int( $meta_value ) ? $meta_value : $default_value;
	}

	/**
	 * Gets the post ID by URL.
	 *
	 * @since 3.16.0
	 *
	 * @param string $url The URL to get the post ID for.
	 * @return int The post ID of the URL, 0 if not found.
	 */
	private function get_post_id_by_url( string $url ): int {
		$cache = wp_cache_get( $url, 'wp_parsely_smart_link_url_to_postid' );
		if ( is_integer( $cache ) ) {
			return $cache;
		}

		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			$post_id = wpcom_vip_url_to_postid( $url );
		} else {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
			$post_id = url_to_postid( $url );
			wp_cache_set( $url, $post_id, 'wp_parsely_smart_link_url_to_postid' );
		}

		return $post_id;
	}

	/**
	 * Sets the source post ID.
	 *
	 * @since 3.16.0
	 *
	 * @param int $source_post_id The source post ID.
	 */
	public function set_source_post_id( int $source_post_id ): void {
		$this->source_post_id = $source_post_id;
	}

	/**
	 * Sets the UID of the smart link.
	 *
	 * @since 3.16.0
	 *
	 * @param string $uid The UID of the smart link.
	 */
	public function set_uid( string $uid ): void {
		$this->uid = $uid;
	}

	/**
	 * Sets the href of the smart link.
	 *
	 * @since 3.16.0
	 *
	 * @param string $href The href of the smart link.
	 */
	public function set_href( string $href ): void {
		$this->href                = $href;
		$this->destination_post_id = $this->get_post_id_by_url( $href );

		if ( 0 !== $this->destination_post_id ) {
			$post_type                   = get_post_type( $this->destination_post_id );
			$this->destination_post_type = false !== $post_type ? $post_type : 'external';
		}
	}

	/**
	 * Generates a unique ID for the suggested link.
	 *
	 * It takes the href, title, text, and offset properties and concatenates
	 * them to create a unique ID. This ID is hashed to ensure it is unique.
	 *
	 * @since 3.16.0
	 *
	 * @return string The unique ID.
	 */
	protected function generate_uid(): string {
		return md5( $this->href . $this->title . $this->text . $this->offset );
	}

	/**
	 * Serializes the model to a JSON string.
	 *
	 * @since 3.16.0
	 *
	 * @return array<mixed> The serialized model.
	 */
	public function to_array(): array {
		return array(
			'smart_link_id' => $this->smart_link_id,
			'uid'           => $this->uid,
			'href'          => $this->href,
			'title'         => $this->title,
			'text'          => $this->text,
			'offset'        => $this->offset,
			'applied'       => $this->applied,
			'source'        => array(
				'post_type' => get_post_type( $this->source_post_id ),
				'post_id'   => $this->source_post_id,
			),
			'destination'   => array(
				'post_type' => $this->destination_post_type,
				'post_id'   => $this->destination_post_id,
			),
		);
	}

	/**
	 * Deserializes a JSON string to a model.
	 *
	 * @since 3.16.0
	 *
	 * @throws InvalidArgumentException If the JSON data is invalid.
	 *
	 * @param string $json The JSON string to deserialize.
	 * @return Base_Model The deserialized model.
	 */
	public static function deserialize( string $json ): Base_Model {
		$data = json_decode( $json, true );

		// Validate the JSON data.
		if ( ! is_array( $data ) ) {
			throw new InvalidArgumentException( 'Invalid JSON data' );
		}

		// If the UID has been provided, set it on the model.
		$smart_link = new Smart_Link( $data['href'], $data['title'], $data['text'], $data['offset'] );

		if ( isset( $data['uid'] ) ) {
			$smart_link->set_uid( $data['uid'] );

			if ( $smart_link->exists() ) {
				$smart_link->load();
				// Update the fields.
				$smart_link->set_href( $data['href'] );
				$smart_link->title  = $data['title'];
				$smart_link->text   = $data['text'];
				$smart_link->offset = $data['offset'];
			}
		}

		return $smart_link;
	}

	/**
	 * Gets a smart link by UID.
	 *
	 * @since 3.16.0
	 *
	 * @param string $uid The UID of the smart link.
	 * @param int    $post_id The post ID of the smart link.
	 * @return Smart_Link The smart link object.
	 */
	public static function get_smart_link( string $uid, int $post_id ): Smart_Link {
		$smart_link                 = new Smart_Link( '', '', '', 0 );
		$smart_link->uid            = $uid;
		$smart_link->source_post_id = $post_id;
		$smart_link->load();
		return $smart_link;
	}

	/**
	 * Gets a smart link by post object ID.
	 *
	 * @since 3.16.0
	 *
	 * @param int $smart_link_id The ID of the smart link.
	 * @return Smart_Link The smart link object.
	 */
	private static function get_smart_link_by_id( int $smart_link_id ): Smart_Link {
		$smart_link                = new Smart_Link( '', '', '', 0 );
		$smart_link->smart_link_id = $smart_link_id;
		$smart_link->load();
		return $smart_link;
	}

	/**
	 * Gets the outbound smart links in a post.
	 *
	 * Outbound smart links are smart links that link to other posts.
	 *
	 * @since 3.16.0
	 *
	 * @param int $post_id The post ID to get the smart links for.
	 * @return array<Smart_Link> The smart links in the post.
	 */
	public static function get_outbound_smart_links( int $post_id ): array {
		$smart_links = new \WP_Query(
			array(
				'post_type'      => 'parsely_smart_link',
				'posts_per_page' => -1,
				'fields'         => 'ids', // Only get the post IDs to improve performance.
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array(
					array(
						'taxonomy'         => 'smart_link_source',
						'include_children' => false, // Performance optimization.
						'field'            => 'name',
						'terms'            => (string) $post_id,
					),
				),
			)
		);

		$links = array();
		foreach ( $smart_links->posts as $smart_link_id ) {
			if ( ! is_int( $smart_link_id ) ) {
				continue;
			}
			$smart_link = self::get_smart_link_by_id( $smart_link_id );
			$links[]    = $smart_link;
		}

		return $links;
	}

	/**
	 * Gets the inbound smart links in a post.
	 *
	 * Inbound smart links are links on other posts that link to the post.
	 *
	 * @since 3.16.0
	 *
	 * @param int $post_id The post ID to get the smart links for.
	 * @return array<Inbound_Smart_Link> The smart links in the post.
	 */
	public static function get_inbound_smart_links( int $post_id ): array {
		$smart_links = new \WP_Query(
			array(
				'post_type'      => 'parsely_smart_link',
				'posts_per_page' => -1,
				'fields'         => 'ids', // Only get the post IDs to improve performance.
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array(
					array(
						'taxonomy'         => 'smart_link_destination',
						'include_children' => false, // Performance optimization.
						'field'            => 'name',
						'terms'            => (string) $post_id,
					),
				),
			)
		);

		$links = array();
		foreach ( $smart_links->posts as $smart_link_id ) {
			if ( ! is_int( $smart_link_id ) ) {
				continue;
			}
			$smart_link = self::get_smart_link_by_id( $smart_link_id );
			$smart_link = Inbound_Smart_Link::from_smart_link( $smart_link );

			// Check if this inbound smart link is still linked to a post.
			// If not, do not add it to the array, and instead remove it.
			if ( ! $smart_link->is_linked() ) {
				$smart_link->delete();
				continue;
			}

			$links[] = $smart_link;
		}

		return $links;
	}
}
