<?php

/**
 * Markdown converter for block content.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

use WP_Error;

/**
 * Converts WordPress post content to Markdown.
 *
 * Walks the parsed block tree. Registered callbacks can supply Markdown;
 * other blocks render to HTML for conversion. Wrappers with custom descendants
 * retain their content order.
 *
 * @package Content_For_Agents
 */
class Markdown_Converter {
	/** Whether this converter invoked a registered block callback. */
	private bool $used_block_callback = false;

	/** Whether a block callback ran during this conversion. */
	public function used_block_callback(): bool {
		return $this->used_block_callback;
	}

	/**
	 * Convert post content to Markdown.
	 *
	 * @param int|\WP_Post $post Post ID or post object.
	 * @return string|WP_Error Markdown content or a post-level conversion failure.
	 */
	public function post_to_markdown( $post ) {
		$this->used_block_callback = false;
		$post_object               = get_post( $post );
		if ( ! $post_object || ! post_type_supports( $post_object->post_type, 'content-for-agents' ) ) {
			return '';
		}

		// Direct converter calls need post globals for block rendering and callbacks.
		$context = null;
		try {
			$context = new Post_Context( $post_object );
			/**
			 * Allow plugins to supply pre-built Markdown, bypassing block conversion.
			 *
			 * Return a non-null string to short-circuit conversion. Return null to fall
			 * through to the standard pipeline. Useful for post types that store Markdown
			 * directly in meta (e.g. OCR-extracted content).
			 *
			 * @param string|WP_Error|null $pre Pre-built Markdown, a failure, or null to use default conversion.
			 * @param \WP_Post    $post_object The post being converted.
			 */
			try {
				$pre = Post_Context::preserve( static fn() => apply_filters( 'content_for_agents_pre_markdown', null, $post_object ) );
			} catch ( \Throwable $error ) {
				$pre = new WP_Error( 'content_for_agents_pre_markdown_exception', 'Pre-Markdown filter failed.', $error );
			}
			if ( is_string( $pre ) ) {
				return $pre;
			}
			if ( null !== $pre ) {
				$error = is_wp_error( $pre ) ? $pre : new WP_Error( 'content_for_agents_invalid_pre_markdown_value', 'Pre-Markdown filter returned a non-string value.' );
				Markdown_Conversion_Logger::log( $error, $post_object->ID );
			}

			$blocks   = parse_blocks( $post_object->post_content );
			$markdown = $this->blocks_to_markdown( $blocks, $post_object );
			$markdown = trim( $markdown );
			// Match WordPress's the_content handling of legacy same-site HTTP URLs.
			return wp_replace_insecure_home_url( $markdown );
		} catch ( \Throwable $error ) {
			$failure = new WP_Error( 'content_for_agents_conversion_exception', 'Post conversion failed.', $error );
			Markdown_Conversion_Logger::log( $failure, $post_object->ID );
			return $failure;
		} finally {
			$context?->restore();
		}
	}

