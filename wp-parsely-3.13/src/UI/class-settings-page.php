<?php
/**
 * UI: Settings page class
 *
 * @package Parsely
 * @since   3.0.0
 */

declare(strict_types=1);

namespace Parsely\UI;

use Parsely\Parsely;
use Parsely\Validator;

use function Parsely\Utils\get_asset_info;

use const Parsely\PARSELY_FILE;

/**
 * Renders the wp-admin Parse.ly plugin settings page.
 *
 * @since 3.0.0
 *
 * @phpstan-import-type Parsely_Options from Parsely
 *
 * @phpstan-type Setting_Arguments array{
 *   option_key: string,
 *   label_for: string,
 *   title?: string,
 *   help_text?: string,
 *   yes_text?: string,
 *   filter?: string,
 *   optional_args?: Setting_Optional_Args,
 *   select_options?: array<string, string>,
 *   radio_options?: array<string, string>,
 * }
 *
 * @phpstan-type Setting_Optional_Args array{
 *   type?: string,
 *   placeholder?: string,
 *   required?: string,
 *   is_obfuscated_value: bool,
 * }
 *
 * @phpstan-type ParselySettingOptions array{
 *   apikey: string,
 *   api_secret: string,
 *   metadata_secret: string,
 *   meta_type?: string,
 *   logo: string,
 *   track_authenticated_users: bool|string,
 *   disable_javascript: bool|string,
 *   disable_amp?: bool,
 *   track_post_types_as?: array<string, string>,
 *   track_post_types: string[],
 *   track_page_types: string[],
 *   content_id_prefix?: string,
 *   use_top_level_cats?:bool|string,
 *   custom_taxonomy_section?: string,
 *   cats_as_tags?: bool|string,
 *   lowercase_tags?: bool,
 *   force_https_canonicals?: bool,
 *   disable_autotrack?: bool|string,
 * }
 */
final class Settings_Page {
	/**
	 * Instance of Parsely class.
	 *
	 * @var Parsely
	 */
	private $parsely;

	/**
	 * Admin page name used for hook suffixes.
	 *
	 * @since 3.2.0
	 *
	 * @var string
	 */
	private $hook_suffix;

	/**
	 * Options for badges that are displayed for managed options.
	 *
	 * @since 3.9.0
	 *
	 * @var array<string, mixed>
	 */
	private $managed_options_badge = array();

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;

		$managed_options_badge = apply_filters(
			'wp_parsely_managed_options_badge',
			array(
				'text' => __( 'Upgrade', 'wp-parsely' ),
				'url'  => 'https://www.parse.ly/getdemo/',
			)
		);

