<?php
/**
 * Validates local file paths before they are read as WordPress uploads.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * Uploads path guard.
 */
final class UploadsPathGuard {

	/**
	 * Require a file path to resolve inside the WordPress uploads directory.
	 *
	 * @param string $file_path Full path to the file.
	 * @return true|WP_Error True when trusted, otherwise an error.
	 */
	public static function validate( string $file_path ): true|WP_Error {
		$upload_dir = wp_get_upload_dir();
		$basedir    = ! empty( $upload_dir['basedir'] ) ? realpath( $upload_dir['basedir'] ) : false;
		$real       = realpath( $file_path );

		if ( false === $real || false === $basedir || ! str_starts_with( $real, $basedir . DIRECTORY_SEPARATOR ) ) {
			return new WP_Error(
				'invalid_file_path',
				__( 'The file is outside the uploads directory.', 'vip-workflows' )
			);
		}

		return true;
	}
}
