<?php
/**
 * UI: Recommended Widget class
 *
 * Provides a widget with Parse.ly recommended articles.
 *
 * @package Parsely
 */

declare(strict_types=1);

namespace Parsely\UI;

use Parsely\Parsely;
use WP_Widget;

use function Parsely\Utils\get_asset_info;

use const Parsely\PARSELY_FILE;

/**
 * Provides a widget with Parse.ly recommended articles.
 *
 * @phpstan-type Widget_Settings array{
 *   title: string,
 *   return_limit: int,
 *   display_direction: string,
 *   published_within: int,
 *   sort: string,
 *   personalize_results: bool,
 *   img_src: string,
 *   display_author: bool,
 * }
 */
final class Recommended_Widget extends WP_Widget {
	/**
	 * Instance of Parsely class.
	 *
	 * @var Parsely
	 */
	private $parsely;

	/**
	 * Default values of widget settings
	 *
	 * @var Widget_Settings
	 */
	private static $default_widget_settings = array(
		'title'               => '',
		'return_limit'        => 5,
		'display_direction'   => 'vertical',
		'published_within'    => 0,
		'sort'                => 'score',
		'personalize_results' => false,
		'img_src'             => 'parsely_thumb',
		'display_author'      => false,
	);

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		parent::__construct(
			'Parsely_Recommended_Widget',
			__( 'Parse.ly Recommended Widget', 'wp-parsely' ),
			array(
				'classname'   => 'Recommended_Widget parsely-recommended-widget-hidden',
				'description' => __( 'Display a list of post recommendations, personalized for a visitor or the current post.', 'wp-parsely' ),
			)
		);

