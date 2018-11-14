<?php

class Gutenberg_Ramp {

	private static $instance;
	public    $active         = false;

	/**
	 * @var Gutenberg_Ramp_Criteria
	 */
	public $criteria;

	/**
	 * Get the Gutenberg Ramp singleton instance
	 *
	 * @return Gutenberg_Ramp
	 */
	public static function get_instance() {

		if ( ! self::$instance ) {
			self::$instance = new Gutenberg_Ramp();
		}

		return self::$instance;
	}

	/**
	 * Gutenberg_Ramp constructor.
	 */
	private function __construct() {

		$this->criteria = new Gutenberg_Ramp_Criteria();
	}

	/**
	 * Figure out whether or not Gutenberg should be loaded for the given post
	 *
	 * Ramp has everything disabled by default, so the default answer for `gutenberg_should_load` is false
	 * The conditions in the functions are attempts to change that to true
	 *
	 * @return bool
	 *
	 */
	public function gutenberg_should_load( $post ) {

		$criteria = $this->criteria->get();

		/**
		 * Return false early -
		 * If criteria is empty and there are no post types enabled from the Ramp UI
		 */
		if ( ! $criteria && empty( $this->criteria->get_enabled_post_types() ) ) {
			return false;
		}

		// check if we should always or never load
		if ( false !== $this->criteria->get( 'load' ) ) {
			if ( $criteria['load'] === 1 ) {
				return true;
			} elseif ( $criteria['load'] === 0 ) {
				return false;
			}
		}

		if ( ! isset( $post->ID ) ) {
			return false;
		}

		if ( $this->is_allowed_post_type( $post->ID ) ) {
			return true;
		}

		$ramp_post_ids = ( isset( $criteria['post_ids'] ) ) ? $criteria['post_ids'] : [];
		if ( in_array( $post->ID, $ramp_post_ids, true ) ) {
			return true;
		}

		return false;
	}

	public function maybe_load_gutenberg( $can_edit, $post ) {

		// Don't load the Gutenberg, if the Gutenberg doesn't want to be loaded
		if ( false === $can_edit ) {
			return false;
		}

		return $this->gutenberg_should_load( $post );

	}

	/**
	 * Check whether current post type is defined as gutenberg-friendly
	 *
	 * @param $post_id
	 *
	 * @return bool
	 */
	public function is_allowed_post_type( $post_id ) {

		$allowed_post_types = $this->criteria->get_enabled_post_types();

		// Exit early, if no allowed post types are found
		if ( false === $allowed_post_types || ! is_array( $allowed_post_types ) ) {
			return false;
		}

		$current_post_type = get_post_type( $post_id );

		// Exit if no current post type found
		if ( false === $current_post_type ) {
			return false;
		}

		return in_array( $current_post_type, $allowed_post_types, true );

	}

	//
	//
	// ----- Utility functions -----
	//
	//

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
			_doing_it_wrong( 'Gutenberg_Ramp::get_supported_post_types', "get_supported_post_types() was called before the init hook. Some post types might not be registered yet.", '1.0.0' );
		}

		$post_types = get_post_types(
			[
				'show_ui'      => true,
				'show_in_rest' => true,
			],
			'object'
		);

		$available_post_types = [];

		// Remove post types that don't want an editor
		foreach ( $post_types as $name => $post_type_object ) {
			if ( post_type_supports( $name, 'editor' ) && ! empty( $post_type_object->label ) ) {
				$available_post_types[ $name ] = $post_type_object->label;
			}
		}

		return $available_post_types;
	}

	/**
	 * Get a list of unsupported post types post types
	 * @return array
	 */
	public function get_unsupported_post_types() {

		if ( 0 === did_action( 'init' ) && ! doing_action( 'init' ) ) {
			_doing_it_wrong( 'Gutenberg_Ramp::get_unsupported_post_types', "get_unsupported_post_types() was called before the init hook. Some post types might not be registered yet.", '1.1.0' );
		}

		$post_types       = array_keys( get_post_types( [
				'public'   => true,  // Remove any internal/hidden post types
				'_builtin' => false, // Remove builtin post types like attachment, revision, etc.
			]
		) );

		$supported_post_types = array_keys( $this->get_supported_post_types() );

		return array_diff( $post_types, $supported_post_types );
	}

}
