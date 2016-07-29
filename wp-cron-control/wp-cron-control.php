<?php
/*
 Plugin Name: WP-Cron Control
 Plugin URI: https://wordpress.org/plugins/wp-cron-control/
 Description: Take control of wp-cron execution.
 Author: Thorsten Ott, Erick Hitter, Automattic
 Version: 0.7.1
 Text Domain: wp-cron-control
 */

class WP_Cron_Control {

	private static $__instance = NULL;

	private $settings = array();
	private $default_settings = array();
	private $settings_texts = array();

	private $plugin_prefix = 'wpcroncontrol_';
	private $plugin_name = 'WP-Cron Control';
	private $settings_page_name = null;
	private $dashed_name = 'wp-cron-control';
	private $js_version = '20110801';
	private $css_version = '20110801';

	private $define_global_secret = NULL;	// if this is set, it's value will be used as secret instead of the option

	public function __construct() {
		global $blog_id;

		// this allows overwriting of the default secret with a value set in the code. Useful If you don't want to give control to users.
		if ( NULL <> $this->define_global_secret && !defined( 'WP_CRON_CONTROL_SECRET' ) )
			define( 'WP_CRON_CONTROL_SECRET', $this->define_global_secret );

		add_action( 'admin_init', array( &$this, 'register_setting' ) );
		add_action( 'admin_menu', array( &$this, 'register_settings_page' ) );

		/**
		 * Default settings that will be used for the setup. You can alter these value with a simple filter such as this
		 * add_filter( 'wpcroncontrol_default_settings', 'mywpcroncontrol_settings' );
		 * function mywpcroncontrol_settings( $settings ) {
		 * 		$settings['secret_string'] = 'i am more secret than the default';
		 * 		return $settings;
		 * }
		 */
		$this->default_settings = (array) apply_filters( $this->plugin_prefix . 'default_settings', array(
			'enable'				=> 1,
			'enable_scheduled_post_validation' => 0,
			'secret_string'			=> md5( __FILE__ . $blog_id ),
		) );

		/**
		 * Define fields that will be used on the options page
		 * the array key is the field_name the array then describes the label, description and type of the field. possible values for field types are 'text' and 'yesno' for a text field or input fields or 'echo' for a simple output
		 * a filter similar to the default settings (ie wpcroncontrol_settings_texts) can be used to alter this values
		 */
		$this->settings_texts = (array) apply_filters( $this->plugin_prefix . 'settings_texts', array(
			'enable' => array(
				'label' => sprintf( __( 'Enable %s', 'wp-cron-control' ), $this->plugin_name ),
				'desc' => sprintf( __( 'Enable this plugin and allow requests to %s only with the appended secret parameter.', 'wp-cron-control' ), '<code>wp-cron.php</code>' ),
				'type' => 'yesno'
			),
			'secret_string' => array(
				'label' => __( 'Secret string', 'wp-cron-control' ),
				'desc' => sprintf( __( 'The secret parameter that needs to be appended to %s requests.', 'wp-cron-control' ), '<code>wp-cron.php</code>' ),
				'type' => 'text'
			),
			'enable_scheduled_post_validation' => array(
				'label' => __( 'Enable scheduled post validation', 'wp-cron-control' ),
				'desc' => sprintf( __( 'In some rare cases, it can happen that even when running %s via a scheduled system cron job, posts miss their schedule. This feature makes sure that there is a scheduled event for each scheduled post.', 'wp-cron-control' ), '<code>wp-cron</code>' ),
				'type' => 'yesno'
			),
		) );

		$user_settings = get_option( $this->plugin_prefix . 'settings' );
		if ( false === $user_settings )
			$user_settings = array();

		// after getting default settings make sure to parse the arguments together with the user settings
		$this->settings = wp_parse_args( $user_settings, $this->default_settings );

		/**
		 * If you define( 'WP_CRON_CONTROL_SECRET', 'my_super_secret_string' ); in your wp-config.php or your theme then
		 * users are not allowed to change the secret, so we output the existing secret string rather than allowing to add a new one
		 */
		if ( defined( 'WP_CRON_CONTROL_SECRET' ) ) {
			$this->settings_texts['secret_string']['type'] = 'echo';
			$this->settings_texts['secret_string']['desc'] = $this->settings_texts['secret_string']['desc'] . sprintf( __( 'Cannot be changed as it is defined via %s.', 'wp-cron-control' ), "<code>WP_CRON_CONTROL_SECRET</code>" );
			$this->settings['secret_string'] = WP_CRON_CONTROL_SECRET;
		}

	}