		$this->parsely = $parsely;
	}

	/**
	 * Gets the URL for the Recommendations API (GET /related).
	 *
	 * @since 2.5.0
	 *
	 * @see https://docs.parse.ly/content-recommendations/
	 *
	 * @internal While this is a public method now, this should be moved to a new class.
	 *
	 * @param string      $site_id          Publisher Site ID.
	 * @param int|null    $published_within Publication filter start date; see https://docs.parse.ly/api-date-time/ for
	 *                                      formatting details. No restriction by default.
	 * @param string|null $sort             What to sort the results by. There are currently 2 valid options: `score`,
	 *                                      which will sort articles by overall relevance and `pub_date` which will sort
	 *                                      results by their publication date. The default is `score`.
	 * @param int         $return_limit     Number of records to retrieve; defaults to "10".
	 * @return string API URL.
	 */
	private function get_api_url( string $site_id, ?int $published_within, ?string $sort, int $return_limit ): string {
		$related_api_endpoint = Parsely::PUBLIC_API_BASE_URL . '/related';

		$query_args = array(
			'apikey' => $site_id,
			'sort'   => $sort,
			'limit'  => $return_limit,
		);

		if ( null !== $published_within && 0 !== $published_within ) {
			$query_args['pub_date_start'] = $published_within . 'd';
		}

		return add_query_arg( $query_args, $related_api_endpoint );
	}

	/**
	 * This is the widget function.
	 *
	 * @param array<string, string> $args            Widget Arguments.
	 * @param array<mixed>          $widget_settings Values saved to the db.
	 */
	public function widget( $args, $widget_settings ): void /* @phpstan-ignore-line */ {
		if ( ! $this->site_id_and_secret_are_populated() ) {
			return;
		}

		$instance          = $this->get_widget_settings( $widget_settings );
		$removed_title_esc = remove_filter( 'widget_title', 'esc_html' );

		/** This filter is documented in wp-includes/widgets/class-wp-widget-pages.php */
		$title = apply_filters( 'widget_title', $instance['title'] );

		if ( $removed_title_esc ) {
			add_filter( 'widget_title', 'esc_html' );
		}

		$title_html = $args['before_widget'] . $args['before_title'] . $title . $args['after_title'];
		echo wp_kses_post( $title_html );

		// Set up the variables.
		$api_url = $this->get_api_url(
			$this->parsely->get_site_id(),
			(int) $instance['published_within'], // @phpstan-ignore-line
			$instance['sort'],
			(int) $instance['return_limit'] // @phpstan-ignore-line
		);

		?>

		<div class="parsely-recommended-widget"
			data-parsely-widget-display-author="<?php echo esc_attr( (string) wp_json_encode( $instance['display_author'] ) ); ?>"
			data-parsely-widget-display-direction="<?php echo esc_attr( $instance['display_direction'] ); ?>"
			data-parsely-widget-api-url="<?php echo esc_url( $api_url ); ?>"
			data-parsely-widget-img-display="<?php echo esc_attr( $instance['img_src'] ); ?>"
			data-parsely-widget-permalink="<?php echo esc_url( (string) get_permalink() ); ?>"
			data-parsely-widget-personalized="<?php echo esc_attr( (string) wp_json_encode( $instance['personalize_results'] ) ); ?>"
			data-parsely-widget-id="<?php echo esc_attr( (string) $this->id ); ?>"
		></div>

		<?php

		$recommended_widget_script_asset = get_asset_info( 'build/recommended-widget.asset.php' );

		wp_register_script(
			'wp-parsely-recommended-widget',
			plugin_dir_url( PARSELY_FILE ) . 'build/recommended-widget.js',
			$recommended_widget_script_asset['dependencies'],
			$recommended_widget_script_asset['version'],
			true
		);

		wp_register_style(
			'wp-parsely-recommended-widget',
			plugin_dir_url( PARSELY_FILE ) . 'build/recommended-widget.css',
			array(),
			$recommended_widget_script_asset['version']
		);

		wp_enqueue_script( 'wp-parsely-recommended-widget' );
		wp_enqueue_style( 'wp-parsely-recommended-widget' );

		echo wp_kses_post( $args['after_widget'] );
	}

	/**
	 * This is the form function.
	 *
	 * @param array<mixed> $current_settings Values saved to the db.
	 */
	public function form( $current_settings ): string {
		if ( ! $this->site_id_and_secret_are_populated() ) {
			$settings_page_url = add_query_arg( 'page', 'parsely', get_admin_url() . 'options-general.php' );

			$message = sprintf(
				/* translators: %s: Plugin settings page URL */
				__( 'The <i>Parse.ly Site ID</i> and <i>Parse.ly API Secret</i> fields need to be populated on the <a href="%s">Parse.ly settings page</a> for this widget to work.', 'wp-parsely' ),
				esc_url( $settings_page_url )
			);

			echo '<p>', wp_kses_post( $message ), '</p>';

			return '';
		}

		$instance = $this->get_widget_settings( $current_settings );

		// editable fields: title.
		$title               = $instance['title'];
		$return_limit        = $instance['return_limit'];
		$display_direction   = $instance['display_direction'];
		$published_within    = $instance['published_within'];
		$sort                = $instance['sort'];
		$personalize_results = $instance['personalize_results'];
		$img_src             = $instance['img_src'];
		$display_author      = $instance['display_author'];

		$instance['return_limit']        = $return_limit;
		$instance['display_direction']   = $display_direction;
		$instance['published_within']    = $published_within;
		$instance['sort']                = $sort;
		$instance['personalize_results'] = $personalize_results;
		$instance['img_src']             = $img_src;
		$instance['display_author']      = $display_author;

		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'wp-parsely' ); ?></label>
			<br>
			<input type="text" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" value="<?php echo esc_attr( $title ); ?>" class="widefat" />
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'published_within' ) ); ?>" id="<?php echo esc_attr( $this->get_field_id( 'published_within_label' ) ); ?>"><?php esc_html_e( 'Published within', 'wp-parsely' ); ?></label>
			<input type="number" id="<?php echo esc_attr( $this->get_field_id( 'published_within' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'published_within' ) ); ?>" value="<?php echo esc_attr( (string) $instance['published_within'] ); ?>" min="0" max="30"
				class="tiny-text" aria-labelledby="<?php echo esc_attr( $this->get_field_id( 'published_within_label' ) ); ?> <?php echo esc_attr( $this->get_field_id( 'published_within' ) ); ?> <?php echo esc_attr( $this->get_field_id( 'published_within_unit' ) ); ?>" />
			<span id="<?php echo esc_attr( $this->get_field_id( 'published_within_unit' ) ); ?>"> <?php esc_html_e( 'days (0 for no limit).', 'wp-parsely' ); ?></span>
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'return_limit' ) ); ?>"><?php esc_html_e( 'Number of posts to show (max 20):', 'wp-parsely' ); ?></label>
			<input type="number" id="<?php echo esc_attr( $this->get_field_id( 'return_limit' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'return_limit' ) ); ?>" value="<?php echo esc_attr( (string) $instance['return_limit'] ); ?>" min="1" max="20" class="tiny-text" />
		</p>
		<p>
			<fieldset>
				<legend><?php esc_html_e( 'Display entries:', 'wp-parsely' ); ?></legend>
				<p>
					<input type="radio" id="<?php echo esc_attr( $this->get_field_id( 'display_direction_horizontal' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'display_direction' ) ); ?>"<?php checked( $instance['display_direction'], 'horizontal' ); ?> value="horizontal" />
					<label for="<?php echo esc_attr( $this->get_field_id( 'display_direction_horizontal' ) ); ?>"><?php esc_html_e( 'Horizontally', 'wp-parsely' ); ?></label>
					<br />
					<input type="radio" id="<?php echo esc_attr( $this->get_field_id( 'display_direction_vertical' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'display_direction' ) ); ?>"<?php checked( $instance['display_direction'], 'vertical' ); ?> value="vertical" />
					<label for="<?php echo esc_attr( $this->get_field_id( 'display_direction_vertical' ) ); ?>"><?php esc_html_e( 'Vertically', 'wp-parsely' ); ?></label>
				</p>
			</fieldset>
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'sort' ) ); ?>"><?php esc_html_e( 'Sort by:', 'wp-parsely' ); ?></label>
			<br>
			<select id="<?php echo esc_attr( $this->get_field_id( 'sort' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'sort' ) ); ?>" class="widefat">
				<option<?php selected( $instance['sort'], 'score' ); ?> value="score"><?php esc_html_e( 'Score', 'wp-parsely' ); ?></option>
				<option<?php selected( $instance['sort'], 'pub_date' ); ?> value="pub_date"><?php esc_html_e( 'Publish date', 'wp-parsely' ); ?></option>
			</select>
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'img_src' ) ); ?>"><?php esc_html_e( 'Image source:', 'wp-parsely' ); ?></label>
			<br>
			<select id="<?php echo esc_attr( $this->get_field_id( 'img_src' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'img_src' ) ); ?>" class="widefat">
				<option<?php selected( $instance['img_src'], 'parsely_thumb' ); ?> value="parsely_thumb"><?php esc_html_e( 'Parse.ly generated thumbnail (85x85px)', 'wp-parsely' ); ?></option>
				<option<?php selected( $instance['img_src'], 'original' ); ?> value="original"><?php esc_html_e( 'Original image', 'wp-parsely' ); ?></option>
				<option<?php selected( $instance['img_src'], 'none' ); ?> value="none"><?php esc_html_e( 'No image', 'wp-parsely' ); ?></option>
			</select>
		</p>
		<p>
			<input type="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'display_author' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'display_author' ) ); ?>" value="display_author"<?php checked( $instance['display_author'], 'display_author' ); ?> />
			<label for="<?php echo esc_attr( $this->get_field_id( 'display_author' ) ); ?>"><?php esc_html_e( 'Display author', 'wp-parsely' ); ?></label>
			<br />
			<input type="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'personalize_results' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'personalize_results' ) ); ?>" value="personalize_results"<?php checked( $instance['personalize_results'], 'personalize_results' ); ?> />
			<label for="<?php echo esc_attr( $this->get_field_id( 'personalize_results' ) ); ?>"><?php esc_html_e( 'Personalize recommended results', 'wp-parsely' ); ?></label>
		</p>
		<?php

		return '';
	}

	/**
	 * This is the update function.
	 *
	 * @param Widget_Settings $new_instance The new values for the db.
	 * @param Widget_Settings $old_instance Values saved to the db.
	 * @return Widget_Settings
	 */
	public function update( $new_instance, $old_instance ) /* @phpstan-ignore-line */ {
		$instance                        = $old_instance;
		$instance['title']               = trim( wp_kses_post( $new_instance['title'] ) );
		$instance['published_within']    = $new_instance['published_within'];
		$instance['return_limit']        = $new_instance['return_limit'] <= 20 ? $new_instance['return_limit'] : 20;
		$instance['display_direction']   = trim( $new_instance['display_direction'] );
		$instance['sort']                = trim( $new_instance['sort'] );
		$instance['display_author']      = $new_instance['display_author'];
		$instance['personalize_results'] = $new_instance['personalize_results'];
		$instance['img_src']             = trim( $new_instance['img_src'] );

		return $instance;
	}

	/**
	 * Checks if both the Site ID and API secret settings are populated with
	 * non-empty values.
	 *
	 * @since 2.5.0
	 *
	 * @return bool True if Site ID and API Secret settings are set.
	 *              False otherwise.
	 */
	private function site_id_and_secret_are_populated(): bool {
		return $this->parsely->site_id_is_set() && $this->parsely->api_secret_is_set();
	}

	/**
	 * Returns all widget settings by assigning defaults if a setting isn't present
	 *
	 * @since 3.7.0
	 *
	 * @param array<string, mixed> $settings Widget Options.
	 * @return Widget_Settings
	 */
	public function get_widget_settings( array $settings ) {
		/**
		 * Variable.
		 *
		 * @var Widget_Settings
		 */
		$widget_settings = $settings;

		return array_merge( self::$default_widget_settings, $widget_settings );
	}
}
