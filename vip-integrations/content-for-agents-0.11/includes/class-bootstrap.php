<?php

/**
 * Bootstrap class.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Bootstrap class for plugin initialization.
 *
 * @package Content_For_Agents
 */
class Bootstrap {

	/**
	 * The loader responsible for maintaining and registering all hooks.
	 *
	 * @var Loader
	 */
	protected $loader;

	/**
	 * Initialize the plugin.
	 */
	public function __construct() {
		$this->loader = new Loader();
		$this->register_modules();
	}

	/**
	 * Register all plugin modules.
	 */
	private function register_modules() {
		$this->loader->add_action( 'init', $this, 'register_default_post_type_support', 5 );
		$this->loader->add_action( 'init', $this, 'fire_block_markdown_registration', 5 );

		// Expose the current conversion context to registered block callbacks.
		add_action( 'content_for_agents_set_context', array( Block_Markdown_Registry::class, 'set_context' ) );
		add_action( 'content_for_agents_clear_context', array( Block_Markdown_Registry::class, 'clear_context' ) );

		new Markdown_Endpoint( $this->loader );
		new Markdown_Cache_Invalidator( $this->loader );
		new Discovery( $this->loader );
		new Robots_Txt( $this->loader );
	}

	/**
	 * Fire the action that allows other plugins to register block markdown callbacks.
	 *
	 * Runs at init priority 5 so registrations happen before most block work.
	 *
	 * @hook init, 5
	 */
	public function fire_block_markdown_registration() {
		/**
		 * Fires when plugins should register their block markdown callbacks.
		 *
		 * Use Block_Markdown_Registry::register() inside this action to map a
		 * block name to a callable that returns markdown.
		 *
		 */
		do_action( 'content_for_agents_register_block_callbacks' );
	}

	/**
	 * Register default post type support for built-in post types.
	 *
	 * @hook init
	 */
	public function register_default_post_type_support() {
		add_post_type_support( 'post', 'content-for-agents' );
		add_post_type_support( 'page', 'content-for-agents' );
	}

	/**
	 * Run the loader to register hooks.
	 */
	public function run() {
		$this->loader->run();
	}
}
