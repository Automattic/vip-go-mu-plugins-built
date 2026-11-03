<?php

/**
 * Temporary WordPress post context for content conversion.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Temporarily sets WordPress's template globals for a post.
 */
class Post_Context {
	private const GLOBAL_KEYS = array( 'post', 'id', 'authordata', 'currentday', 'currentmonth', 'page', 'pages', 'multipage', 'more', 'numpages' );

	private array $saved   = array();
	private bool $restored = false;

	/**
	 * Save globals, optionally setting up the requested post.
	 *
	 * @param \WP_Post|null $post Post being rendered, or null to capture current globals.
	 */
	public function __construct( ?\WP_Post $post = null ) {
		foreach ( self::GLOBAL_KEYS as $key ) {
			if ( array_key_exists( $key, $GLOBALS ) ) {
				$this->saved[ $key ] = $GLOBALS[ $key ];
			}
		}
		if ( null === $post ) {
			return;
		}

		try {
			$GLOBALS['post'] = $post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Required for block and excerpt filters.
			setup_postdata( $post );
		} catch ( \Throwable $error ) {
			$this->restore();
			throw $error;
		}
	}

	/**
	 * Run extension code without changing the surrounding post globals.
	 *
	 * @param callable $callback Extension code to execute.
	 * @return mixed Callback result; exceptions propagate after restoring globals.
	 */
	public static function preserve( callable $callback ) {
		$context = new self();
		try {
			return $callback();
		} finally {
			$context->restore();
		}
	}

	/**
	 * Restore the caller's globals after post conversion.
	 */
	public function restore(): void {
		if ( $this->restored ) {
			return;
		}
		$this->restored = true;
		foreach ( self::GLOBAL_KEYS as $key ) {
			if ( array_key_exists( $key, $this->saved ) ) {
				$GLOBALS[ $key ] = $this->saved[ $key ]; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited, WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Restoring core globals by name.
			} else {
				unset( $GLOBALS[ $key ] ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Restoring core globals by name.
			}
		}
	}
}
