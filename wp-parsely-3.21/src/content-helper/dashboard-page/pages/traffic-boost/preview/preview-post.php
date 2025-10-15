<?php
/**
 * Template for the preview frame.
 *
 * @since 3.19.0
 *
 * @global string $post_title The title of the post being previewed
 * @global string $block_content The rendered content of the post being previewed
 *
 * @package Parsely
 */

declare(strict_types=1);

// Define constants to prevent unwanted scripts and styles from being loaded.

if ( ! defined( 'IFRAME_REQUEST' ) ) {
	define( 'IFRAME_REQUEST', true ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound
}
if ( ! defined( 'WP_ADMIN' ) ) {
	define( 'WP_ADMIN', true ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound
}

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php echo esc_html( $post_title ?? '' ); ?></title>
	<?php wp_head(); ?>
	<style>
		body {
			margin: 0;
			padding: 1rem;
			min-height: none;
			height: 0;
		}
		.wp-parsely-preview-content {
			padding-bottom: 30px;
		}
		.editor-styles-wrapper {
			max-width: 840px;
			margin: 0 auto;
		}
		/* Hide any edit UI */
		.block-editor-block-list__layout .block-editor-block-list__block.is-selected > .block-editor-block-list__block-edit::before,
		.block-editor-block-list__layout .block-editor-block-list__block.is-hovered > .block-editor-block-list__block-edit::before {
			border: none;
			box-shadow: none;
		}
		/* Disable link interactions while preserving styling */
		a {
			cursor: pointer !important;
		}
	</style>
	<script>
		// Prevent right click, context menu, and other iframe-specific interactions.
		document.addEventListener('DOMContentLoaded', function() {
			// Prevent right click and context menu.
			document.addEventListener( 'contextmenu', function( e ) {
				e.preventDefault();
			} );

			// Prevent keyboard shortcuts.
			document.addEventListener('keydown', function(e) {
				// Prevent view source (Ctrl+U).
				if (e.ctrlKey && e.key === 'u') {
					e.preventDefault();
					return false;
				}
				// Prevent inspect element (Ctrl+Shift+I or F12).
				if ((e.ctrlKey && e.shiftKey && e.key === 'i') || e.key === 'F12') {
					e.preventDefault();
					return false;
				}
			});
		});
	</script>
</head>
<body <?php body_class( 'editor-styles-wrapper block-editor-writing-flow' ); ?>>
	<div class="wp-block editor-post-title editor-post-title__block">
		<h1 class="editor-post-title__input"><?php echo esc_html( $post_title ?? '' ); ?></h1>
	</div>
	<div class="wp-parsely-preview-content">
		<?php echo wp_kses_post( $block_content ?? '' ); ?>
		<div class="wp-parsely-preview-marker"></div>
	</div>
	<?php wp_footer(); ?>
</body>
</html>