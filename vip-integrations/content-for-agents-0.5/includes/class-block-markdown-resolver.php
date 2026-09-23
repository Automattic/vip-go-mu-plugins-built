<?php
/**
 * Block Markdown Resolver.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

use WP_Block_Type_Registry;

/**
 * Resolves block-level markdown behavior from block metadata.
 *
 * Supported block.json metadata contract:
 * - contentForAgents.callback: callable string (e.g. Namespace\\Class::method)
 * - contentForAgents.mode: html-fallback|strip|children-only
 *
 * @package Content_For_Agents
 */
class Block_Markdown_Resolver {

	/**
	 * Inject block markdown metadata into supports so it survives registration.
	 *
	 * @param array $metadata Raw block metadata.
	 * @return array
	 */
	public static function inject_metadata_into_supports( array $metadata ): array {
		if ( empty( $metadata['contentForAgents'] ) || ! is_array( $metadata['contentForAgents'] ) ) {
			return $metadata;
		}

		if ( ! isset( $metadata['supports'] ) || ! is_array( $metadata['supports'] ) ) {
			$metadata['supports'] = array();
		}

		$metadata['supports']['contentForAgents'] = $metadata['contentForAgents'];

		return $metadata;
	}

	/**
	 * Get markdown config for a registered block.
	 *
	 * @param string $block_name Block name.
	 * @return array|null
	 */
	public static function get_block_config( string $block_name ): ?array {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block_name );
		if ( ! $block_type || ! isset( $block_type->supports ) || ! is_array( $block_type->supports ) ) {
			return null;
		}

		$config = $block_type->supports['contentForAgents'] ?? null;
		if ( ! is_array( $config ) ) {
			return null;
		}

		return $config;
	}

	/**
	 * Resolve a block's markdown handling strategy from block metadata.
	 *
	 * @param string   $block_name Block name.
	 * @param array    $block      Parsed block array.
	 * @param \WP_Post $post       Post being converted.
	 * @return array{handled:bool,recurse:bool,markdown:string}
	 */
	public static function resolve_strategy( string $block_name, array $block, \WP_Post $post ): array {
		$config = self::get_block_config( $block_name );
		if ( null === $config ) {
			return array(
				'handled'  => false,
				'recurse'  => false,
				'markdown' => '',
			);
		}

		$mode = isset( $config['mode'] ) ? sanitize_key( (string) $config['mode'] ) : 'html-fallback';
		if ( 'strip' === $mode ) {
			return array(
				'handled'  => true,
				'recurse'  => false,
				'markdown' => '',
			);
		}

		if ( 'children-only' === $mode ) {
			return array(
				'handled'  => true,
				'recurse'  => true,
				'markdown' => '',
			);
		}

		$callback = $config['callback'] ?? null;
		if ( is_string( $callback ) && is_callable( $callback ) ) {
			return array(
				'handled'  => true,
				'recurse'  => false,
				'markdown' => (string) call_user_func( $callback, $block, $post ),
			);
		}

		return array(
			'handled'  => false,
			'recurse'  => false,
			'markdown' => '',
		);
	}
}
