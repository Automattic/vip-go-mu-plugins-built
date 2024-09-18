<?php
/**
 * Content Parser
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi;

defined( 'ABSPATH' ) || die();

use Throwable;
use WP_Error;
use WP_Block;
use WP_Block_Type_Registry;
use Symfony\Component\DomCrawler\Crawler;
use function apply_filters;
use function do_action;
use function parse_blocks;

/**
 * The content parser that would be used to transform a post into an array of blocks, along with their attributes.
 */
class ContentParser {
	/**
	 * Block registry instance
	 *
	 * @var WP_Block_Type_Registry
	 *
	 * @access private
	 */
	protected $block_registry;
	/**
	 * Post ID
	 *
	 * @var int|null
	 *
	 * @access private
	 */
	protected $post_id = null;
	/**
	 * Warnings that would be returned with the blocks
	 *
	 * @var array
	 *
	 * @access private
	 */
	protected $warnings = [];

	/**
	 * Initialize the ContentParser class.
	 *
	 * @param WP_Block_Type_Registry|null $block_registry the block registry instance.
	 */
	public function __construct( $block_registry = null ) {
		if ( null === $block_registry ) {
			$block_registry = WP_Block_Type_Registry::get_instance();
		}

		$this->block_registry = $block_registry;
	}

	/**
	 * Filter out a block from the blocks output based on:
	 *
	 * - include parameter, if it is set or
	 * - exclude parameter, if it is set or
	 * - whether it is an empty whitespace block
	 *
	 * and finally, based on a filter vip_block_data_api__allow_block
	 *
	 * @param WP_Block $block Current block.
	 * @param array    $filter_options Options to be used for filtering, if any.
	 *
	 * @return bool true, if the block should be included or false otherwise
	 *
	 * @access private
	 */
	protected function should_block_be_included( WP_Block $block, array $filter_options ) {
		$block_name        = $block->name;
		$is_block_included = true;

		// Whitespace blocks are always excluded.
		$is_whitespace_block = null === $block_name && empty( trim( $block->inner_html ) );
		if ( $is_whitespace_block ) {
			return false;
		}

		if ( ! empty( $filter_options['include'] ) ) {
			$is_block_included = in_array( $block_name, $filter_options['include'] );
		} elseif ( ! empty( $filter_options['exclude'] ) ) {
			$is_block_included = ! in_array( $block_name, $filter_options['exclude'] );
		}

		/**
		 * Filter out blocks from the blocks output
		 *
		 * @param bool   $is_block_included True if the block should be included, or false to filter it out.
		 * @param string $block_name    Name of the parsed block, e.g. 'core/paragraph'.
		 * @param array  $block         Result of parse_blocks() for this block.
		 *                              Contains 'blockName', 'attrs', 'innerHTML', and 'innerBlocks' keys.
		 */
		return apply_filters( 'vip_block_data_api__allow_block', $is_block_included, $block_name, $block->parsed_block );
	}

