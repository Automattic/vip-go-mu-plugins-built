<?php

/**
 * Block Markdown Registry.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Static registry mapping block names to markdown callbacks.
 *
 * Other plugins register their callbacks on the
 * `content_for_agents_register_block_callbacks` action, which fires
 * at init priority 5. Each callback receives the parsed block array and
 * the WP_Post being converted, and returns a markdown string.
 *
 * Example:
 *   add_action( 'content_for_agents_register_block_callbacks', function() {
 *       Block_Markdown_Registry::register(
 *           'my-plugin/my-block',
 *           function( array $block, \WP_Post $post ): string {
 *               return '> ' . ( $block['attrs']['quote'] ?? '' );
 *           }
 *       );
 *   } );
 *
 * @package Content_For_Agents
 */
class Block_Markdown_Registry {

	/**
	 * Registered block-name → callable map.
	 *
	 * @var array<string, callable>
	 */
	private static array $callbacks = array();

	/**
	 * Current transformation context slug (e.g. 'email', 'plain-text', 'apple-news').
	 * Empty string when no transformation is in progress.
	 *
	 * Set via do_action( 'content_for_agents_set_context', $slug ) by the
	 * content transformer pipeline before calling post_to_markdown(), and cleared
	 * via do_action( 'content_for_agents_clear_context' ) immediately after.
	 *
	 * @var string
	 */
	private static string $context = '';

	/**
	 * Set the current transformation context.
	 *
	 * @param string $context Provider slug (e.g. 'email').
	 */
	public static function set_context( string $context ): void {
		self::$context = $context;
	}

	/**
	 * Clear the current transformation context.
	 */
	public static function clear_context(): void {
		self::$context = '';
	}

	/**
	 * Get the current transformation context slug.
	 *
	 * @return string Provider slug, or empty string if none is set.
	 */
	public static function get_context(): string {
		return self::$context;
	}

	/**
	 * Register a markdown callback for a block type.
	 *
	 * @param string   $block_name Fully-qualified block name (e.g. 'my-plugin/chart').
	 * @param callable $callback   fn(array $block, \WP_Post $post): string
	 *                             Returns markdown string, or empty string to suppress the block.
	 */
	public static function register( string $block_name, callable $callback ): void {
		self::$callbacks[ $block_name ] = $callback;
	}

	/**
	 * Get the registered callback for a block type, if any.
	 *
	 * @param string $block_name Fully-qualified block name.
	 * @return callable|null
	 */
	public static function get( string $block_name ): ?callable {
		return self::$callbacks[ $block_name ] ?? null;
	}

	/**
	 * Check if a block type has a registered markdown callback.
	 *
	 * @param string $block_name Fully-qualified block name.
	 * @return bool
	 */
	public static function has( string $block_name ): bool {
		return isset( self::$callbacks[ $block_name ] );
	}
}
