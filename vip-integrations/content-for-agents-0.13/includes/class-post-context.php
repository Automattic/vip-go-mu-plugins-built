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
	 * Save the caller's globals and set up the requested post.
	 *
	 * @param \WP_Post $post Post being rendered.
	 */
	public function __construct( \WP_Post $post ) {
		foreach ( self::GLOBAL_KEYS as $key ) {
			if ( array_key_exists( $key, $GLOBALS ) ) {
				$this->saved[ $key ] = $GLOBALS[ $key ];
			}
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