		if ( is_array( $managed_options_badge ) ) {
			$this->managed_options_badge = $managed_options_badge;
		}
	}

	/**
	 * Registers settings page.
	 *
	 * @since 3.0.0
	 */
	public function run(): void {
		add_action( 'admin_menu', array( $this, 'add_settings_sub_menu' ) );
		add_action( 'admin_init', array( $this, 'initialize_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_settings_assets' ) );
	}

	/**
	 * Enqueues all needed scripts and styles for Parse.ly plugin settings page.
	 *
	 * @param string $hook_suffix The current page being loaded.
	 */
	public function enqueue_settings_assets( string $hook_suffix ): void {
		if ( 'settings_page_parsely' === $hook_suffix ) {
			add_filter( 'media_library_months_with_files', '__return_empty_array' );
			wp_enqueue_media();

			$admin_settings_asset = get_asset_info( 'build/admin-settings.asset.php' );
			$built_assets_url     = plugin_dir_url( PARSELY_FILE ) . '/build/';

			wp_enqueue_script(
				'parsely-admin-settings',
				$built_assets_url . 'admin-settings.js',
				$admin_settings_asset['dependencies'],
				$admin_settings_asset['version'],
				true
			);

			wp_enqueue_style(
				'parsely-admin-settings',
				$built_assets_url . 'admin-settings.css',
				$admin_settings_asset['dependencies'],
				$admin_settings_asset['version']
			);
		}
	}

	/**
	 * Adds the Parse.ly settings page in WordPress settings menu.
	 */
	public function add_settings_sub_menu(): void {
		$suffix = add_options_page(
			__( 'Parse.ly Settings', 'wp-parsely' ),
			__( 'Parse.ly', 'wp-parsely' ),
			Parsely::CAPABILITY, // phpcs:ignore WordPress.WP.Capabilities.Undetermined
			Parsely::MENU_SLUG,
			array( $this, 'display_settings' )
		);

		if ( is_string( $suffix ) ) {
			$this->hook_suffix = $suffix;

			// Adds help text when admin page loads.
			add_action( 'load-' . $this->hook_suffix, array( $this, 'add_help_text' ) );
		}
	}

	/**
	 * Adds the help tab to the settings page.
	 *
	 * @since 3.1.0
	 */
	public function add_help_text(): void {
		$screen = get_current_screen();
		if ( null === $screen ) {
			return;
		}

		$screen->add_help_tab(
			array(
				'id'      => 'overview',
				'title'   => __( 'Overview', 'wp-parsely' ),
				'content' => '<p>' . __( 'The only required setting on this page is the Site ID. All of the other settings are optional.', 'wp-parsely' ) . '</p>' .
					'<p>' . __( 'You must click the Save Changes button at the bottom of the screen for new settings to take effect.', 'wp-parsely' ) . '</p>',
			)
		);
	}

	/**
	 * Displays the Parse.ly settings screen (options-general.php?page=[SLUG]).
	 */
	public function display_settings(): void {
		// phpcs:ignore WordPress.WP.Capabilities.Undetermined
		if ( ! current_user_can( Parsely::CAPABILITY ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'wp-parsely' ) );
		}

		include_once plugin_dir_path( PARSELY_FILE ) . 'views/parsely-settings.php';
	}

	/**
	 * Initializes the settings for Parse.ly.
	 */
	public function initialize_settings(): void {
		// Add the option first, to prevent double sanitization of the uninitialized option as reported
		// in https://core.trac.wordpress.org/ticket/21989.
		// The option will be initialized with the default values.
		add_option( Parsely::OPTIONS_KEY, $this->parsely->get_options() );

		// All our options are actually stored in one single array to reduce DB queries.
		register_setting(
			Parsely::OPTIONS_KEY,
			Parsely::OPTIONS_KEY,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'validate_options' ),
			)
		);

		$this->initialize_basic_section();
		$this->initialize_recrawl_section();
		$this->initialize_advanced_section();
	}

	/**
	 * Registers section and settings for Basic section.
	 *
	 * @since 3.2.0
	 */
	private function initialize_basic_section(): void {
		$are_credentials_managed = $this->parsely->are_credentials_managed;
		$section_key             = 'basic-section';

		add_settings_section(
			$section_key,
			__( 'Basic', 'wp-parsely' ),
			'__return_null',
			Parsely::MENU_SLUG
		);

		// Site ID.
		$field_id   = 'apikey';
		$field_args = array(
			'option_key'    => $field_id,
			'help_text'     => __( 'Your Site ID is typically your own site domain without <code>http(s)://</code> prefixes or trailing <code>/</code> (e.g. <code>mydomain.com</code>).', 'wp-parsely' ),
			'label_for'     => $field_id,
			'optional_args' => array(
				'required'    => 'required',
				'placeholder' => 'mydomain.com',
				'disabled'    => $are_credentials_managed,
			),

		);
		add_settings_field(
			$field_id,
			__( 'Site ID <em>(required)</em>', 'wp-parsely' ),
			array( $this, 'print_text_tag' ),
			Parsely::MENU_SLUG,
			$section_key,
			$field_args
		);

		if ( ! $are_credentials_managed ) {
			// API Secret.
			$field_id   = 'api_secret';
			$field_args = array(
				'option_key'    => $field_id,
				'help_text'     => __( 'Your API secret is your secret code to <a href="https://docs.parse.ly/the-parsely-api/">access our API</a>. It can be found at <code>dash.parsely.com/<var>yoursitedomain</var>/settings/api</code> (replace <var>yoursitedomain</var> with your domain name, e.g. <samp>mydomain.com</samp>).<br />If you haven\'t purchased access to the API and would like to do so, email your account manager or <a href="mailto:support@parsely.com">support@parsely.com</a>.', 'wp-parsely' ),
				'label_for'     => $field_id,
				'optional_args' => array(
					'type'                => 'password',
					'is_obfuscated_value' => true,
				),
			);
			add_settings_field(
				$field_id,
				__( 'API Secret', 'wp-parsely' ),
				array( $this, 'print_text_tag' ),
				Parsely::MENU_SLUG,
				$section_key,
				$field_args
			);
		}

		// Metadata Format.
		$field_id   = 'meta_type';
		$field_args = array(
			'title'         => __( 'Metadata Format', 'wp-parsely' ),
			'option_key'    => $field_id,
			'help_text'     => __( 'Choose the metadata format for our crawlers to access. Most publishers are fine with <a href="https://docs.parse.ly/metadata-jsonld/">JSON-LD</a>, but if you prefer to use our proprietary metadata format then you can do so here.', 'wp-parsely' ),
			'radio_options' => array(
				'json_ld'        => 'json_ld',
				'repeated_metas' => 'repeated_metas',
			),
			'label_for'     => Parsely::OPTIONS_KEY . "[$field_id]",
			'filter'        => 'wp_parsely_metadata',
		);
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Metadata Format', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			$field_args
		);

		// Logo.
		$field_help = __( 'Here you can specify your logo\'s URL by using the "Browse" button or typing the URL manually.', 'wp-parsely' );
		$field_id   = 'logo';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Logo', 'wp-parsely' ), $field_id ),
			array( $this, 'print_media_single_image' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'      => __( 'Logo', 'wp-parsely' ), // Passed for legend element.
				'option_key' => $field_id,
				'label_for'  => $field_id,
				'help_text'  => $field_help,
			)
		);

		// Track logged-in users.
		$field_id = 'track_authenticated_users';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Track Logged-in Users', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Track Logged-in Users', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, track logged-in users.', 'wp-parsely' ),
					'false' => __( 'No, do not track logged-in users. I do not want to see the Parse.ly tracking code on my site when browsing while logged in.', 'wp-parsely' ),
				),
				'help_text'     => (
					is_multisite() ?
					__( ' Note: For WordPress multisite, a user must be logged-in to the current site to be considered logged-in.', 'wp-parsely' ) :
					null
				),
			)
		);

		// Disable JavaScript.
		$field_id = 'disable_javascript';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Disable JavaScript', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Disable JavaScript', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, disable JavaScript tracking. I want to use a separate system for tracking instead of the Parse.ly plugin.', 'wp-parsely' ),
					'false' => __( 'No, do not disable JavaScript tracking. I want the Parse.ly plugin to load the tracker.', 'wp-parsely' ),
				),
				'help_text'     => __( '<span style="color:#d63638">WARNING:</span> Changing this setting to "Yes" will prevent the plugin from injecting the Parse.ly tracker. Only do so if you are setting the tracker elsewhere (e.g. hardcoded, GTM, another tag manager, etc.).', 'wp-parsely' ),
				'filter'        => 'wp_parsely_load_js_tracker',
			)
		);

		if ( defined( 'AMP__VERSION' ) ) {
			// Disable AMP tracking.
			$field_id = 'disable_amp';
			add_settings_field(
				$field_id,
				$this->set_field_label_contents( __( 'Disable AMP Tracking', 'wp-parsely' ), $field_id ),
				array( $this, 'print_radio_tags' ),
				Parsely::MENU_SLUG,
				$section_key,
				array(
					'title'         => __( 'Disable AMP Tracking', 'wp-parsely' ), // Passed for legend element.
					'option_key'    => $field_id,
					'radio_options' => array(
						'true'  => __( 'Yes, disable Parse.ly tracking on AMP pages. I use a different system for JavaScript tracking on AMP pages.', 'wp-parsely' ),
						'false' => __( 'No, do not disable Parse.ly tracking on AMP pages.', 'wp-parsely' ),
					),
				)
			);
		}
	}

	/**
	 * Registers section and settings for Recrawl section.
	 *
	 * @since 3.2.0
	 */
	private function initialize_recrawl_section(): void {
		$section_key = 'recrawl-section';

		add_settings_section(
			$section_key,
			__( 'Recrawl', 'wp-parsely' ),
			function (): void {
				echo '<br /><strong>' . wp_kses_post( __( '<span style="color:#d63638">Important:</span> Changing any of these values below on a site currently tracked with Parse.ly will require reprocessing of your Parse.ly data.', 'wp-parsely' ) ) . '</strong><br />';
				printf(
					/* translators: Mailto link  */
					esc_html__( 'Once you have changed a value and saved, please contact %s to request a recrawl.', 'wp-parsely' ),
					wp_kses_post( '<a href="mailto:support@parsely.com?subject=' . rawurlencode( 'Please reprocess ' . $this->parsely->get_site_id() ) . '">support@parsely.com</a>' )
				);
			},
			Parsely::MENU_SLUG
		);

		// Allow use of custom taxonomy to populate articleSection in parselyPage; defaults to category.
		$field_id   = 'track_post_types_as';
		$field_help = __( 'By default, Parse.ly only tracks posts and pages. If you want to track other post types, select how you want to track them here.', 'wp-parsely' );
		add_settings_field(
			$field_id,
			__( 'Track Post Types as', 'wp-parsely' ),
			array( $this, 'print_track_post_types_table' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'      => __( 'Track Post Types as', 'wp-parsely' ),
				'option_key' => $field_id,
				'help_text'  => $field_help,
				'filter'     => 'wp_parsely_trackable_statuses',
			)
		);

		// Content ID Prefix.
		$field_id   = 'content_id_prefix';
		$field_args = array(
			'option_key'    => $field_id,
			'optional_args' => array(
				'placeholder' => 'WP-',
			),
			'help_text'     => __( 'If you use more than one content management system (e.g. WordPress and Drupal), you may end up with duplicate content IDs. Adding a Content ID Prefix will ensure the content IDs from WordPress will not conflict with other content management systems. We recommend using "WP-" for your prefix.', 'wp-parsely' ),
			'label_for'     => $field_id,
		);
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Content ID Prefix', 'wp-parsely' ), $field_id ),
			array( $this, 'print_text_tag' ),
			Parsely::MENU_SLUG,
			$section_key,
			$field_args
		);

		// Use top-level categories.
		$field_id = 'use_top_level_cats';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Use Top-Level Categories for Section', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Use Top-Level Categories for Section', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, use the first category assigned to a post as the section name.', 'wp-parsely' ),
					'false' => __( 'No, do not use the first category assigned to a post as the section name.', 'wp-parsely' ),
				),
				'help_text'     => __( 'If you choose Yes, and post a story to News > National > Florida, the plugin will use "News" for the section name in your dashboard instead of "Florida".', 'wp-parsely' ),
			)
		);

		// Allow use of custom taxonomy to populate articleSection in parselyPage; defaults to category.
		$field_id   = 'custom_taxonomy_section';
		$field_args = array(
			'option_key'     => $field_id,
			'help_text'      => __( 'By default, the section value in your Parse.ly dashboard maps to a post\'s category. You can optionally choose a custom taxonomy, if you\'ve created one, to populate the section value instead.', 'wp-parsely' ),
			'select_options' => self::get_section_taxonomies(),
			'label_for'      => Parsely::OPTIONS_KEY . "[$field_id]",
		);
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Use Custom Taxonomy for Section', 'wp-parsely' ), $field_id ),
			array( $this, 'print_select_tag' ),
			Parsely::MENU_SLUG,
			$section_key,
			$field_args
		);

		// Use categories and custom taxonomies as tags.
		$field_id = 'cats_as_tags';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Add Categories to Tags', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Add Categories to Tags', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, add all assigned categories and taxonomies to my tags.', 'wp-parsely' ),
					'false' => __( 'No, do not add all assigned categories and taxonomies to my tags.', 'wp-parsely' ),
				),
				'help_text'     => __( 'If you choose Yes, then a post that has been assigned the categories "Business/Tech" and "Business/Social" will automatically include "Business/Tech" and "Business/Social" as tags, too.', 'wp-parsely' ),
			)
		);

		// Lowercase all tags.
		$field_id = 'lowercase_tags';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Lowercase All Tags', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Lowercase All Tags', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, use lowercase versions of my tags to correct for potential misspellings.', 'wp-parsely' ),
					'false' => __( 'No, do not use lowercase versions of my tags to correct for potential misspellings.', 'wp-parsely' ),
				),
			)
		);

		$field_id = 'force_https_canonicals';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Force HTTPS Canonicals', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Force HTTPS Canonicals', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, force <code>https</code> canonical URLs by default.', 'wp-parsely' ),
					'false' => __( 'No, I want to use <code>http</code>.', 'wp-parsely' ),
				),
				'help_text'     => __( 'Note: the plugin uses <code>http</code> by default, and this is fine for most publishers. It is unlikely you will have to change this unless directed to do so by a Parse.ly support representative.', 'wp-parsely' ),
			)
		);
	}

	/**
	 * Registers section and settings for Advanced section.
	 *
	 * @since 3.2.0
	 */
	private function initialize_advanced_section(): void {
		$are_credentials_managed = $this->parsely->are_credentials_managed;
		$section_key             = 'advanced-section';

		add_settings_section(
			$section_key,
			__( 'Advanced', 'wp-parsely' ),
			'__return_null',
			Parsely::MENU_SLUG
		);

		if ( ! $are_credentials_managed ) {
			// Metadata Secret.
			$field_id   = 'metadata_secret';
			$field_args = array(
				'option_key'    => $field_id,
				'help_text'     => __( 'Your metadata secret is given to you by Parse.ly support. DO NOT enter anything here unless given to you by Parse.ly support!', 'wp-parsely' ),
				'label_for'     => $field_id,
				'optional_args' => array(
					'type'                => 'password',
					'is_obfuscated_value' => true,
				),
			);
			add_settings_field(
				$field_id,
				__( 'Metadata Secret', 'wp-parsely' ),
				array( $this, 'print_text_tag' ),
				Parsely::MENU_SLUG,
				$section_key,
				$field_args
			);
		}

		// Disable autotrack.
		$field_id = 'disable_autotrack';
		add_settings_field(
			$field_id,
			$this->set_field_label_contents( __( 'Disable Autotracking', 'wp-parsely' ), $field_id ),
			array( $this, 'print_radio_tags' ),
			Parsely::MENU_SLUG,
			$section_key,
			array(
				'title'         => __( 'Disable Autotracking', 'wp-parsely' ), // Passed for legend element.
				'option_key'    => $field_id,
				'radio_options' => array(
					'true'  => __( 'Yes, disable autotracking. I do not want the tracking code to report an event as soon as the script has finished loading. I plan to implement Dynamic Tracking myself.', 'wp-parsely' ),
					'false' => __( 'No, do not disable autotracking. I want to make sure the default behavior of the tracking code is in place. The tracking code should report an event as soon as the script has finished loading.', 'wp-parsely' ),
				),
			)
		);
	}

	/**
	 * Shows setting tabs.
	 *
	 * @since 3.8.0
	 */
	public function show_setting_tabs(): void {
		global $wp_settings_sections;
		?>

		<nav class="nav-tab-wrapper">
			<?php foreach ( $wp_settings_sections[ Parsely::MENU_SLUG ] as $section ) { ?>
				<a
					class="nav-tab <?php echo esc_attr( $section['id'] . '-tab' ); ?>"
					href=<?php echo esc_url_raw( '?page=' . Parsely::MENU_SLUG . '#' . $section['id'] ); ?>
				>
					<?php echo esc_html( $section['title'] ); ?>
				</a>
			<?php } ?>
		</nav>

		<?php
	}

	/**
	 * Shows content of setting tabs.
	 *
	 * @since 3.8.0
	 */
	public function show_setting_tabs_content(): void {
		global $wp_settings_sections;

		foreach ( $wp_settings_sections[ Parsely::MENU_SLUG ] as $section ) {
			?>

			<div class="tab-content <?php echo esc_attr( $section['id'] ); ?>">
				<?php
				if ( $section['callback'] ) {
					call_user_func( $section['callback'], $section );
				}
				?>

				<table class="form-table" role="presentation">
					<?php do_settings_fields( Parsely::MENU_SLUG, $section['id'] ); ?>
				</table>
			</div>

			<?php
		}
	}

	/**
	 * Prints out a warning if the filter for the setting is defined, if any.
	 *
	 * @since 3.4.0
	 *
	 * @param Setting_Arguments $args The arguments for the form field. May contain 'filter'.
	 */
	private function print_filter_text( $args ): void {
		if ( isset( $args['filter'] ) && has_filter( $args['filter'] ) ) {
			echo '<p>';
			echo '<b><code>' . esc_html( $args['filter'] ) . '</code>' . esc_html__( 'filter hook is in use!', 'wp-parsely' ) . '</b> ';
			echo esc_html__( 'A callback is attached to the filter hook that might interfere and override this setting.', 'wp-parsely' );
			echo '</p>';
		}
	}

	/**
	 * Prints out the description text, if there is any.
	 *
	 * @since 3.1.0
	 *
	 * @param Setting_Arguments $args The arguments for the form field. May contain 'help_text'.
	 */
	private function print_description_text( $args ): void {
		echo isset( $args['help_text'] ) ? '<p class="description" id="' . esc_attr( $args['option_key'] ) . '-description">' . wp_kses_post( $args['help_text'] ) . '</p>' : '';
	}

	/**
	 * Prints out an input text tag.
	 *
	 * @param Setting_Arguments $args The arguments for text tag.
	 */
	public function print_text_tag( $args ): void {
		$options = $this->parsely->get_options();
		$name    = $args['option_key'];
		/**
		 * Variable.
		 *
		 * @var string
		 */
		$value               = $options[ $name ] ?? '';
		$optional_args       = $args['optional_args'] ?? array();
		$id                  = esc_attr( $name );
		$name                = Parsely::OPTIONS_KEY . "[$id]";
		$is_obfuscated_value = $optional_args['is_obfuscated_value'] ?? false;
		$value               = $is_obfuscated_value ? $this->get_obfuscated_value( $value ) : esc_attr( $value );
		$accepted_args       = array( 'placeholder', 'required', 'disabled' );
		$type                = $optional_args['type'] ?? 'text';

		$is_managed = key_exists( $id, $this->parsely->managed_options );
		echo '<fieldset', $is_managed ? ' disabled>' : '>';
		printf( "<input type='%s' name='%s' id='%s' value='%s'", esc_attr( $type ), esc_attr( $name ), esc_attr( $id ), esc_attr( $value ) );

		if ( isset( $args['help_text'] ) ) {
			echo ' aria-describedby="' . esc_attr( $id ) . '-description"';
		}

		foreach ( $optional_args as $key => $val ) {
			if ( \in_array( $key, $accepted_args, true ) && false !== $val ) {
				// Don't add a placeholder to managed option fields.
				if ( $is_managed && 'placeholder' === $key ) {
					continue;
				}

				// Support attributes without values.
				echo ' ' . esc_attr( $key );
				if ( true !== $val ) {
					echo '="' . esc_attr( $val ) . '"';
				}
			}
		}
		echo ' /></fieldset>';

		$this->print_description_text( $args );
	}

	/**
	 * Prints a checkbox tag in the settings page.
	 *
	 * @param Setting_Arguments $args Arguments to print to checkbox tag.
	 */
	public function print_checkbox_tag( $args ): void {
		$options  = $this->parsely->get_options();
		$name     = $args['option_key'];
		$value    = $options[ $name ];
		$id       = esc_attr( $name );
		$name     = Parsely::OPTIONS_KEY . "[$id]";
		$yes_text = $args['yes_text'] ?? '';

		$is_managed = key_exists( $id, $this->parsely->managed_options );
		echo '<fieldset', $is_managed ? ' disabled>' : '>';
		printf( "<input type='checkbox' name='%s' id='%s_true' value='true' ", esc_attr( $name ), esc_attr( $id ) );
		if ( isset( $args['help_text'] ) ) {
			echo ' aria-describedby="' . esc_attr( $id ) . '-description"';
		}
		echo checked( true === $value, true, false );
		printf( " /> <label for='%s_true'>%s</label><fieldset>", esc_attr( $id ), esc_html( $yes_text ) );

		$this->print_description_text( $args );
	}

	/**
	 * Prints out the select tags
	 *
	 * @param Setting_Arguments $args The arguments for the select dropdowns.
	 */
	public function print_select_tag( $args ): void {
		$options        = $this->parsely->get_options();
		$name           = $args['option_key'];
		$select_options = $args['select_options'] ?? array();
		$selected       = $options[ $name ] ?? null;
		$id             = esc_attr( $name );
		$name           = Parsely::OPTIONS_KEY . "[$id]";

		$is_managed = key_exists( $id, $this->parsely->managed_options );
		echo '<fieldset', $is_managed ? ' disabled>' : '>';
		printf( "<select name='%s' id='%s'", esc_attr( $name ), esc_attr( $name ) );
		if ( isset( $args['help_text'] ) ) {
			echo ' aria-describedby="' . esc_attr( $id ) . '-description"';
		}
		echo '>';

		foreach ( $select_options as $key => $val ) {
			echo '<option value="' . esc_attr( $key ) . '" ';
			echo selected( $selected, $key, false ) . '>';
			echo esc_html( $val );
			echo '</option>';
		}
		echo '</select></fieldset>';

		$this->print_filter_text( $args );
		$this->print_description_text( $args );
	}

	/**
	 * Prints the radio buttons.
	 *
	 * @param Setting_Arguments $args The arguments for the radio buttons.
	 */
	public function print_radio_tags( $args ): void {
		$name          = $args['option_key'];
		$id            = esc_attr( $name );
		$selected      = $this->parsely->get_options()[ $name ];
		$title         = $args['title'] ?? '';
		$radio_options = $args['radio_options'] ?? array();

		if ( is_bool( $selected ) ) {
			// Converting boolean to string so that we have string type keys for all cases.
			$selected = $selected ? 'true' : 'false';
		}

		$is_managed = key_exists( $name, $this->parsely->managed_options );
		?>
		<fieldset <?php echo $is_managed ? 'disabled' : ''; ?>>
			<legend class="screen-reader-text"><span><?php echo esc_html( $title ); ?></span></legend>
			<p>
				<?php foreach ( $radio_options as $value => $text ) { ?>
				<label for="<?php echo esc_attr( "{$id}_{$value}" ); ?>">
					<input
						type="radio"
						name="<?php echo esc_attr( Parsely::OPTIONS_KEY . "[$id]" ); ?>"
						id="<?php echo esc_attr( "{$id}_{$value}" ); ?>"
						value="<?php echo esc_attr( $value ); ?>"
					<?php checked( $selected, $value ); ?>
					/>
					<?php echo wp_kses_post( $text ); ?>
				</label>
				<br />
				<?php } ?>
			</p>
		</fieldset>
		<?php
		$this->print_filter_text( $args );
		$this->print_description_text( $args );
	}

	/**
	 * Prints out a "single-image browse control" which includes a text input to
	 * store image path and a button to browse for images.
	 *
	 * @param Setting_Arguments $args The arguments for the control.
	 */
	public function print_media_single_image( $args ): void {
		$key   = $args['option_key'];
		$title = $args['title'] ?? '';
		/**
		 * Variable.
		 *
		 * @var string
		 */
		$input_value = $this->parsely->get_options()[ $key ];
		$input_name  = Parsely::OPTIONS_KEY . "[$key]";
		$button_text = __( 'Browse', 'wp-parsely' );

		$is_managed = key_exists( $key, $this->parsely->managed_options );
		?>

		<fieldset class="media-single-image" id="media-single-image-<?php echo esc_attr( $key ); ?>"<?php echo $is_managed ? ' disabled' : ''; ?>>
			<legend class="screen-reader-text"><span><?php echo esc_html( $title ); ?></span></legend>
			<input class="file-path" type="text" name="<?php echo esc_attr( $input_name ); ?>" id="logo" value="<?php echo esc_attr( $input_value ); ?>" />
			<button data-option="<?php echo esc_attr( $key ); ?>" class="browse button" type="button"><?php echo esc_html( $button_text ); ?></button>
		</fieldset>

		<?php
		$this->print_description_text( $args );
	}

	/**
	 * Prints out the post tracking options table.
	 *
	 * @since 3.2.0
	 *
	 * @param Setting_Arguments $args The arguments used in the output HTML elements.
	 */
	public function print_track_post_types_table( $args ): void {
		$option_key = esc_attr( $args['option_key'] );
		$title      = $args['title'] ?? '';
		/**
		 * Variable.
		 *
		 * @var array<string>
		 */
		$post_types = get_post_types( array( 'public' => true ) );
		$values     = $this->get_tracking_values_for_display();
		?>
		<fieldset>
			<legend class="screen-reader-text"><span><?php echo esc_html( $title ); ?></span></legend>
			<table class="form-table widefat striped" id="track-post-types">
				<caption class="screen-reader-text"><?php echo esc_html( $title ); ?></caption>
				<thead>
					<tr>
						<th scope="col"><?php echo esc_html__( 'Post Type', 'wp-parsely' ); ?></th>
						<th id="track-post-types--post" scope="col"><?php echo esc_html__( 'Track as Post', 'wp-parsely' ); ?></th>
						<th id="track-post-types--page" scope="col"><?php echo esc_html__( 'Track as Non-Post', 'wp-parsely' ); ?></th>
						<th id="track-post-types--none" scope="col"><?php echo esc_html__( 'Do not track', 'wp-parsely' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php
					foreach ( $post_types as $post_type ) {
						$group_name = "parsely[{$option_key}][{$post_type}]";
						$id_post    = "{$option_key}_{$post_type}_post";
						$id_page    = "{$option_key}_{$post_type}_page";
						$id_none    = "{$option_key}_{$post_type}_none";
						$value      = $values[ $post_type ] ?? 'none';
						?>
						<tr>
							<th scope="row"><?php echo esc_html( $post_type ); ?></th>
							<td>
								<label aria-labelledby="track-post-types--post" for="<?php echo esc_attr( $id_post ); ?>">
									<input id="<?php echo esc_attr( $id_post ); ?>" name="<?php echo esc_attr( $group_name ); ?>" type="radio" value="post" <?php checked( $value, 'post' ); ?> />
								</label>
							</td>
							<td>
								<label aria-labelledby="track-post-types--page" for="<?php echo esc_attr( $id_page ); ?>">
									<input id="<?php echo esc_attr( $id_page ); ?>" name="<?php echo esc_attr( $group_name ); ?>" type="radio" value="page" <?php checked( $value, 'page' ); ?> />
								</label>
							</td>
							<td>
								<label aria-labelledby="track-post-types--none" for="<?php echo esc_attr( $id_none ); ?>">
									<input id="<?php echo esc_attr( $id_none ); ?>" name="<?php echo esc_attr( $group_name ); ?>" type="radio" value="none" <?php checked( $value, 'none' ); ?> />
								</label>
							</td>
						</tr>
					<?php } ?>
				</tbody>
			</table>
		</fieldset>
		<?php
		$this->print_filter_text( $args );
		$this->print_description_text( $args );
	}

	/**
	 * Returns the custom post type tracking values in a format that is easily
	 * consumable by the print_track_post_types_table() function.
	 *
	 * @since 3.2.0
	 *
	 * @return array<string> Key-value pairs with post type and their 'track as' value.
	 */
	public function get_tracking_values_for_display(): array {
		$options = $this->parsely->get_options();
		$types   = array( 'post', 'page' );
		$result  = array();

		foreach ( $types as $type ) {
			$array_value = $options[ "track_{$type}_types" ];

			foreach ( $array_value as $post_type ) {
				$result[ $post_type ] = $type;
			}
		}

		return $result;
	}

	/**
	 * Validates the options provided by the user.
	 *
	 * @param ParselySettingOptions $input Options from the settings page.
	 * @return ParselySettingOptions
	 */
	public function validate_options( $input ) {
		$input = $this->validate_basic_section( $input );
		$input = $this->validate_recrawl_section( $input );
		$input = $this->validate_advanced_section( $input );

		return $input;
	}

	/**
	 * Validates fields of Basic Section.
	 *
	 * @param ParselySettingOptions $input Options from the settings page.
	 * @return ParselySettingOptions Validated inputs.
	 */
	private function validate_basic_section( $input ) {
		$are_credentials_managed = $this->parsely->are_credentials_managed;
		$options                 = $this->parsely->get_options();

		if ( $are_credentials_managed ) {
			$input['apikey']     = '';
			$input['api_secret'] = '';
		} else {
			$site_id    = $this->sanitize_site_id( $input['apikey'] );
			$api_secret = $this->get_unobfuscated_value( $input['api_secret'], $this->parsely->get_api_secret() );

			$valid_credentials = Validator::validate_api_credentials( $this->parsely, $site_id, $api_secret );

			// When running e2e tests, we need to update the API keys without validating them, as they will be invalid.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( isset( $_POST['e2e_parsely_skip_api_validate'] ) && 'y' === $_POST['e2e_parsely_skip_api_validate'] ) {
				$valid_credentials = true;
			}

			if ( is_wp_error( $valid_credentials ) && Validator::INVALID_API_CREDENTIALS === $valid_credentials->get_error_code() ) {
				add_settings_error(
					Parsely::OPTIONS_KEY,
					'api_secret',
					__( 'The Site ID and API Secret weren\'t saved as they failed to authenticate with the Parse.ly API. Try again with different credentials or contact Parse.ly support', 'wp-parsely' )
				);
				$input['apikey']     = $options['apikey'];
				$input['api_secret'] = $options['api_secret'];
			}

			// Since the API secret is obfuscated, we need to make sure that the value
			// is not changed when the credentials are valid.
			if ( true === $valid_credentials && $input['api_secret'] !== $api_secret ) {
				$input['api_secret'] = $api_secret;
			}
		}

		if ( ! isset( $input['meta_type'] ) ) {
			$input['meta_type'] = $options['meta_type'];
		} else {
			$input['meta_type'] = sanitize_text_field( $input['meta_type'] );
		}

		if ( '' === $input['logo'] ) {
			$input['logo'] = self::get_logo_default();
		}

		// Track authenticated users.
		if ( 'true' !== $input['track_authenticated_users'] && 'false' !== $input['track_authenticated_users'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'track_authenticated_users',
				__( 'Value passed for track_authenticated_users must be either "true" or "false".', 'wp-parsely' )
			);
		} else {
			$input['track_authenticated_users'] = 'true' === $input['track_authenticated_users'];
		}

		if ( 'true' !== $input['disable_javascript'] && 'false' !== $input['disable_javascript'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'disable_javascript',
				__( 'Value passed for disable_javascript must be either "Yes" or "No".', 'wp-parsely' )
			);
		} else {
			$input['disable_javascript'] = 'true' === $input['disable_javascript'];
		}

		// Allow for Disable AMP setting to be conditionally included on the page.
		// If it's not shown, then set the value as what was previously saved.
		if ( ! isset( $input['disable_amp'] ) ) {
			$input['disable_amp'] = 'true';
			if ( false === $options['disable_amp'] ) {
				$input['disable_amp'] = 'false';
			}
		}

		if ( 'true' !== $input['disable_amp'] && 'false' !== $input['disable_amp'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'disable_amp',
				__( 'Value passed for disable_amp must be either "true" or "false".', 'wp-parsely' )
			);
		} else {
			$input['disable_amp'] = 'true' === $input['disable_amp'];
		}

		return $input;
	}

	/**
	 * Validates fields of Recrawl Section.
	 *
	 * @param ParselySettingOptions $input Options from the settings page.
	 * @return ParselySettingOptions Validated inputs.
	 */
	private function validate_recrawl_section( $input ) {
		$options = $this->parsely->get_options();

		$this->validate_options_post_type_tracking( $input );

		// Content ID prefix.
		if ( ! isset( $input['content_id_prefix'] ) ) {
			$input['content_id_prefix'] = $options['content_id_prefix'];
		} else {
			$input['content_id_prefix'] = sanitize_text_field( $input['content_id_prefix'] );
		}

		// Allow for Top-level categories setting to be conditionally included on the page.
		// If it's not shown, then set the value as what was previously saved.
		if ( ! isset( $input['use_top_level_cats'] ) ) {
			$input['use_top_level_cats'] = 'true';
			if ( false === $options['use_top_level_cats'] ) {
				$input['use_top_level_cats'] = 'false';
			}
		}

		// Top-level categories.
		if ( 'true' !== $input['use_top_level_cats'] && 'false' !== $input['use_top_level_cats'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'use_top_level_cats',
				__( 'Value passed for use_top_level_cats must be either "true" or "false".', 'wp-parsely' )
			);
		} else {
			$input['use_top_level_cats'] = 'true' === $input['use_top_level_cats'];
		}

		// Custom taxonomy as section.
		if ( ! isset( $input['custom_taxonomy_section'] ) ) {
			$input['custom_taxonomy_section'] = $options['custom_taxonomy_section'];
		} else {
			$input['custom_taxonomy_section'] = sanitize_text_field( $input['custom_taxonomy_section'] );
		}

		// Allow for Categories as Tags setting to be conditionally included on the page.
		// If it's not shown, then set the value as what was previously saved.
		if ( ! isset( $input['cats_as_tags'] ) ) {
			$input['cats_as_tags'] = 'true';
			if ( false === $options['cats_as_tags'] ) {
				$input['cats_as_tags'] = 'false';
			}
		}

		// Child categories as tags.
		if ( 'true' !== $input['cats_as_tags'] && 'false' !== $input['cats_as_tags'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'cats_as_tags',
				__( 'Value passed for cats_as_tags must be either "true" or "false".', 'wp-parsely' )
			);
		} else {
			$input['cats_as_tags'] = 'true' === $input['cats_as_tags'];
		}

		// Allow for Lowercase Tags setting to be conditionally included on the page.
		// If it's not shown, then set the value as what was previously saved.
		if ( ! isset( $input['lowercase_tags'] ) ) {
			$input['lowercase_tags'] = 'true';
			if ( false === $options['lowercase_tags'] ) {
				$input['lowercase_tags'] = 'false';
			}
		}

		// Lowercase tags.
		if ( 'true' !== $input['lowercase_tags'] && 'false' !== $input['lowercase_tags'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'lowercase_tags',
				__( 'Value passed for lowercase_tags must be either "true" or "false".', 'wp-parsely' )
			);
		} else {
			$input['lowercase_tags'] = 'true' === $input['lowercase_tags'];
		}

		// Allow for Force HTTPS Canonical setting to be conditionally included on the page.
		// If it's not shown, then set the value as what was previously saved.
		if ( ! isset( $input['force_https_canonicals'] ) ) {
			$input['force_https_canonicals'] = 'true';
			if ( false === $options['force_https_canonicals'] ) {
				$input['force_https_canonicals'] = 'false';
			}
		}

		if ( 'true' !== $input['force_https_canonicals'] && 'false' !== $input['force_https_canonicals'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'force_https_canonicals',
				__( 'Value passed for force_https_canonicals must be either "true" or "false".', 'wp-parsely' )
			);
		} else {
			$input['force_https_canonicals'] = 'true' === $input['force_https_canonicals'];
		}

		return $input;
	}

	/**
	 * Validates fields of Advanced Section.
	 *
	 * @param ParselySettingOptions $input Options from the settings page.
	 * @return ParselySettingOptions Validated inputs.
	 */
	private function validate_advanced_section( $input ) {
		$are_credentials_managed = $this->parsely->are_credentials_managed;
		$options                 = $this->parsely->get_options();

		if ( $are_credentials_managed ) {
			$input['metadata_secret'] = '';
		} else {
			$input['metadata_secret'] = $this->get_unobfuscated_value( $input['metadata_secret'], $this->parsely->get_options()['metadata_secret'] );
			$metadata_secret_length   = strlen( $input['metadata_secret'] );
			if ( $metadata_secret_length > 0 &&
					false === Validator::validate_metadata_secret( $input['metadata_secret'] ) ) {
				add_settings_error(
					Parsely::OPTIONS_KEY,
					'metadata_secret',
					__( 'The Metadata Secret was not saved because it is incorrect. Please contact Parse.ly support!', 'wp-parsely' )
				);
				$input['metadata_secret'] = $options['metadata_secret'];
			}
		}

		if ( ! isset( $input['disable_autotrack'] ) ) {
			$input['disable_autotrack'] = $options['disable_autotrack'];
		} elseif ( 'true' !== $input['disable_autotrack'] && 'false' !== $input['disable_autotrack'] ) {
			add_settings_error(
				Parsely::OPTIONS_KEY,
				'disable_autotrack',
				__( 'Value passed for disable_autotrack must be either "Yes" or "No".', 'wp-parsely' )
			);
		} else {
			$input['disable_autotrack'] = 'true' === $input['disable_autotrack'];
		}

		return $input;
	}

	/**
	 * Sanitizes the passed Site ID.
	 *
	 * @since 3.3.0
	 *
	 * @param string $site_id The Site ID to be sanitized.
	 * @return string
	 */
	private function sanitize_site_id( string $site_id ): string {
		return strtolower( sanitize_text_field( $site_id ) );
	}

	/**
	 * Receives the $input array from the validate_options() function and
	 * validate post tracking options.
	 *
	 * This function will mutate the $input array.
	 *
	 * @since 3.2.0
	 *
	 * @param ParselySettingOptions $input Array passed to validate_options() function.
	 */
	private function validate_options_post_type_tracking( &$input ): void {
		$options         = $this->parsely->get_options();
		$posts           = 'track_post_types';
		$pages           = 'track_page_types';
		$track_as        = 'track_post_types_as';
		$input[ $posts ] = $options[ $posts ];
		$input[ $pages ] = $options[ $pages ];

		// @phpstan-ignore-next-line
		if ( isset( $input[ $track_as ] ) && is_array( $input[ $track_as ] ) && 0 < count( $input[ $track_as ] ) ) {
			$post_types = get_post_types( array( 'public' => true ) );
			$temp_posts = array();
			$temp_pages = array();

			// Create temporary Post and Page arrays, disallowing non-existent post types.
			foreach ( $input[ $track_as ] as $key => $value ) {
				if ( false === in_array( $key, $post_types, true ) ) {
					continue;
				}

				if ( 'post' === $value ) {
					$temp_posts[] = $key;
				} elseif ( 'page' === $value ) {
					$temp_pages[] = $key;
				}
			}

			// Cleanup and sanitized values assignment.
			$input [ $posts ] = self::sanitize_option_array( $temp_posts );
			$input [ $pages ] = self::sanitize_option_array( $temp_pages );
		}

		if ( isset( $input[ $track_as ] ) ) {
			unset( $input[ $track_as ] );
		}
	}

	/**
	 * Returns default logo if one can be found.
	 *
	 * @return string
	 */
	private static function get_logo_default(): string {
		/**
		 * Variable.
		 *
		 * @var int
		 */
		$custom_logo_id = get_theme_mod( 'custom_logo' );
		if ( (bool) $custom_logo_id ) {
			$logo_attrs = wp_get_attachment_image_src( $custom_logo_id, 'full' );
			if ( isset( $logo_attrs[0] ) ) {
				return $logo_attrs[0];
			}
		}

		// get_site_icon_url returns an empty string if one isn't found,
		// which is what we want to use as the default anyway.
		return get_site_icon_url();
	}

	/**
	 * Sanitizes all elements in an option array.
	 *
	 * @param array<int, string> $options Array of options to be sanitized.
	 * @return array<int, string>
	 */
	private static function sanitize_option_array( array $options ): array {
		$sanitized_options = $options;
		foreach ( $options as $key => $val ) {
			$sanitized_options[ $key ] = sanitize_text_field( $val );
		}

		return $sanitized_options;
	}

	/**
	 * Gets obfuscated value.
	 *
	 * @param string $current_value Current value of the field.
	 * @return string
	 */
	private function get_obfuscated_value( $current_value ): string {
		return str_repeat( '*', strlen( $current_value ) );
	}

	/**
	 * Gets unobfuscated value.
	 *
	 * @param string $current_value Current value of the field.
	 * @param string $previous_value Previous value of the field. If current
	 *                               value is obfuscated then we will use this.
	 * @return string
	 */
	private function get_unobfuscated_value( $current_value, $previous_value ): string {
		if ( $current_value === $this->get_obfuscated_value( $current_value ) ) {
			return '' === $current_value ? $current_value : $previous_value;
		}

		return $current_value;
	}

	/**
	 * Returns the field label's title. If the option is managed, a badge is
	 * also included.
	 *
	 * @since 3.9.0
	 *
	 * @param string $title The field's title.
	 * @param string $option_id The option's ID.
	 * @return string The resulting content.
	 */
	public function set_field_label_contents( string $title, string $option_id ): string {
		$is_managed = key_exists( $option_id, $this->parsely->managed_options );

		if ( $is_managed ) {
			$text = $this->managed_options_badge['text'] ?? '';
			if ( ! is_string( $text ) || '' === $text ) {
				return $title;
			}

			$url = filter_var( $this->managed_options_badge['url'] ?? '', FILTER_VALIDATE_URL );

			if ( false === $url ) {
				$badge = '<span class="managed-option-badge">' . esc_html( $text ) . '</span>';
			} else {
				$badge = '<a class="managed-option-badge" href="' . esc_url( $url ) .
					'" target="_blank" rel="noopener">' . esc_html( $text ) . '</a>';
			}

			return "{$title}&nbsp;&nbsp;{$badge}";
		}

		return $title;
	}

	/**
	 * Returns the taxonomies allowed to be used as custom_taxonomy_section
	 * option values.
	 *
	 * @since 3.9.0
	 *
	 * @return array<string> Array of taxonomies.
	 */
	public static function get_section_taxonomies(): array {
		return array_diff(
			get_taxonomies(),
			array(
				'post_tag',
				'nav_menu',
				'author',
				'link_category',
				'post_format',
				'wp_theme',
				'wp_template_part_area',
			)
		);
	}
}