	public static function init() {
		self::instance()->settings_page_name = sprintf( __( '%s Settings', 'wp-cron-control' ), self::instance()->plugin_name );

		if ( 1 == self::instance()->settings['enable'] ) {
		}
		self::instance()->prepare();
	}

	/*
	 * Use this singleton to address methods
	 */
	public static function instance() {
		if ( self::$__instance == NULL )
			self::$__instance = new WP_Cron_Control;
		return self::$__instance;
	}

	public function prepare() {
		/**
		 * If a css file for this plugin exists in ./css/wp-cron-control.css make sure it's included
		 */
		if ( file_exists( dirname( __FILE__ ) . "/css/" . $this->dashed_name . ".css" ) )
			wp_enqueue_style( $this->dashed_name, plugins_url( "css/" . $this->dashed_name . ".css", __FILE__ ), $deps = array(), $this->css_version );
		/**
		 * If a js file for this plugin exists in ./js/wp-cron-control.css make sure it's included
		 */
		if ( file_exists( dirname( __FILE__ ) . "/js/" . $this->dashed_name . ".js" ) )
			wp_enqueue_script( $this->dashed_name, plugins_url( "js/" . $this->dashed_name . ".js", __FILE__ ), array(), $this->js_version, true );

		/**
		 * When the plugin is enabled make sure remove the default behavior for issueing wp-cron requests and add our own method
		 * see: http://core.trac.wordpress.org/browser/trunk/wp-includes/default-filters.php#L236
		 * and  http://core.trac.wordpress.org/browser/trunk/wp-includes/cron.php#L258
		 */
		if ( 1 == $this->settings['enable'] ) {
			remove_action( 'init', 'wp_cron' );
			add_action( 'init', array( &$this, 'validate_cron_request' ) );
		}

	}

	public function register_settings_page() {
		add_options_page( $this->settings_page_name, $this->plugin_name, 'manage_options', $this->dashed_name, array( &$this, 'settings_page' ) );
	}

	public function register_setting() {
		register_setting( $this->plugin_prefix . 'settings', $this->plugin_prefix . 'settings', array( &$this, 'validate_settings') );
	}

	public function validate_settings( $settings ) {
		$validated_settings = array();

		if ( !empty( $_POST[ $this->dashed_name . '-defaults'] ) ) {
			// Reset to defaults
			$validated_settings = $this->default_settings;
			$_REQUEST['_wp_http_referer'] = add_query_arg( 'defaults', 'true', $_REQUEST['_wp_http_referer'] );
		} else {
			foreach ( $this->settings_texts as $setting => $setting_info ) {
				switch( $setting ) {
					case 'enable':
					case 'enable_scheduled_post_validation':
						$validated_settings[ $setting ] = intval( $settings[ $setting ] );
						if ( $validated_settings[ $setting ] > 1 || $validated_settings[ $setting ] < 0 ) {
							$validated_settings[ $setting ] = $this->default_settings[ $setting ];
						}
						break;

					case 'secret_string':
						$validated_settings[ $setting ] = sanitize_text_field( $settings[ $setting ] );
						if ( empty( $validated_settings[ $setting ] ) ) {
							$validated_settings[ $setting ] = $this->default_settings[ $setting ];
						}
						break;

					default:
						$validated_settings[ $setting ] = sanitize_text_field( $settings[ $setting ] );
						break;
				}
			}
		}

		return $validated_settings;
	}

