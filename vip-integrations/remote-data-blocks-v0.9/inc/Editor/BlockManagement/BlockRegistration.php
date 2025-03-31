<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\BlockManagement;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Telemetry\TracksTelemetry;
use RemoteDataBlocks\Editor\BlockPatterns\BlockPatterns;
use RemoteDataBlocks\Editor\DataBinding\BlockBindings;
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
		add_filter( 'block_categories_all', [ __CLASS__, 'add_block_category' ], 10, 1 );
	}

	public static function add_block_category( array $block_categories ): array {
		array_push( $block_categories, self::$block_category );

		return $block_categories;
	}

	public static function register_helper_blocks(): void {
		// Remote data HTML block - used to render HTML content in the absence of a proper binding.
		$remote_data_html_block_path = REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/build/blocks/remote-html';
		register_block_type( $remote_data_html_block_path );
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
				'tracks_global_properties' => TracksTelemetry::get_global_properties(),
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
			'loop' => $config['loop'],
			'name' => $block_name,
			'dataSourceType' => ConfigStore::get_data_source_type( $block_name ),
			'patterns' => $config['patterns'],
			'selectors' => $config['selectors'],
			'settings' => [
				'category' => self::$block_category['slug'],
				'title' => $config['title'],
			],
		];

		$block_options = [
			'name' => $block_name,
			'title' => $config['title'],
		];

		// Loop queries are dynamic blocks that render a list of items using the
		// inner blocks as a template.
		if ( $config['loop'] ) {
			$block_options['render_callback'] = [ BlockBindings::class, 'loop_block_render_callback' ];
		}

		$block_type = register_block_type( $block_path, $block_options );

		$script_handle = $block_type->editor_script_handles[0] ?? '';

		// Register a default pattern that simply displays the available data.
		$default_pattern_name = BlockPatterns::register_default_block_pattern( $block_name, $config['title'], $config['queries'][ ConfigRegistry::DISPLAY_QUERY_KEY ] );
		$block_config['patterns']['default'] = $default_pattern_name;

		return [ $block_config, $script_handle ];
	}
}
