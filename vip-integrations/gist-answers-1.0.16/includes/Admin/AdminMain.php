<?php
/**
 * Admin initialization class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin;

use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;

use GistAnswers\Admin\MenuItems;
use GistAnswers\Admin\MenuItems\Dashboard;
use GistAnswers\Admin\MenuItems\ToolsOptions;
use GistAnswers\Admin\NetworkMenu;
use GistAnswers\Admin\SidebarMenu;
use GistAnswers\API\Credentials;
use GistAnswers\API\Delete\Publishers\Crawl as StopCrawl;
use GistAnswers\API\Endpoint;
use GistAnswers\API\Get\PublisherGroups;
use GistAnswers\API\Get\PublisherGroups\Messages;
use GistAnswers\API\Get\Publishers\Sites;
use GistAnswers\API\Post\Publishers;
use GistAnswers\API\Post\Publishers\Ingest;
use GistAnswers\API\Post\Publishers\Widgets\Chat;
use GistAnswers\API\Put\Publishers\Crawl as StartCrawl;
use GistAnswers\Model\GistSite;
use GistAnswers\Model\GistWidget;
use GistAnswers\Plugin\Activate;
use GistAnswers\Plugin\Config;
use GistAnswers\Plugin\GistURLs;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin initialization class for the Gist Answers plugin.
 */
final class AdminMain {

	public const CONNECT_NONCE = 'gist_answers_connect_nonce';

	private const ADMIN_TASK_TRANSIENT_PREFIX = 'gist_answers_admin_task_';

	// Every transient this class sets, for the Danger Zone to delete (see should_run_admin_bookkeeping()).
	public const TRANSIENT_NAMES = array(
		self::ADMIN_TASK_TRANSIENT_PREFIX . 'posts_requiring_ingestion',
		self::ADMIN_TASK_TRANSIENT_PREFIX . 'flagged_answer_widget_posts',
		self::ADMIN_TASK_TRANSIENT_PREFIX . 'unflagged_answer_widget_posts',
	);

	private const INGEST_AFTER_META_KEY    = 'gist_answers_ingest_after';
	private const INGEST_RESPONSE_META_KEY = 'gist_answers_ingest_response';
	private const INGEST_ATTEMPTS_META_KEY = 'gist_answers_ingest_attempts';

	// While the API token can't be confirmed (e.g. the Gist API is briefly unreachable), sending is retried this often.
	// It's also the first delay before a post the API couldn't accept is sent again; each later retry waits twice as
	// long (up to INGEST_MAX_RETRY_DELAY), and the post is given up on after INGEST_MAX_ATTEMPTS.
	private const INGEST_RETRY_DELAY     = 5 * MINUTE_IN_SECONDS;
	private const INGEST_MAX_RETRY_DELAY = 6 * HOUR_IN_SECONDS;
	private const INGEST_MAX_ATTEMPTS    = 8;

	// A post being sent keeps its place in the queue, due again this long after it was claimed, until the API accepts
	// it; so a post isn't lost if the request sending it dies.
	private const INGEST_LEASE_DURATION = 10 * MINUTE_IN_SECONDS;

	// One WP-Cron run stops sending posts after this many seconds, and sends the rest a minute later.
	private const INGEST_TIME_BUDGET = 20;

	private const MAX_POSTS_FOR_INGESTION_FILTER = 'gist_answers_max_posts_for_ingestion';
	private const MIN_DELAY_FOR_INGESTION_FILTER = 'gist_answers_min_delay_for_ingestion';

	private const INGEST_POST_TYPES_FILTER    = 'gist_answers_ingest_post_types';
	private const INGEST_POST_STATUSES_FILTER = 'gist_answers_ingest_post_statuses';
	private const INGEST_TAX_QUERY_FILTER     = 'gist_answers_ingest_tax_query';

	private const ANSWER_PAGE_TYPES_FILTER    = 'gist_answers_answer_page_types';
	private const ANSWER_PAGE_STATUSES_FILTER = 'gist_answers_answer_page_statuses';

	private const ANSWER_WIDGET_FLAG_META_KEY   = 'gist_answers_answer_widget_flag';
	private const ANSWER_WIDGET_UNFLAG_META_KEY = 'gist_answers_answer_widget_unflag';
	private const ANSWER_WIDGET_MANUAL_META_KEY = 'gist_answers_answer_widget_manual';
	private const ANSWER_WIDGET_IGNORE_META_KEY = 'gist_answers_answer_widget_ignore';

	// Marks a page as an answer page created (or moved) through the CMS iframe, so that only such pages can be moved.
	private const ANSWER_PAGE_META_KEY = 'gist_answers_answer_page';

	private const MAX_FLAGGED_ANSWER_WIDGET_POSTS_FILTER = 'gist_answers_max_flagged_answer_widget_posts';

	private const ANSWER_WIDGET_POST_IDS_OPTION    = 'gist_answers_answer_widget_post_ids';
	private const ANSWER_WIDGET_MANUAL_URLS_OPTION = 'gist_answers_answer_widget_urls';

	private const ANSWER_WIDGETS_CREATED_META_KEY = 'gist_answers_answer_widgets_created';

	public const SAVE_DEVELOPER_OPTIONS_NONCE   = 'gist_answers_save_developer_options_nonce';
	public const SAVE_DANGER_ZONE_OPTIONS_NONCE = 'gist_answers_save_danger_zone_options_nonce';

	public const ACTION_API_CONNECTED     = 'gist_answers_api_connected';
	public const ACTION_API_DISCONNECTED  = 'gist_answers_api_disconnected';
	public const ACTION_API_POST_ENQUEUED = 'gist_answers_post_enqueued_for_ingestion';
	public const ACTION_API_POST_INGESTED = 'gist_answers_post_ingested';
	public const ACTION_POST_FLAGGED      = 'gist_answers_post_flagged_as_answer_page';

	public const ACTION_API_POST_INGESTION_FAILED = 'gist_answers_post_ingestion_failed';

	public const FILTER_SHOULD_ENQUEUE = 'gist_answers_should_enqueue_post_for_ingestion';

	public const INGEST_CRON_HOOK = 'gist_answers_ingest_queued_posts';

	public const SITE_ACTIVATION_NONCE = 'gist_answers_gist_answers_site_activation_nonce';

	private const SITE_STATUSES_OPTION = 'gist_answers_site_statuses';

	private const MAX_CACHED_SITE_STATUSES = 1000;

	// A publisher's status is reused for this long, so repeated (or duplicated) status requests don't each call the API.
	private const SITE_STATUS_TRANSIENT_PREFIX   = 'gist_answers_site_status_';
	private const SITE_STATUS_TRANSIENT_DURATION = 30;

	// A refresh (the network hub's refresh button) fetches a publisher's status again unless it was fetched this recently.
	private const SITE_STATUS_REFRESH_MIN_AGE = 5;

	// One status request stops calling the API after this many seconds; the publishers it didn't reach are left out.
	private const SITE_STATUSES_TIME_BUDGET        = 10;
	private const SITE_STATUSES_TIME_BUDGET_FILTER = 'gist_answers_site_statuses_time_budget';

	/**
	 * Post types to be ingested.
	 *
	 * @var array<string>
	 */
	private static array $ingest_post_types = array( 'post' );

	/**
	 * Post statuses to be ingested.
	 *
	 * @var array<string>
	 */
	private static array $ingest_post_statuses = array( 'publish' );

	/**
	 * Post terms to be ingested. Note that this needs to be a valid `$tax_query` array in accordance with
	 * `WP_Tax_Query::__construct()`. An empty array indicates that all terms are eligible for ingestion.
	 *
	 * Reference URL: https://developer.wordpress.org/reference/classes/wp_tax_query/__construct/
	 *
	 * @var array<mixed>
	 */
	private static array $ingest_tax_query = array();

	/**
	 * Post types to be flagged when they contain answer widgets.
	 *
	 * @var array<string>
	 */
	private static array $answer_page_types = array( 'page', 'post' );

	/**
	 * Post statuses to be flagged when they contain answer widgets.
	 *
	 * @var array<string>
	 */
	private static array $answer_page_statuses = array( 'publish' );

	/**
	 * Class constructor.
	 *
	 * @return void
	 */
	public function __construct() {

		$this->preload_fonts();

		$this->enqueue_admin_css();
		$this->enqueue_admin_js();

		new NetworkMenu();
		new SidebarMenu();

		$this->register_admin_post_actions();
		$this->register_admin_rest_routes();

		$this->maybe_show_new_activation_notice_single();
		$this->maybe_show_disconnection_notice_single();

		$this->maybe_show_new_activation_notice_multi();
		$this->maybe_show_disconnection_notice_multi();

		$this->maybe_show_vip_managed_token_notice();

		// Posts are queued, and sent from WP-Cron, by the hooks CommonMain registers (see register_ingestion_hooks()).
		$this->handle_posts_requiring_ingestion();

		$this->flag_posts_with_answer_widgets();
		$this->handle_flagged_answer_widget_posts();
		$this->handle_unflagged_answer_widget_posts();

		$this->force_reload_on_back_button_for_admin_pages();
	}