	public function settings_page() {
		if ( !current_user_can( 'manage_options' ) )  {
			wp_die( __( 'You do not permission to access this page' ) );
		}
		?>
		<div class="wrap">
		<?php if ( function_exists('screen_icon') ) screen_icon(); ?>
			<h2><?php echo $this->settings_page_name; ?></h2>

			<form method="post" action="options.php">

			<?php settings_fields( $this->plugin_prefix . 'settings' ); ?>

			<table class="form-table">
				<?php foreach( $this->settings as $setting => $value): ?>
				<tr valign="top">
					<th scope="row"><label for="<?php echo $this->dashed_name . '-' . $setting; ?>"><?php if ( isset( $this->settings_texts[$setting]['label'] ) ) { echo $this->settings_texts[$setting]['label']; } else { echo $setting; } ?></label></th>
					<td>
						<?php
						/**
						 * Implement various handlers for the different types of fields. This could be easily extended to allow for drop-down boxes, textareas and more
						 */
						?>
						<?php switch( $this->settings_texts[$setting]['type'] ):
							case 'yesno': ?>
								<select name="<?php echo $this->plugin_prefix; ?>settings[<?php echo $setting; ?>]" id="<?php echo $this->dashed_name . '-' . $setting; ?>" class="postform">
									<?php
										$yesno = array( 0 => __( 'No', 'wp-cron-control' ), 1 => __( 'Yes', 'wp-cron-control' ) );
										foreach ( $yesno as $val => $txt ) {
											echo '<option value="' . esc_attr( $val ) . '"' . selected( $value, $val, false ) . '>' . esc_html( $txt ) . "&nbsp;</option>\n";
										}
									?>
								</select><br />
							<?php break;
							case 'text': ?>
								<div><input type="text" name="<?php echo $this->plugin_prefix; ?>settings[<?php echo $setting; ?>]" id="<?php echo $this->dashed_name . '-' . $setting; ?>" class="postform" value="<?php echo esc_attr( $value ); ?>" /></div>
							<?php break;
							case 'echo': ?>
								<div><span id="<?php echo $this->dashed_name . '-' . $setting; ?>" class="postform"><?php echo esc_html( $value ); ?></span></div>
							<?php break;
							default: ?>
								<?php echo esc_html( $this->settings_texts[$setting]['type'] ); ?>
							<?php break;
						endswitch; ?>
						<?php if ( !empty( $this->settings_texts[$setting]['desc'] ) ) { echo wp_kses_post( $this->settings_texts[$setting]['desc'] ); } ?>
					</td>
				</tr>
				<?php endforeach; ?>
				<?php if ( 1 == $this->settings['enable'] ): ?>
					<tr>
						<td colspan="3">
							<p><?php printf( __( 'You enabled %s. To make sure that scheduled tasks are still executed correctly, you will need to setup a system cron job that will call %s with the secret parameter defined in the settings.', 'wp-cron-control' ), $this->plugin_name, '<code>wp-cron.php</code>' ); ?></p>

							<p><?php _e( 'You can use the function defined in this script and set up a cron job that calls either:', 'wp-cron-control' ); ?></p>

							<p><code>php <?php echo __FILE__; ?> <?php echo get_site_url(); ?> <?php echo $this->settings['secret_string']; ?></code></p>
							<p>or</p>
							<p><code>wget -q "<?php echo get_site_url(); ?>/wp-cron.php?doing_wp_cron&amp;<?php echo $this->settings['secret_string']; ?>"</code></p>

							<p><?php _e( 'You can set an interval as low as one minute, but should consider a reasonable value of 5-15 minutes as well.', 'wp-cron-control' ); ?></p>

							<p><?php _e( 'If you need help setting up a cron job please refer to the documentation that your provider offers.', 'wp-cron-control' ); ?></p>

							<p><?php printf( __( 'Anyway, chances are high that either the %s, %s, or %s documentation will help you.', 'wp-cron-control' ), '<a href="http://docs.cpanel.net/twiki/bin/view/AllDocumentation/CpanelDocs/CronJobs#Adding a cron job" target="_blank">CPanel</a>', '<a href="http://download1.parallels.com/Plesk/PP10/10.3.1/Doc/en-US/online/plesk-administrator-guide/plesk-control-panel-user-guide/index.htm?fileName=65208.htm" target="_blank">Plesk</a>', '<a href="http://www.thegeekstuff.com/2011/07/php-cron-job/" target="_blank">crontab</a>' ); ?></p>
						</td>
					</tr>
				<?php endif; ?>
			</table>

			<p class="submit">
		<?php
				if ( function_exists( 'submit_button' ) ) {
					submit_button( null, 'primary', $this->dashed_name . '-submit', false );
					echo ' ';
					submit_button( __( 'Reset to Defaults', 'wp-cron-control' ), '', $this->dashed_name . '-defaults', false );
				} else {
					echo '<input type="submit" name="' . $this->dashed_name . '-submit" class="button-primary" value="' . __( 'Save Changes', 'wp-cron-control' ) . '" />' . "\n";
					echo '<input type="submit" name="' . $this->dashed_name . '-defaults" id="' . $this->dashed_name . '-defaults" class="button-primary" value="' . __( 'Reset to Defaults', 'wp-cron-control' ) . '" />' . "\n";
				}
		?>
			</p>

			</form>
		</div>

		<?php
	}

