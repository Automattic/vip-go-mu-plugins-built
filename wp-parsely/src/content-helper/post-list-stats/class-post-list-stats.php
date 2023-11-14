<?php
/**
 * UI: Class for adding `Parse.ly Stats` on admin columns
 *
 * @package Parsely
 * @since   3.7.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper;

use DateTime;
use Parsely\Content_Helper\Content_Helper_Feature;
use Parsely\Parsely;
use Parsely\RemoteAPI\Base_Endpoint_Remote;
use Parsely\RemoteAPI\Analytics_Posts_API;
use WP_Screen;

use function Parsely\Utils\get_asset_info;
use function Parsely\Utils\get_formatted_number;
use function Parsely\Utils\get_formatted_time;

use const Parsely\PARSELY_FILE;
use const Parsely\Utils\DATE_UTC_FORMAT;

/**
 * Class for adding `Parse.ly Stats` on admin columns.
 *
 * @since 3.7.0
 * @since 3.9.0 Renamed FQCN from `Parsely\UI\Admin_Columns_Parsely_Stats` to `Parsely\Content_Helper\Post_List_Stats`.
 *
 * @phpstan-import-type Analytics_Post_API_Params from Analytics_Posts_API
 * @phpstan-import-type Analytics_Post from Analytics_Posts_API
 * @phpstan-import-type Remote_API_Error from Base_Endpoint_Remote
 *
 * @phpstan-type Parsely_Post_Stats array{
 *   page_views: string,
 *   visitors: string,
 *   avg_time: string,
 * }
 *
 * @phpstan-type Parsely_Posts_Stats_Response array{
 *   data: array<string, Parsely_Post_Stats>|null,
 *   error: Remote_API_Error|null,
 * }
 */
class Post_List_Stats extends Content_Helper_Feature {
	/**
	 * Instance of Parsely Analytics Posts API.
	 *
	 * @var Analytics_Posts_API
	 */
	private $analytics_api;

	/**
	 * Internal Variable.
	 *
	 * @var WP_Screen|null
	 */
	private $current_screen;

	/**
	 * Published times of visible posts.
	 *
	 * Analytics Endpoint don't support post_ids as param so to limit the API we will pass the
	 * min/max publish time.
	 *
	 * @var string[]
	 */
	private $utc_published_times = array();

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Returns the feature's filter name.
	 *
	 * @since 3.9.0
	 *
	 * @return string The filter name.
	 */
	public static function get_feature_filter_name(): string {
		return self::get_global_filter_name() . '_stats_column';
	}

	/**
	 * Returns the feature's script ID.
	 *
	 * @since 3.9.0
	 *
	 * @return string The script ID.
	 */
	public static function get_script_id(): string {
		return 'post-list-stats-script';
	}

	/**
	 * Returns the feature's style ID.
	 *
	 * @since 3.9.0
	 *
	 * @return string The style ID.
	 */
	public static function get_style_id(): string {
		return 'post-list-stats-styles';
	}

