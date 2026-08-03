<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use Spatie\Mjml\Mjml;

// Get all .mjml files in the directory
$script_dir = __DIR__;
$files      = glob( $script_dir . '/*.mjml' );

$failed = 0;
foreach ( $files as $file ) {
	if ( ! mjml_to_html( $file ) ) {
		++$failed;
	}
}

// Exit non-zero so the calling build script can tell a failed build from a
// successful one, rather than reporting success over unwritten templates.
if ( $failed > 0 ) {
	// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_fwrite
	fwrite( STDERR, sprintf( "%d of %d template(s) failed to convert.\n", $failed, count( $files ) ) );
	exit( 1 );
}

function mjml_to_html( $file_path ): bool {
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
		return false !== file_put_contents( $html_file_path, $html );
	}

	// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_fwrite
	fwrite( STDERR, sprintf( "MJML could not convert %s.\n", basename( $file_path ) ) );

	return false;
}
