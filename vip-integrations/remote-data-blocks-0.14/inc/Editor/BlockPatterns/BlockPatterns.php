<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\BlockPatterns;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Config\Query\QueryInterface;
use RemoteDataBlocks\Editor\DataBinding\BlockBindings;

use function register_block_pattern;
use function wp_json_encode;

class BlockPatterns {
	/**
	 * @var array<string, string>
	 */
	private static array $templates = [];

	private static function load_templates(): void {
		if ( ! empty( self::$templates ) ) {
			return;
		}

		self::$templates['columns'] = file_get_contents( __DIR__ . '/templates/columns.html', false );
		self::$templates['empty'] = file_get_contents( __DIR__ . '/templates/empty.html', false );
		self::$templates['heading'] = file_get_contents( __DIR__ . '/templates/heading.html', false );
		self::$templates['image'] = file_get_contents( __DIR__ . '/templates/image.html', false );
		self::$templates['paragraph'] = file_get_contents( __DIR__ . '/templates/paragraph.html', false );
		self::$templates['html'] = file_get_contents( __DIR__ . '/templates/html.html', false );
	}

	private static function generate_attribute_bindings( string $block_name, array $bindings ): array {
		$attributes = [
			'metadata' => [
				'bindings' => [],
			],
		];

		foreach ( $bindings as $attribute => $binding ) {
			if ( null === $binding || ! is_array( $binding ) || count( $binding ) !== 2 ) {
				continue;
			}

			$attributes['metadata']['bindings'][ $attribute ] = [
				'source' => BlockBindings::$binding_source,
				'args' => [
					'block' => $block_name,
					'field' => $binding[0],
				],
			];

			// TODO: Create a name that reflects multiple bindings (e.g., "image URL + image alt").
			$attributes['metadata']['name'] = $binding[1];
		}

		return $attributes;
	}

	private static function populate_template( string $template_name, array $attributes ): string {
		if ( ! isset( self::$templates[ $template_name ] ) ) {
			return '';
		}

		return sprintf( self::$templates[ $template_name ], wp_json_encode( $attributes ) );
	}

	/**
	 * Register a default block pattern for a remote data block that can be used
	 * even when no other patterns are available (e.g., in the item list view).
	 *
	 * @param string $block_name The block name.
	 * @param string $block_title The block title.
	 * @param QueryInterface $display_query The display query.
	 * @return string The registered pattern name.
	 */
	public static function register_default_block_pattern( string $block_name, string $block_title, QueryInterface $display_query ): string {
		self::load_templates();

		// Loop through output variables and generate a pattern. Each text field will
		// result in a paragraph block. If a field name looks like a title, target a
		// single heading block. If a field is an image URL, target a single image block.

		$bindings = [
			'heading' => [
				'content' => null,
			],
			'image' => [
				'alt' => null,
				'url' => null,
			],
			'paragraphs' => [],
			'htmls' => [],
		];

		$output_schema = $display_query->get_output_schema();

		foreach ( $output_schema['type'] as $field => $var ) {
			$name = isset( $var['name'] ) ? $var['name'] : $field;

			// The types handled here should align with the constants defined in
			// src/blocks/remote-data-container/config/constants.ts
			switch ( $var['type'] ) {
				case 'email_address':
				case 'integer':
				case 'markdown':
				case 'number':
				case 'string':
					// Attempt to autodetect headings.
					$normalized_name = trim( strtolower( $name ) );
					$heading_names = [ 'head', 'header', 'heading', 'name', 'title' ];
					if ( null === $bindings['heading']['content'] && in_array( $normalized_name, $heading_names, true ) ) {
						$bindings['heading']['content'] = [ $field, $name ];
						break;
					}
					
					$bindings['paragraphs'][] = [
						'content' => [ $field, $name ],
					];
					break;

				case 'title':
					$bindings['heading']['content'] = [ $field, $name ];
					break;

				case 'image_alt':
					$bindings['images']['alt'][] = [ $field, $name ];
					break;

				case 'image_url':
					$bindings['images']['url'][] = [ $field, $name ];
					break;

				case 'html':
					$bindings['htmls'][] = [
						'content' => [ $field, $name ],
					];
			}
		}

		$content = '';

		// If there is no heading, use the first paragraph.
		if ( empty( $bindings['heading']['content'] ) && ! empty( $bindings['paragraphs'] ) ) {
			$bindings['heading']['content'] = array_shift( $bindings['paragraphs'] )['content'];
		}

		if ( ! empty( $bindings['heading']['content'] ) ) {
			$content .= self::populate_template( 'heading', self::generate_attribute_bindings( $block_name, $bindings['heading'] ) );
		}

		foreach ( $bindings['paragraphs'] as $paragraph ) {
			$content .= self::populate_template( 'paragraph', self::generate_attribute_bindings( $block_name, $paragraph ) );
		}

		foreach ( $bindings['htmls'] as $html ) {
			$content .= self::populate_template( 'html', self::generate_attribute_bindings( $block_name, $html ) );
		}

		// If there is an image URL, create two-column layout with left-aligned image of the first image provided.
		if ( ! empty( $bindings['images']['url'] ) ) {
			$first_image_bindings = [
				'url' => $bindings['images']['url'][0],
			];

			if ( ! empty( $bindings['images']['alt'] ) ) {
				$first_image_bindings['alt'] = $bindings['images']['alt'][0];
			}

			$image_bindings = self::generate_attribute_bindings( $block_name, $first_image_bindings );
			$image_content = self::populate_template( 'image', $image_bindings );
			$content = sprintf( self::$templates['columns'], $image_content, $content );
		}

		// If the pattern content is still empty (probably because there are no
		// output variables), register a pattern that explains why it is empty.
		if ( empty( $content ) ) {
			$content = self::populate_template( 'empty', [] );
		}

		$pattern_name = sprintf( '%s/pattern', $block_name );

		register_block_pattern(
			$pattern_name,
			[
				'title' => sprintf( '%s Data', $block_title ),
				'blockTypes' => [ $block_name ],
				'categories' => [ 'Remote Data Blocks' ],
				'content' => $content,
				'inserter' => true,
				'source' => 'plugin',
			]
		);

		return $pattern_name;
	}

	/**
	 * Bindings are difficult to hardcode, especially if you want to reuse them
	 * across multiple remote data blocks. Ensure that the block arg is present in
	 * the binding and matches the expected value. The block arg is important,
	 * because it is used to determine "compatibility" between blocks and bindings.
	 *
	 * @param string $block_name     The block name.
	 * @param array  $parsed_blocks  The parsed blocks.
	 * @return array The parsed blocks with the block arg added to the bindings.
	 */
	public static function add_block_arg_to_bindings( string $block_name, array $parsed_blocks ): array {
		return array_map( function ( $parsed_block ) use ( $block_name ) {
			$attributes = $parsed_block['attrs'];

			if ( isset( $attributes['metadata']['bindings'] ) ) {
				foreach ( $attributes['metadata']['bindings'] as $target => $binding ) {
					if ( BlockBindings::$binding_source === $binding['source'] ) {
						$parsed_block['attrs']['metadata']['bindings'][ $target ]['args']['block'] = $block_name;
					}
				}
			}

			if ( isset( $parsed_block['innerBlocks'] ) ) {
				$parsed_block['innerBlocks'] = self::add_block_arg_to_bindings( $block_name, $parsed_block['innerBlocks'] );
			}

			return $parsed_block;
		}, $parsed_blocks );
	}
}
