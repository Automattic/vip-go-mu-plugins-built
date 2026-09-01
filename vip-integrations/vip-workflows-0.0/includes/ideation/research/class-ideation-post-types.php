<?php
/**
 * Ideation Post Types Registration.
 *
 * Registers the Ideation Project custom post type and its statuses.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Research;

use VIPWorkflows\ModuleInterface;

/**
 * Registers and manages ideation-related post types.
 */
class IdeationPostTypes implements ModuleInterface {


	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'ideation-post-types';
	}

	/**
	 * Post type slug.
	 */
	public const POST_TYPE = 'vip_ideation';

	/**
	 * Post statuses for ideation projects.
	 */
	public const STATUS_DRAFT   = 'draft';
	public const STATUS_ACTIVE  = 'active';
	public const STATUS_ARCHIVE = 'archive';

	/**
	 * Attachments removed per pass when a project is deleted.
	 *
	 * @var int
	 */
	private const CLEANUP_BATCH = 100;

	/**
	 * Initialize post types.
	 */
	public function init(): void {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_statuses' ) );
		add_action( 'before_delete_post', array( $this, 'cleanup_project_data' ) );
	}

	/**
	 * Register the Ideation Project post type.
	 */
	public function register_post_type(): void {
		$labels = array(
			'name'                  => _x( 'Ideation Projects', 'Post type general name', 'vip-workflows' ),
			'singular_name'         => _x( 'Ideation Project', 'Post type singular name', 'vip-workflows' ),
			'menu_name'             => _x( 'Ideation', 'Admin Menu text', 'vip-workflows' ),
			'add_new'               => __( 'Add New', 'vip-workflows' ),
			'add_new_item'          => __( 'Add New Ideation Project', 'vip-workflows' ),
			'edit_item'             => __( 'Edit Ideation Project', 'vip-workflows' ),
			'new_item'              => __( 'New Ideation Project', 'vip-workflows' ),
			'view_item'             => __( 'View Ideation Project', 'vip-workflows' ),
			'search_items'          => __( 'Search Ideation Projects', 'vip-workflows' ),
			'not_found'             => __( 'No ideation projects found', 'vip-workflows' ),
			'not_found_in_trash'    => __( 'No ideation projects found in Trash', 'vip-workflows' ),
			'all_items'             => __( 'All Ideation Projects', 'vip-workflows' ),
			'archives'              => __( 'Ideation Archives', 'vip-workflows' ),
			'filter_items_list'     => __( 'Filter ideation list', 'vip-workflows' ),
			'items_list_navigation' => __( 'Ideation list navigation', 'vip-workflows' ),
			'items_list'            => __( 'Ideation list', 'vip-workflows' ),
		);

		$args = array(
			'labels'              => $labels,
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => false,
			'show_in_menu'        => false,
			'query_var'           => false,
			'rewrite'             => false,
			'capability_type'     => 'post',
			'capabilities'        => $this->get_capabilities(),
			'map_meta_cap'        => true,
			'has_archive'         => false,
			'hierarchical'        => false,
			'supports'            => array( 'title', 'editor', 'author' ),
			'show_in_rest'        => true,
			'rest_base'           => 'vip-ideation',
			'rest_namespace'      => 'vip-workflows/v1',
		);

		register_post_type( self::POST_TYPE, $args );
	}

	/**
	 * Register custom post statuses for ideation projects.
	 */
	public function register_statuses(): void {
		register_post_status(
			self::STATUS_ACTIVE,
			array(
				'label'                     => _x( 'Active', 'Ideation status', 'vip-workflows' ),
				/* translators: %s: number of active ideation posts. */
				'label_count'               => _n_noop( 'Active <span class="count">(%s)</span>', 'Active <span class="count">(%s)</span>', 'vip-workflows' ),
				'public'                    => false,
				'exclude_from_search'       => true,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
			)
		);

		register_post_status(
			self::STATUS_ARCHIVE,
			array(
				'label'                     => _x( 'Archived', 'Ideation status', 'vip-workflows' ),
				/* translators: %s: number of archived ideation posts. */
				'label_count'               => _n_noop( 'Archived <span class="count">(%s)</span>', 'Archived <span class="count">(%s)</span>', 'vip-workflows' ),
				'public'                    => false,
				'exclude_from_search'       => true,
				'show_in_admin_all_list'    => false,
				'show_in_admin_status_list' => true,
			)
		);
	}

	/**
	 * Clean up associated data when an ideation project is permanently deleted.
	 *
	 * @param int $post_id Post ID being deleted.
	 */
	public function cleanup_project_data( int $post_id ): void {
		$post = get_post( $post_id );
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return;
		}

		global $wpdb;

		$sources_table = $wpdb->prefix . 'vip_ideation_sources';
		$wpdb->delete( $sources_table, array( 'project_id' => $post_id ), array( '%d' ) );

		$analyses_table = $wpdb->prefix . 'vip_ideation_analyses';
		$wpdb->delete( $analyses_table, array( 'project_id' => $post_id ), array( '%d' ) );

		// Attachments go a page at a time. A project's media has no ceiling, and
		// reading all of it at once is what the platform prohibits: a project that
		// outgrew the request would take the delete down with it, having already
		// cleared the join tables above. Each pass re-reads the first page, because
		// the pass before it removed what it read.
		do {
			$attachment_ids = get_posts(
				array(
					'post_type'      => 'attachment',
					'post_parent'    => $post_id,
					'posts_per_page' => self::CLEANUP_BATCH,
					'post_status'    => 'any',
					'fields'         => 'ids',
				)
			);

			$found   = count( $attachment_ids );
			$removed = 0;
			foreach ( $attachment_ids as $attachment_id ) {
				if ( wp_delete_attachment( $attachment_id, true ) ) {
					++$removed;
				}
			}

			// An attachment that refused to delete is read again by the next pass, so
			// a pass that removed nothing ends the loop rather than spinning on it.
		} while ( $removed > 0 && self::CLEANUP_BATCH === $found );
	}

	/**
	 * Get ideation project capabilities.
	 *
	 * @return array<string, string>
	 */
	private function get_capabilities(): array {
		return array(
			'edit_post'          => 'edit_ideation_project',
			'read_post'          => 'read_ideation_project',
			'delete_post'        => 'delete_ideation_project',
			'edit_posts'         => 'edit_ideation_projects',
			'edit_others_posts'  => 'edit_others_ideation_projects',
			'publish_posts'      => 'publish_ideation_projects',
			'read_private_posts' => 'read_private_ideation_projects',
			'delete_posts'       => 'delete_ideation_projects',
			'create_posts'       => 'create_ideation_projects',
		);
	}

	/**
	 * Get available statuses for ideation projects.
	 *
	 * @return array<string, array>
	 */
	public static function get_statuses(): array {
		return array(
			self::STATUS_DRAFT   => array(
				'key'   => self::STATUS_DRAFT,
				'label' => __( 'Draft', 'vip-workflows' ),
				'color' => '#666666',
			),
			self::STATUS_ACTIVE  => array(
				'key'   => self::STATUS_ACTIVE,
				'label' => __( 'Active', 'vip-workflows' ),
				'color' => '#00a32a',
			),
			self::STATUS_ARCHIVE => array(
				'key'   => self::STATUS_ARCHIVE,
				'label' => __( 'Archived', 'vip-workflows' ),
				'color' => '#999999',
			),
		);
	}
}
