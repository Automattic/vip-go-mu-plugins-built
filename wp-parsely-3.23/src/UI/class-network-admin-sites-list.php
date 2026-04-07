<?php
/**
 * UI: Network Admin site list class
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\UI;

use Parsely\Parsely;

/**
 * Renders the additions to the WordPress Multisite Network Admin Sites List
 * page.
 *
 * @since 3.2.0
 */
final class Network_Admin_Sites_List {
	public const COLUMN_NAME = 'parsely-site-id';
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
	 * Attaches network admin page functionality to the appropriate action and
	 * filter hooks.
	 *
	 * @since 3.2.0
	 */
	public function run(): void {
		add_filter( 'manage_sites_action_links', array( self::class, 'add_action_link' ), 10, 2 );
		add_filter( 'wpmu_blogs_columns', array( self::class, 'add_site_id_column' ) );
		add_action( 'manage_sites_custom_column', array( $this, 'populate_site_id_column' ), 10, 2 );
	}

	/**
	 * Uses the manage_sites_action_links filter to append a link to the settings
	 * page in the "row actions".
	 *
	 * @since 3.2.0
	 *
	 * @param array<string, mixed> $actions  The list of actions meant to be displayed for the current site's
	 *                                       context in the row actions.
	 * @param int                  $_blog_id The blog ID for the current context.
	 * @return array<string, mixed> The list of actions including ours.
	 */
	public static function add_action_link( array $actions, int $_blog_id ): array {
		// phpcs:ignore WordPress.WP.Capabilities.Undetermined
		if ( ! current_user_can( Parsely::CAPABILITY ) ) {
			return $actions;
		}

		$actions['parsely-settings'] = sprintf(
			'<a href="%1$s" aria-label="%2$s">%3$s</a>',
			esc_url( esc_url( Parsely::get_settings_url( $_blog_id ) ) ),
			esc_attr( self::generate_aria_label_for_blog_id( $_blog_id ) ),
			__( 'Parse.ly Settings', 'wp-parsely' )
		);

		return $actions;
	}

	/**
	 * Generates ARIA label content.
	 *
	 * @since 3.2.0
	 *
	 * @param int $_blog_id Which sub-site to include in the ARIA label.
	 * @return string ARIA label content including the blogname.
	 */
	private static function generate_aria_label_for_blog_id( int $_blog_id ): string {
		$site     = get_blog_details( $_blog_id );
		$blogname = false === $site ? '' : $site->blogname;

		return sprintf(
			/* translators: blog name or blog id if empty  */
			__( 'Go to Parse.ly stats for "%s"', 'wp-parsely' ),
			'' === $blogname ? $_blog_id : $blogname
		);
	}

	/**
	 * Uses the wpmu_blogs_columns filter to register the column where we'll
	 * display the site's Site ID (if configured).
	 *
	 * @since 3.2.0
	 *
	 * @param array<string, mixed> $sites_columns The list of columns meant to be displayed in the sites list table.
	 * @return array<string, mixed> The list of columns to display in the network admin table including ours.
	 */
	public static function add_site_id_column( array $sites_columns ): array {
		$sites_columns[ self::COLUMN_NAME ] = __( 'Parse.ly Site ID', 'wp-parsely' );
		return $sites_columns;
	}

	/**
	 * Uses the manage_sites_custom_column action to output each site's Site ID
	 * (if configured).
	 *
	 * @since 3.2.0
	 *
	 * @param string $column_name The column name for the current context.
	 * @param int    $_blog_id The blog ID for the current context.
	 */
	public function populate_site_id_column( string $column_name, int $_blog_id ): void {
		if ( self::COLUMN_NAME !== $column_name ) {
			return;
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog
		switch_to_blog( $_blog_id );
		$site_id = $this->parsely->get_site_id();
		restore_current_blog();

		if ( strlen( $site_id ) > 0 ) {
			echo esc_html( $site_id );
		} else {
			echo esc_html( '—' );
		}
	}
}
