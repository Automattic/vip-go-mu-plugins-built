<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use Spatie\Mjml\Mjml;

// Get all .mjml files in the directory
$script_dir = __DIR__;
$files      = glob( $script_dir . '/*.mjml' );

foreach ( $files as $file ) {
	mjml_to_html( $file );
}

function mjml_to_html( $file_path ) { 
	global $script_dir;
	// phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
	$mjml = file_get_contents( $file_path );
	
	// Replace path="./ with full path
	$mjml = str_replace( 'path="./', 'path="' . $script_dir . '/', $mjml );

	if ( Mjml::new()->canConvert( $mjml ) ) {
		$html = Mjml::new()->minify()->toHtml($mjml, [
			'beautify' => true,
			'minify'   => false,
		]);

		// Get base file name
		$file_name = basename( $file_path );
		$file_name = substr( $file_name, 0, strrpos( $file_name, '.' ) );

		// Save the HTML file
		$html_file_path = __DIR__ . '/../templates/' . $file_name . '.html';

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_file_put_contents
		file_put_contents( $html_file_path, $html );
	} else {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( 'MJML could not be converted' );
	}
}
