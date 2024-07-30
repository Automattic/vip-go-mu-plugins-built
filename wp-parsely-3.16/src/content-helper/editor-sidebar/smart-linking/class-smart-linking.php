<?php
/**
 * Class for Smart Linking feature in the editor sidebar
 *
 * @package Parsely
 * @since   3.16.0
 */

declare( strict_types = 1 );

namespace Parsely\Content_Helper\Editor_Sidebar;

use Parsely\Content_Helper\Content_Helper_Feature;
use Parsely\Content_Helper\Editor_Sidebar;
use Parsely\Permissions;
use WP_Query;

/**
 * Class for Smart Linking feature in the editor sidebar.
 *
 * @since 3.16.0
 */
class Smart_Linking extends Content_Helper_Feature {

	/**
	 * Allowed blocks for the Smart Linking feature.
	 *
	 * @since 3.16.2
	 *
	 * @var array $BLOCKS_ALLOWED
	 */
	private const BLOCKS_ALLOWED = array(
		'core/paragraph',
	);

	/**
	 * Instance of Editor_Sidebar class.
	 *
	 * @since 3.16.0
	 *
	 * @param Editor_Sidebar $editor_sidebar Instance of Editor_Sidebar class.
	 */
	public function __construct( Editor_Sidebar $editor_sidebar ) {
		$this->parsely = $editor_sidebar->parsely;

		add_action( 'delete_post', array( $this, 'purge_smart_links' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'add_inline_script' ) );
	}

	/**
	 * Returns the feature's filter name. The feature filter controls the
	 * enabled/disabled state of a particular Content Helper feature.
	 *
	 * @since 3.16.0
	 *
	 * @return string The filter name.
	 */
	public static function get_feature_filter_name(): string {
		return ''; // Not in use for this feature.
	}

	/**
	 * Returns the feature's script ID.
	 *
	 * @since 3.16.0
	 *
	 * @return string The script ID.
	 */
	public static function get_script_id(): string {
		return ''; // Not in use for this feature.
	}

	/**
	 * Returns the feature's style ID.
	 *
	 * @since 3.16.0
	 *
	 * @return string The style ID.
	 */
	public static function get_style_id(): string {
		return ''; // Not in use for this feature.
	}

	/**
	 * Runs the feature's initialization process.
	 *
	 * Registers the custom post type and taxonomies for the Smart Links.
	 *
	 * @since 3.16.0
	 */
	public function run(): void {
		if ( ! $this->can_enable_feature() ) {
			return;
		}

		// Register private custom post type for the Smart Links.
		$this->register_post_type();

		// Register the taxonomies for the Smart Links.
		$this->register_taxonomy( 'smart_link_source', __( 'Smart Link Source', 'wp-parsely' ) );
		$this->register_taxonomy( 'smart_link_destination', __( 'Smart Link Destination', 'wp-parsely' ) );
	}

	/**
	 * Returns whether the feature can be enabled for the current user.
	 *
	 * @since 3.16.0
	 *
	 * @param bool ...$conditions Conditions that need to be met besides filters
	 *                            for the function to return true.
	 * @return bool Whether the feature can be enabled.
	 */
	protected function can_enable_feature( bool ...$conditions ): bool {
		if ( ! parent::can_enable_feature( ...$conditions ) ) {
			return false;
		}

		return Permissions::current_user_can_use_pch_feature(
			'smart_linking',
			$this->parsely->get_options()['content_helper'],
			get_the_ID()
		);
	}

	/**
	 * Registers the custom post type for the Smart Links.
	 *
	 * @since 3.16.0
	 */
	private function register_post_type(): void {
		register_post_type(
			'parsely_smart_link',
			array(
				'labels'          => array(
					'name'          => __( 'Smart Links', 'wp-parsely' ),
					'singular_name' => __( 'Smart Link', 'wp-parsely' ),
				),
				'supports'        => array( 'title', 'custom-fields' ),
				'taxonomies'      => array( 'smart_link_source', 'smart_link_destination' ),
				'hierarchical'    => false,
				'public'          => false,
				'show_ui'         => false,
				'can_export'      => true,
				'has_archive'     => false,
				'rewrite'         => false,
				'capability_type' => 'post',
				'show_in_rest'    => false,
			)
		);
	}

	/**
	 * Registers a taxonomy for the Smart Links.
	 *
	 * @since 3.16.0
	 *
	 * @param string $taxonomy      The taxonomy name.
	 * @param string $singular_name The singular name of the taxonomy.
	 */
	private function register_taxonomy( string $taxonomy, string $singular_name ): void {
		register_taxonomy(
			$taxonomy,
			'parsely_smart_link',
			array(
				'labels'            => array(
					'name'          => $singular_name,
					'singular_name' => $singular_name,
				),
				'public'            => false,
				'show_ui'           => false,
				'show_tagcloud'     => false,
				'show_admin_column' => false,
				'show_in_rest'      => false,
				'hierarchical'      => false,
				'rewrite'           => false,
				'capabilities'      => array(
					'manage_terms' => 'edit_posts',
					'edit_terms'   => 'edit_posts',
					'delete_terms' => 'edit_posts',
					'assign_terms' => 'edit_posts',
				),
			)
		);
	}

	/**
	 * Adds inline script with Smart Linking specific data.
	 *
	 * @since 3.16.2
	 */
	public function add_inline_script(): void {
		/**
		 * Filters the allowed blocks for the Smart Linking feature.
		 *
		 * @since 3.16.2
		 *
		 * @param array $allowed_blocks The allowed blocks for the Smart Linking feature.
		 */
		$allowed_blocks = apply_filters( 'wp_parsely_smart_linking_allowed_blocks', self::BLOCKS_ALLOWED );
		wp_add_inline_script(
			Editor_Sidebar::get_script_id(),
			'window.wpParselySmartLinkingAllowedBlocks = ' . wp_json_encode( $allowed_blocks ) . ';',
			'before'
		);
	}

	/**
	 * Purges all outbound smart links associated with a post when the post is deleted.
	 *
	 * @since 3.16.0
	 *
	 * @param int $post_id The ID of the post being deleted.
	 */
	public function purge_smart_links( int $post_id ): void {
		$post = get_post( $post_id );
		if ( null === $post ) {
			return;
		}

		$smart_links_query = new WP_Query(
			array(
				'post_type'      => 'parsely_smart_link',
				'post_status'    => 'any',
				'posts_per_page' => - 1,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array(
					array(
						'taxonomy' => 'smart_link_source',
						'field'    => 'slug',
						'terms'    => $post_id,
					),
				),
			)
		);

		while ( $smart_links_query->have_posts() ) {
			$smart_links_query->the_post();
			$smart_link_post_id = get_the_ID();

			if ( ! is_int( $smart_link_post_id ) ) {
				continue;
			}

			wp_delete_post( $smart_link_post_id, true );
		}

		wp_reset_postdata();

		// Remove any source and destination terms that have the post ID.
		wp_delete_term( $post_id, 'smart_link_source' );
		wp_delete_term( $post_id, 'smart_link_destination' );
	}
}