	/**
	 * Parses a post's content and returns an array of blocks with their attributes and inner blocks.
	 *
	 * @global WP_Post $post
	 *
	 * @param string   $post_content HTML content of a post.
	 * @param int|null $post_id ID of the post being parsed. Required for blocks containing meta-sourced attributes and some block filters.
	 * @param array    $filter_options An associative array of options for filtering blocks. Can contain keys:
	 *                 'exclude': An array of block names to block from the response.
	 *                 'include': An array of block names that are allowed in the response.
	 *
	 * @return array|WP_Error
	 */
	public function parse( $post_content, $post_id = null, $filter_options = [] ) {
		global $post;

		Analytics::record_usage();

		if ( isset( $filter_options['exclude'] ) && isset( $filter_options['include'] ) ) {
			return new WP_Error( 'vip-block-data-api-invalid-params', 'Cannot provide blocks to exclude and include at the same time', [ 'status' => 400 ] );
		}

		// Temporarily set global $post. This is necessary to provide the built-in
		// 'postId' and 'postType' contexts within synced patterns, which can be
		// consumed by block bindings inside those patterns.
		//
		// https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/blocks.php#L2025-L2035
		//
		// For blocks outside of synced patterns, we provide this context ourselves
		// in the render_parsed_block() method of this class, but synced patterns
		// are essentially mini-block-tree islands that are rendered in isolation
		// via `do_blocks`.
		//
		// See also: SyncedPatternsTest::test_multiple_nested_synced_patterns_with_block_bindings()
		$previous_global_post = $post;
		if ( is_int( $post_id ) ) {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$post          = get_post( $post_id );
			$this->post_id = $post_id;
		}

		$this->warnings = [];

		$has_blocks = has_blocks( $post_content );

		if ( ! $has_blocks ) {
			$error_message = join(' ', [
				sprintf( 'Error parsing post ID %d: This post does not appear to contain block content.', $post_id ),
				'The VIP Block Data API is designed to parse Gutenberg blocks and can not read classic editor content.',
			] );

			return new WP_Error( 'vip-block-data-api-no-blocks', $error_message, [ 'status' => 400 ] );
		}

		$parsing_error = false;

		try {
			/**
			 * Filters content before parsing blocks in a post.
			 *
			 * @param string $post_content The content of the post being parsed.
			 * @param int $post_id Post ID associated with the content.
			 */
			$post_content = apply_filters( 'vip_block_data_api__before_parse_post_content', $post_content, $post_id );

			$blocks = parse_blocks( $post_content );

			/**
			 * Fires before blocks are rendered, allowing code to hook into the block rendering process.
			 *
			 * @param array    $blocks  Blocks being rendered.
			 * @param int|null $post_id Post ID associated with the blocks.
			 *
			 * @since 1.4.0
			 */
			do_action( 'vip_block_data_api__before_block_render', $blocks, $post_id );

			$sourced_blocks = array_map( function ( $block ) use ( $filter_options ) {
				// Render the block, then walk the tree using source_block to apply our
				// sourced attribute logic.
				$rendered_block = $this->render_parsed_block( $block );

				return $this->source_block( $rendered_block, $filter_options );
			}, $blocks );

			$sourced_blocks = array_values( array_filter( $sourced_blocks ) );

			/**
			 * Fires after block are rendered, allowing code to hook into the block rendering process.
			 *
			 * @param array    $sourced_blocks Raw render result.
			 * @param int|null $post_id        Post ID associated with the blocks.
			 *
			 * @since 1.4.0
			 */
			do_action( 'vip_block_data_api__after_block_render', $sourced_blocks, $post_id );

			// Restore global $post.
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$post = $previous_global_post;

			$result = [
				'blocks' => $sourced_blocks,
			];

			if ( ! empty( $this->warnings ) ) {
				$result['warnings'] = $this->warnings;
			}

			// Debug output.
			if ( $this->is_debug_enabled() ) {
				$result['debug'] = [
					'blocks_parsed' => $blocks,
					'content'       => $post_content,
				];
			}
		} catch ( Throwable $error ) {
			$parsing_error = $error;
		}

		if ( $parsing_error ) {
			$error_message = sprintf( 'Error parsing post ID %d: %s', $post_id, $parsing_error->getMessage() );
			return new WP_Error( 'vip-block-data-api-parser-error', $error_message, [
				'status'  => 500,
				'details' => $parsing_error->__toString(),
			] );
		} else {
			/**
			 * Filters the API result before returning parsed blocks in a post.
			 *
			 * @param string $result The successful API result, contains 'blocks'
			 * key with an array of block data, and optionally 'warnings' and 'debug' keys.
			 * @param int $post_id Post ID associated with the content.
			 */
			$result = apply_filters( 'vip_block_data_api__after_parse_blocks', $result, $post_id );

			return $result;
		}
	}

	/**
	 * Helper function to render a parsed block, so that we can benefit from
	 * core-powered functions like block bindings and synced patterns.
	 *
	 * This loosely mirrors the code in the `render_block` function in core, but
	 * allows us to capture the block instance so that we can traverse the tree:
	 *
	 * https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/blocks.php#L1959
	 *
	 * @param array $parsed_block Parsed block (result of `parse_blocks`).
	 * @return WP_Block
	 */
	protected function render_parsed_block( array $parsed_block ): WP_Block {
		$context = [];
		if ( is_int( $this->post_id ) ) {
			$context['postId']   = $this->post_id;
			$context['postType'] = get_post_type( $this->post_id );
		}

		$context = apply_filters( 'render_block_context', $context, $parsed_block, null );

		$block_instance = new WP_Block( $parsed_block, $context, $this->block_registry );
		$block_instance->render();

		return $block_instance;
	}

