<?php declare(strict_types = 1);

/**
 * Remote Data Blocks API
 *
 * This file contains functions, in the global namespace, for registering and
 * interacting with Remote Data Blocks.
 */

use RemoteDataBlocks\Editor\BlockManagement\ConfigRegistry;

/**
 * Register a remote data block.
 *
 * @param array<string, mixed> $block_config The block configuration.
 */
function register_remote_data_block( array $block_config ): bool|WP_Error {
	return ConfigRegistry::register_block( $block_config );
}