	/**
	 * Preload the admin font files.
	 *
	 * @return void
	 */
	private function preload_fonts(): void {
		add_action(
			'admin_head',
			function () {

				$font_filenames = array(
					'haffer-regular.woff2',
					'haffer-medium.woff2',
					'haffer-semibold.woff2',
					'haffer-semibold-italic.woff2',
					'haffer-bold.woff2',
					'haffer-bold-italic.woff2',
				);

				foreach ( $font_filenames as $font_filename ) {
					echo '<link rel="preload" href="' . esc_url( GIST_ANSWERS_PLUGIN_URL . 'public/fonts/' . $font_filename ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
				}
			},
			0,
			0,
		);
	}

	/**
	 * Enqueue admin CSS.
	 *
	 * @return void
	 */
	private function enqueue_admin_css(): void {
		add_action(
			'admin_enqueue_scripts',
			function () {
				wp_enqueue_style( 'gist-answers-admin', GIST_ANSWERS_PLUGIN_URL . 'public/css/admin.css', array(), GIST_ANSWERS_VERSION );
			},
		);
	}

	/**
	 * Enqueue admin JS.
	 *
	 * @return void
	 */
	private function enqueue_admin_js(): void {
		add_action(
			'admin_enqueue_scripts',
			function () {
				wp_enqueue_script( 'gist-answers-admin', GIST_ANSWERS_PLUGIN_URL . 'public/js/admin.js', array( 'jquery' ), GIST_ANSWERS_VERSION, true );

				// The REST API root of the current site (which differs per site on subdirectory multisites, and with plain
				// permalinks), and the origin that Gist Answers CMS iframes post messages from.
				$cms_base_url = GistURLs::get_cms_base_url();

				$settings = array(
					'restRoot'  => esc_url_raw( rest_url( 'gist-answers/v1/' ) ),
					'cmsOrigin' => wp_parse_url( $cms_base_url, PHP_URL_SCHEME ) . '://' . wp_parse_url( $cms_base_url, PHP_URL_HOST ) . ( wp_parse_url( $cms_base_url, PHP_URL_PORT ) ? ':' . wp_parse_url( $cms_base_url, PHP_URL_PORT ) : '' ),
				);

				wp_add_inline_script( 'gist-answers-admin', 'window.gistAnswersAdmin = Object.assign( window.gistAnswersAdmin || {}, ' . wp_json_encode( $settings ) . ' );', 'before' );
			},
		);
	}

	/**
	 * Register admin post actions for handling connect and disconnect requests.
	 *
	 * @return void
	 */
	private function register_admin_post_actions(): void {

		add_action( 'admin_post_gist_answers_connect', array( $this, 'handle_gist_answers_connect' ) );

		add_action( 'admin_post_gist_answers_site_activation', array( $this, 'handle_gist_answers_site_activation' ) );

		add_action( 'admin_post_gist_answers_save_developer_options', array( $this, 'handle_gist_answers_save_developer_options' ) );
		add_action( 'admin_post_gist_answers_save_danger_zone_options', array( $this, 'handle_gist_answers_save_danger_zone_options' ) );
	}

	/**
	 * Handle the Gist Answers connect action.
	 *
	 * @return void
	 */
	public function handle_gist_answers_connect(): void {

		check_admin_referer( 'gist_answers_connect', self::CONNECT_NONCE );

		// The API token is stored network-wide on multisite.
		self::die_unless( self::current_user_can_manage_network() );

		$api_token = sanitize_text_field( wp_unslash( $_POST['gist_answers_api_token'] ?? '' ) );

		$token_is_valid = Endpoint::validate_api_token( $api_token );

		if ( is_multisite() ) {
			$admin_menu_url = MenuItems::get_admin_menu_url_for_network();
		} else {
			$admin_menu_url = Dashboard::get_admin_menu_url();
		}

		if ( $token_is_valid ) {

			Credentials::store_api_token( $api_token );

			$publisher_groups_request = new PublisherGroups();

			Credentials::store_publisher_group( $publisher_groups_request->response() );
			Credentials::refresh_publisher_data();

			do_action( self::ACTION_API_CONNECTED ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.

			wp_safe_redirect( $admin_menu_url . '&connected=1' );
			exit;
		}

		wp_safe_redirect( $admin_menu_url . '&connected=-1' );
		exit;
	}

	/**
	 * Handle the Gist Answers site activation action.
	 *
	 * @return void
	 */
	public function handle_gist_answers_site_activation(): void {

		check_admin_referer( 'gist_answers_site_activation', self::SITE_ACTIVATION_NONCE );

		$blog_id = absint( wp_unslash( $_POST['gist_answers_blog_id'] ?? 0 ) );

		self::die_unless( self::current_user_can_manage_site( $blog_id ) );

		$source = sanitize_text_field( wp_unslash( $_POST['gist_answers_source'] ?? '' ) );

		$activation_mode = sanitize_text_field( wp_unslash( $_POST['gist_answers_activation_mode'] ?? '' ) );

		if ( 'associate' === $activation_mode ) {

			$publisher_id = sanitize_text_field( wp_unslash( $_POST['gist_answers_publisher_id'] ?? '' ) );

			$this->associate_site_with_publisher( $blog_id, $publisher_id, $source );
		}

		$gist_site = GistSite::get( $blog_id );

		$gist_site->reload_categories();

		if ( is_multisite() && ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$posts_route = rest_get_route_for_post_type_items( 'post' );

		$name        = $gist_site->get_display_name();
		$description = get_bloginfo( 'description' );
		$domain      = $gist_site->get_domain();
		$location    = 'Unknown';
		$category_id = $gist_site->get_default_category_id();
		$posts_url   = get_rest_url( null, $posts_route );
		$url_type    = 'WPV2';
		$site_url    = get_home_url();

		$description = $description ? $description : $name;

		$activation_request = new Publishers(
			$name,
			$description,
			$domain,
			$location,
			$category_id,
			$posts_url,
			$url_type,
			$site_url,
		);

		if ( is_multisite() && ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		$response_data = $activation_request->response()->data ?? null;

		$error_response = __( 'There was an error activating your site. Please try again later.', 'gist-answers' );

		if ( is_object( $response_data ) ) {

			if ( ! empty( $response_data->error ?? null ) ) {

				$error_response = __( 'Site activation error', 'gist-answers' ) . ': ' . esc_html( $response_data->error );

			} else {

				$publisher    = $response_data->publisher ?? null;
				$publisher_id = is_object( $publisher ) ? strval( $publisher->id ?? '' ) : '';

				if ( ! empty( $publisher_id ) ) {

					// Store the new publisher for this site now, rather than relying on it being matched by name and domain later.
					Credentials::clear_publishers_list_cache();

					$publisher_data = Credentials::update_publisher( $blog_id, $publisher_id );

					if ( strval( $publisher_data->id ?? '' ) === $publisher_id ) {
						$error_response = null;
					} else {
						$error_response = sprintf(
							/* translators: %s: The label of the "Activate website" button. */
							__( 'Your site was added to Gist Answers, but could not be linked to this WordPress site. Please click "%s" again and choose it from the list.', 'gist-answers' ),
							__( 'Activate website', 'gist-answers' )
						);
					}
				}
			}
		}

		if ( ! empty( $error_response ) ) {
			GistSite::store_site_activation_errors(
				array( $error_response ),
				(object) array(
					'name'          => $name,
					'description'   => $description,
					'domain'        => $domain,
					'location'      => $location,
					'category_id'   => $category_id,
					'posts_url'     => $posts_url,
					'url_type'      => $url_type,
					'home_page_url' => $site_url,
				)
			);
		}

		if ( 'network' === $source ) {
			$admin_menu_url = MenuItems::get_admin_menu_url_for_network();
		} else {
			$admin_menu_url = Dashboard::get_admin_menu_url();
		}

		$activated_flag = empty( $error_response ) ? 1 : -1;

		$admin_menu_url = add_query_arg( 'activated', $activated_flag, $admin_menu_url );

		wp_safe_redirect( $admin_menu_url );
		exit;
	}

	/**
	 * Associate a site with a publisher that is already activated in Gist Answers, then redirect back.
	 *
	 * @param int    $blog_id      ID of the blog/site to associate.
	 * @param string $publisher_id ID of the existing publisher to associate the site with.
	 * @param string $source       The admin screen the request came from ('network' or empty).
	 *
	 * @return void
	 */
	private function associate_site_with_publisher( int $blog_id, string $publisher_id, string $source ): void {

		// Only a network administrator can link a site to a publisher that doesn't match it, or that another site in
		// the network is already linked to.
		$candidate_ids = array_map(
			fn ( $publisher ) => $publisher->id,
			Credentials::get_activation_matches( $blog_id, self::current_user_can_manage_network() )->publishers
		);

		$error_response = __( 'There was an error associating your site with the selected website. Please try again later.', 'gist-answers' );

		if ( ! empty( $publisher_id ) && in_array( $publisher_id, $candidate_ids, true ) ) {

			$publisher_data = Credentials::update_publisher( $blog_id, $publisher_id );

			if ( strval( $publisher_data->id ?? '' ) === $publisher_id ) {
				$error_response = null;
			}
		}

		if ( ! empty( $error_response ) ) {
			GistSite::store_site_activation_errors(
				array( $error_response ),
				(object) array(
					'publisher_id' => $publisher_id,
				)
			);
		}

		if ( 'network' === $source ) {
			$admin_menu_url = MenuItems::get_admin_menu_url_for_network();
		} else {
			$admin_menu_url = Dashboard::get_admin_menu_url();
		}

		$admin_menu_url = add_query_arg( 'activated', empty( $error_response ) ? 1 : -1, $admin_menu_url );

		wp_safe_redirect( $admin_menu_url );
		exit;
	}

	/**
	 * If needed, show the new activation notice in the single-site admin.
	 *
	 * @return void
	 */
	private function maybe_show_new_activation_notice_single(): void {
		add_action(
			'admin_notices',
			function () {
				if ( get_transient( Activate::NEW_ACTIVATION_FLAG ) ) {

					$notice_content = sprintf(
						// translators: %s is the URL to the Gist Answers "Dashboard" page.
						__( 'Plugin activated successfully! Visit the Gist Answers <a href="%s">Dashboard</a> to connect your site to the Gist Answers Console.', 'gist-answers' ),
						esc_url( Dashboard::get_admin_menu_url() ),
					);

					wp_admin_notice(
						self::get_logo_img() . '<span>' . $notice_content . '</span>',
						array(
							'type'        => 'success',
							'dismissible' => true,
						)
					);

					delete_transient( Activate::NEW_ACTIVATION_FLAG );
				}
			}
		);
	}

	/**
	 * If needed, show the new activation notice in the multisite admin.
	 *
	 * @return void
	 */
	private function maybe_show_new_activation_notice_multi(): void {
		add_action(
			'network_admin_notices',
			function () {
				if ( get_site_transient( Activate::NEW_ACTIVATION_FLAG ) ) {

					$notice_content = sprintf(
						// translators: %s is the URL to the Network Hub.
						__( 'Plugin activated successfully! Visit the Gist Answers <a href="%s">Network Dashboard</a> to connect your sites to the Gist Answers Console.', 'gist-answers' ),
						esc_url( MenuItems::get_admin_menu_url_for_network() ),
					);

					wp_admin_notice(
						self::get_logo_img() . '<span>' . $notice_content . '</span>',
						array(
							'type'        => 'success',
							'dismissible' => true,
						)
					);

					delete_site_transient( Activate::NEW_ACTIVATION_FLAG );
				}
			}
		);
	}

	/**
	 * If needed, show the disconnection notice in the single-site admin.
	 *
	 * @return void
	 */
	private function maybe_show_disconnection_notice_single(): void {
		add_action(
			'admin_notices',
			function () {

				// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- We are only checking which admin page is visible to conditionally show the notice; no security risk here.
				if ( $this->is_gist_answers_admin_page() ) {
					return;
				}

				$gist_site = GistSite::get();

				if ( $gist_site->has_stored_api_token() && ! $gist_site->has_valid_publisher() ) {

					$notice_content = sprintf(
						// translators: %s is the URL to the Gist Answers admin menu page.
						__( 'There is a problem with your Gist Answers integration. Visit the Gist Answers <a href="%s">Dashboard</a> to review the status of your Gist API connection.', 'gist-answers' ),
						esc_url( Dashboard::get_admin_menu_url() )
					);

					wp_admin_notice(
						self::get_logo_img() . '<span>' . $notice_content . '</span>',
						array(
							'type'        => 'warning',
							'dismissible' => true,
						)
					);

					do_action( self::ACTION_API_DISCONNECTED, 'single' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
				}
			}
		);
	}

	/**
	 * If needed, show the disconnection notice in the multisite admin.
	 *
	 * @return void
	 */
	private function maybe_show_disconnection_notice_multi(): void {
		add_action(
			'network_admin_notices',
			function () {

				// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- We are only checking which admin page is visible to conditionally show the notice; no security risk here.
				if ( $this->is_gist_answers_admin_page() ) {
					return;
				}

				$gist_site = GistSite::get();

				if ( $gist_site->has_stored_api_token() && ! $gist_site->has_valid_api_token() ) {

					$notice_content = sprintf(
						// translators: %s is the URL to the Gist Answers admin menu page.
						__( 'There is a problem with your Gist Answers integration. Visit the Gist Answers <a href="%s">Network Dashboard</a> to review the status of your Gist API connection.', 'gist-answers' ),
						esc_url( MenuItems::get_admin_menu_url_for_network() )
					);

					wp_admin_notice(
						self::get_logo_img() . '<span>' . $notice_content . '</span>',
						array(
							'type'        => 'warning',
							'dismissible' => true,
						)
					);

					do_action( self::ACTION_API_DISCONNECTED, 'network' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
				}
			}
		);
	}

	/**
	 * Get an image tag for the Gist Answers plugin logo.
	 *
	 * @return string The HTML image tag for the Gist Answers plugin logo.
	 */
	public static function get_logo_img(): string {
		return sprintf(
			'<img class="gist-answers-admin-menu-logo" src="%s" alt="%s" />',
			esc_url( GIST_ANSWERS_PLUGIN_URL . 'public/images/admin-logo.png' ),
			esc_attr__( 'Gist Answers', 'gist-answers' ),
		);
	}

	/**
	 * Get an image tag for the question card illustration.
	 *
	 * @return string The HTML image tag for the question card illustration.
	 */
	public static function get_question_card_img(): string {
		return sprintf(
			'<img class="gist-answers-question-card" src="%s" alt="%s" />',
			esc_url( GIST_ANSWERS_PLUGIN_URL . 'public/images/question-card.svg' ),
			esc_attr__( 'Question Widget', 'gist-answers' ),
		);
	}

	/**
	 * Register the hooks that queue posts for ingestion, and that send them from WP-Cron.
	 *
	 * CommonMain registers these on every request, not only where AdminMain is loaded: when WP-Cron runs from WP-CLI
	 * (as it does on WordPress VIP) or with ALTERNATE_WP_CRON, `wp_doing_cron()` is still false when the plugin loads,
	 * so the plugin loads its front-end side.
	 *
	 * @return void
	 */
	public static function register_ingestion_hooks(): void {

		add_action(
			'save_post',
			function ( $post_id, $post ) {

				if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! $post instanceof WP_Post ) {
					return;
				}

				// A post that is no longer eligible (e.g. made private, a draft, or password-protected) leaves the queue,
				// whoever saved it.
				if ( ! self::should_enqueue_post_for_ingestion( $post_id, $post ) ) {
					self::dequeue_post_from_ingestion( $post_id );
				} elseif ( current_user_can( 'edit_post', $post_id ) ) {
					self::maybe_enqueue_post_for_ingestion( $post_id, $post );
				}
			},
			65535,
			2,
		);

		// WP-Cron publishes scheduled posts with no current user, so the save above doesn't queue them. Only this
		// transition is trusted without a user, not every save made by a WP-Cron job. It fires before `save_post`.
		add_action(
			'future_to_publish',
			function ( $post ) {
				if ( $post instanceof WP_Post && ! current_user_can( 'edit_post', $post->ID ) ) {
					self::maybe_enqueue_post_for_ingestion( $post->ID, $post );
				}
			},
			65535,
		);

		add_action(
			self::INGEST_CRON_HOOK,
			function () {

				$next_ingest_after = self::ingest_queued_posts();

				if ( null !== $next_ingest_after ) {
					self::schedule_ingestion( $next_ingest_after );
				}
			},
		);
	}

	/**
	 * Queue the given post for ingestion by flagging it with a meta key, if it's eligible, and schedule the WP-Cron
	 * event that sends it, so it doesn't wait for someone to visit the admin.
	 *
	 * Nothing is queued for a site that isn't linked to a publisher, as nothing can be sent for it. Only the stored
	 * publisher is checked, since searching the API for one would hold up the save.
	 *
	 * @param int     $post_id The ID of the post being saved.
	 * @param WP_Post $post    The post being saved.
	 *
	 * @return void
	 */
	private static function maybe_enqueue_post_for_ingestion( int $post_id, WP_Post $post ): void {

		if ( ! self::should_enqueue_post_for_ingestion( $post_id, $post ) || '' === Credentials::get_stored_publisher_id() ) {
			return;
		}

		$ingest_after = time() + self::get_min_delay_for_ingestion();

		update_post_meta( $post_id, self::INGEST_AFTER_META_KEY, $ingest_after );

		// A new save starts its retries afresh.
		delete_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY );

		self::schedule_ingestion( $ingest_after );

		do_action( self::ACTION_API_POST_ENQUEUED, $post_id, $post ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
	}

	/**
	 * Remove the given post from the ingestion queue, along with its retry count.
	 *
	 * @param int $post_id The post ID.
	 *
	 * @return void
	 */
	private static function dequeue_post_from_ingestion( int $post_id ): void {
		delete_post_meta( $post_id, self::INGEST_AFTER_META_KEY );
		delete_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY );
	}

	/**
	 * Filter to determine whether the given post ID should be enqueued for ingestion by Gist Answers.
	 *
	 * This is checked when a post is saved, and again just before it's sent. Only content visitors can read is
	 * eligible: a post whose type or status isn't publicly viewable never is (whatever the post type and status
	 * filters allow), and a password-protected post isn't unless the `gist_answers_should_enqueue_post_for_ingestion`
	 * filter allows it.
	 *
	 * @param int     $post_id The ID of the post being evaluated.
	 * @param WP_Post $post    The post object being evaluated.
	 *
	 * @return bool True if the post should be enqueued for ingestion, false otherwise.
	 */
	public static function should_enqueue_post_for_ingestion( int $post_id, WP_Post $post ): bool {
		return (
			! empty( $post_id ) &&
			intval( $post->ID ?? 0 ) === $post_id &&
			in_array( $post->post_type ?? null, self::get_ingest_post_types(), true ) &&
			in_array( $post->post_status ?? null, self::get_ingest_post_statuses(), true ) &&
			is_post_publicly_viewable( $post ) &&
			Utilities::post_matches_tax_query( $post_id, self::get_ingest_tax_query() ) &&
			apply_filters( self::FILTER_SHOULD_ENQUEUE, '' === $post->post_password, $post_id, $post ) // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		);
	}

	/**
	 * Determine whether one of the `admin_init` bookkeeping tasks (ingestion, and flagging posts with answer widgets)
	 * should run on this request.
	 *
	 * They only run for logged-in users on regular admin page loads (not AJAX requests such as the heartbeat, or form
	 * submissions to admin-post.php), and at most once a minute, as they query post meta and can make API requests.
	 *
	 * @param string $task A unique name for the task.
	 *
	 * @return bool True if the task should run now, false otherwise.
	 */
	private static function should_run_admin_bookkeeping( string $task ): bool {

		global $pagenow;

		if ( wp_doing_ajax() || ! is_user_logged_in() || 'admin-post.php' === $pagenow ) {
			return false;
		}

		$transient_name = self::ADMIN_TASK_TRANSIENT_PREFIX . $task;

		if ( get_transient( $transient_name ) ) {
			return false;
		}

		set_transient( $transient_name, true, MINUTE_IN_SECONDS );

		return true;
	}

	/**
	 * Make sure queued posts are sent to the Gist API: an admin page load schedules the WP-Cron event that sends them,
	 * for when the earliest one is due, if it isn't already scheduled.
	 *
	 * Posts are only sent from WP-Cron, never during an admin page load. Scheduling the event here covers posts that
	 * were queued without one (by an earlier version of the plugin, or before the plugin was deactivated).
	 *
	 * @return void
	 */
	private function handle_posts_requiring_ingestion(): void {
		add_action(
			'admin_init',
			function () {
				if ( self::should_run_admin_bookkeeping( 'posts_requiring_ingestion' ) ) {

					$next_ingest_after = self::get_next_ingest_after();

					if ( null !== $next_ingest_after ) {
						self::schedule_ingestion( $next_ingest_after );
					}
				}
			},
		);
	}

	/**
	 * Get when the earliest queued post is due to be sent for ingestion.
	 *
	 * @return int|null When the earliest queued post is due, or null if nothing is queued, or the site has no
	 *                  publisher to send posts for.
	 */
	private static function get_next_ingest_after(): ?int {

		if ( '' === Credentials::get_stored_publisher_id() ) {
			return null;
		}

		$post_ids = get_posts( // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_posts_get_posts -- Filters are intentionally suppressed so third-party query filters (e.g. language plugins) cannot hide posts from this internal bookkeeping query.
			array(
				'post_type'   => self::get_ingest_post_types(),
				'post_status' => 'any',
				'meta_key'    => self::INGEST_AFTER_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Care has been taken to ensure the efficiency of this query; only a small number of the specific meta keys will ever exist, as they are deleted after ingestion.
				'orderby'     => 'meta_value_num',
				'order'       => 'ASC',
				'fields'      => 'ids',
				'numberposts' => 1,
			)
		);

		if ( ! is_array( $post_ids ) || 0 === count( $post_ids ) ) {
			return null;
		}

		return intval( get_post_meta( $post_ids[0], self::INGEST_AFTER_META_KEY, true ) );
	}

	/**
	 * Schedule the ingestion WP-Cron event for the given time, unless it's already scheduled for then or earlier.
	 *
	 * An event scheduled for later is replaced, as WordPress won't schedule a second one within 10 minutes of it.
	 *
	 * @param int $timestamp When the event should run (now, if that's in the past).
	 *
	 * @return void
	 */
	private static function schedule_ingestion( int $timestamp ): void {

		$timestamp = max( $timestamp, time() );

		$scheduled = wp_next_scheduled( self::INGEST_CRON_HOOK );

		if ( false !== $scheduled ) {

			if ( $scheduled <= $timestamp ) {
				return;
			}

			wp_clear_scheduled_hook( self::INGEST_CRON_HOOK );
		}

		wp_schedule_single_event( $timestamp, self::INGEST_CRON_HOOK );
	}

	/**
	 * Send the queued posts whose delay has passed to the Gist API for ingestion.
	 *
	 * Each post is claimed by moving its queue time INGEST_LEASE_DURATION ahead (only while it still holds the time
	 * that was read, so a post saved again meanwhile waits for its new delay), and only the request whose update
	 * changes it sends the post, so two WP-Cron runs at the same time can't both send it. A post only leaves the queue
	 * once the API accepts it (or it's given up on); if the request dies first, the post is sent again once the lease
	 * runs out. Each post's eligibility is checked again before it's sent, as it may have changed since it was queued.
	 *
	 * @return int|null When the queue is next due (a minute from now if more posts were due than are sent at once, or
	 *                  a few minutes from now if the API token can't be confirmed or the API couldn't accept a post),
	 *                  or null if nothing is left queued, or the site has no publisher to send them for.
	 */
	private static function ingest_queued_posts(): ?int {

		$max_posts = self::get_max_posts_for_ingestion();

		// The earliest-due queued posts, one more than are sent at once, which shows whether more are due than that.
		// The post types are listed, since `any` leaves out those excluded from search.
		$post_ids = get_posts( // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_posts_get_posts -- Filters are intentionally suppressed so third-party query filters (e.g. language plugins) cannot hide posts from this internal bookkeeping query.
			array(
				'post_type'   => self::get_ingest_post_types(),
				'post_status' => 'any',
				'meta_key'    => self::INGEST_AFTER_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Care has been taken to ensure the efficiency of this query; only a small number of the specific meta keys will ever exist, as they are deleted after ingestion.
				'orderby'     => 'meta_value_num',
				'order'       => 'ASC',
				'fields'      => 'ids',
				'numberposts' => $max_posts + 1,
			)
		);

		if ( ! is_array( $post_ids ) || 0 === count( $post_ids ) ) {
			return null;
		}

		$publisher_id = Credentials::get_publisher()->id ?? null;

		if ( empty( $publisher_id ) ) {
			return null;
		}

		update_meta_cache( 'post', $post_ids );

		$now = time();

		$ingest_afters = array_map( fn ( $post_id ) => intval( get_post_meta( $post_id, self::INGEST_AFTER_META_KEY, true ) ), $post_ids );

		$due_count = count( array_filter( $ingest_afters, fn ( $ingest_after ) => $ingest_after <= $now ) );

		if ( 0 === $due_count ) {
			return $ingest_afters[0];
		}

		// Nothing is sent while the token can't be confirmed, but the queue is kept, and tried again.
		if ( ! Credentials::has_valid_api_token() ) {
			return $now + self::INGEST_RETRY_DELAY;
		}

		// If the posts that are due aren't all sent in this run, the rest are sent this long from now.
		$resume_delay = MINUTE_IN_SECONDS;

		$started = microtime( true );

		foreach ( array_slice( $post_ids, 0, min( $due_count, $max_posts ) ) as $index => $post_id ) {

			if ( microtime( true ) - $started >= self::INGEST_TIME_BUDGET ) {
				break;
			}

			$lease = time() + self::INGEST_LEASE_DURATION;

			// Another request has already claimed this post, or it was saved again (and is due later) meanwhile.
			if ( ! self::compare_and_set_ingest_after( $post_id, $ingest_afters[ $index ], $lease ) ) {
				continue;
			}

			$post = get_post( $post_id );

			// It's no longer eligible (e.g. it was made private, or a filter now excludes it), so it isn't sent.
			if ( ! $post instanceof WP_Post || ! self::should_enqueue_post_for_ingestion( $post_id, $post ) ) {
				delete_post_meta( $post_id, self::INGEST_AFTER_META_KEY, $lease );
				delete_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY );
				continue;
			}

			$attempts = intval( get_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY, true ) ) + 1;

			update_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY, $attempts );

			$ingest_request = new Ingest( $publisher_id, get_permalink( $post_id ) );

			$response = $ingest_request->response();

			update_post_meta( $post_id, self::INGEST_RESPONSE_META_KEY, $response );

			$outcome = self::get_ingest_outcome( $response->code );

			if ( 'accepted' === $outcome ) {

				// Unless it was saved again while it was being sent, in which case that save is sent too.
				delete_post_meta( $post_id, self::INGEST_AFTER_META_KEY, $lease );
				delete_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY );

				do_action( self::ACTION_API_POST_INGESTED, $post_id, $response ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.

				continue;
			}

			// The token was rejected: the post keeps its place (without using up an attempt), and nothing more is sent
			// until the token can be confirmed again.
			if ( 'unauthorized' === $outcome ) {

				update_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY, $attempts - 1 );

				self::compare_and_set_ingest_after( $post_id, $lease, time() + self::INGEST_RETRY_DELAY );

				$resume_delay = self::INGEST_RETRY_DELAY;

				break;
			}

			if ( 'retry' === $outcome && $attempts < self::INGEST_MAX_ATTEMPTS ) {

				$retry_delay = self::get_ingest_retry_delay( $attempts, intval( $response->retry_after ?? 0 ) );

				self::compare_and_set_ingest_after( $post_id, $lease, time() + $retry_delay );

				// The API is struggling (or asked to wait), so the rest wait too, rather than fail in turn.
				$resume_delay = $retry_delay;

				break;
			}

			// The API rejected the post, or it couldn't be sent after INGEST_MAX_ATTEMPTS, so it's given up on.
			if ( delete_post_meta( $post_id, self::INGEST_AFTER_META_KEY, $lease ) ) {

				delete_post_meta( $post_id, self::INGEST_ATTEMPTS_META_KEY );

				/**
				 * Fires when a post is given up on: the Gist API rejected it, or couldn't be reached after several
				 * attempts. The post is sent again the next time it's saved.
				 *
				 * @param int    $post_id  The post ID.
				 * @param object $response The last API response.
				 * @param int    $attempts How many times it was sent.
				 */
				do_action( self::ACTION_API_POST_INGESTION_FAILED, $post_id, $response, $attempts ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
			}
		}

		$next_ingest_after = self::get_next_ingest_after();

		// Posts that were due but weren't sent (more were due than are sent at once, the run ran out of time, or the API
		// couldn't accept one) are sent later, rather than straight away.
		if ( null !== $next_ingest_after && $next_ingest_after <= time() ) {
			$next_ingest_after = time() + $resume_delay;
		}

		return $next_ingest_after;
	}

	/**
	 * Change a post's queue time, but only if it still holds the expected time. Unlike update_post_meta(), this never
	 * adds the meta key back once another request has removed it, and only one of several requests making the same
	 * change at the same time succeeds.
	 *
	 * @param int $post_id  The post ID.
	 * @param int $expected The queue time the post should hold.
	 * @param int $value    The new queue time.
	 *
	 * @return bool True if the queue time was changed, false otherwise.
	 */
	private static function compare_and_set_ingest_after( int $post_id, int $expected, int $value ): bool {

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- An atomic compare-and-set, which the metadata API can't do; the post's meta cache, and cached post queries, are cleared below.
		$updated = $wpdb->update(
			$wpdb->postmeta,
			array( 'meta_value' => strval( $value ) ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- See above.
			array(
				'post_id'    => $post_id,
				'meta_key'   => self::INGEST_AFTER_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- See above.
				'meta_value' => strval( $expected ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- See above.
			),
			array( '%s' ),
			array( '%d', '%s', '%s' )
		);

		wp_cache_delete( $post_id, 'post_meta' );
		wp_cache_set_posts_last_changed();

		return is_int( $updated ) && $updated > 0;
	}

	/**
	 * Work out what to do with a post after the Gist API's response to it.
	 *
	 * @param int $code The response code (999 if the API couldn't be reached).
	 *
	 * @return string `accepted`; `unauthorized` (the API token was rejected); `retry` (the API timed out, was
	 *                unreachable, was rate-limiting, or had a server error); or `rejected` (the API won't accept it).
	 */
	private static function get_ingest_outcome( int $code ): string {

		if ( $code >= 200 && $code < 300 ) {
			return 'accepted';
		}

		if ( in_array( $code, array( 401, 403 ), true ) ) {
			return 'unauthorized';
		}

		if ( $code >= 500 || in_array( $code, array( 0, 408, 425, 429 ), true ) ) {
			return 'retry';
		}

		return 'rejected';
	}

	/**
	 * Work out how long to wait before sending a post again, after the given number of attempts: INGEST_RETRY_DELAY,
	 * doubling with each attempt up to INGEST_MAX_RETRY_DELAY, and no sooner than the API asked (with `Retry-After`),
	 * plus up to a quarter more at random, so posts that failed together aren't all sent again at once.
	 *
	 * @param int $attempts    How many times the post has been sent.
	 * @param int $retry_after How many seconds the API asked to wait (0 if it didn't say).
	 *
	 * @return int The delay in seconds.
	 */
	private static function get_ingest_retry_delay( int $attempts, int $retry_after ): int {

		$delay = min( self::INGEST_MAX_RETRY_DELAY, self::INGEST_RETRY_DELAY * ( 2 ** max( 0, $attempts - 1 ) ) );
		$delay = max( $delay, min( $retry_after, self::INGEST_MAX_RETRY_DELAY ) );

		return $delay + wp_rand( 0, intdiv( $delay, 4 ) );
	}

	/**
	 * Unschedule the ingestion WP-Cron event (and the background publisher data refresh), and optionally delete the
	 * posts' ingestion meta too, on this site or on every site in the network.
	 *
	 * @param bool $all_sites        Optional. Whether to do so on every site in the network, on multisite. Defaults to false.
	 * @param bool $delete_post_meta Optional. Whether to also delete the posts' queue and response meta. Defaults to false.
	 *
	 * @return void
	 */
	public static function clear_ingestion( bool $all_sites = false, bool $delete_post_meta = false ): void {

		// get_all_blog_ids() lists the current site as 0 as well as by its ID, so it's only taken once.
		$blog_ids = $all_sites && is_multisite() ? array_diff( Utilities::get_all_blog_ids(), array( 0 ) ) : array( 0 );

		foreach ( $blog_ids as $blog_id ) {

			if ( ! empty( $blog_id ) && is_multisite() ) {
				switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (cron events and posts); restore_current_blog() follows.
			}

			wp_clear_scheduled_hook( self::INGEST_CRON_HOOK );
			wp_clear_scheduled_hook( Credentials::PUBLISHER_REFRESH_CRON_HOOK );
			wp_clear_scheduled_hook( Credentials::PUBLISHER_LINKS_REBUILD_CRON_HOOK );
			wp_unschedule_hook( GistWidget::WIDGET_REFRESH_CRON_HOOK );

			if ( $delete_post_meta ) {
				delete_post_meta_by_key( self::INGEST_AFTER_META_KEY );
				delete_post_meta_by_key( self::INGEST_RESPONSE_META_KEY );
				delete_post_meta_by_key( self::INGEST_ATTEMPTS_META_KEY );
			}

			if ( ! empty( $blog_id ) && is_multisite() ) {
				restore_current_blog();
			}
		}
	}

	/**
	 * On Gist Answers admin pages, note that the API token is managed by WordPress VIP when it comes from the VIP config.
	 *
	 * @return void
	 */
	private function maybe_show_vip_managed_token_notice(): void {

		$show_notice = function () {

			if ( ! $this->is_gist_answers_admin_page() || ! Config::from_constant()->is_ready() ) {
				return;
			}

			$notice_content = sprintf(
				// translators: %s is the VIP config constant name.
				__( 'This site\'s Gist API token is managed by WordPress VIP (%s). To change it, update the Gist Answers integration\'s configuration in the VIP Dashboard.', 'gist-answers' ),
				'<code>' . esc_html( Config::CONSTANT_NAME ) . '</code>',
			);

			wp_admin_notice(
				self::get_logo_img() . '<span>' . $notice_content . '</span>',
				array(
					'type'        => 'info',
					'dismissible' => false,
				)
			);
		};

		add_action( 'admin_notices', $show_notice );
		add_action( 'network_admin_notices', $show_notice );
	}

	/**
	 * Determine whether we are on any of the Gist Answers admin pages.
	 *
	 * @return bool True if we are on a Gist Answers admin page, false otherwise.
	 */
	private function is_gist_answers_admin_page(): bool {

		$current_screen = get_current_screen();

		$is_gist_answers_network_menu = $current_screen && strpos( $current_screen->id ?? '', 'toplevel_page_gist-answers' ) !== false;
		$is_gist_answers_single_menu  = $current_screen && strpos( $current_screen->id ?? '', 'gist-answers_page_gist-answers' ) !== false;

		return $is_gist_answers_network_menu || $is_gist_answers_single_menu;
	}

	/**
	 * Flag posts that contain an answer-widget shortcode or Gutenberg block
	 *
	 * @return void
	 */
	private function flag_posts_with_answer_widgets(): void {
		add_action(
			'save_post',
			function ( $post_id, $post ) {

				if (
					! ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) &&
					! wp_is_post_revision( $post_id ) &&
					current_user_can( 'edit_post', $post_id ) &&
					in_array( $post->post_type ?? null, self::get_answer_page_types(), true ) &&
					in_array( $post->post_status ?? null, self::get_answer_page_statuses(), true )
				) {
					if ( self::post_content_contains_answer_widget( strval( $post->post_content ?? '' ) ) ) {

						// The latest save wins: a pending unflag (from an earlier save without the widget) is cancelled.
						delete_post_meta( $post_id, self::ANSWER_WIDGET_UNFLAG_META_KEY );

						$is_flagged = in_array( intval( $post_id ), self::get_flagged_post_ids(), true );

						if ( ! $is_flagged && ! get_post_meta( $post_id, self::ANSWER_WIDGET_FLAG_META_KEY, true ) ) {

							update_post_meta( $post_id, self::ANSWER_WIDGET_FLAG_META_KEY, true );

							$this->maybe_create_answer_widget_for( $post_id );

							// A new answer widget may have been created, so refresh the stored widgets.
							Credentials::refresh_publisher_data();

							do_action( self::ACTION_POST_FLAGGED, $post_id ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
						}
					} else {

						// The latest save wins: a pending flag (from an earlier save with the widget) is cancelled.
						delete_post_meta( $post_id, self::ANSWER_WIDGET_FLAG_META_KEY );

						if ( in_array( intval( $post_id ), self::get_flagged_post_ids(), true ) ) {
							update_post_meta( $post_id, self::ANSWER_WIDGET_UNFLAG_META_KEY, true );
						}
					}
				}
			},
			65535,
			2,
		);
	}

	/**
	 * Determine whether the given post content contains an answer widget (as a shortcode, a block, or pasted HTML).
	 *
	 * @param string $post_content The post content to check.
	 *
	 * @return bool True if the post content contains an answer widget, false otherwise.
	 */
	private static function post_content_contains_answer_widget( string $post_content ): bool {
		return self::post_content_contains_answer_widget_shortcode( $post_content ) ||
			self::post_content_contains_answer_widget_block( $post_content ) ||
			self::post_content_contains_answer_widget_html( $post_content );
	}

	/**
	 * Determine whether the given page is an answer page: one created or moved through the CMS iframe, or one that
	 * contains an answer widget. Call it on the page's own site.
	 *
	 * @param int $post_id The ID of the page.
	 *
	 * @return bool True if the page is an answer page, false otherwise.
	 */
	private static function is_answer_page( int $post_id ): bool {

		$post = get_post( $post_id );

		if ( ! $post instanceof WP_Post || 'page' !== $post->post_type ) {
			return false;
		}

		return boolval( get_post_meta( $post_id, self::ANSWER_PAGE_META_KEY, true ) ) || self::post_content_contains_answer_widget( strval( $post->post_content ) );
	}

	/**
	 * Determine whether the given post content contains an answer-widget shortcode.
	 *
	 * @param string $post_content The post content to check.
	 *
	 * @return bool True if the post content contains an answer-widget shortcode, false otherwise.
	 */
	private static function post_content_contains_answer_widget_shortcode( string $post_content ): bool {

		$post_content = strtolower( $post_content );

		$start_index = strpos( $post_content, '[gist_answers_render_widget ' );

		while ( false !== $start_index ) {

			$shortcode_data = Utilities::extract_shortcode_data_from( $post_content, $start_index );

			if (
				'gist_answers_render_widget' === ( $shortcode_data->shortcode ?? null ) &&
				is_array( $shortcode_data->params ?? null ) &&
				'answer' === GistWidget::sanitize_args_type( $shortcode_data->params )
			) {
				return true;
			}

			$start_index = strpos( $post_content, '[gist_answers_render_widget ', $start_index + 1 );
		}

		return false;
	}

	/**
	 * Determine whether the given post content contains an answer-widget Gutenberg block.
	 *
	 * @param string $post_content The post content to check.
	 *
	 * @return bool True if the post content contains an answer-widget Gutenberg block, false otherwise.
	 */
	private static function post_content_contains_answer_widget_block( string $post_content ): bool {

		foreach ( parse_blocks( $post_content ) as $block ) {

			$block_name = $block['blockName'] ?? null;

			if ( 'gist-answers/answer' === $block_name ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine whether the given post content contains Gist Answer widget HTML pasted directly into the content.
	 *
	 * @param string $post_content The post content to check.
	 *
	 * @return bool True if the post content contains Gist Answer widget HTML pasted directly into the content, false otherwise.
	 */
	private static function post_content_contains_answer_widget_html( string $post_content ): bool {

		$post_content = strtolower( $post_content );
		$post_content = preg_replace( '/\s+/', ' ', $post_content );

		return str_contains( $post_content, '<gist-chat-widget ' );
	}

	/**
	 * Process posts that have been flagged as containing an answer widget.
	 *
	 * @return void
	 */
	private function handle_flagged_answer_widget_posts(): void {
		add_action(
			'admin_init',
			function () {

				if ( ! self::should_run_admin_bookkeeping( 'flagged_answer_widget_posts' ) ) {
					return;
				}

				$new_post_ids = get_posts( // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_posts_get_posts -- Filters are intentionally suppressed so third-party query filters (e.g. language plugins) cannot hide posts from this internal bookkeeping query.
					array(
						'post_type'    => self::get_answer_page_types(),
						'post_status'  => self::get_answer_page_statuses(),
						'meta_key'     => self::ANSWER_WIDGET_FLAG_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Care has been taken to ensure the efficiency of this query; only a small number of the specific meta keys will ever exist, as they are deleted after ingestion.
						'meta_value'   => true, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Care has been taken to ensure the efficiency of this query; only a small number of the specific meta keys will ever exist, as they are deleted after ingestion.
						'meta_compare' => '=',
						'meta_type'    => 'BOOLEAN',
						'fields'       => 'ids',
						'numberposts'  => self::get_max_flagged_answer_widget_posts(),
					)
				);

				if ( is_array( $new_post_ids ) && count( $new_post_ids ) > 0 ) {

					$existing_post_ids = self::get_flagged_post_ids();

					foreach ( $new_post_ids as $post_id ) {

						if ( ! in_array( intval( $post_id ), $existing_post_ids, true ) ) {
							$existing_post_ids[] = intval( $post_id );
						}

						delete_post_meta( $post_id, self::ANSWER_WIDGET_FLAG_META_KEY );
					}

					self::update_flagged_post_ids( $existing_post_ids );
				}
			},
		);
	}

	/**
	 * Process posts that have been un-flagged as containing an answer widget.
	 *
	 * @return void
	 */
	private function handle_unflagged_answer_widget_posts(): void {
		add_action(
			'admin_init',
			function () {

				if ( ! self::should_run_admin_bookkeeping( 'unflagged_answer_widget_posts' ) ) {
					return;
				}

				$new_post_ids = get_posts( // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_posts_get_posts -- Filters are intentionally suppressed so third-party query filters (e.g. language plugins) cannot hide posts from this internal bookkeeping query.
					array(
						'post_type'    => self::get_answer_page_types(),
						'post_status'  => self::get_answer_page_statuses(),
						'meta_key'     => self::ANSWER_WIDGET_UNFLAG_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Care has been taken to ensure the efficiency of this query; only a small number of the specific meta keys will ever exist, as they are deleted after ingestion.
						'meta_value'   => true, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Care has been taken to ensure the efficiency of this query; only a small number of the specific meta keys will ever exist, as they are deleted after ingestion.
						'meta_compare' => '=',
						'meta_type'    => 'BOOLEAN',
						'fields'       => 'ids',
						'numberposts'  => self::get_max_flagged_answer_widget_posts(),
					)
				);

				if ( is_array( $new_post_ids ) && count( $new_post_ids ) > 0 ) {

					$existing_post_ids = self::get_flagged_post_ids();

					foreach ( $new_post_ids as $post_id ) {

						$existing_post_ids = array_diff( $existing_post_ids, array( intval( $post_id ) ) );

						delete_post_meta( $post_id, self::ANSWER_WIDGET_UNFLAG_META_KEY );
					}

					self::update_flagged_post_ids( $existing_post_ids );
				}
			},
		);
	}

	/**
	 * Get the IDs of posts that have been flagged as containing an answer widget.
	 *
	 * @return array<int> The array of flagged post IDs.
	 */
	public static function get_flagged_post_ids(): array {

		$post_ids = get_option( self::ANSWER_WIDGET_POST_IDS_OPTION, array() );

		$post_ids = is_array( $post_ids ) ? $post_ids : array();
		$post_ids = array_map( 'intval', $post_ids );
		$post_ids = array_unique( $post_ids );
		$post_ids = array_filter( $post_ids );

		return $post_ids;
	}

	/**
	 * Update the IDs of posts that have been flagged as containing an answer widget.
	 *
	 * @param array<int> $post_ids The array of flagged post IDs to update.
	 *
	 * @return void
	 */
	private static function update_flagged_post_ids( array $post_ids ): void {

		$post_ids = is_array( $post_ids ) && count( $post_ids ) > 0 ? get_posts( // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_posts_get_posts -- Filters are intentionally suppressed so third-party query filters (e.g. language plugins) cannot hide posts from this internal bookkeeping query.
			array(
				'post_type'   => self::get_answer_page_types(),
				'post_status' => self::get_answer_page_statuses(),
				'post__in'    => $post_ids,
				'fields'      => 'ids',
				'numberposts' => count( $post_ids ),
			)
		) : array();

		$post_ids = is_array( $post_ids ) ? $post_ids : array();
		$post_ids = array_map( 'intval', $post_ids );
		$post_ids = array_unique( $post_ids );
		$post_ids = array_filter( $post_ids );

		update_option( self::ANSWER_WIDGET_POST_IDS_OPTION, $post_ids );
	}

	/**
	 * Determine the source of a flagged post ID.
	 *
	 * @param int $post_id The ID of the flagged post.
	 *
	 * @return string The source of the flagged post.
	 */
	public static function get_flagged_post_source( int $post_id ): string {

		if ( get_post_meta( $post_id, self::ANSWER_WIDGET_MANUAL_META_KEY, true ) ) {

			return 'manual';

		} else {

			$post_content = get_post_field( 'post_content', $post_id );

			if ( self::post_content_contains_answer_widget_shortcode( $post_content ) ) {
				return 'shortcode';
			}

			if ( self::post_content_contains_answer_widget_block( $post_content ) ) {
				return 'block';
			}

			if ( self::post_content_contains_answer_widget_html( $post_content ) ) {
				return 'html';
			}
		}

		return 'unknown';
	}

	/**
	 * Get useful Answer Page display text for the given source and post type of a post.
	 *
	 * @param string $source    The source of the post.
	 * @param string $post_type The post type of the post.
	 *
	 * @return string The display text for the given source and post type.
	 */
	public static function get_source_display_text_for( string $source, string $post_type ): string {

		if ( 'manual' === $source ) {
			return __( 'URL added manually via admin', 'gist-answers' );
		}

		if ( 'page' === $post_type ) {

			switch ( $source ) {
				case 'shortcode':
					return __( 'Shortcode in page content', 'gist-answers' );
				case 'block':
					return __( 'Gutenberg block in page content', 'gist-answers' );
				case 'html':
					return __( 'Gist Answers HTML in page content', 'gist-answers' );
				default:
					return __( 'Unknown source in page content', 'gist-answers' );
			}
		} else {

			switch ( $source ) {
				case 'shortcode':
					return __( 'Shortcode in post content', 'gist-answers' );
				case 'block':
					return __( 'Gutenberg block in post content', 'gist-answers' );
				case 'html':
					return __( 'Gist Answers HTML in post content', 'gist-answers' );
				default:
					return __( 'Unknown source in post content', 'gist-answers' );
			}
		}
	}

	/**
	 * Get filtered ingestion post types.
	 *
	 * @return array<string> The array of filtered ingestion post types.
	 */
	public static function get_ingest_post_types(): array {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$post_types = apply_filters( self::INGEST_POST_TYPES_FILTER, self::$ingest_post_types );

		return is_array( $post_types ) ? $post_types : array();
	}

	/**
	 * Get filtered ingestion post statuses.
	 *
	 * @return array<string> The array of filtered ingestion post statuses.
	 */
	public static function get_ingest_post_statuses(): array {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$post_statuses = apply_filters( self::INGEST_POST_STATUSES_FILTER, self::$ingest_post_statuses );

		return is_array( $post_statuses ) ? $post_statuses : array();
	}

	/**
	 * Get the filtered ingestion tax query array.
	 *
	 * @return array The filtered ingestion tax query array.
	 */
	public static function get_ingest_tax_query(): array {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$tax_query = apply_filters( self::INGEST_TAX_QUERY_FILTER, self::$ingest_tax_query );

		return is_array( $tax_query ) ? $tax_query : array();
	}

	/**
	 * Get filtered answer page types.
	 *
	 * @return array<string> The array of filtered answer page types.
	 */
	public static function get_answer_page_types(): array {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$page_types = apply_filters( self::ANSWER_PAGE_TYPES_FILTER, self::$answer_page_types );

		return is_array( $page_types ) ? $page_types : array();
	}

	/**
	 * Get filtered answer page statuses.
	 *
	 * @return array<string> The array of filtered answer page statuses.
	 */
	public static function get_answer_page_statuses(): array {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$page_statuses = apply_filters( self::ANSWER_PAGE_STATUSES_FILTER, self::$answer_page_statuses );

		return is_array( $page_statuses ) ? $page_statuses : array();
	}

	/**
	 * Get the maximum number of posts that will be sent for ingestion during a single WP-Cron run (allowing for WordPress filtering).
	 *
	 * @return int The maximum number of posts that will be sent for ingestion during a single WP-Cron run.
	 */
	private static function get_max_posts_for_ingestion(): int {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$result = apply_filters( self::MAX_POSTS_FOR_INGESTION_FILTER, 10 );

		return min( max( 1, intval( $result ) ), 100 );
	}

	/**
	 * Get the minimum delay (in seconds) before a new or updated post will be sent for ingestion (allowing for WordPress filtering).
	 *
	 * @return int The minimum delay (in seconds) before a new or updated post will be sent for ingestion.
	 */
	private static function get_min_delay_for_ingestion(): int {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$result = apply_filters( self::MIN_DELAY_FOR_INGESTION_FILTER, 5 );

		return min( max( 1, intval( $result ) ), 300 );
	}

	/**
	 * Get the maximum number of posts that will be processed for flagged answer widgets during a single page load (allowing for WordPress filtering).
	 *
	 * @return int The maximum number of posts that will be processed for flagged answer widgets during a single page load.
	 */
	private static function get_max_flagged_answer_widget_posts(): int {

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.
		$result = apply_filters( self::MAX_FLAGGED_ANSWER_WIDGET_POSTS_FILTER, 10 );

		return min( max( 1, intval( $result ) ), 100 );
	}

	/**
	 * Create an answer widget for the given post if the page slug has not already been registered with the Gist API.
	 *
	 * @param int $post_id The post ID for which to possibly create an answer widget.
	 *
	 * @return void
	 */
	private function maybe_create_answer_widget_for( int $post_id ): void {

		$gist_site = GistSite::get();

		$answer_widgets = $gist_site->get_chat_widgets();

		$gist_slugs = Utilities::safe_list_pluck( $answer_widgets, 'name' );
		$gist_slugs = array_map( 'strtolower', $gist_slugs );
		$gist_slugs = array_map(
			function ( $slug ) {
				return trim( $slug, '/' );
			},
			$gist_slugs
		);

		$past_slugs = get_post_meta( $post_id, self::ANSWER_WIDGETS_CREATED_META_KEY, true );
		$past_slugs = is_array( $past_slugs ) ? $past_slugs : array();

		$new_slug = get_permalink( $post_id );
		$new_slug = ! empty( $new_slug ) ? Utilities::get_page_slug_from_url( $new_slug ) : '';
		$new_slug = strtolower( $new_slug );

		$should_ignore = get_post_meta( $post_id, self::ANSWER_WIDGET_IGNORE_META_KEY, true );

		if ( $should_ignore ) {

			$past_slugs[] = $new_slug;

			delete_post_meta( $post_id, self::ANSWER_WIDGET_IGNORE_META_KEY );

		} elseif ( ! in_array( $new_slug, $gist_slugs, true ) && ! in_array( $new_slug, $past_slugs, true ) ) {

			$publisher_id = strval( $gist_site->get_publisher()->id ?? '' );

			$post_permalink = strval( get_permalink( $post_id ) );

			// Without a linked publisher (or a permalink), there's nothing to create the answer widget for yet.
			if ( '' === $publisher_id || '' === $post_permalink ) {
				return;
			}

			if ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE && function_exists( 'gist_answers_update_local_host' ) ) {
				$post_permalink = gist_answers_update_local_host( $post_permalink );
			}

			$chat_request = new Chat( $publisher_id, $post_permalink );

			$published = $chat_request->response()->data->published ?? null;

			if ( is_object( $published ) && ( $published->ok ?? false ) ) {
				$past_slugs[] = $new_slug;
			}
		}

		$past_slugs = array_unique( $past_slugs );

		update_post_meta( $post_id, self::ANSWER_WIDGETS_CREATED_META_KEY, $past_slugs );
	}

	/**
	 * Handle the Gist Answers developer options save action.
	 *
	 * @return void
	 */
	public function handle_gist_answers_save_developer_options(): void {

		check_admin_referer( 'gist_answers_save_developer_options', self::SAVE_DEVELOPER_OPTIONS_NONCE );

		self::die_unless( self::current_user_can_manage_network() );

		$log_api_responses         = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_log_api_responses'] ?? null ) );
		$log_api_backtraces        = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_log_api_backtraces'] ?? null ) );
		$count_api_requests        = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_count_api_requests'] ?? null ) );
		$simulate_api_server_error = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_simulate_api_server_error'] ?? null ) );
		$simulate_api_token_error  = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_simulate_api_token_error'] ?? null ) );

		ToolsOptions::update_log_api_responses( $log_api_responses );
		ToolsOptions::update_log_api_backtraces( $log_api_backtraces );
		ToolsOptions::update_count_api_requests( $count_api_requests );
		ToolsOptions::update_simulate_api_server_error( $simulate_api_server_error );
		ToolsOptions::update_simulate_api_token_error( $simulate_api_token_error );

		$source = sanitize_text_field( wp_unslash( $_POST['gist_answers_admin_page_source'] ?? null ) );

		$redirect_url = 'network' === $source ? ToolsOptions::get_admin_menu_url_for_network() : ToolsOptions::get_admin_menu_url();

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Handle the Gist Answers developer options save action.
	 *
	 * @return void
	 */
	/**
	 * Handle the Gist Answers danger zone options save action.
	 *
	 * @return void
	 */
	public function handle_gist_answers_save_danger_zone_options(): void {

		check_admin_referer( 'gist_answers_save_danger_zone_options', self::SAVE_DANGER_ZONE_OPTIONS_NONCE );

		self::die_unless( self::current_user_can_manage_network() );

		if ( is_multisite() && ! is_super_admin() ) {
			wp_die(
				esc_html__( 'Sorry, only network admins are allowed to perform this action.', 'gist-answers' ),
				esc_html__( 'Error', 'gist-answers' ),
				array( 'response' => 401 ),
			);
		}

		$delete_api_key = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_delete_api_key'] ?? null ) );
		$delete_content = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_delete_content'] ?? null ) );
		$delete_widgets = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_delete_widgets'] ?? null ) );
		$delete_options = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_delete_options'] ?? null ) );
		$delete_plugin  = 'on' === sanitize_text_field( wp_unslash( $_POST['gist_answers_delete_plugin'] ?? null ) );

		if ( $delete_api_key ) {
			Utilities::delete_api_key_from_database();
		}

		if ( $delete_content ) {
			Utilities::delete_content_with_widgets();
		}

		if ( $delete_widgets ) {
			Utilities::delete_sidebar_widgets();
		}

		if ( $delete_options ) {
			Utilities::delete_all_database_options();
		}

		if ( $delete_plugin ) {
			Utilities::delete_plugin_folder();
		}

		$source = sanitize_text_field( wp_unslash( $_POST['gist_answers_admin_page_source'] ?? null ) );

		$redirect_url = 'network' === $source ? ToolsOptions::get_admin_menu_url_for_network() : ToolsOptions::get_admin_menu_url();

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Stop the request with a 403 error unless the given capability check passed.
	 *
	 * @param bool $allowed Whether the current user is allowed to perform the request.
	 *
	 * @return void
	 */
	private static function die_unless( bool $allowed ): void {
		if ( ! $allowed ) {
			wp_die( esc_html__( 'Sorry, you are not allowed to do that.', 'gist-answers' ), 403 );
		}
	}

	/**
	 * Determine whether the current user can manage Gist Answers for the given site.
	 *
	 * The capability is checked on that site itself, so an administrator of one site in a network can't act on another.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to the current site.
	 *
	 * @return bool True if the current user can manage the site, false otherwise.
	 */
	public static function current_user_can_manage_site( int $blog_id = 0 ): bool {

		if ( ! is_multisite() || empty( $blog_id ) || get_current_blog_id() === $blog_id ) {
			return current_user_can( 'manage_options' );
		}

		return ! empty( get_site( $blog_id ) ) && current_user_can_for_site( $blog_id, 'manage_options' );
	}

	/**
	 * Determine whether the current user can manage network-wide Gist Answers settings (e.g., the API token).
	 *
	 * @return bool True if the current user can manage network-wide settings, false otherwise.
	 */
	public static function current_user_can_manage_network(): bool {
		return is_multisite() ? current_user_can( 'manage_network_options' ) : current_user_can( 'manage_options' );
	}

	/**
	 * REST permission callback: whether the current user can manage the site given by the request's `blog_id`.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return bool True if the current user can manage the requested site, false otherwise.
	 */
	public static function current_user_can_manage_requested_site( WP_REST_Request $request ): bool {
		return self::current_user_can_manage_site( absint( $request->get_param( 'blog_id' ) ?? 0 ) );
	}

	/**
	 * Determine whether the current user can manage all of the given publishers.
	 *
	 * Network administrators (or the administrator of a single site) can manage every publisher; the administrator of
	 * one site in a network can only manage the publisher linked to that site.
	 *
	 * @param array<string> $publisher_ids The IDs of the publishers.
	 *
	 * @return bool True if the current user can manage all of the publishers, false otherwise.
	 */
	private static function current_user_can_manage_publishers( array $publisher_ids ): bool {

		$publisher_ids = array_filter( array_map( 'strval', $publisher_ids ) );

		if ( empty( $publisher_ids ) ) {
			return false;
		}

		if ( self::current_user_can_manage_network() ) {
			return true;
		}

		$own_publisher_id = strval( Credentials::get_publisher()->id ?? '' );

		return current_user_can( 'manage_options' ) && '' !== $own_publisher_id && array( $own_publisher_id ) === array_values( array_unique( $publisher_ids ) );
	}

	/**
	 * Work out which site, and which page path within it, an answer page URL refers to.
	 *
	 * On multisite, the site is matched by both domain and path (so subdirectory and domain-mapped sites resolve
	 * correctly), and the site's own path is removed from the page path. On single-site, the domain must be the
	 * site's own.
	 *
	 * @param string $url The answer page URL.
	 *
	 * @return object|null With `blog_id` (0 on single-site) and `path` (e.g., `answers` or `help/answers`), or null if
	 *                     the URL doesn't refer to a page on a site in this installation.
	 */
	private static function resolve_answer_page_target( string $url ): ?object {

		$host = Utilities::get_domain_from_url( trim( $url ) );
		$path = '/' . ltrim( strval( wp_parse_url( trim( $url ), PHP_URL_PATH ) ), '/' );

		if ( empty( $host ) ) {
			return null;
		}

		if ( is_multisite() ) {

			$site = get_site_by_path( $host, $path );

			if ( empty( $site ) ) {
				return null;
			}

			$blog_id   = intval( $site->blog_id );
			$site_path = strval( $site->path );

		} else {

			// Like get_site_by_path() on multisite, a `www.` prefix on either side is ignored.
			if ( preg_replace( '/^www\./', '', $host ) !== preg_replace( '/^www\./', '', Utilities::get_domain_from_url( home_url( '/' ) ) ) ) {
				return null;
			}

			$blog_id   = 0;
			$site_path = trailingslashit( strval( wp_parse_url( home_url( '/' ), PHP_URL_PATH ) ) );
		}

		if ( ! str_starts_with( trailingslashit( $path ), $site_path ) ) {
			return null;
		}

		$page_path = trim( substr( $path, strlen( $site_path ) ), '/' );

		return '' === $page_path ? null : (object) array(
			'blog_id' => $blog_id,
			'path'    => $page_path,
		);
	}

	/**
	 * Find the parent page for a (possibly nested) answer page path.
	 *
	 * @param string $page_path The page path (e.g., `answers` or `help/answers`).
	 * @param int    $blog_id   Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return int|null The ID of the parent page, 0 if the path isn't nested, or null if its parent page doesn't exist.
	 */
	private static function get_parent_page_id_for( string $page_path, int $blog_id = 0 ): ?int {

		$parent_path = dirname( $page_path );

		if ( '.' === $parent_path || '' === $parent_path ) {
			return 0;
		}

		if ( is_multisite() && ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's pages; restore_current_blog() follows.
		}

		$parent_page = get_page_by_path( $parent_path, OBJECT, 'page' );

		if ( is_multisite() && ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return is_object( $parent_page ) ? intval( $parent_page->ID ) : null;
	}

	/**
	 * Register the Gist Answers admin REST API routes.
	 *
	 * @return void
	 */
	private function register_admin_rest_routes(): void {
		add_action(
			'rest_api_init',
			function () {

				// GET requests.
				register_rest_route(
					'gist-answers/v1',
					'/admin/site-statuses',
					array(
						'methods'             => 'GET',
						'callback'            => array( $this, 'handle_gist_answers_site_statuses' ),
						'permission_callback' => function ( WP_REST_Request $request ) {
							return self::current_user_can_manage_publishers( $this->get_sanitized_publisher_ids_from_request( $request ) );
						},
						// No more IDs than a page of the network hub shows; a longer list is rejected before any API request.
						'args'                => array(
							'publisher_ids' => array(
								'type'     => 'array',
								'items'    => array(
									'type' => 'string',
								),
								'maxItems' => NetworkMenu::SITES_PER_PAGE_MAX,
							),
							'refresh'       => array(
								'type'    => 'boolean',
								'default' => false,
							),
						),
					),
				);

				register_rest_route(
					'gist-answers/v1',
					'/admin/publisher-matches',
					array(
						'methods'             => 'GET',
						'callback'            => array( $this, 'handle_gist_answers_publisher_matches' ),
						'permission_callback' => array( self::class, 'current_user_can_manage_requested_site' ),
					),
				);

				register_rest_route(
					'gist-answers/v1',
					'/admin/iframe-url',
					array(
						'methods'             => 'GET',
						'callback'            => array( $this, 'handle_gist_answers_iframe_url' ),
						'permission_callback' => array( self::class, 'current_user_can_manage_requested_site' ),
					),
				);

				register_rest_route(
					'gist-answers/v1',
					'/admin/submenu-page-url',
					array(
						'methods'             => 'GET',
						'callback'            => array( $this, 'handle_gist_answers_submenu_page_url' ),
						'permission_callback' => array( self::class, 'current_user_can_manage_requested_site' ),
					),
				);

				// POST requests.
				register_rest_route(
					'gist-answers/v1',
					'/admin/site-status/update',
					array(
						'methods'             => 'POST',
						'callback'            => array( $this, 'handle_gist_answers_site_status_update' ),
						'permission_callback' => function ( WP_REST_Request $request ) {
							return self::current_user_can_manage_publishers( array( sanitize_text_field( wp_unslash( strval( $request->get_param( 'publisher_id' ) ) ) ) ) );
						},
					),
				);

				register_rest_route(
					'gist-answers/v1',
					'/admin/answer-page',
					array(
						'methods'             => 'POST',
						'callback'            => array( $this, 'handle_gist_answers_answer_page' ),
						'permission_callback' => function ( WP_REST_Request $request ) {

							$target = self::resolve_answer_page_target( sanitize_text_field( wp_unslash( strval( $request->get_param( 'target_url' ) ) ) ) );

							return ! empty( $target ) && self::current_user_can_manage_site( $target->blog_id );
						},
					),
				);
			}
		);
	}

	/**
	 * Handle the Gist Answers site statuses REST API request.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return WP_REST_Response The REST API response object.
	 */
	public function handle_gist_answers_site_statuses( WP_REST_Request $request ): WP_REST_Response {

		$output = array();

		$api_response_code = 200;

		$publisher_ids = $this->get_sanitized_publisher_ids_from_request( $request );

		// A refresh only reuses statuses fetched in the last few seconds, so a repeated refresh still can't call the API
		// for every request.
		$max_age = true === $request->get_param( 'refresh' ) ? self::SITE_STATUS_REFRESH_MIN_AGE : self::SITE_STATUS_TRANSIENT_DURATION;

		$publisher_messages = null;

		/**
		 * Filter how many seconds one site statuses request may spend calling the Gist Answers API. Once it's used up,
		 * the publishers whose statuses haven't been fetched are left out, and the response says it's incomplete.
		 *
		 * @param int $budget The budget in seconds. Defaults to 10.
		 */
		$budget = floatval( apply_filters( self::SITE_STATUSES_TIME_BUDGET_FILTER, self::SITE_STATUSES_TIME_BUDGET ) ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- False positive; the hook name is a constant defined in this class, with a proper prefix.

		$started = microtime( true );

		$fetched = 0;

		$incomplete = false;

		foreach ( $publisher_ids as $publisher_id ) {

			$cached_status = self::get_recent_site_status( $publisher_id, $max_age );

			if ( null !== $cached_status ) {
				$output[ $publisher_id ] = $cached_status;
				continue;
			}

			if ( $fetched > 0 && microtime( true ) - $started >= $budget ) {
				$incomplete = true;
				continue;
			}

			// Only fetched when a status isn't cached, and once per request.
			if ( null === $publisher_messages ) {
				$publisher_messages = $this->get_publisher_messages();
			}

			++$fetched;

			$sites_request = new Sites( $publisher_id );

			$sites_response = $sites_request->response()->data ?? null;

			$sites = is_array( $sites_response ) ? array_values( array_filter( $sites_response, 'is_object' ) ) : array();

			$ingestion_status = self::get_ingestion_status_for_sites( $sites );

			$sites_succeeded = 200 === ( $sites_request->response()->code ?? null );

			if ( is_array( $publisher_messages[ $publisher_id ] ?? null ) ) {

				// The message is shown in place of the ingestion status, but the toggle still shows whether any of the
				// publisher's sites are being ingested, and still starts or stops all of them.
				$output[ $publisher_id ] = $publisher_messages[ $publisher_id ][0] ?? (object) array();

				$output[ $publisher_id ]->phase    = '';
				$output[ $publisher_id ]->status   = '';
				$output[ $publisher_id ]->site_id  = $ingestion_status->site_id;
				$output[ $publisher_id ]->site_ids = $ingestion_status->site_ids;
				$output[ $publisher_id ]->active   = $ingestion_status->active;

			} else {

				// The whole request fails, so the rest aren't fetched.
				if ( ! $sites_succeeded ) {
					$api_response_code = $sites_request->response()->code ?? 424;
					break;
				}

				$output[ $publisher_id ] = $ingestion_status;
			}

			if ( $sites_succeeded ) {
				self::remember_site_status( $publisher_id, $output[ $publisher_id ] );
			}
		}

		if ( 200 === $api_response_code ) {

			$this->update_cached_site_statuses( $output );

			$response = array(
				'status' => 'success',
				'data'   => $output,
			);

			if ( $incomplete ) {
				$response['incomplete'] = true;
			}

			return new WP_REST_Response( $response, 200 );

		} else {

			return new WP_REST_Response(
				array(
					'status' => 'error',
				),
				$api_response_code,
			);
		}
	}

	/**
	 * Get a publisher's status if it was fetched within the last $max_age seconds (and at most
	 * SITE_STATUS_TRANSIENT_DURATION).
	 *
	 * @param string $publisher_id The publisher ID.
	 * @param int    $max_age      The oldest a status may be, in seconds.
	 *
	 * @return object|null The status (see handle_gist_answers_site_statuses()), or null if there's none.
	 */
	private static function get_recent_site_status( string $publisher_id, int $max_age = self::SITE_STATUS_TRANSIENT_DURATION ): ?object {

		$transient_name = self::SITE_STATUS_TRANSIENT_PREFIX . md5( $publisher_id );

		$cached = is_multisite() ? get_site_transient( $transient_name ) : get_transient( $transient_name );

		if ( ! is_array( $cached ) || ! is_object( $cached['status'] ?? null ) || ! is_int( $cached['fetched_at'] ?? null ) ) {
			return null;
		}

		return time() - $cached['fetched_at'] < $max_age ? $cached['status'] : null;
	}

	/**
	 * Remember a publisher's status for SITE_STATUS_TRANSIENT_DURATION.
	 *
	 * @param string $publisher_id The publisher ID.
	 * @param object $status       The status (see handle_gist_answers_site_statuses()).
	 *
	 * @return void
	 */
	private static function remember_site_status( string $publisher_id, object $status ): void {

		$transient_name = self::SITE_STATUS_TRANSIENT_PREFIX . md5( $publisher_id );

		$cached = array(
			'status'     => $status,
			'fetched_at' => time(),
		);

		if ( is_multisite() ) {
			set_site_transient( $transient_name, $cached, self::SITE_STATUS_TRANSIENT_DURATION );
		} else {
			set_transient( $transient_name, $cached, self::SITE_STATUS_TRANSIENT_DURATION );
		}
	}

	/**
	 * Forget a publisher's recently fetched status (see get_recent_site_status()), e.g. once its ingestion is started
	 * or stopped, so the next status request fetches it again.
	 *
	 * @param string $publisher_id The publisher ID.
	 *
	 * @return void
	 */
	public static function forget_recent_site_status( string $publisher_id ): void {

		$transient_name = self::SITE_STATUS_TRANSIENT_PREFIX . md5( $publisher_id );

		if ( is_multisite() ) {
			delete_site_transient( $transient_name );
		} else {
			delete_transient( $transient_name );
		}
	}

	/**
	 * Get sanitized publisher IDs from the given REST API request.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return array<string> The array of sanitized publisher IDs.
	 */
	private function get_sanitized_publisher_ids_from_request( WP_REST_Request $request ): array {

		$publisher_ids = $request->get_param( 'publisher_ids' );
		$publisher_ids = is_array( $publisher_ids ) ? $publisher_ids : array();

		$publisher_ids = array_filter( $publisher_ids, 'is_string' );
		$publisher_ids = array_map( 'wp_unslash', $publisher_ids );
		$publisher_ids = array_map( 'sanitize_text_field', $publisher_ids );
		$publisher_ids = array_filter( $publisher_ids, 'strlen' );

		// Each publisher is authorized and fetched once, however many times it's listed.
		return array_values( array_unique( $publisher_ids ) );
	}

	/**
	 * Work out the content ingestion status of a publisher from the ingestion statuses of all of its sites.
	 *
	 * If all of the sites are being ingested (or all are paused), the status says so; if some are and some aren't, it
	 * is `mixed`, and says how many are being ingested.
	 *
	 * @param array<object> $sites The publisher's sites, as returned by the API.
	 *
	 * @return object The status, with `type` (`full`, `delta`, `pause`, `mixed`, or `none`), `text`, the `phase` and
	 *                `status` of the first site, the `site_id` of the first site and `site_ids` of all of them, and
	 *                whether any of them are being ingested (`active`).
	 */
	private static function get_ingestion_status_for_sites( array $sites ): object {

		$site_types = array_map( array( self::class, 'get_ingestion_type_for_site' ), $sites );

		$crawl_types = array_values( array_filter( $site_types, fn ( $type ) => 'none' !== $type ) );

		$active_count = count( array_filter( $crawl_types, fn ( $type ) => 'pause' !== $type ) );

		if ( empty( $crawl_types ) ) {

			$status = (object) array(
				'type' => 'none',
				'text' => '',
			);

		} elseif ( 0 === $active_count ) {

			$status = (object) array(
				'type' => 'pause',
				'text' => 'Ingestion paused',
			);

		} elseif ( count( $crawl_types ) === $active_count ) {

			$status = in_array( 'full', $crawl_types, true )
				? (object) array(
					'type' => 'full',
					'text' => 'Historical ingestion in progress',
				)
				: (object) array(
					'type' => 'delta',
					'text' => 'Ingestion active',
				);

		} else {

			$status = (object) array(
				'type' => 'mixed',
				'text' => sprintf(
					/* translators: 1: The number of feeds being ingested, 2: The total number of feeds. */
					__( 'Ingestion active (%1$d of %2$d feeds)', 'gist-answers' ),
					$active_count,
					count( $crawl_types )
				),
			);
		}

		$first_site = $sites[0] ?? null;

		$status->phase  = is_object( $first_site ) ? $first_site->ingest_status->crawl_phase ?? null : null;
		$status->status = is_object( $first_site ) ? $first_site->ingest_status->crawler_status ?? null : null;

		$status->site_ids = array_values( array_filter( array_map( fn ( $site ) => strval( $site->id ?? '' ), $sites ) ) );
		$status->site_id  = $status->site_ids[0] ?? '';

		$status->active = $active_count > 0;

		return $status;
	}

	/**
	 * Work out the content ingestion status of a single site.
	 *
	 * @param object $site The site, as returned by the API.
	 *
	 * @return string `full` (historical ingestion in progress), `delta` (ingestion active), `pause`, or `none` (the
	 *                site has no ingestion status).
	 */
	private static function get_ingestion_type_for_site( object $site ): string {

		$crawl_phase  = is_object( $site->ingest_status ?? null ) ? $site->ingest_status->crawl_phase ?? null : null;
		$crawl_status = is_object( $site->ingest_status ?? null ) ? $site->ingest_status->crawler_status ?? null : null;

		$is_running = in_array( $crawl_status, array( 'queued', 'processing' ), true );

		switch ( $crawl_phase ) {
			case 'none':
			case 'delta':
				return $is_running ? 'delta' : 'pause';

			case 'full':
				return $is_running ? 'full' : 'pause';

			default:
				return 'none';
		}
	}

	/**
	 * Update the cached site statuses in the WordPress options table.
	 *
	 * @param array<object> $new_statuses The array of new site statuses, keyed by publisher ID.
	 *
	 * @return void
	 */
	private function update_cached_site_statuses( array $new_statuses ): void {

		if ( is_multisite() ) {
			$site_statuses = get_site_option( self::SITE_STATUSES_OPTION, array() );
		} else {
			$site_statuses = get_option( self::SITE_STATUSES_OPTION, array() );
		}

		$site_statuses = is_array( $site_statuses ) ? $site_statuses : array();

		// Move updated statuses to the end, so that only the most recently updated ones are kept below.
		foreach ( $new_statuses as $publisher_id => $new_status ) {
			unset( $site_statuses[ $publisher_id ] );
			$site_statuses[ $publisher_id ] = $new_status;
		}

		$site_statuses = array_slice( $site_statuses, -self::MAX_CACHED_SITE_STATUSES, null, true );

		if ( is_multisite() ) {
			update_site_option( self::SITE_STATUSES_OPTION, $site_statuses );
		} else {
			update_option( self::SITE_STATUSES_OPTION, $site_statuses, false );
		}
	}

	/**
	 * Get the publisher messages from the Gist API.
	 *
	 * @return array<object> The array of publisher messages, keyed by publisher ID.
	 */
	private function get_publisher_messages(): array {

		$publisher_group_id = Credentials::get_publisher_group_id();

		$messages_request = new Messages( $publisher_group_id );

		$messages_response = $messages_request->response()->data ?? null;

		$output = array();

		if ( is_object( $messages_response ) ) {

			$errors   = is_array( $messages_response->errors ?? null ) ? $messages_response->errors : array();
			$messages = is_array( $messages_response->messages ?? null ) ? $messages_response->messages : array();

			$output = $this->group_messages_by_publisher_id( 'error', $errors, $output );
			$output = $this->group_messages_by_publisher_id( 'message', $messages, $output );
		}

		return $output;
	}

	/**
	 * Group messages by publisher ID.
	 *
	 * @param string        $type    The type of message ('error' or 'message').
	 * @param array<object> $items   The array of message items to group.
	 * @param array<object> $output  The output array to populate with grouped messages.
	 *
	 * @return array<object> The output array with messages grouped by publisher ID.
	 */
	private function group_messages_by_publisher_id( string $type, array $items, array $output ): array {

		foreach ( $items as $item ) {
			if ( is_object( $item ) ) {

				$publisher_id = $item->publisher_id ?? null;

				if ( ! empty( $publisher_id ) ) {

					$messages = array( $item->message ?? null );

					foreach ( get_object_vars( $item ) as $subitem ) {

						if ( is_object( $subitem ) && isset( $subitem->message ) ) {
							$messages[] = $subitem->message;
						}
					}

					$messages = array_filter( $messages );

					// The message text comes from the API, so it is passed on as plain text (never HTML) and the error label
					// is added separately when it is displayed.
					foreach ( $messages as $message ) {
						$output[ $publisher_id ][] = (object) array(
							'type'  => $type,
							'label' => 'error' === $type ? __( 'Error', 'gist-answers' ) : '',
							'text'  => wp_strip_all_tags( strval( $message ) ),
						);
					}
				}
			}
		}

		return $output;
	}

	/**
	 * Handle the Gist Answers publisher matches REST API request.
	 *
	 * Returns how the site should be activated: see Credentials::get_activation_matches().
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return WP_REST_Response The REST API response object.
	 */
	public function handle_gist_answers_publisher_matches( WP_REST_Request $request ): WP_REST_Response {

		$blog_id = absint( $request->get_param( 'blog_id' ) ?? 0 );

		return new WP_REST_Response( Credentials::get_activation_matches( $blog_id, self::current_user_can_manage_network() ), 200 );
	}

	/**
	 * Handle the Gist Answers site status update REST API request.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return WP_REST_Response The REST API response object.
	 */
	public function handle_gist_answers_site_status_update( WP_REST_Request $request ): WP_REST_Response {

		$publisher_id = sanitize_text_field( wp_unslash( $request->get_param( 'publisher_id' ) ) );

		// The crawl is started or stopped for all of the publisher's sites at once; their IDs are kept for the cached
		// status (`site_id` is accepted for a single site).
		$site_ids = sanitize_text_field( wp_unslash( $request->get_param( 'site_ids' ) ?? $request->get_param( 'site_id' ) ?? '' ) );
		$site_ids = array_values( array_filter( array_map( 'trim', explode( ',', $site_ids ) ) ) );

		$checked = sanitize_text_field( wp_unslash( $request->get_param( 'checked' ) ) );

		$site_status = array(
			$publisher_id => (object) array(
				'type'     => 'none',
				'text'     => '',
				'phase'    => '',
				'status'   => '',
				'site_id'  => $site_ids[0] ?? '',
				'site_ids' => $site_ids,
			),
		);

		if ( ! empty( $publisher_id ) && ! empty( $site_ids ) && in_array( $checked, array( 'true', 'false' ), true ) ) {

			$crawl_request = 'true' === $checked ? new StartCrawl( $publisher_id ) : new StopCrawl( $publisher_id );

			if ( 'true' === $checked ) {
				$site_status[ $publisher_id ]->type = 'full';
				$site_status[ $publisher_id ]->text = 'Ingestion queued';
			} else {
				$site_status[ $publisher_id ]->type = 'pause';
				$site_status[ $publisher_id ]->text = 'Ingestion paused';
			}
		}

		$this->update_cached_site_statuses( $site_status );

		self::forget_recent_site_status( $publisher_id );

		return new WP_REST_Response(
			array(
				'response' => isset( $crawl_request ) ? $crawl_request->response()->data ?? 'error' : 'error',
			),
			isset( $crawl_request ) ? ( $crawl_request->response()->code ?? 424 ) : 424,
		);
	}

	/**
	 * Handle the Gist Answers iframe URL REST API request.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return WP_REST_Response The REST API response object.
	 */
	public function handle_gist_answers_iframe_url( WP_REST_Request $request ): WP_REST_Response {

		$which = sanitize_text_field( wp_unslash( $request->get_param( 'which' ) ) );

		$blog_id = intval( $request->get_param( 'blog_id' ) );

		if ( ! GistURLs::is_valid_cms_iframe( $which ) ) {
			return new WP_REST_Response( array( 'error' => 'Invalid iframe' ), 400 );
		}

		$iframe_url = GistURLs::get_cms_iframe_url( $which, $blog_id );

		$token_hash = empty( $iframe_url ) ? '' : Utilities::get_token_hash_from_iframe_url( $iframe_url, $blog_id );

		return new WP_REST_Response(
			array(
				'url'        => $iframe_url,
				'token_hash' => $token_hash,
			),
			empty( $iframe_url ) ? 424 : 200,
		);
	}

	/**
	 * Handle the Gist Answers submenu page URL REST API request.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return WP_REST_Response The REST API response object.
	 */
	public function handle_gist_answers_submenu_page_url( WP_REST_Request $request ): WP_REST_Response {

		$which = sanitize_text_field( wp_unslash( $request->get_param( 'which' ) ) );

		$blog_id = intval( $request->get_param( 'blog_id' ) );

		$gist_site = GistSite::get( $blog_id );

		$gist_url = $gist_site->get_gist_url();

		$source_slug = MenuItems::get_admin_menu_slug_for( Dashboard::class );
		$target_slug = MenuItems::get_admin_menu_slug_for( $which );

		if ( ! empty( $target_slug ) ) {
			$gist_url = str_replace( $source_slug, $target_slug, $gist_url );
		}

		return new WP_REST_Response(
			array(
				'url' => $gist_url,
			),
			200,
		);
	}

	/**
	 * Handle the Gist Answers answer page REST API request.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return WP_REST_Response The REST API response object.
	 */
	public function handle_gist_answers_answer_page( WP_REST_Request $request ): WP_REST_Response {

		$action          = sanitize_text_field( wp_unslash( $request->get_param( 'action' ) ) );
		$target_url      = sanitize_text_field( wp_unslash( $request->get_param( 'target_url' ) ) );
		$embed_token     = sanitize_text_field( wp_unslash( $request->get_param( 'embed_token' ) ) );
		$prev_target_url = sanitize_text_field( wp_unslash( $request->get_param( 'prev_target_url' ) ) );
		$token_hash      = sanitize_text_field( wp_unslash( $request->get_param( 'token_hash' ) ) );

		$target_domain      = Utilities::get_domain_from_url( $target_url );
		$prev_target_domain = Utilities::get_domain_from_url( $prev_target_url );

		$target      = self::resolve_answer_page_target( $target_url );
		$prev_target = self::resolve_answer_page_target( $prev_target_url );

		$blog_id = $target->blog_id ?? 0;

		// The token hash is a short-lived grant for this user, the target site, and the publisher linked to it.
		if ( empty( $embed_token ) || empty( $token_hash ) || ! Utilities::token_hash_is_valid( $token_hash, $embed_token, $blog_id ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'error'   => wp_kses_post( __( 'The embed token has expired. Please refresh the page and try again.', 'gist-answers' ) ),
				),
				403,
			);
		}

		$message = '';

		switch ( $action ) {
			case 'create':
				if ( empty( $target_url ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'Missing required parameter \'target_url\' when creating the answer page.', 'gist-answers' ) ),
						),
						400,
					);
				}

				$target_page_slug = $target->path ?? '';

				$maybe_post_id = Utilities::get_post_id_from_page_slug( $target_page_slug, $blog_id );

				if ( ! empty( $maybe_post_id ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'A page already exists at this location. The answer page could not be created.', 'gist-answers' ) ),
						),
						400,
					);
				}

				$parent_post_id = self::get_parent_page_id_for( $target_page_slug, $blog_id );

				if ( null === $parent_post_id ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'The parent page of this location does not exist. The answer page could not be created.', 'gist-answers' ) ),
						),
						400,
					);
				}

				if ( is_multisite() && ! empty( $blog_id ) ) {
					switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
				}

				// The capability is checked on the target site, right before the page is published there.
				if ( current_user_can( 'publish_pages' ) ) {
					$post = wp_insert_post(
						array(
							'post_type'    => 'page',
							'post_status'  => 'publish',
							'post_title'   => basename( $target_page_slug ),
							'post_name'    => basename( $target_page_slug ),
							'post_parent'  => $parent_post_id,
							'post_content' => '<!-- wp:gist-answers/answer /-->',
							'meta_input'   => array(
								self::ANSWER_WIDGET_IGNORE_META_KEY => true,
								self::ANSWER_PAGE_META_KEY => true,
							),
						),
						true,
					);
				} else {
					$post = new WP_Error( 'gist_answers_forbidden', __( 'Sorry, you are not allowed to publish pages on this site. The answer page could not be created.', 'gist-answers' ) );
				}

				if ( is_multisite() && ! empty( $blog_id ) ) {
					restore_current_blog();
				}

				if ( is_wp_error( $post ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( implode( ' ', $post->get_error_messages() ?? array() ) ),
						),
						'gist_answers_forbidden' === $post->get_error_code() ? 403 : 400,
					);
				}

