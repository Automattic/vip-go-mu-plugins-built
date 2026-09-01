<?php
/**
 * Story entity -- the lifecycle container for content.
 *
 * Groups ideation projects and posts that belong to the same editorial
 * effort. Created automatically at the earliest pipeline entry point and
 * propagated downstream.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Story;

use VIPWorkflows\ModuleInterface;
use WP_Post;
use WP_Error;

/**
 * Story.
 */
class Story implements ModuleInterface {

	public const POST_TYPE = 'vip_story';
	public const META_STORY_ID = '_vip_story_id';

	public const STATUS_IDEATION   = 'ideation';
	public const STATUS_EDITORIAL  = 'editorial';
	public const STATUS_PUBLISHED  = 'published';
	public const STATUS_MONITORING = 'monitoring';
	public const STATUS_REFRESH    = 'refresh';
	public const STATUS_ARCHIVED   = 'archived';

	/**
	 * Wrapped post object.
	 *
	 * @var ?WP_Post
	 */
	private ?WP_Post $post;

	/**
	 * Construct the Story instance.
	 *
	 * @param ?WP_Post $post post.
	 */
	public function __construct( ?WP_Post $post = null ) {
		$this->post = $post;
	}

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'story';
	}

	/**
	 * Initialize the module.
	 *
	 * @return void
	 */
	public function init(): void {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_statuses' ) );
	}

	/**
	 * Register post type.
	 *
	 * @return void
	 */
	public function register_post_type(): void {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels' => array(
					'name'          => __( 'Stories', 'vip-workflows' ),
					'singular_name' => __( 'Story', 'vip-workflows' ),
				),
				'public'              => false,
				'show_ui'             => false,
				'show_in_rest'        => false,
				'exclude_from_search' => true,
				'supports'            => array( 'title' ),
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
			)
		);
	}

	/**
	 * Every pipeline status, in lifecycle order, with the name it goes by.
	 *
	 * The authoritative vocabulary. A story's status is served to the admin as
	 * `pipeline_status` (IdeationController reads `get_status()` straight into
	 * it), so the screens that draw it need the same list — and cannot read this
	 * one without a build step. `src/admin/utils/pipeline-status.js` therefore
	 * holds a copy, and `tests/phpunit/Unit/PipelineStatusTest.php` fails until
	 * the two agree slug for slug and label for label. That guard is why the
	 * list is a method rather than an array built inside the registration below:
	 * both the registration and the test read this, so there is one list.
	 *
	 * @return array<string, string> Status slug => label.
	 */
	public static function statuses(): array {
		return array(
			self::STATUS_IDEATION   => __( 'Ideation', 'vip-workflows' ),
			self::STATUS_EDITORIAL  => __( 'Editorial', 'vip-workflows' ),
			self::STATUS_PUBLISHED  => __( 'Published', 'vip-workflows' ),
			self::STATUS_MONITORING => __( 'Monitoring', 'vip-workflows' ),
			self::STATUS_REFRESH    => __( 'Refresh', 'vip-workflows' ),
			self::STATUS_ARCHIVED   => __( 'Archived', 'vip-workflows' ),
		);
	}

	/**
	 * Register statuses.
	 *
	 * @return void
	 */
	public function register_statuses(): void {
		foreach ( self::statuses() as $key => $label ) {
			register_post_status(
				'story_' . $key,
				array(
					'label'                  => $label,
					'public'                 => false,
					'internal'               => true,
					'show_in_admin_all_list' => false,
				)
			);
		}
	}

	/**
	 * Create a story post.
	 *
	 * @param string $title  Story title.
	 * @param string $status Story status.
	 * @return self|WP_Error Story object or error.
	 */
	public static function create( string $title, string $status ): self|WP_Error {
		$post_id = wp_insert_post(
			array(
				'post_type'   => self::POST_TYPE,
				'post_title'  => $title,
				'post_status' => 'story_' . $status,
				'post_author' => get_current_user_id(),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		return new self( get_post( $post_id ) );
	}

	/**
	 * Get.
	 *
	 * @param int $story_id story id.
	 * @return ?self
	 */
	public static function get( int $story_id ): ?self {
		$post = get_post( $story_id );
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return null;
		}

		return new self( $post );
	}

	/**
	 * Find the story for a given object (ideation project or post).
	 *
	 * @param int $object_id Object ID.
	 */
	public static function for_object( int $object_id ): ?self {
		$story_id = (int) get_post_meta( $object_id, self::META_STORY_ID, true );
		if ( ! $story_id ) {
			return null;
		}

		return self::get( $story_id );
	}

	// ------------------------------------------------------------------
	// Object linking
	// ------------------------------------------------------------------

	/**
	 * Link an object to this story.
	 *
	 * Inserts a row into the join table and sets _vip_story_id meta
	 * on the object for fast reverse lookups.
	 *
	 * @param int    $object_id Object ID.
	 * @param string $object_type Object type.
	 */
	public function add_object( int $object_id, string $object_type ): void {
		global $wpdb;

		$table = $wpdb->prefix . 'vip_story_objects';

		$wpdb->replace(
			$table,
			array(
				'story_id'    => $this->post->ID,
				'object_id'   => $object_id,
				'object_type' => $object_type,
				'added_at'    => current_time( 'mysql' ),
			),
			array( '%d', '%d', '%s', '%s' )
		);

		update_post_meta( $object_id, self::META_STORY_ID, $this->post->ID );
	}

	/**
	 * Get all objects linked to this story, optionally filtered by type.
	 *
	 * @param string|null $type Filter by object_type (ideation, post). Null for all.
	 * @return array Array of [ 'object_id' => int, 'object_type' => string, 'added_at' => string ].
	 */
	public function get_objects( ?string $type = null ): array {
		global $wpdb;

		$table = $wpdb->prefix . 'vip_story_objects';

		if ( $type ) {
			return $wpdb->get_results(
				$wpdb->prepare(
					'SELECT object_id, object_type, added_at FROM %i WHERE story_id = %d AND object_type = %s ORDER BY added_at ASC',
					$table,
					$this->post->ID,
					$type
				),
				ARRAY_A
			);
			return $results ? $results : array();
		}

		$results = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT object_id, object_type, added_at FROM %i WHERE story_id = %d ORDER BY added_at ASC',
				$table,
				$this->post->ID
			),
			ARRAY_A
		);
		return $results ? $results : array();
	}

	/**
	 * Transition the story to a new status.
	 *
	 * @param string $new_status New story status.
	 * @return void
	 */
	public function transition( string $new_status ): void {
		wp_update_post(
			array(
				'ID'          => $this->post->ID,
				'post_status' => 'story_' . $new_status,
			)
		);

		$this->post = get_post( $this->post->ID );
	}

	/**
	 * Get the status.
	 *
	 * @return string
	 */
	public function get_status(): string {
		return str_replace( 'story_', '', $this->post->post_status );
	}

	/**
	 * Get the story post ID.
	 *
	 * @return int Story post ID.
	 */
	public function get_post_id(): int {
		return $this->post->ID;
	}

	/**
	 * Get the title.
	 *
	 * @return string
	 */
	public function get_title(): string {
		return $this->post->post_title;
	}

	/**
	 * Serialize for API responses.
	 */
	public function to_array(): array {
		$objects = $this->get_objects();

		$object_summary = array();
		foreach ( $objects as $obj ) {
			$post = get_post( (int) $obj['object_id'] );
			$object_summary[] = array(
				'id'    => (int) $obj['object_id'],
				'type'  => $obj['object_type'],
				'title' => $post ? $post->post_title : '',
			);
		}

		return array(
			'id'         => $this->post->ID,
			'title'      => $this->post->post_title,
			'status'     => $this->get_status(),
			'objects'    => $object_summary,
			'created_at' => $this->post->post_date,
			'updated_at' => $this->post->post_modified,
		);
	}
}
