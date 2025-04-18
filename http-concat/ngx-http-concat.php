<?php
/*
 * Concatenation script inspired by Nginx's ngx_http_concat and Apache's modconcat modules.
 *
 * It follows the same pattern for enabling the concatenation. It uses two ?, like this:
 * http://example.com/??style1.css,style2.css,foo/style3.css
 *
 * If a third ? is present it's treated as version string. Like this:
 * http://example.com/??style1.css,style2.css,foo/style3.css?v=102234
 *
 * It will also replace the relative paths in CSS files with absolute paths.
 */


require_once( __DIR__ . '/cssmin/cssmin.php' );
require_once( __DIR__ . '/concat-utils.php' );

/* Config */
// Maximum group size is set in WPCOM_Concat_Utils::$concat_max, anything over than that will be spit into multiple groups
$concat_unique = true;
$concat_types = array(
	'css' => 'text/css',
	'js' => 'application/javascript'
);

/* Constants */
// By default determine the document root from this scripts path in the plugins dir (you can hardcode this define)
define( 'CONCAT_FILES_ROOT', substr( dirname( __DIR__ ), 0, strpos( dirname( __DIR__ ), '/wp-content' ) ) );

function concat_http_status_exit( $status ) {
	switch ( $status ) {
		case 200:
			$text = 'OK';
			break;
		case 400:
			$text = 'Bad Request';
			break;
		case 403:
			$text = 'Forbidden';
			break;
		case 404:
			$text = 'Not found';
			break;
		case 500:
			$text = 'Internal Server Error';
			break;
		default:
			$text = '';
	}

	$protocol = $_SERVER['SERVER_PROTOCOL'];
	if ( 'HTTP/1.1' != $protocol && 'HTTP/1.0' != $protocol )
		$protocol = 'HTTP/1.0';

	@header( "$protocol $status $text", true, $status );
	exit();
}

function concat_get_mtype( $file ) {
	global $concat_types;

	$lastdot_pos = strrpos( $file, '.' );
	if ( false === $lastdot_pos )
		return false;

	$ext = substr( $file, $lastdot_pos + 1 );

	return isset( $concat_types[$ext] ) ? $concat_types[$ext] : false;
}

function concat_get_path( $uri ) {
	if ( ! strlen( $uri ) )
		concat_http_status_exit( 400 );

	if ( false !== strpos( $uri, '..' ) || false !== strpos( $uri, "\0" ) )
		concat_http_status_exit( 400 );

	return CONCAT_FILES_ROOT . ( '/' != $uri[0] ? '/' : '' ) . $uri;
}

/* Main() */
if ( !in_array( $_SERVER['REQUEST_METHOD'], array( 'GET', 'HEAD' ) ) )
	concat_http_status_exit( 400 );

// /_static/??/foo/bar.css,/foo1/bar/baz.css?m=293847g
// or
// /_static/??-eJzTT8vP109KLNJLLi7W0QdyDEE8IK4CiVjn2hpZGluYmKcDABRMDPM=
// or url-encoded
// /_static/?%3F%2Ffoo%2Fbar.css%2Cfoo1%2Fbar%2Fbaz.css%3Fm%3D293847g
$args = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_QUERY );
if ( ! $args ) {
	concat_http_status_exit( 400 );
}

$args = rawurldecode( $args );

if ( false === strpos( $args, '?' ) ) {
	concat_http_status_exit( 400 );
}

$args = substr( $args, strpos( $args, '?' ) + 1 );

// /foo/bar.css,/foo1/bar/baz.css?m=293847g
// or
// -eJzTT8vP109KLNJLLi7W0QdyDEE8IK4CiVjn2hpZGluYmKcDABRMDPM=
if ( '-' == $args[0] ) {
	$args = @gzuncompress( base64_decode( substr( $args, 1 ) ) );

	// Invalid data, abort!
	if ( false === $args ) {
		concat_http_status_exit( 400 );
	}
}

