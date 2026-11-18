<?php
/**
 * Network admin menu class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin;

use GistAnswers\Admin\ConnectionWizard;
use GistAnswers\Admin\MenuItems;
use GistAnswers\Admin\MenuItems\DividerHeading;
use GistAnswers\API\Credentials;
use GistAnswers\Model\GistSite;
use GistAnswers\Plugin\CommonMain;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Network admin menu class for the Gist Answers plugin.
 */
final class NetworkMenu {

	public const NETWORK_MENU_SLUG = 'gist-answers-network';

	public const ALLOW_STATUS_SORT    = false;
	public const ALLOW_INGESTION_SORT = false;

	private const SITES_PER_PAGE_FILTER  = 'gist_answers_network_sites_per_page';
	private const SITES_PER_PAGE_DEFAULT = 20;

	// Also the most publishers whose statuses can be requested at once (see AdminMain::register_admin_rest_routes()).
	public const SITES_PER_PAGE_MAX = 100;

	/**
	 * Class constructor.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action(
			'after_setup_theme',
			function () {
				$this->create_network_menu();
				$this->maybe_create_developer_menu();
			},
		);
	}

	/**
	 * Creates the network admin menu for the Gist Answers plugin.
	 *
	 * @return void
	 */
	public function create_network_menu() {
		add_action(
			'network_admin_menu',
			function () {
				add_menu_page(
					__( 'Gist Answers', 'gist-answers' ),
					__( 'Gist Answers', 'gist-answers' ),
					'manage_network',
					self::NETWORK_MENU_SLUG,
					array( $this, 'render_network_menu' ),
					null, // Icon is generated via CSS.
					50,
				);
			},
		);
	}

	/**
	 * Renders the network admin menu page for the Gist Answers plugin.
	 *
	 * @return void
	 */
	public function render_network_menu(): void {

		if ( file_exists( GIST_ANSWERS_PLUGIN_DIR . 'templates/network-menu.php' ) ) {
			?>

			<div class="wrap gist-answers-admin-menu-wrap">
				<h1 class="gist-answers-admin-menu-dummy-title"><!-- required -- WP will insert admin notices after this element --></h1>

				<div id="gist-answers-admin-menu-sticky-detector"></div>

				<div class="gist-answers-admin-menu-wrapped-items">
					<?php $data = $this->with(); ?>

					<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/network-menu.php'; ?>
				</div><!-- .gist-answers-admin-menu-wrapped-items -->

				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/popup-iframe.php'; ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/alert-modal.php'; ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/activation-modal.php'; ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/admin-loader.php'; ?>

			</div><!-- .gist-answers-admin-menu-wrap -->

			<?php
		}
	}

	/**
	 * Get the list of sites available to the current user.
	 *
	 * Only each site's ID and name are loaded here, which is all that sorting, searching, and paginating need; the full
	 * site data is only loaded for the sites on the page being displayed (see load_gist_sites()).
	 *
	 * @return array<object> The sites available to the current user, as objects with `blog_id` and `name`.
	 */
	protected function get_user_sites(): array {

		$user_sites = get_blogs_of_user( get_current_user_id() );

		$output = array();

		if ( is_array( $user_sites ) && ! empty( $user_sites ) ) {
			foreach ( $user_sites as $site ) {

				$blog_id = intval( $site->userblog_id ?? 0 );

				if ( ! empty( $blog_id ) ) {
					$output[] = (object) array(
						'blog_id' => $blog_id,
						'name'    => strval( $site->blogname ?? '' ),
					);
				}
			}
		}

		return $output;
	}

	/**
	 * Load the full Gist Answers data for the given sites, refreshing each site's stored publisher data first.
	 *
	 * @param array<object> $user_sites The sites (as returned by get_user_sites()).
	 *
	 * @return array<GistSite> The GistSite objects for the sites.
	 */
	private function load_gist_sites( array $user_sites ): array {
		return array_map(
			function ( object $site ): GistSite {

				Credentials::refresh_publisher_data_if_stale( $site->blog_id );

				return GistSite::get( $site->blog_id );
			},
			array_values( $user_sites ),
		);
	}