	/**
	 * Processes a single block, and returns the sourced block data.
	 *
	 * @param WP_Block $block          Block to be processed.
	 * @param array    $filter_options Options to filter using, if any.
	 *
	 * @return array|null
	 *
	 * @access private
	 */
	protected function source_block( WP_Block $block, array $filter_options ) {
		$block_name = $block->name;

		if ( ! $this->should_block_be_included( $block, $filter_options ) ) {
			return null;
		}

		if ( ! $this->block_registry->is_registered( $block_name ) ) {
			$this->add_missing_block_warning( $block_name );
		}

		$sourced_block = [
			'name'       => $block->name,
			'attributes' => $this->apply_sourced_attributes( $block ),
		];

		// WP_Block#inner_blocks can be an array or WP_Block_List (iterable).
		if ( is_array( $block->inner_blocks ) ) {
			$inner_blocks = $block->inner_blocks;
		} else {
			$inner_blocks = iterator_to_array( $block->inner_blocks );
		}

		/**
		 * Filters a block's inner blocks before recursive iteration.
		 *
		 * @param array  $inner_blocks An array of inner block (WP_Block) instances.
		 * @param string $block_name   Name of the parsed block, e.g. 'core/paragraph'.
		 * @param int    $post_id      Post ID associated with the parsed block.
		 * @param array  $block        Result of parse_blocks() for this block.
		 */
		$inner_blocks = apply_filters( 'vip_block_data_api__sourced_block_inner_blocks', $inner_blocks, $block_name, $this->post_id, $block->parsed_block );

		// Recursively iterate over inner blocks.
		$sourced_inner_blocks = array_values( array_filter( array_map( function ( $inner_block ) use ( $filter_options ) {
			return $this->source_block( $inner_block, $filter_options );
		}, $inner_blocks ) ) );

		// Only set innerBlocks if entries are present to match prior version behavior.
		if ( ! empty( $sourced_inner_blocks ) ) {
			$sourced_block['innerBlocks'] = $sourced_inner_blocks;
		}

		/**
		 * Filters a block when parsing is complete.
		 *
		 * @param array  $sourced_block An associative array of parsed block data with keys 'name' and 'attribute'.
		 * @param string $block_name    Name of the parsed block, e.g. 'core/paragraph'.
		 * @param int    $post_id       Post ID associated with the parsed block.
		 * @param array  $block         Result of parse_blocks() for this block. Contains 'blockName', 'attrs', 'innerHTML', and 'innerBlocks' keys.
		 */
		$sourced_block = apply_filters( 'vip_block_data_api__sourced_block_result', $sourced_block, $block_name, $this->post_id, $block->parsed_block );

		// If attributes are empty, explicitly use an object to avoid encoding an empty array in JSON.
		if ( empty( $sourced_block['attributes'] ) ) {
			$sourced_block['attributes'] = (object) [];
		}

		return $sourced_block;
	}

	/**
	 * Source the attributes of a block and return a merged attribute array.
	 *
	 * @param WP_Block $block Block to be processed.
	 * @return array Attribute array
	 */
	protected function apply_sourced_attributes( WP_Block $block ): array {
		$block_definition            = $this->block_registry->get_registered( $block->name ) ?? null;
		$block_definition_attributes = $block_definition->attributes ?? [];
		$block_attributes            = $block->attributes;

		foreach ( $block_definition_attributes as $block_attribute_name => $block_attribute_definition ) {
			$attribute_source        = $block_attribute_definition['source'] ?? null;
			$attribute_default_value = $block_attribute_definition['default'] ?? null;

			// If the attribute was resolved from a block binding, skip.
			if ( $this->has_successful_block_binding( $block_attribute_name, $block_attributes, $attribute_default_value ) ) {
				continue;
			}

			if ( null === $attribute_source ) {
				// Unsourced attributes are stored in the block's delimiter attributes, skip DOM parser.

				if ( isset( $block_attributes[ $block_attribute_name ] ) ) {
					// Attribute is already set in the block's delimiter attributes, skip.
					continue;
				} elseif ( null !== $attribute_default_value ) {
					// Attribute is unset and has a default value, use default value.
					$block_attributes[ $block_attribute_name ] = $attribute_default_value;
					continue;
				} else {
					// Attribute is unset and has no default value, skip.
					continue;
				}
			}

			// Specify a manual doctype so that the parser will use the HTML5 parser.
			$crawler = new Crawler( sprintf( '<!doctype html><html><body>%s</body></html>', $block->inner_html ) );

			// Enter the <body> tag for block parsing.
			$crawler = $crawler->filter( 'body' )->children();

			$attribute_value = $this->source_attribute( $crawler, $block_attribute_definition );

			if ( null !== $attribute_value ) {
				$block_attributes[ $block_attribute_name ] = $attribute_value;
			}
		}

		// Sort attributes by key to ensure consistent output.
		ksort( $block_attributes );

		return $block_attributes;
	}