	/**
	 * Convert a flat array of parsed blocks to markdown.
	 *
	 * @param array    $blocks   Array of parsed block arrays from parse_blocks().
	 * @param \WP_Post $post     The post being converted.
	 * @return string Markdown content; failed blocks are omitted.
	 */
	public function blocks_to_markdown( array $blocks, \WP_Post $post ): string {
		$parts     = array();
		$converter = new HTML_To_Markdown_Converter();

		foreach ( $blocks as $block ) {
			$block_name = $block['blockName'] ?? null;
			$context    = new Post_Context();
			try {
				// Null blockName = freeform/classic content between blocks.
				if ( null === $block_name ) {
					$trimmed = trim( $block['innerHTML'] ?? '' );
					if ( '' !== $trimmed ) {
						$parts[] = $this->convert_rendered_html( $trimmed, $converter );
					}
					continue;
				}

				// Dispatch to registered block-level markdown callback.
				$callback = Block_Markdown_Registry::get( $block_name );
				if ( $callback ) {
					$this->used_block_callback = true;
					try {
						$block_md = Post_Context::preserve( static fn() => call_user_func( $callback, $block, $post ) );
					} catch ( \Throwable $error ) {
						$block_md = new WP_Error( 'content_for_agents_callback_exception', 'Block callback threw an exception.', $error );
					}

					if ( null !== $block_md && ! is_string( $block_md ) ) {
						$cause = is_wp_error( $block_md ) ? $block_md : new WP_Error( 'content_for_agents_invalid_callback_value', 'Block callback returned a non-string value.' );
						Markdown_Conversion_Logger::log( $cause, $post->ID, $block_name );
						// The HTML renderer owns visibility for the entire failed subtree.
						$block_md = $this->convert_rendered_html( $this->render_block( $block, $post ), $converter );
						if ( '' !== trim( $block_md ) ) {
							$parts[] = $block_md;
						}
						continue;
					}

					/**
					 * Filter markdown output for a specific block type.
					 *
					 * The dynamic portion of the hook name, `$block_name`, is the
					 * fully-qualified block name (e.g. 'my-plugin/chart').
					 *
					 * @param string|null $block_md Markdown produced by the block's callback.
					 * @param array    $block    Parsed block array.
					 * @param \WP_Post $post     The post being converted.
					 */
					$default_md = $block_md;
					try {
						$block_md = Post_Context::preserve(
							static fn() => apply_filters(
								'content_for_agents_block_' . $block_name,
								$block_md,
								$block,
								$post
							)
						);
					} catch ( \Throwable $error ) {
						$block_md = new WP_Error( 'content_for_agents_filter_exception', 'Block Markdown filter threw an exception.', $error );
					}

					if ( null !== $block_md && ! is_string( $block_md ) ) {
						$cause = is_wp_error( $block_md ) ? $block_md : new WP_Error( 'content_for_agents_invalid_filter_value', 'Block Markdown filter returned a non-string value.' );
						Markdown_Conversion_Logger::log( $cause, $post->ID, $block_name );
						$block_md = $default_md;
					}

					if ( null !== $block_md && '' !== trim( $block_md ) ) {
						$parts[] = $block_md;
					}
					continue;
				}

				$inner = $block['innerBlocks'] ?? array();
				if ( ! empty( $inner ) && $this->descendants_require_zipping( $inner ) ) {
					if ( 'core/quote' === $block_name ) {
						$inner_md = $this->zip_inner_content( $block, $post, $converter, true );
						if ( '' !== trim( $inner_md ) ) {
							// Prefix the complete ordered content, including blank lines.
							$inner_md = '> ' . str_replace( "\n", "\n> ", trim( $inner_md ) );
							$inner_md = (string) preg_replace( '/^>[ \t]+$/m', '>', $inner_md );
						}
						if ( '' !== trim( $inner_md ) ) {
							$parts[] = $inner_md;
						}
						continue;
					}

					$separator = 'core/list' === $block_name ? "\n" : "\n\n";
					$zipped_md = $this->zip_inner_content( $block, $post, $converter, false, $separator );
					if ( '' !== trim( $zipped_md ) ) {
						$parts[] = $zipped_md;
					}
					continue;
				}

				if ( 'core/shortcode' === $block_name ) {
					$shortcode = trim( $block['innerHTML'] ?? '' );
					if ( '' !== $shortcode ) {
						$parts[] = $this->convert_rendered_html( $shortcode, $converter, true );
					}
					continue;
				}

				// Default: render block to HTML, then convert to markdown.
				$html = $this->render_block( $block, $post );
				$md   = $this->convert_rendered_html( $html, $converter );
				if ( 'core/embed' === $block_name ) {
					global $wp_embed;
					$embed_url = $block['attrs']['url'] ?? '';
					if ( $wp_embed instanceof \WP_Embed && is_string( $embed_url ) && '' !== $embed_url ) {
						try {
							$resolved_md = $this->convert_rendered_html( $wp_embed->shortcode( array(), $embed_url ), $converter );
						} catch ( \Throwable $error ) {
							Markdown_Conversion_Logger::log( new WP_Error( 'content_for_agents_embed_exception', 'Embed preview failed.', $error ), $post->ID, $block_name );
							$resolved_md = '';
						}
						$resolved_text = trim( $resolved_md );
						if (
						'' !== $resolved_text
						&& ! preg_match( '/^\[Embedded media\]\([^\n]+\)$/', $resolved_text )
						&& ! in_array( $resolved_text, array( $embed_url, '[' . $embed_url . '](' . $embed_url . ')' ), true )
						) {
							$md = $resolved_md;
							if ( preg_match( '~<figcaption\b[^>]*>.*?</figcaption>~is', $html, $caption ) ) {
								$md .= "\n\n" . $this->convert_rendered_html( $caption[0], $converter );
							}
						}
					}
				}
				if ( '' !== trim( $md ) ) {
					$parts[] = $md;
				}
			} catch ( \Throwable $error ) {
				$cause = new WP_Error( 'content_for_agents_block_exception', 'Block conversion threw an exception.', $error );
				Markdown_Conversion_Logger::log( $cause, $post->ID, $block_name ?? 'freeform' );
			} finally {
				$context->restore();
			}
		}

		return implode( "\n\n", $parts );
	}

