<?php
/**
 * Server-side rendering of the `core/rss` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/rss` block on server.
 *
 * @since 5.2.0
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the block content with received rss items.
 */
function gutenberg_render_block_core_rss( $attributes ) {
	if ( in_array( untrailingslashit( $attributes['feedURL'] ), array( site_url(), home_url() ), true ) ) {
		return '<div class="components-placeholder"><div class="notice notice-error">' . __( 'Adding an RSS feed to this site’s homepage is not supported, as it could lead to a loop that slows down your site. Try using another block, like the <strong>Latest Posts</strong> block, to list posts from the site.' ) . '</div></div>';
	}

	$rss = fetch_feed( $attributes['feedURL'] );

	if ( is_wp_error( $rss ) ) {
		return '<div class="components-placeholder"><div class="notice notice-error"><strong>' . __( 'RSS Error:' ) . '</strong> ' . esc_html( $rss->get_error_message() ) . '</div></div>';
	}

	if ( ! $rss->get_item_quantity() ) {
		return '<div class="components-placeholder"><div class="notice notice-error">' . __( 'An error has occurred, which probably means the feed is down. Try again later.' ) . '</div></div>';
	}

	$rss_items  = $rss->get_items( 0, $attributes['itemsToShow'] );
	$list_items = '';

	$open_in_new_tab = ! empty( $attributes['openInNewTab'] );
	$rel             = ! empty( $attributes['rel'] ) ? trim( $attributes['rel'] ) : '';

	$link_attributes = '';

	if ( $open_in_new_tab ) {
		$link_attributes .= ' target="_blank"';
	}

	if ( '' !== $rel ) {
		$link_attributes .= ' rel="' . esc_attr( $rel ) . '"';
	}

	foreach ( $rss_items as $item ) {
		$title = esc_html( trim( strip_tags( html_entity_decode( $item->get_title() ) ) ) );

		if ( empty( $title ) ) {
			$title = __( '(no title)' );
		}
		$link = $item->get_link();
		$link = esc_url( $link );

		if ( $link ) {
			$title = "<a href='{$link}'{$link_attributes}>{$title}</a>";
		}
		$title = "<div class='wp-block-rss__item-title'>{$title}</div>";

		$date_markup = '';
		if ( ! empty( $attributes['displayDate'] ) ) {
			$timestamp = $item->get_date( 'U' );

			if ( $timestamp ) {
				$gmt_offset = get_option( 'gmt_offset' );
				$timestamp += (int) ( (float) $gmt_offset * HOUR_IN_SECONDS );

				$date_markup = sprintf(
					'<time datetime="%1$s" class="wp-block-rss__item-publish-date">%2$s</time> ',
					esc_attr( date_i18n( 'c', $timestamp ) ),
					esc_html( date_i18n( get_option( 'date_format' ), $timestamp ) )
				);
			}
		}

		$author = '';
		if ( $attributes['displayAuthor'] ) {
			$author = $item->get_author();
			if ( is_object( $author ) ) {
				$author = $author->get_name();
				if ( ! empty( $author ) ) {
					$author = '<span class="wp-block-rss__item-author">' . sprintf(
						/* translators: byline. %s: author. */
						__( 'by %s' ),
						esc_html( strip_tags( $author ) )
					) . '</span>';
				}
			}
		}

		$excerpt     = '';
		$description = $item->get_description();
		if ( $attributes['displayExcerpt'] && ! empty( $description ) ) {
			$excerpt = html_entity_decode( $description, ENT_QUOTES, get_option( 'blog_charset' ) );
			$excerpt = esc_attr( wp_trim_words( $excerpt, $attributes['excerptLength'], ' [&hellip;]' ) );

			// Change existing [...] to [&hellip;].
			if ( '[...]' === substr( $excerpt, -5 ) ) {
				$excerpt = substr( $excerpt, 0, -5 ) . '[&hellip;]';
			}

			$excerpt = '<div class="wp-block-rss__item-excerpt">' . esc_html( $excerpt ) . '</div>';
		}

		$list_items .= "<li class='wp-block-rss__item'>{$title}{$date_markup}{$author}{$excerpt}</li>";
	}

	$classnames = array();
	if ( isset( $attributes['blockLayout'] ) && 'grid' === $attributes['blockLayout'] ) {
		$classnames[] = 'is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['blockLayout'] ) {
		$classnames[] = 'columns-' . $attributes['columns'];
	}
	if ( $attributes['displayDate'] ) {
		$classnames[] = 'has-dates';
	}
	if ( $attributes['displayAuthor'] ) {
		$classnames[] = 'has-authors';
	}
	if ( $attributes['displayExcerpt'] ) {
		$classnames[] = 'has-excerpts';
	}

	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classnames ) ) );

	return sprintf( '<ul %s>%s</ul>', $wrapper_attributes, $list_items );
}

/**
 * Registers the `core/rss` block on server.
 *
 * @since 5.2.0
 */
function gutenberg_register_block_core_rss() {
	register_block_type_from_metadata(
		__DIR__ . '/rss',
		array(
			'render_callback' => 'gutenberg_render_block_core_rss',
		)
	);
}
add_action( 'init', 'gutenberg_register_block_core_rss', 20 );
