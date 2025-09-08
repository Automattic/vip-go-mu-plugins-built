<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\BlockManagement;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Editor\Assets\Assets;
use RemoteDataBlocks\Telemetry\Telemetry;
use RemoteDataBlocks\Editor\BlockPatterns\BlockPatterns;
use RemoteDataBlocks\REST\RemoteDataController;
use function register_block_type;

class BlockRegistration {
	/**
	 * @var array<string, string>
	 */
	public static array $block_category = [
		'icon' => null,
		'slug' => 'remote-data-blocks',
		'title' => 'Remote Data Blocks',
	];

	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_helper_blocks' ], 10, 0 );
		add_action( 'init', [ __CLASS__, 'register_container_blocks' ], 50, 0 );
		add_action( 'enqueue_block_editor_assets', [ __CLASS__, 'enqueue_block_assets' ], 10, 0 );
		add_filter( 'block_categories_all', [ __CLASS__, 'add_block_category' ], 10, 1 );
	}

	public static function add_block_category( array $block_categories ): array {
		array_push( $block_categories, self::$block_category );

		return $block_categories;
	}

	/**
	 * Register scripts so that they will be available for our registered blocks
	 * and settings pages.
	 */
	public static function enqueue_block_assets(): void {
		Assets::enqueue_build_asset( 'remote-data-blocks-dataviews', 'dataviews' );
		Assets::enqueue_build_asset( 'remote-data-blocks-block-editor', 'block-editor', [ 'remote-data-blocks-dataviews' ] );
	}

	public static function register_helper_blocks(): void {
		// Remote data HTML block - used to render HTML content in the absence of a proper binding.
		register_block_type( REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/blocks/remote-html' );

		// Remote data pagination block - used to render pagination links for collections.
		register_block_type( REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/blocks/remote-data-pagination' );

		// Remote data error fallback block - used to render a message when results aren't available to load.
		// This registers the empty results block, with a variation for when there is an error.
		register_block_type( REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/blocks/remote-data-no-results' );

		// Remote data template - used to render remote data collections.
		register_block_type( REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/blocks/remote-data-template' );
	}

	public static function register_container_blocks(): void {
		$all_remote_block_configs = [];
		$scripts_to_localize = [];

		foreach ( ConfigStore::get_block_configurations() as $block_configuration ) {
			$block_name = $block_configuration['name'];

			[ $config, $script_handle ] = self::register_block_configuration( $block_configuration );
			$all_remote_block_configs[ $block_name ] = $config;
			$scripts_to_localize[] = $script_handle;
		}

		foreach ( array_unique( $scripts_to_localize ) as $script_handle ) {
			wp_localize_script( $script_handle, 'REMOTE_DATA_BLOCKS', [
				'config' => $all_remote_block_configs,
				'rest_url' => RemoteDataController::get_url(),
				'tracks_global_properties' => Telemetry::get_global_properties(),
			] );
		}
	}

	public static function register_block_configuration( array $config ): array {
		$block_name = $config['name'];
		$block_path = REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/blocks/remote-data-container';

		// Set available bindings from the display query output mappings.
		$available_bindings = [];
		$output_schema = $config['queries'][ ConfigRegistry::DISPLAY_QUERY_KEY ]->get_output_schema();
		foreach ( $output_schema['type'] ?? [] as $key => $mapping ) {
			$available_bindings[ $key ] = [
				'name' => $mapping['name'],
				'type' => $mapping['type'],
			];
		}

		// Create the localized data that will be used by our block editor script.
		$block_config = [
			'availableBindings' => $available_bindings,
			'availableOverrides' => $config['overrides'] ?? [],
			'instructions' => $config['instructions'],
			'name' => $block_name,
			'dataSourceType' => ConfigStore::get_data_source_type( $block_name ),
			'patterns' => $config['patterns'],
			'selectors' => $config['selectors'],
			'settings' => [
				'category' => self::$block_category['slug'],
				'icon' => $config['icon'] ?? 'cloud',
				'title' => $config['title'],
			],
		];

		$block_options = [
			'name' => $block_name,
			'title' => $config['title'],
		];

		$block_type = register_block_type( $block_path, $block_options );

		$script_handle = $block_type->editor_script_handles[0] ?? '';

		// Register a default pattern that simply displays the available data.
		$default_pattern_name = BlockPatterns::register_default_block_pattern( $block_name, $config['title'], $config['queries'][ ConfigRegistry::DISPLAY_QUERY_KEY ] );
		$block_config['patterns']['default'] = $default_pattern_name;

		return [ $block_config, $script_handle ];
	}
}
