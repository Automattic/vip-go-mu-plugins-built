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
use Parsely\Parsely;
use Parsely\Utils\Utils;
use WP_Post;

use const Parsely\PARSELY_CACHE_GROUP;

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
	protected $smart_link_id = 0;

	/**
	 * The post ID of the suggested link (link source).
	 *
	 * @since 3.16.0
	 * @var int The post ID of the suggested link, 0 if not set.
	 */
	public $source_post_id = 0;

	/**
	 * The context of the smart link.
	 *
	 * For example, 'traffic_boost' or 'smart_linking'.
	 *
	 * @since 3.19.0
	 * @var string|null The context of the smart link.
	 */
	protected $context = null;

	/**
	 * The source post object.
	 *
	 * @since 3.19.0
	 *
	 * @var WP_Post|null The source post.
	 */
	protected $source_post;

	/**
	 * The post ID of the link destination.
	 *
	 * @since 3.16.0
	 * @var int The post ID of the link destination, 0 if not set.
	 */
	public $destination_post_id = 0;

	/**
	 * The post type of the destination post.
	 *
	 * @since 3.16.0
	 * @var string The post type of the destination post.
	 */
	public $destination_post_type = 'external';

	/**
	 * The post type of the source post.
	 *
	 * @since 3.19.0
	 * @var string The post type of the source post.
	 */
	public $source_post_type = 'unknown';

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
	 * The status of the smart link.
	 *
	 * @since 3.19.0
	 * @var string|null The status of the smart link.
	 */
	protected $status = null;

	/**
	 * Whether the smart link exists on the database.
	 *
	 * @since 3.16.0
	 * @var bool Whether the link exists.
	 */
	private $exists = false;

	/**
	 * The post meta of the smart link object.
	 *
	 * @since 3.19.0
	 * @var array<string,array<int,mixed>> The post meta of the smart link.
	 */
	private $smart_link_post_meta = array();

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
		if ( '' !== $href ) {
			$this->set_href( $href );
		}

		// Set the title to be the destination post title if the destination post ID is set.
		if ( 0 !== $this->destination_post_id ) {
			$this->title = get_the_title( $this->destination_post_id );
		} else {
			$this->title = $title;
		}

		$this->text   = $text;
		$this->offset = $offset;
		$this->set_source_post_id( $post_id );

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
		$cache_key = self::get_uid_to_smart_link_cache_key( $uid );
		$cached    = wp_cache_get( $cache_key, PARSELY_CACHE_GROUP );

		if ( false !== $cached && is_numeric( $cached ) ) {
			return (int) $cached;
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
						'field'            => 'slug',
						'terms'            => (string) $this->source_post_id,
					),
				),
			)
		);

		if ( $smart_links->have_posts() && is_int( $smart_links->posts[0] ) ) {
			wp_cache_set(
				$cache_key,
				$smart_links->posts[0],
				PARSELY_CACHE_GROUP,
				WEEK_IN_SECONDS
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

		if ( null === $smart_link || 'parsely_smart_link' !== $smart_link->post_type ) {
			$this->exists = false;
			return false;
		}

		$this->exists = true;

		$this->uid = $smart_link->post_title;

		// Load the Smart Link properties from the post meta.
		$this->load_post_meta();

		$this->title  = $this->get_string_meta( '_smart_link_title' );
		$this->href   = $this->get_string_meta( '_smart_link_href' );
		$this->text   = $this->get_string_meta( '_smart_link_text' );
		$this->offset = $this->get_int_meta( '_smart_link_offset' );

		$this->status = $this->get_status();

		// Load the context of the smart link, if it exists.
		if ( isset( $this->smart_link_post_meta['_smart_link_context'] ) ) {
			$this->context = $this->get_string_meta( '_smart_link_context' );
		}

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
			$this->destination_post_id = Utils::get_post_id_by_url( $this->href );
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

		$did_update = false;
		if ( $this->exists() ) {
			// If it exists, try to update the existing post.
			$updated = wp_update_post(
				array(
					'ID'         => $this->smart_link_id,
					'post_title' => $this->uid,
				),
				true // Return WP_Error if the post is not updated.
			);

			if ( is_wp_error( $updated ) ) {
				// If the post is not updated, there is an invalid post ID cached.
				// Flush the cache to avoid future errors.
				$this->flush_cache();
			} else {
				$did_update = true;
			}
		}

		// If the smart link does not exist, or if the post was not updated, create a new post.
		if ( ! $did_update || ! $this->exists ) {
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
			$this->exists        = true;
			wp_cache_set(
				self::get_uid_to_smart_link_cache_key( $this->uid ),
				$post_id,
				PARSELY_CACHE_GROUP,
				WEEK_IN_SECONDS
			);
		}

		// Update the smart link meta.
		$meta = array(
			'_smart_link_title'  => $this->title,
			'_smart_link_href'   => $this->href,
			'_smart_link_text'   => $this->text,
			'_smart_link_offset' => $this->offset,
		);

		if ( null !== $this->context ) {
			$meta['_smart_link_context'] = $this->context;
		}

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

		// Update the status term.
		if ( null !== $this->status && Smart_Link_Status::is_valid_status( $this->status ) ) {
			wp_set_post_terms( $this->smart_link_id, $this->status, 'smart_link_status' );
		} else {
			wp_set_post_terms( $this->smart_link_id, Smart_Link_Status::PENDING, 'smart_link_status' );
		}

		// Flush all the associated cache on the source and destination posts.
		$this->flush_all_cache();

		return true;
	}

	/**
	 * Removes the smart link from the database.
	 *
	 * @since 3.19.0
	 *
	 * @return bool True if the smart link was removed successfully, false otherwise.
	 */
	public function delete(): bool {
		if ( 0 === $this->smart_link_id ) {
			return false;
		}

		// Delete the post object.
		$deleted = wp_delete_post( $this->smart_link_id, true );

		if ( $deleted instanceof WP_Post ) {
			$this->smart_link_id = 0;
			$this->exists        = false;
			$this->status        = null;
			$this->flush_all_cache();

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
	 * Updates the UID of the smart link.
	 *
	 * @since 3.19.0
	 */
	public function update_uid(): void {
		$this->uid = $this->generate_uid();
	}

	/**
	 * Returns the href of the smart link with ITM parameters appended.
	 *
	 * @since 3.19.0
	 *
	 * @param bool $skip_utm_params Whether to skip the ITM parameters.
	 * @return string The href of the smart link with ITM parameters appended.
	 */
	public function get_link_href( $skip_utm_params = false ): string {
		if ( $skip_utm_params ) {
			return $this->href;
		}

		$params = array(
			'campaign' => 'wp-parsely',
			'medium'   => 'smart-link',
			'term'     => $this->uid,
		);

		// If the context is set, add it to the params as the source.
		if ( null !== $this->get_context() ) {
			// Replace underscores with hyphens, for consistency with the ITM parameters.
			$params['source'] = str_replace( '_', '-', $this->get_context() );
		}

		return Utils::append_itm_params( $this->href, $params );
	}

	/**
	 * Returns the context of the smart link.
	 *
	 * @since 3.19.0
	 *
	 * @return string|null The context of the smart link.
	 */
	public function get_context() {
		return $this->context;
	}

	/**
	 * Gets the status of the smart link.
	 *
	 * If the smart link does not have a valid status, it is pending.
	 *
	 * @since 3.19.0
	 *
	 * @return string The status of the smart link.
	 */
	public function get_status(): string {
		if ( null !== $this->status && Smart_Link_Status::is_valid_status( $this->status ) ) {
			return $this->status;
		}

		$status_terms = wp_get_post_terms( $this->smart_link_id, 'smart_link_status' );

		if ( is_wp_error( $status_terms ) || count( $status_terms ) === 0 ) {
			return Smart_Link_Status::PENDING;
		}

		$term = $status_terms[0]->slug;

		if ( ! Smart_Link_Status::is_valid_status( $term ) ) {
			return Smart_Link_Status::PENDING;
		}

		$this->status = $term;
		return $term;
	}

	/**
	 * Checks if the smart link is applied.
	 *
	 * @since 3.19.0
	 *
	 * @return bool True if the smart link is applied, false otherwise.
	 */
	public function is_applied(): bool {
		return $this->get_status() === Smart_Link_Status::APPLIED;
	}

	/**
	 * Sets the status of the smart link.
	 *
	 * @since 3.19.0
	 *
	 * @param string $status The status to set.
	 * @param bool   $save Whether to save the status to the database.
	 * @throws \InvalidArgumentException If the status is invalid.
	 */
	public function set_status( string $status, bool $save = false ): void {
		if ( ! Smart_Link_Status::is_valid_status( $status ) ) {
			throw new \InvalidArgumentException( 'Invalid status' );
		}

		if ( $save && null !== $this->smart_link_id ) {
			wp_set_post_terms( $this->smart_link_id, $status, 'smart_link_status' );
		}

		$this->status = $status;
	}

	/**
	 * Loads the post meta of the smart link object.
	 *
	 * @since 3.19.0
	 */
	private function load_post_meta(): void {
		$post_meta = get_post_meta( $this->smart_link_id );
		/** @var array<string,array<int,mixed>> $post_meta */
		$this->smart_link_post_meta = $post_meta;
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
		if ( ! isset( $this->smart_link_post_meta[ $meta_key ] ) ) {
			return $default_value;
		}

		$meta_value = $this->smart_link_post_meta[ $meta_key ][0];
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
		if ( ! isset( $this->smart_link_post_meta[ $meta_key ] ) ) {
			return $default_value;
		}

		$value = $this->smart_link_post_meta[ $meta_key ][0];
		if ( ! is_numeric( $value ) ) {
			return $default_value;
		}

		return (int) $value;
	}

	/**
	 * Sets the source post from a post object.
	 *
	 * This method is an alias for Smart_Link::set_source_post_id().
	 *
	 * @since 3.19.0
	 *
	 * @see Smart_Link::set_source_post_id()
	 * @param WP_Post     $post The source post.
	 * @param string|null $canonical_url The canonical URL for the source post, to be set if it is not already set.
	 */
	public function set_source_post( WP_Post $post, $canonical_url = null ): void {
		$this->source_post = $post;
		$this->set_source_post_id( $post->ID, $canonical_url );
	}

	/**
	 * Sets the source post ID.
	 *
	 * @since 3.16.0
	 *
	 * @param int         $source_post_id The source post ID.
	 * @param string|null $canonical_url The canonical URL for the source post, to be set if it is not already set.
	 */
	public function set_source_post_id( int $source_post_id, $canonical_url = null ): void {
		if ( 0 === $source_post_id ) {
			return;
		}

		$this->source_post_id = $source_post_id;
		if ( null === $this->source_post ) {
			$this->source_post = get_post( $source_post_id );
		}

		// Get the post type of the source post.
		$post_type = get_post_type( $this->source_post_id );
		if ( false !== $post_type ) {
			$post_type_object = get_post_type_object( $post_type );
			if ( null !== $post_type_object ) {
				$this->source_post_type = $post_type_object->labels->singular_name;
			}
		} else {
			$this->source_post_type = 'unknown';
		}

		// Update the canonical URL for the source post.
		if ( null !== $canonical_url ) {
			Parsely::set_canonical_url( $this->source_post_id, $canonical_url );
		}
	}

	/**
	 * Sets the destination post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_Post     $post The destination post.
	 * @param string|null $canonical_url The canonical URL for the destination post, to be set if it is not already set.
	 */
	public function set_destination_post( WP_Post $post, $canonical_url = null ): void {
		$this->destination_post_id = $post->ID;
		$this->href                = get_permalink( $post );

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

		// Update the canonical URL for the destination post.
		if ( null !== $canonical_url ) {
			Parsely::set_canonical_url( $this->destination_post_id, $canonical_url );
		}
	}

	/**
	 * Sets the destination post ID.
	 *
	 * @since 3.19.0
	 *
	 * @see Smart_Link::set_destination_post()
	 * @param int         $destination_post_id The destination post ID.
	 * @param string|null $canonical_url The canonical URL for the destination post, to be set if it is not already set.
	 */
	public function set_destination_post_id( int $destination_post_id, $canonical_url = null ): void {
		$post = get_post( $destination_post_id );
		if ( null === $post ) {
			return;
		}

		$this->set_destination_post( $post, $canonical_url );
	}

	/**
	 * Sets the UID of the smart link.
	 *
	 * @since 3.19.0
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
		$this->href          = $href;
		$destination_post_id = Utils::get_post_id_by_url( $href );

		if ( 0 !== $destination_post_id ) {
			// Set the destination post ID, and update the canonical URL.
			$this->set_destination_post_id( $destination_post_id, $href );
		}
	}

	/**
	 * Sets the context of the smart link.
	 *
	 * @since 3.19.0
	 *
	 * @param string $context The context of the smart link.
	 */
	public function set_context( string $context ): void {
		$this->context = $context;
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
		return md5( $this->source_post_id . $this->destination_post_id . $this->href . $this->title . $this->text . $this->offset );
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
			'href'          => array(
				'raw' => $this->href,
				'itm' => $this->get_link_href(),
			),
			'title'         => $this->title,
			'text'          => $this->text,
			'offset'        => $this->offset,
			'context'       => $this->context,
			'status'        => $this->status,
			'applied'       => $this->is_applied(),
			'source'        => array(
				'post_type'     => $this->source_post_type,
				'post_id'       => $this->source_post_id,
				'canonical_url' => Parsely::get_canonical_url_from_post( $this->source_post_id ),
			),
			'destination'   => array(
				'post_type'     => $this->destination_post_type,
				'post_id'       => $this->destination_post_id,
				'canonical_url' => Parsely::get_canonical_url_from_post( $this->destination_post_id ),
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
		$smart_link = new Smart_Link( $data['href']['raw'], $data['title'], $data['text'], $data['offset'] );

		if ( isset( $data['uid'] ) ) {
			$smart_link->set_uid( $data['uid'] );

			if ( $smart_link->exists() ) {
				$smart_link->load();
				// Update the fields.
				$smart_link->set_href( $data['href']['raw'] );
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
	 * @return Smart_Link|false The smart link object, or false if it does not exist.
	 */
	public static function get_smart_link_by_id( int $smart_link_id ) {
		$smart_link                = new Smart_Link( '', '', '', 0 );
		$smart_link->smart_link_id = $smart_link_id;
		if ( $smart_link->load() ) {
			return $smart_link;
		}

		return false;
	}

	/**
	 * Gets smart links based on the specified parameters.
	 *
	 * @since 3.19.0
	 *
	 * @param int                                                                  $post_id The post ID to get the smart links for.
	 * @param string                                                               $type The type of smart links to get (outbound or inbound or all).
	 * @param string                                                               $status The status of the smart links to get (all or pending or applied).
	 * @param array<string,mixed>                                                  $args WP_Query arguments to pass to the query.
	 * @param callable(Smart_Link):(Smart_Link|Inbound_Smart_Link|false|null)|null $process_smart_link_callback A callback to process each individual smart link.
	 * @return array<Smart_Link> The smart links.
	 */
	public static function get_smart_links( int $post_id, string $type, string $status, array $args = array(), $process_smart_link_callback = null ): array {
		if ( ! Smart_Link_Status::is_valid_status( $status ) ) {
			$status = 'all';
			_doing_it_wrong( __METHOD__, 'Invalid status, defaulting to all.', '3.19.0' );
		}

		if ( ! in_array( $type, array( 'outbound', 'inbound', 'all' ), true ) ) {
			_doing_it_wrong( __METHOD__, 'Invalid type, defaulting to outbound.', '3.19.0' );
			$type = 'outbound';
		}

		$skip_cache     = isset( $args['skip_cache'] ) && true === $args['skip_cache'];
		$cache_key      = self::get_smart_links_for_post_cache_key( $type, $status );
		$cache_group    = self::get_smart_links_post_cache_group( $post_id );
		$smart_link_ids = false;

		// If the cache is not being skipped, get the smart links from the cache.
		if ( ! $skip_cache ) {
			/** @var array<int>|false $smart_link_ids */
			$smart_link_ids = wp_cache_get( $cache_key, $cache_group );
		}

		if ( false === $smart_link_ids ) {
			$tax_query = array();

			// Add the tax query for the type of smart links to get.
			if ( 'outbound' === $type ) {
				$tax_query[] = array(
					'taxonomy'         => 'smart_link_source',
					'include_children' => false, // Performance optimization.
					'field'            => 'slug',
					'terms'            => (string) $post_id,
				);
			} elseif ( 'inbound' === $type ) {
				$tax_query[] = array(
					'taxonomy'         => 'smart_link_destination',
					'include_children' => false, // Performance optimization.
					'field'            => 'slug',
					'terms'            => (string) $post_id,
				);
			}

			// Add the tax query for the status of the smart links to get.
			if ( Smart_Link_Status::ALL === $status ) {
				$tax_query[] = array(
					'taxonomy'         => 'smart_link_status',
					'include_children' => false,
					'field'            => 'slug',
					'terms'            => Smart_Link_Status::get_all_statuses(),
				);
			} else {
				$tax_query[] = array(
					'taxonomy'         => 'smart_link_status',
					'include_children' => false,
					'field'            => 'slug',
					'terms'            => array( $status ),
				);
			}
			// Build the query arguments.
			$query_args = array(
				'post_type'      => 'parsely_smart_link',
				'posts_per_page' => -1,
				'fields'         => 'ids', // Only get the post IDs to improve performance.
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array_merge( array( 'relation' => 'AND' ), $tax_query ),
			);

			// Merge the query arguments with the additional arguments.
			$query_args = array_merge( $query_args, $args );

			// Get the smart links post objects.
			$smart_links_query = new \WP_Query( $query_args );

			// Cache the queried IDs.
			$smart_link_ids = $smart_links_query->posts;
			wp_cache_set( $cache_key, $smart_link_ids, $cache_group, DAY_IN_SECONDS );
		}

		// Create and process the smart links.
		$smart_links = array();
		foreach ( $smart_link_ids as $smart_link_id ) {
			/** @var int $smart_link_id */
			$smart_link = self::get_smart_link_by_id( $smart_link_id );

			if ( false === $smart_link ) {
				continue;
			}

			if ( is_callable( $process_smart_link_callback ) ) {
				/**
				 * The processed smart link after it has been processed by the callback.
				 *
				 * This callback is used to modify the smart link before it is added to the array,
				 * or false if the smart link should be skipped.
				 *
				 * @since 3.19.0
				 *
				 * @var Smart_Link|Inbound_Smart_Link|false|null $smart_link
				 */
				$smart_link = $process_smart_link_callback( $smart_link );
			}

			if ( false === $smart_link || null === $smart_link ) {
				continue;
			}

			$smart_links[] = $smart_link;
		}

		return $smart_links;
	}

	/**
	 * Gets the outbound smart links in a post.
	 *
	 * Outbound smart links are smart links that link to other posts.
	 *
	 * @since 3.16.0
	 * @since 3.19.0 Added status parameter.
	 *
	 * @param int    $post_id The post ID to get the smart links for.
	 * @param string $status The status of the smart links to get.
	 * @return array<Smart_Link> The smart links in the post.
	 */
	public static function get_outbound_smart_links( int $post_id, string $status = Smart_Link_Status::ALL ): array {
		/** @var array<Smart_Link> */
		return self::get_smart_links(
			$post_id,
			'outbound',
			$status,
			array(
				'orderby' => 'date',
				'order'   => 'ASC',
			)
		);
	}

	/**
	 * Gets the inbound smart links in a post.
	 *
	 * Inbound smart links are links on other posts that link to the post.
	 *
	 * @since 3.16.0
	 * @since 3.19.0 Added status parameter.
	 *
	 * @param int    $post_id The post ID to get the smart links for.
	 * @param string $status The status of the smart links to get.
	 * @return array<Inbound_Smart_Link> The smart links in the post.
	 */
	public static function get_inbound_smart_links( int $post_id, string $status = Smart_Link_Status::ALL ): array {
		/** @var array<Inbound_Smart_Link> */
		return self::get_smart_links(
			$post_id,
			'inbound',
			$status,
			array(
				'orderby' => 'date modified',
				'order'   => 'ASC',
			),
			/**
			 * Process the smart link to convert it to an inbound smart link.
			 *
			 * @param Smart_Link $smart_link The smart link to process.
			 * @return Inbound_Smart_Link|false The processed smart link.
			 */
			function ( Smart_Link $smart_link ) {
				$smart_link = Inbound_Smart_Link::from_smart_link( $smart_link );
				$is_linked  = $smart_link->is_linked();
				$status     = $smart_link->get_status();

				// If the smart link is linked and the status is pending, set the status to applied.
				// This is to ensure backwards compatibility with Parse.ly < 3.18.0.
				if ( $is_linked && Smart_Link_Status::PENDING === $status ) {
					$smart_link->set_status( Smart_Link_Status::APPLIED, true );
					$status = Smart_Link_Status::APPLIED;
				}

				// Check if this inbound smart link is still linked to a post.
				// If not, do not add it to the array, and instead remove it.
				if ( Smart_Link_Status::APPLIED === $status && ! $is_linked ) {
					$smart_link->delete();
					return false;
				}

				/** @var Inbound_Smart_Link */
				return $smart_link;
			}
		);
	}

	/**
	 * Gets the link counts for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param int    $post_id The post ID to get the link counts for.
	 * @param string $status The status of the smart links to get.
	 * @return array<string,int> The link counts.
	 */
	public static function get_link_counts( int $post_id, string $status = Smart_Link_Status::ALL ): array {
		if ( ! Smart_Link_Status::is_valid_status( $status ) ) {
			$status = Smart_Link_Status::ALL;
			_doing_it_wrong( __METHOD__, 'Invalid status, defaulting to all.', '3.19.0' );
		}

		$cache_key   = self::get_smart_link_counts_cache_key( $status );
		$cache_group = self::get_smart_links_post_cache_group( $post_id );
		$link_counts = wp_cache_get( $cache_key, $cache_group );

		if ( false !== $link_counts && is_array( $link_counts ) ) {
			return $link_counts;
		}

		$base_query_args = array(
			'post_type'      => 'parsely_smart_link',
			'posts_per_page' => 0,
			'fields'         => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			'tax_query'      => array(),
		);

		// Build the tax query for the status.
		if ( Smart_Link_Status::ALL !== $status ) {
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			$base_query_args['tax_query'] = array(
				array(
					'taxonomy' => 'smart_link_status',
					'field'    => 'slug',
					'terms'    => array( $status ),
				),
			);
		}

		// Build the query arguments for the inbound links.
		$inbound_query_args = $base_query_args;
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		$inbound_query_args['tax_query'] = array_merge(
			$inbound_query_args['tax_query'],
			array(
				array(
					'taxonomy' => 'smart_link_destination',
					'field'    => 'slug',
					'terms'    => $post_id,
				),
			)
		);

		// Build the query arguments for the outbound links.
		$outbound_query_args = array_merge(
			$base_query_args,
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query' => array_merge(
					$base_query_args['tax_query'],
					array(
						array(
							'taxonomy' => 'smart_link_source',
							'field'    => 'slug',
							'terms'    => $post_id,
						),
					)
				),
			)
		);

		// Get the inbound links.
		$inbound_links = new \WP_Query( $inbound_query_args );

		// Get the outbound links.
		$outbound_links = new \WP_Query( $outbound_query_args );

		$link_counts = array(
			'inbound'  => $inbound_links->found_posts,
			'outbound' => $outbound_links->found_posts,
		);

		wp_cache_set( $cache_key, $link_counts, $cache_group, WEEK_IN_SECONDS );

		return $link_counts;
	}

	/**
	 * Flushes the cache for a single smart link.
	 *
	 * @since 3.19.0
	 */
	protected function flush_cache(): void {
		// Delete the cache for the smart link UID to post ID association.
		$cache_key = self::get_uid_to_smart_link_cache_key( $this->uid );
		wp_cache_delete( $cache_key, PARSELY_CACHE_GROUP );
	}

	/**
	 * Flushes the cache for all smart links in a post.
	 *
	 * @since 3.19.0
	 */
	public function flush_all_cache(): void {
		$this->flush_cache();

		if ( $this->source_post_id > 0 ) {
			static::flush_cache_by_post_id( $this->source_post_id );
		}

		if ( $this->destination_post_id > 0 ) {
			static::flush_cache_by_post_id( $this->destination_post_id );
		}
	}

	/**
	 * Generates a cache key for the smart link.
	 *
	 * @since 3.19.0
	 *
	 * @param string $uid The unique identifier for the cache key.
	 * @return string The cache key.
	 */
	protected static function get_uid_to_smart_link_cache_key( string $uid ): string {
		return sprintf( 'smart-link-uid-map-%s', $uid );
	}

	/**
	 * Gets the cache key for all smart links in a post.
	 *
	 * @since 3.19.0
	 *
	 * @param string $type The type of smart links ('outbound', 'inbound', or 'all').
	 * @param string $status The status of the smart links ('all', 'pending', or 'applied').
	 *
	 * @return string The cache key.
	 */
	protected static function get_smart_links_for_post_cache_key( string $type, string $status ): string {
		return sprintf( 'smart-links-post-id-map-%s-%s', $type, $status );
	}

	/**
	 * Gets the cache key for all counts of smart links in a post.
	 *
	 * @since 3.19.0
	 *
	 * @param string $status The status of the smart links ('all', 'pending', or 'applied').
	 *
	 * @return string The cache key.
	 */
	protected static function get_smart_link_counts_cache_key( string $status ): string {
		return sprintf( 'smart-link-counts-%s', $status );
	}

	/**
	 * Generates a cache group for smart links on a post. Useful with wp_cache_flush_group()
	 * to flush all smart link caches on a post.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID.
	 * @return string The cache group.
	 */
	protected static function get_smart_links_post_cache_group( int $post_id ): string {
		return sprintf( '%s-smart-links-%d', PARSELY_CACHE_GROUP, $post_id );
	}

	/**
	 * Flushes the cache for all smart links associated with a given post.
	 *
	 * @since 3.19.0
	 *
	 * @param int $post_id The post ID to flush the cache for.
	 */
	protected static function flush_cache_by_post_id( int $post_id ): void {
		$cache_group = self::get_smart_links_post_cache_group( $post_id );

		if ( function_exists( 'wp_cache_flush_group' ) && wp_cache_supports( 'flush_group' ) ) {
			wp_cache_flush_group( $cache_group );
		} else {
			$statuses = Smart_Link_Status::get_all_statuses();
			$types    = array( 'outbound', 'inbound', 'all' );

			foreach ( $statuses as $status ) {
				// Delete smart link count cache.
				$smart_link_counts_cache_key = self::get_smart_link_counts_cache_key( $status );
				wp_cache_delete( $smart_link_counts_cache_key, $cache_group );

				// Delete smart links caches.
				foreach ( $types as $type ) {
					$cache_key = self::get_smart_links_for_post_cache_key( $type, $status );
					wp_cache_delete( $cache_key, $cache_group );
				}
			}
		}
	}
}