	/**
	 * Registers action and filter hook callbacks.
	 *
	 * @since 3.7.0
	 */
	public function run(): void {
		$this->analytics_api = new Analytics_Posts_API( $this->parsely );

		if ( ! $this->can_enable_feature(
			$this->parsely->site_id_is_set(),
			$this->parsely->api_secret_is_set(),
			$this->analytics_api->is_user_allowed_to_make_api_call()
		) ) {
			return;
		}

		add_action( 'current_screen', array( $this, 'set_current_screen' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_parsely_stats_styles' ) );
		add_filter( 'manage_posts_columns', array( $this, 'add_parsely_stats_column_on_list_view' ) );
		add_action( 'manage_posts_custom_column', array( $this, 'update_published_times_and_show_placeholder' ) );
		add_filter( 'manage_pages_columns', array( $this, 'add_parsely_stats_column_on_list_view' ) );
		add_action( 'manage_pages_custom_column', array( $this, 'update_published_times_and_show_placeholder' ) );
		add_action( 'admin_footer', array( $this, 'enqueue_parsely_stats_script_with_data' ) );
	}

	/**
	 * Sets current screen property.
	 *
	 * @since 3.7.0
	 */
	public function set_current_screen(): void {
		$this->current_screen = get_current_screen();
	}

	/**
	 * Enqueues styles for Parse.ly Stats.
	 *
	 * @since 3.7.0
	 */
	public function enqueue_parsely_stats_styles(): void {
		if ( ! $this->is_tracked_as_post_type() ) {
			return;
		}

		$admin_settings_asset = get_asset_info( 'build/content-helper/post-list-stats.asset.php' );
		$built_assets_url     = plugin_dir_url( PARSELY_FILE ) . 'build/content-helper/';

		wp_enqueue_style(
			static::get_style_id(),
			$built_assets_url . 'post-list-stats.css',
			$admin_settings_asset['dependencies'],
			$admin_settings_asset['version']
		);
	}

	/**
	 * Adds `Parse.ly Stats` column on admin columns.
	 *
	 * @since 3.7.0
	 *
	 * @param array<string, string> $columns Columns array which contain keys and labels.
	 * @return array<string, string>
	 */
	public function add_parsely_stats_column_on_list_view( array $columns ): array {
		if ( $this->is_tracked_as_post_type() ) {
			$columns['parsely-stats'] = __( 'Parse.ly Stats (7d)', 'wp-parsely' );
		}

		return $columns;
	}

	/**
	 * Updates our published_times list with current post info and show placeholder.
	 *
	 * Note: We don't have `the_posts` hook for hierarchical post types like pages so we are following this approach:
	 *
	 * 1. Get post publish times and show a placeholder while displaying rows on Admin List.
	 * 2. Make Parsely Analytics API call limited by publish dates inside `wp_footer` hook and pass the stats data to JS script.
	 * 3. Show data on each Admin Row using JS.
	 *
	 * @since 3.7.0
	 *
	 * @param string $column_name The name of the column to display.
	 */
	public function update_published_times_and_show_placeholder( string $column_name ): void {
		if ( 'parsely-stats' !== $column_name || ! $this->is_tracked_as_post_type() ) {
			return;
		}

		global $post;

		if ( 'publish' === $post->post_status && $this->parsely->api_secret_is_set() ) {
			array_push( $this->utc_published_times, $post->post_date_gmt );
		}

		$stats_key = $this->get_unique_stats_key_of_current_post();
		?>
		<div class="parsely-post-stats" data-stats-key="<?php echo esc_attr( $stats_key ); ?>">
			<span class="parsely-post-stats-placeholder">...</span>
		</div>
		<?php
	}

	/**
	 * Enqueues script and pass Parse.ly Stats data for showing on Frontend.
	 *
	 * @since 3.7.0
	 */
	public function enqueue_parsely_stats_script_with_data(): void {
		if ( ! $this->is_tracked_as_post_type() ) {
			return;
		}

		if ( $this->is_parsely_stats_column_hidden() ) {
			return; // Avoid calling the API if column is hidden.
		}

		$parsely_stats_response = $this->get_parsely_stats_response( $this->analytics_api );

		if ( null === $parsely_stats_response ) {
			return;
		}

		$admin_settings_asset = get_asset_info( 'build/content-helper/post-list-stats.asset.php' );
		$built_assets_url     = plugin_dir_url( PARSELY_FILE ) . 'build/content-helper/';

		wp_enqueue_script(
			static::get_script_id(),
			$built_assets_url . 'post-list-stats.js',
			$admin_settings_asset['dependencies'],
			$admin_settings_asset['version'],
			true
		);

		wp_add_inline_script(
			static::get_script_id(),
			"window.wpParselyPostsStatsResponse = '" . wp_json_encode( $parsely_stats_response ) . "';",
			'before'
		);
	}

	/**
	 * Return TRUE if Parse.ly Stats column is hidden.
	 *
	 * @return bool
	 */
	public function is_parsely_stats_column_hidden(): bool {
		if ( ! isset( $this->current_screen ) ) {
			return false;
		}

		return in_array( 'parsely-stats', get_hidden_columns( $this->current_screen ), true );
	}

	/**
	 * Calls Parse.ly Analytics API and get stats data.
	 *
	 * @since 3.7.0
	 *
	 * @param Analytics_Posts_API $analytics_api Instance of Analytics_Posts_API.
	 * @return Parsely_Posts_Stats_Response|null
	 */
	public function get_parsely_stats_response( $analytics_api ) {
		if ( ! $this->is_tracked_as_post_type() ) {
			return null;
		}

		if ( ! $this->parsely->api_secret_is_set() ) {
			return array(
				'data'  => null,
				'error' => array(
					'code'        => 403,
					'message'     => __( 'Forbidden.', 'wp-parsely' ),
					'htmlMessage' => '<p>' .
						__(
							'We are unable to retrieve data for Parse.ly Stats. Please contact <a href=\\"mailto:support@parsely.com\\">support@parsely.com</a> for help resolving this issue.',
							'wp-parsely'
						) .
					'</p>',
				),
			);
		}

		$date_params = $this->get_publish_date_params_for_analytics_api();
		if ( is_null( $date_params ) ) {
			return null;
		}

		$response = $analytics_api->get_posts_analytics(
			array(
				'period_start'   => Analytics_Posts_API::ANALYTICS_API_DAYS_LIMIT . 'd',
				'pub_date_start' => $date_params['pub_date_start'] ?? '',
				'pub_date_end'   => $date_params['pub_date_end'] ?? '',
				'limit'          => Analytics_Posts_API::MAX_RECORDS_LIMIT,
				'sort'           => 'avg_engaged', // Note: API sends different stats on different sort options.
			)
		);

		if ( is_wp_error( $response ) ) {
			return array(
				'data'  => null,
				'error' => array(
					'code'        => (int) $response->get_error_code(),
					'message'     => $response->get_error_message(),
					'htmlMessage' => (
						'<p>' .
								esc_html__( 'Error while getting data for Parse.ly Stats.', 'wp-parsely' ) . '<br/>' .
								esc_html__( 'Detail: ', 'wp-parsely' ) . esc_html( "({$response->get_error_code()}) {$response->get_error_message()}" ) .
						'</p>'
					),
				),
			);
		}

		if ( null === $response ) {
			return array(
				'data'  => array(),
				'error' => null,
			);
		}

		/**
		 * Variable.
		 *
		 * @var array<string, Parsely_Post_Stats>
		 */
		$parsely_stats_map = array();

		foreach ( $response as $post_analytics ) {
			$key = $this->get_unique_stats_key_from_analytics( $post_analytics );

			if ( '' === $key || ! isset( $post_analytics['metrics'] ) ) {
				continue;
			}

			$metrics         = $post_analytics['metrics'];
			$views           = $metrics['views'] ?? 0;
			$visitors        = $metrics['visitors'] ?? 0;
			$engaged_seconds = isset( $metrics['avg_engaged'] ) ? round( $metrics['avg_engaged'] * 60, 2 ) : 0;

			/**
			 * Variable.
			 *
			 * @var Parsely_Post_Stats
			 */
			$stats = array(
				'page_views' => get_formatted_number( (string) $views ) . ' ' . _n( 'page view', 'page views', $views, 'wp-parsely' ),
				'visitors'   => get_formatted_number( (string) $visitors ) . ' ' . _n( 'visitor', 'visitors', $visitors, 'wp-parsely' ),
				'avg_time'   => get_formatted_time( $engaged_seconds ) . ' ' . __( 'avg time', 'wp-parsely' ),
			);

			$parsely_stats_map[ $key ] = $stats;
		}

		return array(
			'data'  => $parsely_stats_map,
			'error' => null,
		);
	}

	/**
	 * Gets publish date params which we can used as params in analytics API.
	 *
	 * Uses published times list to get the min/max dates which we can use to limit the API.
	 *
	 * @since 3.7.0
	 *
	 * @return Analytics_Post_API_Params|null
	 */
	private function get_publish_date_params_for_analytics_api() {
		$published_times = $this->utc_published_times;

		if ( count( $published_times ) === 0 ) {
			return null;
		}

		return array(
			'pub_date_start' => ( new DateTime( min( $published_times ) ) )->format( DATE_UTC_FORMAT ),
			'pub_date_end'   => ( new DateTime( max( $published_times ) ) )->format( DATE_UTC_FORMAT ),
		);
	}

	/**
	 * Gets unique key which we can use for Parse.ly stats map.
	 *
	 * Needed because Parse.ly Analytics API doesn't have anything unique through which we can identify the post.
	 *
	 * @since 3.7.0
	 *
	 * @param Analytics_Post $analytics_post Post analytics obj returned from Parse.ly API.
	 * @return string
	 */
	private function get_unique_stats_key_from_analytics( $analytics_post ): string {
		if ( ! isset( $analytics_post['url'] ) ) {
			return '';
		}

		return (string) wp_parse_url( $analytics_post['url'], PHP_URL_PATH );
	}

	/**
	 * Gets unique key from currently set post which we can use to get data from Parse.ly stats map.
	 *
	 * @since 3.7.0
	 *
	 * @return string
	 */
	private function get_unique_stats_key_of_current_post(): string {
		return (string) wp_parse_url( (string) get_permalink(), PHP_URL_PATH );
	}

	/**
	 * Returns TRUE if the current screen is the list screen and we are tracking it as `Post` in plugin settings.
	 *
	 * @since 3.7.0
	 *
	 * @return bool
	 */
	private function is_tracked_as_post_type(): bool {
		if ( is_null( $this->current_screen ) ) {
			return false;
		}

		// Analytics API doesn't include Non-Post data, so we can only show stats on tracked post types.
		$track_post_types = $this->parsely->get_options()['track_post_types'];

		foreach ( $track_post_types as $track_post_type ) {
			if ( 'edit' === $this->current_screen->base && $track_post_type === $this->current_screen->post_type ) {
				return true;
			}
		}

		return false;
	}
}
