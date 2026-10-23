<?php

namespace Automattic\ShareADraft;

use WP_Post;

/**
 * The "Share a Draft" meta box on the classic edit screen, for sites running
 * the Classic Editor plugin and post types that do not use the block editor.
 *
 * It holds the same controls as the block-editor panel, mounted by
 * build/classic.js. The box is flagged as back-compat, so the block editor
 * never shows it alongside its own panel; and since its script is only
 * enqueued when the box renders, the block editor never loads that either.
 */
final class ClassicEditorMetaBox {
	private EditorAssets $assets;

	public function __construct( EditorAssets $assets ) {
		$this->assets = $assets;
	}

	public function register(): void {
		add_action( 'add_meta_boxes', [ $this, 'add' ], 10, 2 );
	}

	/**
	 * Offer the box only where the block-editor panel would show: a viewable
	 * post type, in a status that can still be shared. The classic screen
	 * reloads on every status change, so checking once here is enough.
	 *
	 * @param string $post_type The post type being edited.
	 * @param mixed  $post      The post being edited; core passes a WP_Post here,
	 *                          but other screens fire this hook with other objects.
	 */
	public function add( string $post_type, $post ): void {
		if ( ! $post instanceof WP_Post
			|| ! is_post_type_viewable( $post_type )
			|| PublishCleanup::is_terminal( $post->post_status )
		) {
			return;
		}

		add_meta_box(
			'shareadraft',
			esc_html__( 'Share a Draft', 'shareadraft' ),
			[ $this, 'render' ],
			null,
			'side',
			'default',
			[ '__back_compat_meta_box' => true ]
		);
	}

	public function render( WP_Post $post ): void {
		$this->assets->enqueue_classic();

		printf(
			'<div id="shareadraft-classic" data-post-id="%d"></div>',
			(int) $post->ID
		);
	}
}