	/**
	 * Inspect the attribute to determine if it was resolved from a block binding.
	 *
	 * @param string $attribute_name Attribute name.
	 * @param array  $attributes     Block attributes.
	 * @param mixed  $default_value  Default value of the attribute.
	 */
	protected function has_successful_block_binding( string $attribute_name, array $attributes, mixed $default_value ): bool {
		// No bindings defined.
		if ( ! isset( $attributes['metadata']['bindings'] ) ) {
			return false;
		}

		$attribute_value = $attributes[ $attribute_name ] ?? null;
		$bindings        = $attributes['metadata']['bindings'];

		// If the attribute is empty or matches the default value, it was not resolved
		// from a block binding.
		if ( empty( $attribute_value ) || $attribute_value === $default_value ) {
			return false;
		}

		return isset( $bindings[ $attribute_name ]['source'] ) || isset( $bindings['__default']['source'] );
	}

	/**
	 * Processes the source attributes of a block.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 *  @return array|string|null
	 *
	 * @access private
	 */
	protected function source_attribute( $crawler, $block_attribute_definition ) {
		$attribute_value         = null;
		$attribute_default_value = $block_attribute_definition['default'] ?? null;
		$attribute_source        = $block_attribute_definition['source'];

		// See block attribute sources:
		// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/#value-source
		if ( 'attribute' === $attribute_source || 'property' === $attribute_source ) {
			// 'property' sources were removed in 2018. Default to attribute value.
			// https://github.com/WordPress/gutenberg/pull/8276

			$attribute_value = $this->source_block_attribute( $crawler, $block_attribute_definition );
		} elseif ( 'rich-text' === $attribute_source ) {
			$attribute_value = $this->source_block_rich_text( $crawler, $block_attribute_definition );
		} elseif ( 'html' === $attribute_source ) {
			// Most 'html' sources were converted to 'rich-text' in WordPress 6.5.
			// https://github.com/WordPress/gutenberg/pull/43204

			$attribute_value = $this->source_block_html( $crawler, $block_attribute_definition );
		} elseif ( 'text' === $attribute_source ) {
			$attribute_value = $this->source_block_text( $crawler, $block_attribute_definition );
		} elseif ( 'tag' === $attribute_source ) {
			$attribute_value = $this->source_block_tag( $crawler, $block_attribute_definition );
		} elseif ( 'raw' === $attribute_source ) {
			$attribute_value = $this->source_block_raw( $crawler );
		} elseif ( 'query' === $attribute_source ) {
			$attribute_value = $this->source_block_query( $crawler, $block_attribute_definition );
		} elseif ( 'meta' === $attribute_source ) {
			$attribute_value = $this->source_block_meta( $block_attribute_definition );
		} elseif ( 'node' === $attribute_source ) {
			$attribute_value = $this->source_block_node( $crawler, $block_attribute_definition );
		} elseif ( 'children' === $attribute_source ) {
			$attribute_value = $this->source_block_children( $crawler, $block_attribute_definition );
		}

		if ( null === $attribute_value ) {
			$attribute_value = $attribute_default_value;
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `attribute` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_attribute( $crawler, $block_attribute_definition ) {
		// 'attribute' sources:
		// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/#attribute-source

		$attribute_value = null;
		$attribute       = $block_attribute_definition['attribute'];
		$selector        = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		if ( $crawler->count() > 0 ) {
			$attribute_value = $crawler->attr( $attribute );
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `html` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_html( $crawler, $block_attribute_definition ) {
		// 'html' sources:
		// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/#html-source

		$attribute_value = null;
		$selector        = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		if ( $crawler->count() > 0 ) {
			$multiline_selector = $block_attribute_definition['multiline'] ?? null;

			if ( null === $multiline_selector ) {
				$attribute_value = $crawler->html();
			} else {
				$multiline_parts = $crawler->filter( $multiline_selector )->each(function ( $node ) {
					return $node->outerHtml();
				});

				$attribute_value = join( '', $multiline_parts );
			}
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `rich-text` source attribute.
	 * At present, the main difference from `html` is that `rich-text` does not support multiline selectors.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_rich_text( $crawler, $block_attribute_definition ) {
		// 'rich-text' sources:
		// https://github.com/WordPress/gutenberg/blob/6a42225124e69276a2deec4597a855bb504b37cc/packages/blocks/src/api/parser/get-block-attributes.js#L228-L232

		$attribute_value = null;
		$selector        = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		if ( $crawler->count() > 0 ) {
			$attribute_value = $crawler->html();
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `text` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_text( $crawler, $block_attribute_definition ) {
		// 'text' sources:
		// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/#text-source

		$attribute_value = null;
		$selector        = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		if ( $crawler->count() > 0 ) {
			$attribute_value = $crawler->text();
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `query` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_query( $crawler, $block_attribute_definition ) {
		// 'query' sources:
		// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/#query-source

		$query_items = $block_attribute_definition['query'];
		$selector    = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		$attribute_values = $crawler->each(function ( $node ) use ( $query_items ) {
			$attribute_value = array_map(function ( $query_item ) use ( $node ) {
				return $this->source_attribute( $node, $query_item );
			}, $query_items);

			// Remove unsourced query values.
			$attribute_value = array_filter( $attribute_value, function ( $value ) {
				return null !== $value;
			});

			return $attribute_value;
		});


		return $attribute_values;
	}

	/**
	 * Helper function to process the `tag` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_tag( $crawler, $block_attribute_definition ) {
		// The only current usage of the 'tag' attribute is Gutenberg core is the 'core/table' block:
		// https://github.com/WordPress/gutenberg/blob/796b800/packages/block-library/src/table/block.json#L39
		// Also see tag attribute parsing in Gutenberg:
		// https://github.com/WordPress/gutenberg/blob/6517008/packages/blocks/src/api/parser/get-block-attributes.js#L225

		$attribute_value = null;
		$selector        = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		if ( $crawler->count() > 0 ) {
			$attribute_value = strtolower( $crawler->nodeName() );
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `raw` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_raw( $crawler ) {
		// The only current usage of the 'raw' attribute in Gutenberg core is the 'core/html' block:
		// https://github.com/WordPress/gutenberg/blob/6517008/packages/block-library/src/html/block.json#L13
		// Also see tag attribute parsing in Gutenberg:
		// https://github.com/WordPress/gutenberg/blob/6517008/packages/blocks/src/api/parser/get-block-attributes.js#L131

		$attribute_value = null;

		if ( $crawler->count() > 0 ) {
			$attribute_value = trim( $crawler->outerHtml() );
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process the `meta` source attribute.
	 *
	 * @param array $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_meta( $block_attribute_definition ) {
		// 'meta' sources:
		// https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/#meta-source

		$post = get_post( $this->post_id );
		if ( null === $post ) {
			return null;
		}

		$meta_key            = $block_attribute_definition['meta'];
		$is_metadata_present = metadata_exists( 'post', $post->ID, $meta_key );

		if ( ! $is_metadata_present ) {
			return null;
		} else {
			return get_post_meta( $post->ID, $meta_key, true );
		}
	}

	/**
	 * Helper function to process the `children` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return array|string|null
	 *
	 * @access private
	 */
	protected function source_block_children( $crawler, $block_attribute_definition ) {
		// 'children' attribute usage was removed from core in 2018, but not officically deprecated until WordPress 6.1:
		// https://github.com/WordPress/gutenberg/pull/44265
		// Parsing code for 'children' sources can be found here:
		// https://github.com/WordPress/gutenberg/blob/dd0504b/packages/blocks/src/api/children.js#L149

		$attribute_values = [];
		$selector         = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		if ( $crawler->count() === 0 ) {
			// If the selector doesn't exist, return a default empty array.
			return $attribute_values;
		}

		$children = $crawler->children();

		if ( $children->count() === 0 ) {
			// 'children' attributes can be a single element. In this case, return the element value in an array.
			$attribute_values = [
				$crawler->getNode( 0 )->nodeValue,
			];
		} else {
			// Use DOMDocument childNodes directly to preserve text nodes. $crawler->children() will return only
			// element nodes and omit text content.
			$children_nodes = $crawler->getNode( 0 )->childNodes;

			foreach ( $children_nodes as $node ) {
				$node_value = $this->from_dom_node( $node );

				if ( $node_value ) {
					$attribute_values[] = $node_value;
				}
			}
		}

		return $attribute_values;
	}

	/**
	 * Helper function to process the `node` source attribute.
	 *
	 * @param Symfony\Component\DomCrawler\Crawler $crawler Crawler instance.
	 * @param array                                $block_attribute_definition Definition of the block attribute.
	 *
	 * @return string|null
	 *
	 * @access private
	 */
	protected function source_block_node( $crawler, $block_attribute_definition ) {
		// 'node' attribute usage was removed from core in 2018, but not officically deprecated until WordPress 6.1:
		// https://github.com/WordPress/gutenberg/pull/44265
		// Parsing code for 'node' sources can be found here:
		// https://github.com/WordPress/gutenberg/blob/dd0504bd34c29b5b2824d82c8d2bb3a8d0f071ec/packages/blocks/src/api/node.js#L125

		$attribute_value = null;
		$selector        = $block_attribute_definition['selector'] ?? null;

		if ( null !== $selector ) {
			$crawler = $crawler->filter( $selector );
		}

		$node       = $crawler->getNode( 0 );
		$node_value = null;

		if ( $node ) {
			$node_value = $this->from_dom_node( $node );
		}

		if ( null !== $node_value ) {
			$attribute_value = $node_value;
		}

		return $attribute_value;
	}

	/**
	 * Helper function to process markup used by the deprecated 'node' and 'children' sources.
	 * These sources can return a representation of the DOM tree and bypass the $crawler to access DOMNodes directly.
	 *
	 * @param \DOMNode $node Node currently being processed.
	 *
	 * @return array|string|null
	 *
	 * @access private
	 */
	protected function from_dom_node( $node ) {
		// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- external API calls

		if ( XML_TEXT_NODE === $node->nodeType ) {
			// For plain text nodes, return the text directly.
			$text = trim( $node->nodeValue );

			// Exclude whitespace-only nodes.
			if ( ! empty( $text ) ) {
				return $text;
			}
		} elseif ( XML_ELEMENT_NODE === $node->nodeType ) {
			$children = array_map( [ $this, 'from_dom_node' ], iterator_to_array( $node->childNodes ) );

			// For element nodes, recurse and return an array of child nodes.
			return [
				'type'     => $node->nodeName,
				'children' => array_filter( $children ),
			];
		} else {
			return null;
		}

		// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	}

	/**
	 * Add a warning to the warnings, if a block is not registered server-side.
	 *
	 * @param string $block_name Name of the block.
	 *
	 * @return void
	 *
	 * @access private
	 */
	protected function add_missing_block_warning( $block_name ) {
		$warning_message = sprintf( 'Block type "%s" is not server-side registered. Sourced block attributes will not be available.', $block_name );

		if ( ! in_array( $warning_message, $this->warnings ) ) {
			$this->warnings[] = $warning_message;
		}
	}

	/**
	 * Check if debug mode is enabled.
	 *
	 * @return bool true if debug is enabled, or false otherwise
	 *
	 * @access private
	 */
	protected function is_debug_enabled() {
		return defined( 'VIP_BLOCK_DATA_API__PARSE_DEBUG' ) && constant( 'VIP_BLOCK_DATA_API__PARSE_DEBUG' ) === true;
	}
}