	/**
	 * Isolate dynamic render callbacks, including those inside rendered parents.
	 *
	 * Keep WordPress's normal parent rendering and visibility decisions. Temporarily
	 * guard only callbacks in this subtree and restore them even if rendering fails.
	 *
	 * @param array    $block Parsed block.
	 * @param \WP_Post $post  Response post.
	 * @return string Rendered HTML.
	 */
	private function render_block( array $block, \WP_Post $post ): string {
		$callbacks = array();
		$pending   = array( $block );
		try {
			while ( $pending ) {
				$current = array_pop( $pending );
				$name    = $current['blockName'] ?? '';
				$type    = \WP_Block_Type_Registry::get_instance()->get_registered( $name );
				if ( $type && $type->is_dynamic() && ! isset( $callbacks[ $name ] ) ) {
					$callback              = $type->render_callback;
					$callbacks[ $name ]    = array( $type, $callback );
					$type->render_callback = function ( ...$args ) use ( $callback, $name, $post ) {
						try {
							return call_user_func_array( $callback, $args );
						} catch ( \Throwable $error ) {
							Markdown_Conversion_Logger::log( new WP_Error( 'content_for_agents_render_exception', 'Dynamic block rendering failed.', $error ), $post->ID, $name );
							return '';
						}
					};
				}
				array_push( $pending, ...( $current['innerBlocks'] ?? array() ) );
			}
			return render_block( $block );
		} finally {
			foreach ( $callbacks as list( $type, $callback ) ) {
				$type->render_callback = $callback;
			}
		}
	}

	/**
	 * Apply WordPress text and shortcode filters before HTML conversion.
	 *
	 * @param string                     $html      Rendered or authored HTML.
	 * @param HTML_To_Markdown_Converter $converter HTML converter.
	 * @param bool                       $literal_if_unresolved Preserve a lone unresolved Shortcode block.
	 * @return string Markdown output.
	 */
	private function convert_rendered_html( string $html, HTML_To_Markdown_Converter $converter, bool $literal_if_unresolved = false ): string {
		return Post_Context::preserve(
			function () use ( $html, $converter, $literal_if_unresolved ): string {
				$linked   = $this->link_unregistered_shortcodes( $html );
				$prepared = capital_P_dangit( wptexturize( $linked ) );
				$rendered = convert_smilies( do_shortcode( $prepared ) );
				if ( $literal_if_unresolved && $linked === $html && $rendered === $prepared ) {
						return $html;
				}
				return $converter->convert( $rendered );
			}
		);
	}

