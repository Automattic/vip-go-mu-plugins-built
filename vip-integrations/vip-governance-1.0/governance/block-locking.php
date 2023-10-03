<?php
/**
 * Block Locking
 * 
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || die();

/**
 * Block Locking class that's used to disable block locking and code editing
 */
class BlockLocking {
	/**
	 * Initialize the class
	 *
	 * @param array $allowed_features Features that are allowed from the governance rules.
	 * @return void
	 * 
	 * @access private
	 */
	public static function init( $allowed_features ) {
		$allow_lock_blocks = false;
		$allow_code_editor = false;

		if ( in_array( 'lockBlocks', $allowed_features ) ) {
			$allow_lock_blocks = true;
		}

		if ( in_array( 'codeEditor', $allowed_features ) ) {
			$allow_code_editor = true;
		}

		// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		add_filter( 'block_editor_settings_all', function ( $settings, $context ) use ( $allow_lock_blocks, $allow_code_editor ) {
			if ( false === $allow_lock_blocks ) {
				// Disable locking and unlocking blocks.
				$settings['canLockBlocks'] = false;
			}

			if ( false === $allow_code_editor ) {
				// Disable switching to code editing mode.
				$settings['codeEditingEnabled'] = false;
			}

			return $settings;
		}, 10, 2 );
	}
}