// /foo/bar.css,/foo1/bar/baz.css?m=293847g
$version_string_pos = strpos( $args, '?' );
if ( false !== $version_string_pos )
	$args = substr( $args, 0, $version_string_pos );

// /foo/bar.css,/foo1/bar/baz.css
$args = explode( ',', $args );
if ( ! $args )
	concat_http_status_exit( 400 );

// array( '/foo/bar.css', '/foo1/bar/baz.css' )
if ( 0 == count( $args ) || count( $args ) > WPCOM_Concat_Utils::get_concat_max() )
	concat_http_status_exit( 400 );

// If we're in a subdirectory context, use that as the root.
// We can't assume that the root serves the same content as the subdir.
$subdir_path_prefix = '';
$request_path = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
$_static_index = strpos( $request_path, '/_static/' );
if ( $_static_index > 0 ) {
	$subdir_path_prefix = substr( $request_path, 0, $_static_index );
}
unset( $request_path, $_static_index );

$last_modified = 0;
$pre_output = '';
$output = '';

$css_minify = new tubalmartin\CssMin\Minifier;

foreach ( $args as $uri ) {
	$fullpath = concat_get_path( $uri );

	if ( ! file_exists( $fullpath ) )
		concat_http_status_exit( 404 );

	$mime_type = concat_get_mtype( $fullpath );
	if ( ! in_array( $mime_type, $concat_types ) )
		concat_http_status_exit( 400 );

	if ( $concat_unique ) {
		if ( ! isset( $last_mime_type ) )
			$last_mime_type = $mime_type;

		if ( $last_mime_type != $mime_type )
			concat_http_status_exit( 400 );
	}

	$stat = stat( $fullpath );
	if ( false === $stat )
		concat_http_status_exit( 500 );

	if ( $stat['mtime'] > $last_modified )
		$last_modified = $stat['mtime'];

	$buf = file_get_contents( $fullpath );
	if ( false === $buf )
		concat_http_status_exit( 500 );

	if ( 'text/css' == $mime_type ) {
		$dirpath = $subdir_path_prefix . dirname( $uri );

		// url(relative/path/to/file) -> url(/absolute/and/not/relative/path/to/file)
		$buf = WPCOM_Concat_Utils::relative_path_replace( $buf, $dirpath );

		// The @charset rules must be on top of the output
		if ( 0 === strpos( $buf, '@charset' ) ) {
			preg_replace_callback(
				'/(?P<charset_rule>@charset\s+[\'"][^\'"]+[\'"];)/i',
				function ( $match ) {
					global $pre_output;

					if ( 0 === strpos( $pre_output, '@charset' ) )
						return '';

					$pre_output = $match[0] . "\n" . $pre_output;

					return '';
				},
				$buf
			);
		}

		// Move the @import rules on top of the concatenated output.
		// Only @charset rule are allowed before them.
		if ( false !== strpos( $buf, '@import' ) ) {
			$buf = preg_replace_callback(
				'/(?P<pre_path>@import\b\s{0,}(?:url\s*\()?[\'"\s]*)(?P<path>[^\'"\s](?:https?:\/\/.+\/?)?.+?)(?P<post_path>[\'"\s\)]*(?:\W|screen|print|all);)/i',
				function ( $match ) use ( $dirpath ) {
					global $pre_output;

					if ( 0 !== strpos( $match['path'], 'http' ) && '/' != $match['path'][0] )
						$pre_output .= $match['pre_path'] . ( $dirpath == '/' ? '/' : $dirpath . '/' ) .
							$match['path'] . $match['post_path'] . "\n";
					else
						$pre_output .= $match[0] . "\n";

					return '';
				},
				$buf
			);
		}

		$buf = $css_minify->run( $buf );
	}

	if ( 'application/javascript' == $mime_type )
		$output .= "$buf;\n";
	else
		$output .= "$buf";
}

header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT' );
header( 'Content-Length: ' . ( strlen( $pre_output ) + strlen( $output ) ) );
header( "Content-Type: $mime_type" );

echo $pre_output . $output;
