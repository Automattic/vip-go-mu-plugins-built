<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\PatternEditor;

defined( 'ABSPATH' ) || exit();

class PatternEditor {
	public static string $block_type_meta_key = '_remote_data_blocks_block_type';

	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_meta' ], 10, 0 );
		add_action( 'enqueue_block_editor_assets', [ __CLASS__, 'enqueue_block_editor_assets' ], 10, 0 );
	}

	public static function register_meta(): void {
		register_post_meta( 'wp_block', self::$block_type_meta_key, [
			'auth_callback' => function ( bool $_allowed, string $meta_key, int $object_id ) {
				return current_user_can( 'edit_post_meta', $object_id );
			},
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
		] );
	}

	public static function enqueue_block_editor_assets(): void {
		$asset_file = REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/pattern-editor/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			wp_die( 'The settings asset file is missing. Run `npm run build` to generate it.' );
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'remote-data-blocks-pattern-editor',
			plugins_url( 'build/pattern-editor/index.js', REMOTE_DATA_BLOCKS__PLUGIN_ROOT ),
			$asset['dependencies'],
			$asset['version'],
			[
				'in_footer' => true,
			]
		);
	}
}