	/**
	 * Link URL-bearing unregistered shortcodes before typography changes their attributes.
	 *
	 * @param string $content HTML or shortcode text.
	 * @return string Resolved HTML.
	 */
	private function link_unregistered_shortcodes( string $content ): string {
		if ( ! str_contains( $content, '[' ) || ! preg_match_all( '/\[(?!\[|\/)([A-Za-z][A-Za-z0-9_-]*)\b/', $content, $found ) ) {
			return $content;
		}
		$unregistered = array_values( array_filter( array_unique( $found[1] ), static fn( string $name ): bool => ! shortcode_exists( $name ) ) );
		if ( empty( $unregistered ) ) {
			return $content;
		}
		return (string) preg_replace_callback(
			'/' . get_shortcode_regex( $unregistered ) . '/s',
			static function ( array $matches ): string {
				if ( '[' === $matches[1] && ']' === $matches[6] ) {
					return $matches[0];
				}
				$attributes = shortcode_parse_atts( $matches[3] );
				$url        = is_array( $attributes ) ? ( $attributes['url'] ?? $attributes[0] ?? '' ) : '';
				$url        = is_string( $url ) ? trim( $url ) : '';
				// esc_url() treats a plain word as a hostname, so require URL syntax first.
				$url = preg_match( '~^(?:[a-z][a-z0-9+.-]*:|/|\?|#|www\.)~i', $url ) ? esc_url( $url ) : '';
				return '' === $url ? $matches[0] : '<a href="' . $url . '">' . esc_html( html_entity_decode( $url, ENT_QUOTES | ENT_HTML5 ) ) . '</a>';
			},
			$content
		);
	}