	/**
	 * Data to be passed to the template for rendering.
	 *
	 * @return object Object containing data to be passed to the template.
	 */
	private function with(): object {

		$source = 'network';

		$gist_site = GistSite::get();

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- False positive; these are read-only UI flags.
		$connected_flag = intval( $_GET['connected'] ?? 0 );
		$activated_flag = intval( $_GET['activated'] ?? 0 );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$wizard_content_data = ConnectionWizard::get_wizard_content_data_for( $gist_site, $source, $connected_flag );

		$is_connected = 'connected' === ( $wizard_content_data->status ?? '' );

		$page_title = $is_connected ?
			__( 'Network Dashboard', 'gist-answers' ) :
			__( 'Welcome to Gist Answers', 'gist-answers' );

		$user_sites = $this->get_user_sites();

		$user_has_sites = is_array( $user_sites ) && count( $user_sites ) > 0;

		$sortable_column = $this->get_sortable_column_from_query_string();
		$sort_inverted   = $this->get_sort_inverted_from_query_string();
		$search_term     = $this->get_search_term_from_query_string();

		$user_sites = $this->sort_and_filter_user_sites( $user_sites, $sortable_column, $sort_inverted, $search_term );

		$sites_per_page = $this->get_filtered_sites_per_page();

		$max_pages = ceil( count( $user_sites ) / $sites_per_page );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- False positive; this is a read-only UI flag.
		$current_page = intval( $_GET['current-page'] ?? 1 );
		$current_page = max( 1, min( $current_page, $max_pages ) );

		return (object) array(
			'source'              => $source,
			'page_title'          => $page_title,
			'explainer_text'      => $is_connected && is_array( $user_sites ) && count( $user_sites ) > 0 ? sprintf(
				// translators: %s is a mailto link to the Gist Answers support email address.
				__( 'When you activate your WordPress site, Gist Answers will start ingesting its content. Contact %s with any questions.', 'gist-answers' ),
				CommonMain::get_api_contact_mailto_link(),
			) : '',
			'user_sites'          => $this->load_gist_sites( $this->paginate_user_sites( $user_sites, $current_page, $sites_per_page ) ),
			'user_has_sites'      => $user_has_sites,
			'wizard_content_data' => $wizard_content_data,
			'error_message'       => $this->get_activation_error_message( $activated_flag ),
			'sortable_column'     => $sortable_column,
			'sort_inverted'       => $sort_inverted,
			'max_pages'           => $max_pages,
			'current_page'        => $current_page,
			'search_term'         => $search_term,
		);
	}

	/**
	 * Create the developer menu if the flag is set.
	 *
	 * @return void
	 */
	private function maybe_create_developer_menu(): void {
		if ( MenuItems::should_show_developer_menu() ) {

			$menu_items = MenuItems::get_developer();

			$this->create_network_submenus( $menu_items );
		}
	}

	/**
	 * Create the network submenus in the sidebar.
	 *
	 * @param array<object> $menu_items The menu items to be rendered.
	 *
	 * @return void
	 */
	private function create_network_submenus( array $menu_items ): void {
		add_action(
			'init',
			function () use ( $menu_items ) {

				$in_submenu = false;

				foreach ( $menu_items as $menu_item ) {
					switch ( $menu_item->type ?? null ) {
						case 'divider_heading':
							$name = $menu_item->name ?? null;

							if ( ! empty( $name ) ) {
								new DividerHeading( $name, true );
							}

							$in_submenu = true;

							break;

						case 'menu_subitem':
							$class_name = $menu_item->class_name ?? null;

							if ( ! empty( $class_name ) ) {

								$class_name = preg_replace( '/\s+/', '', $class_name );

								$qualified_class_name = 'GistAnswers\\Admin\\MenuItems\\' . $class_name;

								new $qualified_class_name( $in_submenu, true );
							}
					}
				}
			}
		);
	}

	/**
	 * Get the activation error message based on the activated flag.
	 *
	 * @param int $activated_flag The activated flag from the query string.
	 *
	 * @return string The activation error message, or an empty string if no error.
	 */
	private function get_activation_error_message( $activated_flag ): string {

		if ( -1 === $activated_flag ) {

			$errors = GistSite::get_site_activation_errors();
			$errors = is_object( $errors ) ? $errors->errors ?? array() : array();

			return $errors[0] ?? '';
		}

		return '';
	}