				Credentials::refresh_publisher_data( $blog_id );

				$message = wp_kses_post( __( 'The answer page was successfully created.', 'gist-answers' ) );

				break;

			case 'update':
				if ( empty( $target_url ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'Missing required parameter \'target_url\' when updating the answer page.', 'gist-answers' ) ),
						),
						400,
					);
				}

				if ( empty( $target_domain ) || empty( $prev_target_domain ) || $target_domain !== $prev_target_domain || ( $prev_target->blog_id ?? null ) !== $blog_id ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'The domain of the target URL does not match the previous target URL.', 'gist-answers' ) ),
						),
						403,
					);
				}

				$target_page_slug = $target->path ?? '';

				$maybe_post_id = Utilities::get_post_id_from_page_slug( $target_page_slug, $blog_id );

				if ( ! empty( $maybe_post_id ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'A page already exists at this location. The answer page could not be updated.', 'gist-answers' ) ),
						),
						400,
					);
				}

				$parent_post_id = self::get_parent_page_id_for( $target_page_slug, $blog_id );

				if ( null === $parent_post_id ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'The parent page of this location does not exist. The answer page could not be updated.', 'gist-answers' ) ),
						),
						400,
					);
				}

				if ( empty( $prev_target_url ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'Missing required parameter \'prev_target_url\' when updating the answer page.', 'gist-answers' ) ),
						),
						400,
					);
				}

				$prev_target_page_slug = $prev_target->path ?? '';

				// Answer pages are always pages, so a post of another type at that path is never renamed or moved.
				$maybe_post_id = Utilities::get_post_id_from_page_slug( $prev_target_page_slug, $blog_id, array( 'page' ) );

				if ( empty( $maybe_post_id ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( __( 'The previous answer page could not be found. The answer page could not be updated.', 'gist-answers' ) ),
						),
						400,
					);
				}

				if ( is_multisite() && ! empty( $blog_id ) ) {
					switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
				}

				// Only an answer page is ever moved, and only by a user who can edit it; both are checked on the target
				// site, right before the page is changed.
				if ( ! self::is_answer_page( $maybe_post_id ) ) {
					$update_result = new WP_Error( 'gist_answers_forbidden', __( 'The page at the previous location is not an answer page. The answer page could not be updated.', 'gist-answers' ) );
				} elseif ( ! current_user_can( 'edit_post', $maybe_post_id ) ) {
					$update_result = new WP_Error( 'gist_answers_forbidden', __( 'Sorry, you are not allowed to edit the answer page. The answer page could not be updated.', 'gist-answers' ) );
				} else {
					$update_result = wp_update_post(
						array(
							'ID'          => $maybe_post_id,
							'post_name'   => basename( $target_page_slug ),
							'post_parent' => $parent_post_id,
							'meta_input'  => array(
								self::ANSWER_WIDGET_IGNORE_META_KEY => true,
								self::ANSWER_PAGE_META_KEY => true,
							),
						),
						true,
					);
				}

				if ( is_multisite() && ! empty( $blog_id ) ) {
					restore_current_blog();
				}

				if ( is_wp_error( $update_result ) ) {
					return new WP_REST_Response(
						array(
							'success' => false,
							'error'   => wp_kses_post( implode( ' ', $update_result->get_error_messages() ?? array() ) ),
						),
						'gist_answers_forbidden' === $update_result->get_error_code() ? 403 : 400,
					);
				}

				Credentials::refresh_publisher_data( $blog_id );

				$message = wp_kses_post( __( 'The answer page was successfully updated.', 'gist-answers' ) );

				break;

			default:
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => wp_kses_post( __( 'Invalid action for creating or updating the answer page.', 'gist-answers' ) ),
					),
					400,
				);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => $message,
			),
			200,
		);
	}

	/**
	 * Retrieve the cached site statuses for initial rendering.
	 *
	 * @return array<object> The array of cached site statuses, keyed by publisher ID.
	 */
	public static function get_cached_site_statuses(): array {

		if ( is_multisite() ) {
			$site_statuses = get_site_option( self::SITE_STATUSES_OPTION, array() );
		} else {
			$site_statuses = get_option( self::SITE_STATUSES_OPTION, array() );
		}

		return is_array( $site_statuses ) ? $site_statuses : array();
	}

	/**
	 * Force reload on back button for admin pages. This ensures that when an admin navigates back to a previously
	 * visited Gist Answers admin page, the page is reloaded to reflect the most up-to-date content, and most
	 * importantly, so any embed tickets are refreshed.
	 *
	 * @return void
	 */
	private function force_reload_on_back_button_for_admin_pages(): void {

		add_filter(
			'wp_headers',
			function ( $headers ) {

				if ( $this->is_gist_answers_admin_page() ) {
					$headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
					$headers['Pragma']        = 'no-cache';
					$headers['Expires']       = '0';
				}

				return $headers;
			},
			65535,
			1
		);

		add_action(
			'admin_print_footer_scripts',
			function () {
				?>

			<script type="text/javascript">
				(function() {
					window.addEventListener('pageshow', function(event) {
						if (event.persisted) {
							window.location.reload();
						}
					});
				})();
			</script>

				<?php
			},
			65535
		);
	}
}