	/**
	 * Whether any descendant needs custom Markdown handling.
	 *
	 * Detection does not execute callbacks. It inspects registry entries,
	 * then recurses through the parsed block tree.
	 *
	 * @param array $blocks Descendant blocks.
	 * @return bool Whether an innerContent zipper is required.
	 */
	private function descendants_require_zipping( array $blocks ): bool {
		foreach ( $blocks as $block ) {
			$block_name = $block['blockName'] ?? null;
			if ( is_string( $block_name ) && $this->has_custom_markdown_strategy( $block_name ) ) {
				return true;
			}

			if ( $this->descendants_require_zipping( $block['innerBlocks'] ?? array() ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Whether a block has a strategy that replaces or suppresses HTML fallback.
	 *
	 * @param string $block_name Registered block name.
	 * @return bool Whether callback-aware traversal is needed.
	 */
	private function has_custom_markdown_strategy( string $block_name ): bool {
		return 'core/embed' === $block_name || Block_Markdown_Registry::has( $block_name );
	}

	/**
	 * Converts wrapper-owned HTML and child blocks in innerContent order.
	 *
	 * @param array                      $block     Parent block.
	 * @param \WP_Post                   $post      Post being converted.
	 * @param HTML_To_Markdown_Converter $converter        HTML converter.
	 * @param bool                       $quote_fragments  Strip quote/cite wrappers before converting fragments.
	 * @param string                     $separator        Markdown separator between owned fragments and children.
	 * @return string Zipped Markdown.
	 */
	private function zip_inner_content( array $block, \WP_Post $post, HTML_To_Markdown_Converter $converter, bool $quote_fragments = false, string $separator = "\n\n" ): string {
		$parts        = array();
		$inner_blocks = $block['innerBlocks'] ?? array();
		$inner_index  = 0;
		$list_context = 'core/list' === ( $block['blockName'] ?? null )
			? array(
				'ordered' => ! empty( $block['attrs']['ordered'] ),
				'index'   => (int) ( $block['attrs']['start'] ?? 1 ),
			)
			: null;

		foreach ( $block['innerContent'] ?? array() as $fragment ) {
			if ( null === $fragment ) {
				if ( isset( $inner_blocks[ $inner_index ] ) ) {
					$child_md = $this->convert_zipped_child( $inner_blocks[ $inner_index ], $post, $converter, $list_context );
					if ( '' !== trim( $child_md ) ) {
						$parts[] = $child_md;
						if ( null !== $list_context ) {
							++$list_context['index'];
						}
					}
				}
				++$inner_index;
				continue;
			}

			$owned_html = (string) $fragment;
			if ( $quote_fragments ) {
				$owned_html = (string) preg_replace( '/<!--.*?-->/s', '', $owned_html );
				$owned_html = (string) preg_replace( '~</?(?:blockquote|cite)\b(?:[^>"\']|"[^"]*"|\'[^\']*\')*>~i', '', $owned_html );
			}
			try {
				$owned_md = $this->convert_rendered_html( $owned_html, $converter );
			} catch ( \Throwable $error ) {
				Markdown_Conversion_Logger::log( new WP_Error( 'content_for_agents_fragment_exception', 'HTML fragment conversion failed.', $error ), $post->ID, $block['blockName'] ?? 'freeform' );
				continue;
			}
			if ( '' !== trim( $owned_md ) ) {
				$parts[] = $owned_md;
			}
		}

		while ( isset( $inner_blocks[ $inner_index ] ) ) {
			$child_md = $this->convert_zipped_child( $inner_blocks[ $inner_index ], $post, $converter, $list_context );
			if ( '' !== trim( $child_md ) ) {
				$parts[] = $child_md;
				if ( null !== $list_context ) {
					++$list_context['index'];
				}
			}
			++$inner_index;
		}

		return implode( $separator, $parts );
	}

	/**
	 * Convert a child while preserving native list structure around callbacks.
	 *
	 * @param array                      $child     Parsed child block.
	 * @param \WP_Post                   $post      Post being converted.
	 * @param HTML_To_Markdown_Converter $converter HTML converter.
	 * @param array|null                 $list_context Parent list state, if applicable.
	 * @return string Child Markdown.
	 */
	private function convert_zipped_child( array $child, \WP_Post $post, HTML_To_Markdown_Converter $converter, ?array $list_context ): string {
		$is_native_item = null !== $list_context
			&& 'core/list-item' === ( $child['blockName'] ?? null )
			&& ! $this->has_custom_markdown_strategy( 'core/list-item' );

		if ( $is_native_item && ! $this->descendants_require_zipping( $child['innerBlocks'] ?? array() ) ) {
			$tag   = $list_context['ordered'] ? 'ol' : 'ul';
			$start = $list_context['ordered'] ? ' start="' . $list_context['index'] . '"' : '';
			try {
				return $this->convert_rendered_html( '<' . $tag . $start . '>' . $this->render_block( $child, $post ) . '</' . $tag . '>', $converter );
			} catch ( \Throwable $error ) {
				$cause = new WP_Error( 'content_for_agents_render_exception', 'Block rendering threw an exception.', $error );
				Markdown_Conversion_Logger::log( $cause, $post->ID, 'core/list-item' );
				return '';
			}
		}

		$markdown = $this->blocks_to_markdown( array( $child ), $post );
		if ( ! $is_native_item || '' === trim( $markdown ) ) {
			return $markdown;
		}

		$marker   = $list_context['ordered'] ? $list_context['index'] . '. ' : '- ';
		$lines    = explode( "\n", trim( $markdown ) );
		$lines[0] = (string) preg_replace( '/^[-+*]\s+/', '', $lines[0] );
		foreach ( $lines as $index => $line ) {
			if ( 0 < $index && '' !== $line ) {
				$lines[ $index ] = str_repeat( ' ', strlen( $marker ) ) . $line;
			}
		}
		return $marker . implode( "\n", $lines );
	}

	/**
	 * Estimate token count for a string (rough: ~4 chars per token for English).
	 *
	 * @param string $text The text to estimate.
	 * @return int Estimated token count.
	 */
	public static function estimate_tokens( $text ) {
		return (int) ceil( strlen( $text ) / 4 );
	}
}