	/**
	 * Get the sortable column from the query string.
	 *
	 * @return string The sortable column.
	 */
	private function get_sortable_column_from_query_string(): string {

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- False positive; this is a read-only UI flag.
		$sort_column = sanitize_text_field( wp_unslash( $_GET['sort-column'] ?? 'title-asc' ) );
		$sort_column = strtolower( $sort_column );
		$sort_column = trim( $sort_column );

		$sortable_column = explode( '-', $sort_column )[0] ?? 'title';

		$allowed_columns = array( 'title', 'status', 'ingestion' );

		if ( ! in_array( $sortable_column, $allowed_columns, true ) ) {
			$sortable_column = 'title';
		}

		return $sortable_column;
	}

	/**
	 * Get the sort inverted flag from the query string.
	 *
	 * @return bool The sort inverted flag.
	 */
	private function get_sort_inverted_from_query_string(): bool {

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- False positive; this is a read-only UI flag.
		$sort_column = strtolower( sanitize_text_field( wp_unslash( $_GET['sort-column'] ?? 'title-asc' ) ) );
		$sort_column = strtolower( $sort_column );
		$sort_column = trim( $sort_column );

		$sort_direction = explode( '-', $sort_column )[1] ?? 'asc';

		return 'desc' === $sort_direction;
	}

	/**
	 * Get the search term from the query string.
	 *
	 * @return string The search term.
	 */
	private function get_search_term_from_query_string(): string {

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- False positive; this is heavily sanitized for searching site titles only.
		$search_term = sanitize_text_field( wp_unslash( $_GET['title-contains'] ?? '' ) );
		$search_term = trim( $search_term );

		return $search_term;
	}

	/**
	 * Sort and filter the user sites based on the sortable column, sort inverted flag, and search term.
	 *
	 * @param array  $user_sites      The array of user sites to be sorted and filtered.
	 * @param string $sortable_column The column to sort by.
	 * @param bool   $sort_inverted   Whether to invert the sort order.
	 * @param string $search_term     The search term to filter by.
	 *
	 * @return array The sorted and filtered array of user sites.
	 */
	private function sort_and_filter_user_sites( array $user_sites, string $sortable_column, bool $sort_inverted, string $search_term ): array {

		$search_term = Utilities::get_searchable_string( $search_term );

		if ( ! empty( $search_term ) ) {
			$user_sites = array_filter(
				$user_sites,
				function ( object $site ) use ( $search_term ) {
					return str_contains( Utilities::get_searchable_string( $site->name ), $search_term );
				},
			);
		}

		switch ( $sortable_column ) {
			case 'title':
				usort(
					$user_sites,
					function ( object $a, object $b ) use ( $sort_inverted ) {

						$comparison = strcasecmp( $a->name, $b->name );

						return $sort_inverted ? -$comparison : $comparison;
					},
				);
				break;

			case 'status':
				// Not implemented at this time.
				break;

			case 'ingestion':
				// Not implemented at this time.
				break;
		}

		return $user_sites;
	}

	/**
	 * Paginate the user sites based on the current page and sites per page.
	 *
	 * @param array $user_sites     The array of user sites to be paginated.
	 * @param int   $current_page   The current page number.
	 * @param int   $sites_per_page The number of sites to display per page.
	 *
	 * @return array The paginated array of user sites.
	 */
	private function paginate_user_sites( array $user_sites, int $current_page, int $sites_per_page ): array {

		$offset = ( $current_page - 1 ) * $sites_per_page;
		$offset = max( 0, $offset );

		return array_slice( $user_sites, $offset, $sites_per_page );
	}

	/**
	 * Get the number of sites to show per page in the network hub list, allowing for filtering.
	 *
	 * @return int The number of sites to show per page.
	 */
	private function get_filtered_sites_per_page(): int {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$sites_per_page = apply_filters( self::SITES_PER_PAGE_FILTER, self::SITES_PER_PAGE_DEFAULT );

		$sites_per_page = max( 1, $sites_per_page );
		$sites_per_page = min( $sites_per_page, self::SITES_PER_PAGE_MAX );

		return $sites_per_page;
	}
}
