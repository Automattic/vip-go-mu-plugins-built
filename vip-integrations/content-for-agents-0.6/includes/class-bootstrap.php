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
		add_filter( 'block_type_metadata', array( $this, 'inject_block_markdown_metadata' ), 10, 1 );

		// Allow the content transformer (and others) to signal which provider
		// is driving the current markdown conversion so block callbacks can
		// branch their output (e.g. charts → PNG image in email context).
		add_action( 'content_for_agents_set_context', array( Block_Markdown_Registry::class, 'set_context' ) );
		add_action( 'content_for_agents_clear_context', array( Block_Markdown_Registry::class, 'clear_context' ) );

		new Markdown_Endpoint( $this->loader );
		new Markdown_Cache_Invalidator( $this->loader );
		new Discovery( $this->loader );
		new Robots_Txt( $this->loader );
		new LLMs_Txt( $this->loader );
		new Llms_Txt_Cache_Invalidator( $this->loader );
		new Settings( $this->loader );
	}

	/**
	 * Persist block-level markdown metadata into block supports.
	 *
	 * @param array $metadata Raw block metadata.
	 * @return array
	 */
	public function inject_block_markdown_metadata( array $metadata ): array {
		return Block_Markdown_Resolver::inject_metadata_into_supports( $metadata );
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
		 * @since 1.0.0
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