	/**
	 * Alternative function to the current wp_cron function that would usually executed on sanitize_comment_cookies
	 */
	public function validate_cron_request() {
		// make sure we're in wp-cron.php
		if ( false !== strpos( $_SERVER['REQUEST_URI'], '/wp-cron.php' ) ) {
			// grab the necessary secret string
			if ( defined( 'WP_CRON_CONTROL_SECRET' ) )
				$secret = WP_CRON_CONTROL_SECRET;
			else
				$secret = $this->settings['secret_string'];

			// make sure a secret string is provided in the ur
			if ( isset( $_GET[$secret] ) ) {

				// check if there is already a cron request running
				$local_time = time();
				if ( function_exists( '_get_cron_lock' ) )
					$flag = _get_cron_lock();
				else
					$flag = get_transient('doing_cron');

				if ( defined( 'WP_CRON_LOCK_TIMEOUT' ) )
					$timeout = WP_CRON_LOCK_TIMEOUT;
				else
					$timeout = 60;

				if ( $flag > $local_time + 10 * $timeout )
					$flag = 0;

				// don't run if another process is currently running it or more than once every 60 sec.
				if ( $flag + $timeout > $local_time )
					die( 'another cron process running or previous not older than 60 secs' );

				// set a transient to allow locking down parallel requests
				set_transient( 'doing_cron', $local_time );

				// make sure the request also validates in wp-cron.php
				global $doing_wp_cron;
				$doing_wp_cron = $local_time;

				// if settings allow it validate if there are any scheduled posts without a cron event
				if ( 1 == self::instance()->settings['enable_scheduled_post_validation'] ) {
					$this->validate_scheduled_posts();
				}
				return true;
			}
			// something went wrong
			die( 'invalid secret string' );
		}

		// for all other cases disable wp-cron.php and spawn_cron() by telling the system it's already running
		if ( !defined( 'DOING_CRON' ) )
			define( 'DOING_CRON', true );

		// and also disable the wp_cron() call execution
		if ( !defined( 'DISABLE_WP_CRON' ) )
			define( 'DISABLE_WP_CRON', true );
		return false;
	}

	public function validate_scheduled_posts() {
		global $wpdb;

		// grab all scheduled posts from posts table
		$sql = "SELECT ID, post_date_gmt FROM $wpdb->posts WHERE post_status = 'future'";
		$results = $wpdb->get_results( $sql );
		$return = true;

		// if none exists just return
		if ( empty( $results ) )
			return true;

		// otherwise check each of them
		foreach ( $results as $r ) {

			$gmt_time  = strtotime( $r->post_date_gmt . ' GMT' );

			// grab the scheduled job for this post
			$timestamp = wp_next_scheduled( 'publish_future_post', array( (int) $r->ID ) );
			if ( $timestamp === false ) {
				// if none exists issue one
				wp_schedule_single_event( $gmt_time, 'publish_future_post', array( (int) $r->ID ) );
				$return = false;
			} else {
				// if one exists update timestamp to adjust for daylights savings change, when necessary
				if ( $timestamp != $gmt_time ) {
					wp_clear_scheduled_hook( 'publish_future_post', array( (int) $r->ID ) );
					wp_schedule_single_event( $gmt_time, 'publish_future_post', array( (int) $r->ID ) );

					$new_date = date( 'Y-m-d H:i:s', $gmt_time );
					$sql_u = $wpdb->prepare( "UPDATE $wpdb->posts SET post_date_gmt=%s WHERE ID=%d", $new_date, $r->ID );
					$wpdb->query( $sql_u );
					$return = false;
				}
			}
		}

		return $return;
	}
}

/**
 * This method can be used to initiate a cron call via cli
 */
function wp_cron_control_call_cron( $blog_address, $secret ) {
 	$cron_url = $blog_address . '/wp-cron.php?doing_wp_cron&' . $secret;
 	$ch = curl_init( $cron_url );
 	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 0 );
	curl_setopt( $ch, CURLOPT_TIMEOUT, '3' );
	$result = curl_exec( $ch );
	curl_close( $ch );
	return $result;
}

// if we loaded wp-config then ABSPATH is defined and we know the script was not called directly to issue a cli call
if ( defined('ABSPATH') ) {
	WP_Cron_Control::init();
} else {
	// otherwise parse the arguments and call the cron.
	if ( !empty( $argv ) && $argv[0] == basename( __FILE__ ) || $argv[0] == __FILE__ ) {
		if ( isset( $argv[1] ) && isset( $argv[2] ) ) {
			wp_cron_control_call_cron( $argv[1], $argv[2] );
		} else {
			echo "Usage: php " . __FILE__ . " <blog_address> <secret_string>\n";
			echo "Example: php " . __FILE__ . " http://my.blog.com efe18b0e53498e737da9b91cf4ca3d25\n";
			exit;
		}
	}
}

