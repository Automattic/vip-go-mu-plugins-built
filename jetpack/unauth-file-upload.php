<?php
/**
 * Unauthenticated File Upload Helper Functions.
 *
 * @package automattic/jetpack
 */

namespace Automattic\Jetpack\UnauthFileUpload;

add_action( 'wp_ajax_jetpack_unauth_file_download', __NAMESPACE__ . '\handle_file_download' );
add_filter( 'jetpack_unauth_file_upload_get_file', __NAMESPACE__ . '\get_file_content', 10, 2 );
add_filter( 'jetpack_unauth_file_download_url', __NAMESPACE__ . '\filter_get_download_url', 10, 2 );

/**
 * Get the file download URL filter callback.
 *
 * @param string $url The file download URL.
 * @param int    $file_id The file ID.
 *
 * @return string The file download URL.
 */
function filter_get_download_url( $url, $file_id ) {
	$nonce = wp_create_nonce( 'jetpack_unauth_file_download_nonce_' . $file_id );
	return add_query_arg(
		array(
			'action'   => 'jetpack_unauth_file_download',
			'file_id'  => $file_id,
			'_wpnonce' => $nonce,
		),
		admin_url( 'admin-ajax.php' )
	);
}

/**
 * Handle file download requests from the admin page.
 *
 * @return never This method never returns as it exits directly
 */
function handle_file_download() {
	/**
	 * Check if the file is availabe for download.
	 *
	 * @since 14.6
	 *
	 * @param array $data The script data.
	 */
	$blocks_variation = apply_filters( 'jetpack_blocks_variation', \Automattic\Jetpack\Constants::get_constant( 'JETPACK_BLOCKS_VARIATION' ) );

	if ( apply_filters( 'jetpack_unauth_file_download_available', $blocks_variation !== 'beta' ) ) {
		wp_die( esc_html__( 'File download is not available.', 'jetpack' ) );
	}

	if ( ! current_user_can( 'edit_pages' ) ) {
		wp_die( esc_html__( 'Sorry, you are not allowed to access this page.', 'jetpack' ) );
	}

	$file_id = isset( $_GET['file_id'] ) ? absint( wp_unslash( $_GET['file_id'] ) ) : 0;

	if ( ! $file_id ) {
		wp_die( esc_html__( 'Invalid file request.', 'jetpack' ) );
	}

	if (
		! isset( $_GET['_wpnonce'] ) ||
		! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'jetpack_unauth_file_download_nonce_' . $file_id ) ) {
		wp_die( esc_html__( 'Invalid nonce.', 'jetpack' ) );
	}

	/**
	 * Get the file content that we send to the user to download.
	 *
	 * @since 14.6
	 *
	 * @param array $file_content The file content.
	 * @param string $file_id The file ID.
	 *
	 * @return array|\WP_Error The file array, containing the content, name and type.
	 */
	$file = apply_filters( 'jetpack_unauth_file_upload_get_file', array(), $file_id );

	if ( is_wp_error( $file ) || empty( $file ) ) {
		wp_die( esc_html__( 'Error retrieving file content.', 'jetpack' ) );
	}

	// Clean output buffer
	if ( ob_get_length() ) {
		ob_clean();
	}
	// Set headers for download
	header( 'Content-Type: ' . $file['type'] );
	// Forcing the file to be downloaded is important to prevent XSS attacks.
	header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $file['name'] ) . '"' );
	header( 'Content-Length: ' . strlen( $file['content'] ) );
	header( 'Content-Transfer-Encoding: binary' );
	header( 'Cache-Control: no-cache, must-revalidate, max-age=0' );
	header( 'Pragma: no-cache' );
	header( 'Expires: 0' );

	// Output file content and exit
	echo $file['content']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Binary file data
	exit;
}

/**
 * Get the file content.
 *
 * @param array   $file_content The file content, name and type.
 * @param integer $file_id The file ID.
 * @return array|\WP_Error The file content, name and type
 */
function get_file_content( $file_content, $file_id ) {
	if ( ( new \Automattic\Jetpack\Status\Host() )->is_wpcom_simple() ) {
		return $file_content;
	}

	$blog_id     = \Jetpack_Options::get_option( 'id' );
	$request_url = sprintf( '/sites/%d/unauth-file-upload/%s', $blog_id, $file_id );

	$response = \Automattic\Jetpack\Connection\Client::wpcom_json_api_request_as_blog(
		$request_url,
		'v2',
		array(
			'method' => 'GET',
		),
		null,
		'wpcom'
	);

	$file_content = wp_remote_retrieve_body( $response );

	if ( is_wp_error( $response ) || empty( $file_content ) ) {
		return new \WP_Error( 'jetpack_unauth_file_upload_error', esc_html__( 'Error retrieving file content.', 'jetpack' ) );
	}

	try {
		$content = json_decode( $file_content, true, 3, defined( 'JSON_THROW_ON_ERROR' ) ? \JSON_THROW_ON_ERROR : 0 ); // phpcs:ignore PHPCompatibility.Constants.NewConstants.json_throw_on_errorFound
		if ( isset( $content['message'] ) ) {
			return new \WP_Error( 'jetpack_unauth_file_upload_error', esc_html__( 'Error retrieving file content.', 'jetpack' ) );
		}
	} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
		// If the file is not JSON, we assume it's a binary file.
	}

	$content_disposition = wp_remote_retrieve_header( $response, 'content-disposition' );
	$filename            = '';
	if ( $content_disposition ) {
		// Match the filename using a regular expression
		if ( preg_match( '/filename="([^"]+)"/', $content_disposition, $matches ) ) {
			$filename = $matches[1]; // Extract the filename
		}
	}

	$type = wp_remote_retrieve_header( $response, 'content-type' );
	if ( empty( $type ) ) {
		$type = 'application/octet-stream'; // Default to binary if no content type is found
	}

	return array(
		'content' => $file_content,
		'type'    => $type,
		'name'    => $filename,
	);
}
