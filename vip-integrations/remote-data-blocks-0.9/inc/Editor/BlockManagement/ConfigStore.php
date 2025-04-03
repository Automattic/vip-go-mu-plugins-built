<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\BlockManagement;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Config\Query\QueryInterface;
use RemoteDataBlocks\Logging\LoggerManager;
use Psr\Log\LoggerInterface;

use function sanitize_title_with_dashes;

class ConfigStore {
	/**
	 * @var array<string, array<string, mixed>>
	 */
	private static array $blocks = [];

	private static LoggerInterface $logger;

	public static function init( ?LoggerInterface $logger = null ): void {
		self::$blocks = [];
		self::$logger = $logger ?? LoggerManager::instance();
	}

	/**
	 * Convert a block title to a block name. Mainly this is to reduce the burden
	 * of configuration and to ensure that block names are unique (since block
	 * titles must be unique).
	 */
	public static function get_block_name( string $block_title ): string {
		return 'remote-data-blocks/' . sanitize_title_with_dashes( $block_title );
	}

	/**
	 * Get the configuration for a block.
	 */
	public static function get_block_configurations(): array {
		return self::$blocks;
	}

	/**
	 * Get the configuration for a block.
	 */
	public static function get_block_configuration( string $block_name ): ?array {
		if ( ! self::is_registered_block( $block_name ) ) {
			self::$logger->error( sprintf( 'Block %s has not been registered', $block_name ) );
			return null;
		}

		return self::$blocks[ $block_name ];
	}

	/**
	 * Set or update the configuration for a block.
	 */
	public static function set_block_configuration( string $block_name, array $config ): void {
		// @TODO: Validate config shape.
		self::$blocks[ $block_name ] = $config;
	}

	/**
	 * Check if a block is registered.
	 */
	public static function is_registered_block( string $block_name ): bool {
		return isset( self::$blocks[ $block_name ] );
	}

	/**
	 * Get data source type from block name.
	 *
	 * @param string $block_name Name of the block.
	 */
	public static function get_data_source_type( string $block_name ): ?string {
		$config = self::get_block_configuration( $block_name );
		if ( ! $config ) {
			return null;
		}

		$query = $config['queries'][ ConfigRegistry::DISPLAY_QUERY_KEY ] ?? null;
		if ( ! ( $query instanceof QueryInterface ) ) {
			return null;
		}

		return $query->get_data_source()->get_service_name();
	}

	/**
	 * Return an unprivileged representation of the data sources that can be
	 * displayed in settings screens.
	 *
	 * @return array<array<string, string>> Data source properties for UI display.
	 */
	public static function get_data_sources_as_array(): array {
		$data_sources = [];

		foreach ( self::$blocks as $config ) {
			foreach ( $config['queries'] as $query ) {
				$data_source = $query->get_data_source();
				$data_sources[] = $data_source->to_array();
			}
		}

		return $data_sources;
	}
}
