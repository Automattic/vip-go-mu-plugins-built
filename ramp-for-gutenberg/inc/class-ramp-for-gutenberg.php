<?php

class Ramp_For_Gutenberg {

	private static $instance;

	/**
	 * Criteria is temporarily stored on class instance before it can be validated and updated
	 * Do not trust raw data stored in $criteria!
	 * @var mixed null|array
	 */
	private static $criteria = null;

	private $option_name = 'ramp_for_gutenberg_load_critera';
	public $active      = false;
	public $load_gutenberg = null;


	public static function get_instance() {
		if ( ! self::$instance ) {
			 self::$instance = new Ramp_For_Gutenberg();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->option_name = apply_filters( 'ramp_for_gutenberg_option_name', $this->option_name );

		/**
		 * Store the criteria on admin_init
		 *
		 * $priority = 5 to ensure that the UI class has fresh data available
		 * To do that, we need this to run before `ramp_for_gutenberg_initialize_admin_ui()`
		 */
		add_action( 'admin_init', [ $this, 'save_criteria' ], 5, 0 );
	}
	
	public function get_option_name() {
		return $this->option_name;
	}

	/**
	 * Get the desired criteria
	 *
	 * @param string $criteria_name - post_types, post_ids, load
	 * @return mixed
	 */
	public function get_criteria( $criteria_name = '' ) {

		$options = get_option( $this->get_option_name() );

		if ( '' === $criteria_name ) {
			return $options;
		}

		if ( empty( $options[ $criteria_name ] ) ) {
			return false;
		}

		return $options[ $criteria_name ];

	}

	/**
	 * Set the private class variable $criteria
	 * self::$criteria going to be used to update the option when `$this->save_criteria()` is run
	 *
	 * @param $criteria
	 * @return bool
	 */
	public function set_criteria( $criteria ) {

		if ( $this->sanitize_criteria( $criteria ) ) {
			self::$criteria = $criteria;
			return true;
		}

		return false;
	}

	/**
	 * Save criteria in WordPres options if it's valid
	 */
	public function save_criteria() {


		if ( null !== self::$criteria && $this->validate_criteria( self::$criteria ) ) {
			update_option( $this->get_option_name(), self::$criteria );
		}

	}

	/**
	 * Make sure that the passed $post_types exist and can support Gutenberg
	 *
	 * @param array $post_types
	 * @return bool
	 */
	public function validate_post_types( $post_types ) {

		$supported_post_types = array_keys( $this->get_supported_post_types() );
		foreach ( (array) $post_types as $post_type ) {
			if ( ! in_array( $post_type, $supported_post_types, true ) ) {
				_doing_it_wrong( 'ramp_for_gutenberg_load_gutenberg', "Cannot enable Gutenberg support for post type \"{$post_type}\"", null );
				return false;
			}
		}

		return true;
	}

	/**
	 * Validate $criteria
	 *
	 * @param $criteria
	 * @return bool
	 */
	public function validate_criteria( $criteria ) {

		if ( ! empty( $criteria['post_types'] ) && ! $this->validate_post_types( $criteria['post_types'] ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Sanitize $criteria by making sure it's formatted properly
	 *
	 * @param $criteria
	 * @return bool
	 */
	public function sanitize_criteria( $criteria ) {

		if ( ! is_array( $criteria ) || ! $criteria ) {
			return false;
		}

		$criteria_whitelist = [ 'post_ids', 'post_types', 'load' ];
		foreach ( $criteria as $key => $value ) {
			if ( ! in_array( $key, $criteria_whitelist, true ) ) {
				return false;
			}
			switch ( $key ) {
				case 'post_ids':
					foreach ( $value as $id ) {
						if ( ! ( is_numeric( $id ) && $id > 0 ) ) {
							return false;
						}
					}
					break;
				case 'post_types':
					foreach ( $value as $post_type ) {
						if ( sanitize_title( $post_type ) !== $post_type ) {
							return false;
						}
					}
					break;
				case 'load':
					if ( !in_array( $value, [ 0, 1 ], true ) ) {
						return false;
					}
					break;
				default:
					break;
			}
		}
		return true;
	}

	public function load_decision() {
		// we need to correct the situation when one of two conditions apply:
		// case 1: gutenberg should load according to our criteria but it will not currently do so
		// case 2:  gutenberg should not load according to our criteria, but it will currently do so
		if ( $this->gutenberg_should_load() && ! $this->gutenberg_will_load() ) {
			// this is case 1 ... force gutenberg to load if possible
			$this->gutenberg_load();
		} elseif ( ! $this->gutenberg_should_load() && $this->gutenberg_will_load() ) {
			// this is case 2 ... force gutenberg to bail if possible
			// @todo define this behavior -- will probably leverage the classic editor plugin or some version thereof
			$this->gutenberg_unload();
		}
	}

	// this happens very early -- on plugins_loaded.  We'll probably have to do some ghetto stuff here
	public function gutenberg_should_load() {
		
		// always load Gutenberg on the front-end -- this allows blocks to render correctly etc
		if ( !is_admin() ) {
			return true;
		}

		// we only conditionally load Gutenberg on the edit screen.
		if ( ! $this->is_eligible_admin_url() ) {
			return false;
		}

		$criteria = $this->get_criteria();
		// if criteria is empty, we never load gutenberg
		if ( ! $criteria && empty( $this->get_enabled_post_types() ) ) {
			return false;
		}

		// check if we should always or never load
		if ( false !== $criteria && array_key_exists( 'load', $criteria ) ) {
			if ( $criteria['load'] === 1 ) {
				return true;
			} elseif ( $criteria['load'] === 0 ) {
				return false;
			}
		}

		// CRITERIA
		// in order load Gutnberg because of other criteria, we will need to check that a few things are true:
		// 1. we are attempting to load post.php ... there's an available post_id
		// 2. there's an available post_id in the URL to check
		$ramp_for_gutenberg_post_id = $this->get_current_post_id();

		// check post_types
		if ( $this->is_allowed_post_type( $ramp_for_gutenberg_post_id ) ) {
			return true;
		}

		if ( ! $ramp_for_gutenberg_post_id ) {
			return false;
		}

		// grab the criteria
		$ramp_for_gutenberg_post_ids   = ( isset( $criteria['post_ids'] ) ) ? $criteria['post_ids'] : [];

		// check post_ids
		if ( in_array( $ramp_for_gutenberg_post_id, $ramp_for_gutenberg_post_ids, true ) ) {
			return true;
		}
	}

	/**
	 * Get post types that can be supported by Gutenberg.
	 *
	 * This will get all registered post types and remove post types:
	 *        * that aren't shown in the admin menu
	 *        * like attachment, revision, etc.
	 *        * that don't support native editor UI
	 *
	 *
	 * Also removes post types that don't support `show_in_rest`:
	 * @link https://github.com/WordPress/gutenberg/issues/3066
	 *
	 * @return array of formatted post types as [ 'slug' => 'label' ]
	 */
	public function get_supported_post_types() {

		if ( 0 === did_action( 'init' ) && ! doing_action( 'init' ) ) {
			_doing_it_wrong( 'Ramp_For_Gutenberg::get_supported_post_types', "get_supported_post_types() was called before the init hook. Some post types might not be registered yet.", '1.0.0' );
		}

		$post_types = get_post_types(
			[
				'show_ui'      => true,
				'show_in_rest' => true,
			],
			'object'
		);

		$available_post_types = array();

		// Remove post types that don't want an editor
		foreach ( $post_types as $name => $post_type_object ) {
			if ( post_type_supports( $name, 'editor' ) && ! empty( $post_type_object->label ) ) {
				$available_post_types[ $name ] = $post_type_object->label;
			}
		}

		return $available_post_types;
	}

	/**
	 * Get all post types with Gutenberg enabled
	 *
	 * @return array
	 */
	public function get_enabled_post_types() {

		$ui_enabled_post_types     = (array) get_option( 'ramp_for_gutenberg_post_types', array() );
		$helper_enabled_post_types = (array) $this->get_criteria( 'post_types' );

		return array_unique( array_merge( $ui_enabled_post_types, $helper_enabled_post_types ) );

	}

	/**
	 * Check whether current post type is defined as gutenberg-friendly
	 *
	 * @param $post_id
	 *
	 * @return bool
	 */
	public function is_allowed_post_type( $post_id ) {

		$allowed_post_types = $this->get_enabled_post_types();

		// Exit early, if no allowed post types are found
		if ( false === $allowed_post_types || ! is_array( $allowed_post_types ) ) {
			return false;
		}

		// Find the current post type
		$current_post_type = false;
		if ( 0 === (int) $post_id ) {

			if ( isset( $_GET['post_type'] ) ) {
				$current_post_type = sanitize_title( $_GET['post_type'] );
			}

			// Regular posts are plain `post-new.php` with no `post_type` parameter defined.
			elseif ( $this->is_eligible_admin_url( [ 'post-new.php' ] ) ) {
				$current_post_type = 'post';
			}

		} else {
			$current_post_type = get_post_type( $post_id );
		}

		// Exit if no current post type found
		if ( false === $current_post_type ) {
			return false;
		}

		return in_array( $current_post_type, $allowed_post_types, true );

	}

	public function gutenberg_will_load() {
		// for WordPress version > 5, Gutenberg will load
		global $wp_version;
		$version_arr     = explode( '.', $wp_version );
		$wp_version_main = (int) $version_arr[0];
		if ( $wp_version_main >= 5 ) {
			return true;
		}
		// also, the gutenberg plugin might be the source of an attempted load
		if (
			has_filter( 'replace_editor', 'gutenberg_init' )
			||
			has_filter( 'load-post.php', 'gutenberg_intercept_edit_post' )
			||
			has_filter( 'load-post-new.php', 'gutenberg_intercept_post_new' )
		) {
			return true;
		}
		return false;
	}

	// load gutenberg from the plugin
	public function gutenberg_load() {
		// perform any actions required before loading gutenberg
		do_action( 'ramp_for_gutenberg_before_load_gutenberg' );
		$gutenberg_include = apply_filters( 'ramp_for_gutenberg_gutenberg_load_path', WP_PLUGIN_DIR . '/gutenberg/gutenberg.php' );
		if ( validate_file( $gutenberg_include ) !== 0 ) {
			return false;
		}
		// flag this for the filter
		$this->load_gutenberg = true;
		if ( file_exists( $gutenberg_include ) ) {
			include_once $gutenberg_include;
		}
	}

	// @todo
	public function gutenberg_unload() {
		// flag this for the filter
		$this->load_gutenberg = false;
		// @todo load the Classic editor if it's configured
	}

	// utility functions
	public function get_current_post_id() {
		if ( isset( $_GET['post'] ) && is_numeric( $_GET['post'] ) && ( (int) $_GET['post'] > 0 ) ) {
			return absint( $_GET['post'] );
		}

		return 0;
	}

	public function is_eligible_admin_url( $supported_filenames = ['post.php', 'post-new.php'] ) {

		$path          = sanitize_text_field( wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) );
		$path          = trim( $path );
		$wp_admin_slug = trim( wp_parse_url( get_admin_url(), PHP_URL_PATH ), '/' );

		foreach ( $supported_filenames as $filename ) {
			// Require $filename not to be empty to avoid accidents like matching against a plain `/wp-admin/`
			if ( ! empty( $filename ) && "/{$wp_admin_slug}/{$filename}" === $path ) {
				return true;
			}
		}

		return false;
	}

	public function cleanup_option() {
		// if the criteria are already such that Gutenberg will never load, no change is needed
		if ( $this->get_criteria() === [ 'load' => 0 ] ) {
			return;
		}
		// if the theme did not call its function, then remove the option containing criteria, which will prevent all loading
		if ( ! $this->active ) {
			delete_option( $this->get_option_name() );
		}
	}

	/**
	 * Disable Gutenberg if the load decidion has been made to unload it
	 *
	 * This is a slight hack since there's no filter (yet) in Gutenberg on the
	 * post id, just the post type, but because it's (currently) only used to check the
	 * primary post id when loading the editor, it can be leveraged.
	 *
	 * The instance variable load_gutenberg might be set during the load
	 * decision code above. If it's explicitly false, then the filter returns false,
	 * else it returns the original value.
	 *
	 * @param string  $post_type - the post type
	 * @param boolean $can_edit  - whether Gutenberg should edit this post type
	 *
	 * @return boolean - whether Gutenberg should edit this post
	 */
	public function maybe_allow_gutenberg_to_load( $post_type, $can_edit ) {

		// Don't enable Gutenberg in post types that don't support Gutenberg.
		if ( false === $can_edit ) {
			return false;
		}

		// Return the decision, if a decision has been made.
		if ( null !== $this->load_gutenberg ) {
			return (bool) $this->load_gutenberg;
		}

		return $can_edit;
	}
}
