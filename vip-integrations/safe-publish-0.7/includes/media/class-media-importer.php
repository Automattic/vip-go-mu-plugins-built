<?php
/**
 * Media Importer class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Media;

use Safe_Publish\API\HTTP_Client;
use Safe_Publish\API\Request_Actions;
use Safe_Publish\API\Source_Media_REST_Field;
use Safe_Publish\API\Source_Post_Type_Resolver;
use Safe_Publish\Auth\VIP_Safe_Auth;
use Safe_Publish\Media\Media_Logger;
use Safe_Publish\Utils\Options;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Media Importer Class.
 *
 * Handles importing media files from the source site into the WordPress media
 * library.
 */
class Media_Importer {

	/**
	 * HTTP Client instance.
	 *
	 * @var HTTP_Client
	 */
	private HTTP_Client $http_client;

	/**
	 * Logger instance.
	 *
	 * @var Media_Logger
	 */
	private Media_Logger $logger;

	/**
	 * Attachment IDs created during the current import run.
	 *
	 * Only IDs of newly sideloaded attachments are recorded here. Attachments
	 * returned from the deduplication cache are excluded so that a failed
	 * import never deletes media that belongs to a previous successful import.
	 *
	 * @var int[]
	 */
	private array $newly_created_attachment_ids = array();

	/**
	 * Source URL => library metadata applied to the attachment sideloaded from
	 * that URL, keyed by the query-stripped source URL.
	 *
	 * @var array<string, array<string, string>>
	 */
	private array $library_metadata_map = array();

	/**
	 * Constructs the Media_Importer instance.
	 *
	 * @param HTTP_Client $http_client HTTP client for downloading files.
	 */
	public function __construct( HTTP_Client $http_client ) {
		$this->http_client = $http_client;
		$this->logger      = new Media_Logger();
	}

	/**
	 * Imports source media file to WordPress media library.
	 *
	 * @param string   $media_url         Source media URL.
	 * @param string   $source_site_url   Source site URL for resolving relative URLs.
	 * @param bool     $skip_if_not_media Return null (leave the URL unchanged)
	 *                                    instead of false when the download is not
	 *                                    an allowed upload type, for ambiguous URLs
	 *                                    that may be a page link rather than media.
	 * @param int|null $imported_id       Set, by reference, to the destination
	 *                                    attachment ID when a URL is returned; null
	 *                                    otherwise. Meaningful only on a string
	 *                                    return.
	 * @return string|false|null New media URL on success, false on failure, null
	 *                           when the URL belongs to a third-party domain, or
	 *                           when it is not media and $skip_if_not_media is set.
	 */
	public function import_source_media(
		string $media_url,
		string $source_site_url,
		bool $skip_if_not_media = false,
		?int &$imported_id = null
	): string|false|null {
		$imported_id = null;

		// Make URL absolute if it's relative.
		if ( ! filter_var( $media_url, FILTER_VALIDATE_URL ) ) {
			$media_url = rtrim( $source_site_url, '/' ) . '/' . ltrim( $media_url, '/' );
		}

		// Already localized by a previous pass; skip to avoid duplicating it.
		if ( $this->is_local_media_url( $media_url ) ) {
			return null;
		}

		// Skip media that originates from a third-party domain — it is an
		// external resource the source site doesn't own and should not be
		// sideloaded. Return null so callers can distinguish this from a
		// genuine download failure (false).
		$source_domain = wp_parse_url( $source_site_url, PHP_URL_HOST );
		$media_domain  = wp_parse_url( $media_url, PHP_URL_HOST );

		if ( $source_domain !== $media_domain ) {
			return null;
		}

		// Strip query parameters for consistency with import_source_media_as_attachment().
		$media_url = strtok( $media_url, '?' );

		// Check if we already imported this media.
		$existing_attachment = $this->get_attachment_by_url( $media_url );
		if ( $existing_attachment ) {
			$imported_id = $existing_attachment;
			return wp_get_attachment_url( $existing_attachment );
		}

		$this->ensure_media_functions_loaded();

		// Download file.
		$temp_file = download_url( $media_url );

		if ( is_wp_error( $temp_file ) ) {
			$this->logger->media_download_failed(
				$media_url,
				$source_site_url,
				$temp_file->get_error_message()
			);
			return false;
		}

		// Derive a filename whose extension matches the real content, so
		// extensionless URLs still resolve to a valid upload type.
		$basename = sanitize_file_name( (string) pathinfo( $media_url, PATHINFO_BASENAME ) );
		$filename = $this->resolve_media_filename( $temp_file, $basename );

		if ( '' === $filename ) {
			$this->http_client->cleanup_temp_file( $temp_file );

			if ( $skip_if_not_media ) {
				$this->logger->media_left_as_link( $media_url, $source_site_url );
				return null;
			}

			$this->logger->media_unsupported_file_type(
				$media_url,
				$source_site_url,
				(string) pathinfo( $media_url, PATHINFO_EXTENSION )
			);
			return false;
		}

		// For an ambiguous URL, leave it as a link when its content is not the
		// media type its extension implies (e.g. HTML served at a .pdf URL).
		if ( $skip_if_not_media && ! $this->is_media_content( $temp_file, $filename ) ) {
			$this->http_client->cleanup_temp_file( $temp_file );
			$this->logger->media_left_as_link( $media_url, $source_site_url );
			return null;
		}

		// Prepare file array for wp_handle_sideload.
		$file_array = array(
			'name'     => $filename,
			'tmp_name' => $temp_file,
		);

		// Import to media library.
		// Prevent WordPress from potentially degrading the original image quality.
		add_filter(
			'big_image_size_threshold',
			array( $this, 'disable_big_image_scaling' )
		);

		try {
			$attachment_id = media_handle_sideload( $file_array, 0 );
		} finally {
			remove_filter(
				'big_image_size_threshold',
				array( $this, 'disable_big_image_scaling' )
			);
			$this->http_client->cleanup_temp_file( $temp_file );
		}

		if ( is_wp_error( $attachment_id ) ) {
			$this->logger->media_sideload_failed(
				$media_url,
				$source_site_url,
				$attachment_id->get_error_message(),
				'inline'
			);
			return false;
		}

		// Store the original URL as meta for tracking.
		update_post_meta( $attachment_id, Options::META_ORIGINAL_URL, $media_url );
		update_post_meta( $attachment_id, Options::META_IMPORTED_FROM, $source_site_url );

		$this->newly_created_attachment_ids[] = $attachment_id;

		$this->apply_library_metadata(
			$attachment_id,
			$this->library_metadata_map[ $media_url ] ?? array()
		);
		$this->record_source_attachment_parent(
			$attachment_id,
			(int) ( $this->library_metadata_map[ $media_url ]['parent'] ?? 0 )
		);

		$imported_id = $attachment_id;

		return wp_get_attachment_url( $attachment_id );
	}

	/**
	 * Imports source media file to media library and returns attachment ID.
	 *
	 * @param string $media_url         Source media URL.
	 * @param string $source_site_url   Source site URL for resolving relative URLs.
	 * @param bool   $skip_if_not_media Return null (leave the URL unchanged)
	 *                                  instead of false when the download is not
	 *                                  an allowed upload type, for ambiguous URLs
	 *                                  that may be a page link rather than media.
	 * @return int|false|null Attachment ID on success, false on failure, null
	 *                        when the URL belongs to a third-party domain, or
	 *                        when it is not media and $skip_if_not_media is set.
	 */
	public function import_source_media_as_attachment(
		string $media_url,
		string $source_site_url,
		bool $skip_if_not_media = false
	): int|false|null {
		// Make URL absolute if it's relative.
		if ( ! filter_var( $media_url, FILTER_VALIDATE_URL ) ) {
			$media_url = rtrim( $source_site_url, '/' ) . '/' . ltrim( $media_url, '/' );
		}

		// Already localized by a previous pass; skip to avoid duplicating it.
		if ( $this->is_local_media_url( $media_url ) ) {
			return null;
		}

		// Skip media that originates from a third-party domain — it is an
		// external resource the source site doesn't own and should not be
		// sideloaded. Return null so callers can distinguish this from a
		// genuine download failure (false).
		$source_domain = wp_parse_url( $source_site_url, PHP_URL_HOST );
		$media_domain  = wp_parse_url( $media_url, PHP_URL_HOST );

		if ( $source_domain !== $media_domain ) {
			return null;
		}

		return $this->sideload_media(
			$media_url,
			$source_site_url,
			$skip_if_not_media
		);
	}

	/**
	 * Sideloads source media resolved by ID, regardless of serving host.
	 *
	 * A URL resolved from a source media ID is owned, so both the third-party
	 * host guard and the is_local_media_url() already-local check are bypassed:
	 * off-domain media (CDN, files service, Photon) still belongs to the source
	 * and must be sideloaded. Skipping the already-local check can duplicate an
	 * attachment on a same-host re-import — accepted, since running it would
	 * return null and abort the post.
	 *
	 * @param string $media_url       Source media URL.
	 * @param string $source_site_url Source site URL for resolving relative URLs.
	 * @return int|false Attachment ID on success, false on failure.
	 */
	public function import_owned_media_as_attachment(
		string $media_url,
		string $source_site_url
	): int|false {
		// Make URL absolute if it's relative.
		if ( ! filter_var( $media_url, FILTER_VALIDATE_URL ) ) {
			$media_url = rtrim( $source_site_url, '/' ) . '/' . ltrim( $media_url, '/' );
		}

		return $this->sideload_media( $media_url, $source_site_url ) ?? false;
	}

	/**
	 * Downloads a resolved media URL into the library and returns its
	 * attachment ID. Any host or ownership check is the caller's
	 * responsibility.
	 *
	 * @param string $media_url         Absolute source media URL.
	 * @param string $source_site_url   Source site URL, recorded as import origin.
	 * @param bool   $skip_if_not_media Return null instead of false when the
	 *                                  download is not an allowed media type.
	 * @return int|false|null Attachment ID on success, false on failure, null
	 *                        when it is not media and $skip_if_not_media is set.
	 */
	private function sideload_media(
		string $media_url,
		string $source_site_url,
		bool $skip_if_not_media = false
	): int|false|null {
		$media_url = strtok( $media_url, '?' ); // Remove query parameters.

		// Check if we already imported this media.
		$existing_attachment = $this->get_attachment_by_url( $media_url );
		if ( $existing_attachment ) {
			return $existing_attachment;
		}

		$this->ensure_media_functions_loaded();

		// Temporarily enable WebP uploads during import.
		$webp_filter_added = false;
		if ( ! $this->is_webp_supported() ) {
			// phpcs:ignore WordPressVIPMinimum.Hooks.RestrictedHooks.upload_mimes
			add_filter( 'upload_mimes', array( $this, 'add_webp_mime_type' ) );
			$webp_filter_added = true;
		}

		// Also add a filter specifically for media_handle_sideload to bypass restrictions.
		add_filter( 'wp_check_filetype_and_ext', array( $this, 'handle_webp_filetype' ), 10, 3 );

		// Guarantee the upload filters are removed on every exit, including the
		// early returns for a failed download or unsupported file type.
		try {
			return $this->download_and_create_attachment(
				$media_url,
				$source_site_url,
				$skip_if_not_media
			);
		} finally {
			if ( $webp_filter_added ) {
				remove_filter( 'upload_mimes', array( $this, 'add_webp_mime_type' ) );
			}
			remove_filter( 'wp_check_filetype_and_ext', array( $this, 'handle_webp_filetype' ) );
		}
	}

	/**
	 * Downloads a media URL and creates the attachment, assuming the WebP
	 * upload filters are already registered.
	 *
	 * @param string $media_url         Query-stripped source media URL.
	 * @param string $source_site_url   Source site URL, recorded as import origin.
	 * @param bool   $skip_if_not_media Return null instead of false when the
	 *                                  download is not an allowed media type.
	 * @return int|false|null Attachment ID on success, false on failure, null
	 *                        when it is not media and $skip_if_not_media is set.
	 */
	private function download_and_create_attachment(
		string $media_url,
		string $source_site_url,
		bool $skip_if_not_media = false
	): int|false|null {
		$temp_file = $this->http_client->download_file( $media_url );

		if ( is_wp_error( $temp_file ) ) {
			$this->logger->media_download_failed(
				$media_url,
				$source_site_url,
				$temp_file->get_error_message()
			);

			return false;
		}

		// Derive a filename whose extension matches the real content, so
		// extensionless URLs still resolve to a valid upload type.
		$basename = sanitize_file_name( (string) pathinfo( $media_url, PATHINFO_BASENAME ) );
		$filename = $this->resolve_media_filename( $temp_file, $basename );

		if ( '' === $filename ) {
			$this->http_client->cleanup_temp_file( $temp_file );

			if ( $skip_if_not_media ) {
				$this->logger->media_left_as_link( $media_url, $source_site_url );
				return null;
			}

			$this->logger->media_unsupported_file_type(
				$media_url,
				$source_site_url,
				(string) pathinfo( $media_url, PATHINFO_EXTENSION )
			);
			return false;
		}

		// For an ambiguous URL, leave it as a link when its content is not the
		// media type its extension implies (e.g. HTML served at a .pdf URL).
		if ( $skip_if_not_media && ! $this->is_media_content( $temp_file, $filename ) ) {
			$this->http_client->cleanup_temp_file( $temp_file );
			$this->logger->media_left_as_link( $media_url, $source_site_url );
			return null;
		}

		$file_type = wp_check_filetype( $filename );
		$file_size = filesize( $temp_file );

		// Prepare file array for media_handle_sideload.
		$file_array = array(
			'name'     => $filename,
			'type'     => $file_type['type'],
			'tmp_name' => $temp_file,
			'error'    => 0,
			'size'     => $file_size ? $file_size : 0,
		);

		// Import to media library with error handling.
		// Prevent WordPress from potentially degrading the original image quality.
		add_filter(
			'big_image_size_threshold',
			array( $this, 'disable_big_image_scaling' )
		);

		try {
			/** @psalm-suppress InvalidArgument - $_FILES['size'] is int */
			$attachment_id = media_handle_sideload(
				$file_array,
				0,
				null,
				array(
					'test_form' => false, // Skip form validation.
					'test_type' => true,  // But keep type validation.
				)
			);
		} finally {
			remove_filter(
				'big_image_size_threshold',
				array( $this, 'disable_big_image_scaling' )
			);
			$this->http_client->cleanup_temp_file( $temp_file );
		}

		if ( is_wp_error( $attachment_id ) ) {
			$this->logger->media_sideload_failed(
				$media_url,
				$source_site_url,
				$attachment_id->get_error_message(),
				'attachment'
			);
			return false;
		}

		// Verify the attachment was actually created.
		if ( ! $attachment_id || ! is_numeric( $attachment_id ) ) {
			$this->logger->invalid_attachment_id(
				$media_url,
				$source_site_url,
				$attachment_id
			);
			return false;
		}

		// Store the original URL as meta for tracking.
		update_post_meta( $attachment_id, Options::META_ORIGINAL_URL, $media_url );
		update_post_meta( $attachment_id, Options::META_IMPORTED_FROM, $source_site_url );

		$this->newly_created_attachment_ids[] = $attachment_id;

		$this->apply_library_metadata(
			$attachment_id,
			$this->library_metadata_map[ $media_url ] ?? array()
		);
		$this->record_source_attachment_parent(
			$attachment_id,
			(int) ( $this->library_metadata_map[ $media_url ]['parent'] ?? 0 )
		);

		return $attachment_id;
	}

	/**
	 * Resets the list of newly created attachment IDs.
	 *
	 * Should be called at the start of each content-processing run so the list
	 * is scoped to a single import attempt.
	 */
	public function reset_newly_created_attachment_ids(): void {
		$this->newly_created_attachment_ids = array();
	}

	/**
	 * Returns the IDs of attachments freshly sideloaded during the current run,
	 * so the import can reconcile their source parents.
	 *
	 * @return int[]
	 */
	public function get_newly_created_attachment_ids(): array {
		return $this->newly_created_attachment_ids;
	}

	/**
	 * Applies a source menu_order to an attachment this run freshly sideloaded,
	 * so a bare [gallery]/[playlist] renders its set in the source order. The
	 * media REST omits menu_order, so the caller supplies it. A dedup hit from a
	 * prior import is left untouched, and the default 0 needs no write.
	 *
	 * @param int $attachment_id Destination attachment ID.
	 * @param int $menu_order    Source menu_order to apply.
	 */
	public function set_new_attachment_menu_order(
		int $attachment_id,
		int $menu_order
	): void {
		if ( 0 === $menu_order ) {
			return;
		}

		if ( ! in_array( $attachment_id, $this->newly_created_attachment_ids, true ) ) {
			return;
		}

		wp_update_post(
			array(
				'ID'         => $attachment_id,
				'menu_order' => $menu_order,
			)
		);
	}

	/**
	 * Sets the library metadata map applied while sideloading this import's media.
	 *
	 * @param array<string, array<string, string>> $map Source URL => metadata.
	 */
	public function set_library_metadata_map( array $map ): void {
		$this->library_metadata_map = $map;
	}

	/**
	 * Writes source library metadata onto a sideloaded attachment. As the single
	 * write point for both inline and featured media, it sanitizes each field
	 * here rather than trusting the source. Empty fields are left absent.
	 *
	 * @param int                   $attachment_id Attachment to write to.
	 * @param array<string, string> $metadata      Source alt/title/caption/description.
	 */
	private function apply_library_metadata( int $attachment_id, array $metadata ): void {
		$alt = wp_strip_all_tags( (string) ( $metadata['alt'] ?? '' ), true );
		if ( '' !== $alt ) {
			update_post_meta(
				$attachment_id,
				'_wp_attachment_image_alt',
				wp_slash( $alt )
			);
		}

		$post_update = array();
		$title       = sanitize_text_field( (string) ( $metadata['title'] ?? '' ) );
		if ( '' !== $title ) {
			$post_update['post_title'] = wp_slash( $title );
		}
		$caption = wp_kses_post( (string) ( $metadata['caption'] ?? '' ) );
		if ( '' !== $caption ) {
			$post_update['post_excerpt'] = wp_slash( $caption );
		}
		$description = wp_kses_post( (string) ( $metadata['description'] ?? '' ) );
		if ( '' !== $description ) {
			$post_update['post_content'] = wp_slash( $description );
		}

		if ( array() !== $post_update ) {
			$post_update['ID'] = $attachment_id;
			wp_update_post( $post_update );
		}
	}

	/**
	 * Records the source parent post ID on a sideloaded attachment, matching the
	 * write/delete-on-zero contract of the post parent meta. The destination
	 * re-parenting sweep reads it later.
	 *
	 * @param int $attachment_id    Sideloaded attachment.
	 * @param int $source_parent_id Source parent post ID (0 = unattached).
	 */
	private function record_source_attachment_parent(
		int $attachment_id,
		int $source_parent_id
	): void {
		if ( 0 === $source_parent_id ) {
			delete_post_meta(
				$attachment_id,
				Options::META_SOURCE_ATTACHMENT_PARENT_ID
			);
			return;
		}

		update_post_meta(
			$attachment_id,
			Options::META_SOURCE_ATTACHMENT_PARENT_ID,
			$source_parent_id
		);
	}

	/**
	 * Extracts the library metadata from a wp/v2/media record fetched in edit
	 * context. Title, caption, and description are unwrapped from their raw
	 * value; alt_text is a plain string.
	 *
	 * @param array<string, mixed> $media_data Decoded media REST record.
	 * @return array<string, string> Alt/title/caption/description.
	 */
	private static function media_record_metadata( array $media_data ): array {
		return array(
			'alt'         => (string) ( $media_data['alt_text'] ?? '' ),
			'title'       => (string) ( $media_data['title']['raw'] ?? '' ),
			'caption'     => (string) ( $media_data['caption']['raw'] ?? '' ),
			'description' => (string) ( $media_data['description']['raw'] ?? '' ),
		);
	}

	/**
	 * Deletes all attachments created during the current run and resets the list.
	 *
	 * Called when an import is aborted after partial media downloads, to avoid
	 * leaving orphaned attachments in the media library.
	 */
	public function delete_newly_created_attachments(): void {
		foreach ( $this->newly_created_attachment_ids as $attachment_id ) {
			wp_delete_attachment( $attachment_id, true );
		}

		$this->newly_created_attachment_ids = array();
	}

	/**
	 * Resolves a source attachment ID to a downloadable URL via the source
	 * media REST endpoint, sideloads it, and returns the destination
	 * attachment ID.
	 *
	 * Shared by featured-image import and shortcode ID rewriting. A freshly
	 * sideloaded attachment is enriched from the fetched record and stamped with
	 * its source parent; a dedup hit on a prior import is left untouched.
	 *
	 * @param int    $source_id        Source attachment ID.
	 * @param string $source_site_url  Source site URL.
	 * @param array  $auth_credentials Optional. Authentication credentials. Default empty array.
	 * @return int|false|null Destination attachment ID on success, null when the
	 *                        source record is unreachable or carries no
	 *                        source_url (a dangling reference), false when the
	 *                        resolved URL fails to sideload.
	 */
	public function import_source_media_by_id(
		int $source_id,
		string $source_site_url,
		array $auth_credentials = array()
	): int|false|null {
		$media_api_url = trailingslashit( $source_site_url ) . 'wp-json/wp/v2/media/' . $source_id;
		if ( VIP_Safe_Auth::has_valid_credential_format( $auth_credentials ) ) {
			$media_api_url = add_query_arg( 'context', 'edit', $media_api_url );
		}

		$response = $this->http_client->make_request(
			$media_api_url,
			Request_Actions::MEDIA_IMPORT,
			$auth_credentials
		);

		if ( is_wp_error( $response ) ) {
			$this->logger->source_media_fetch_failed(
				$source_id,
				$source_site_url,
				$response->get_error_message()
			);

			return null;
		}

		$media_data = json_decode( wp_remote_retrieve_body( $response ), true );
		$source_url = is_array( $media_data ) ? ( $media_data['source_url'] ?? null ) : null;

		// A non-string source_url would fatal the string-typed sideload below;
		// treat it as a missing URL.
		if ( ! is_string( $source_url ) || '' === $source_url ) {
			$this->logger->source_media_url_missing( $source_id, $source_site_url );

			return null;
		}

		// Resolved by ID, so it is owned regardless of serving host.
		$attachment_id = $this->import_owned_media_as_attachment(
			$source_url,
			$source_site_url
		);

		if ( false === $attachment_id ) {
			return false;
		}

		// Enrich and record source state only for a freshly sideloaded
		// attachment, not a dedup hit that already carries them.
		if ( in_array( $attachment_id, $this->newly_created_attachment_ids, true ) ) {
			$this->apply_library_metadata(
				$attachment_id,
				self::media_record_metadata( $media_data )
			);
			$this->record_source_attachment_parent(
				$attachment_id,
				(int) ( $media_data['post'] ?? 0 )
			);
		}

		return $attachment_id;
	}

	/**
	 * Fetches a source post's attached media set of a given type: the ordered
	 * { id, menu_order } list a cross-post [gallery id="B"]/[playlist id="B"]
	 * renders. Reads the source's referenced-media enrichment field, since the
	 * media REST omits menu_order. Any fetch or shape failure yields an empty
	 * set so the caller degrades rather than aborts.
	 *
	 * @param int    $source_post_id   Referenced source post ID.
	 * @param string $source_post_type Its post type slug, to resolve the REST base.
	 * @param string $mime_group       Media type group: image, audio, or video.
	 * @param string $source_site_url  Source site URL.
	 * @param array  $auth_credentials Optional. Authentication credentials. Default empty array.
	 * @return list<array{id: int, menu_order: int}> Ordered set, or empty.
	 */
	public function fetch_referenced_media_set(
		int $source_post_id,
		string $source_post_type,
		string $mime_group,
		string $source_site_url,
		array $auth_credentials = array()
	): array {
		$rest_base = Source_Post_Type_Resolver::resolve_rest_base(
			$source_post_type,
			$source_site_url,
			array( $this->http_client, 'make_request' ),
			$auth_credentials
		);

		$url = trailingslashit( $source_site_url )
			. 'wp-json/wp/v2/' . $rest_base . '/' . $source_post_id;
		if ( VIP_Safe_Auth::has_valid_credential_format( $auth_credentials ) ) {
			$url = add_query_arg( 'context', 'edit', $url );
		}

		$response = $this->http_client->make_request(
			$url,
			Request_Actions::IMPORT,
			$auth_credentials
		);

		if ( is_wp_error( $response ) ) {
			return array();
		}

		$data  = json_decode( wp_remote_retrieve_body( $response ), true );
		$field = is_array( $data )
			? ( $data[ Source_Media_REST_Field::REFERENCED_FIELD_NAME ] ?? null )
			: null;

		return Source_Media_REST_Field::normalize_menu_order_set(
			is_array( $field ) ? ( $field[ $mime_group ] ?? null ) : null
		);
	}

	/**
	 * Imports featured image from source post.
	 *
	 * @param int    $featured_media_id Source featured media ID.
	 * @param string $source_site_url   Source site URL.
	 * @param array  $auth_credentials  Optional. Authentication credentials. Default empty array.
	 * @return int|false Attachment ID on success, false on failure.
	 */
	public function import_featured_image(
		int $featured_media_id,
		string $source_site_url,
		array $auth_credentials = array()
	): int|false {
		if ( 0 === $featured_media_id || '' === $source_site_url ) {
			return false;
		}

		// Check if we already imported this featured image.
		$existing_attachment = $this->get_attachment_by_featured_media_id( $featured_media_id, $source_site_url );
		if ( false !== $existing_attachment ) {
			return $existing_attachment;
		}

		$attachment_id = $this->import_source_media_by_id(
			$featured_media_id,
			$source_site_url,
			$auth_credentials
		);

		if ( ! is_int( $attachment_id ) ) {
			return false;
		}

		// get_attachment_by_featured_media_id() matches on both the source
		// featured media ID and the origin site, so record the pair here.
		update_post_meta( $attachment_id, Options::META_IMPORTED_FROM, $source_site_url );
		update_post_meta( $attachment_id, Options::META_FEATURED_MEDIA_ID, $featured_media_id );
		update_post_meta( $attachment_id, Options::META_MEDIA_TYPE, 'featured_image' );

		return $attachment_id;
	}

	/**
	 * Returns a URL with the query string parameters from another URL reapplied
	 * onto it.
	 *
	 * @param string $original_url The source URL whose query parameters should be reapplied.
	 * @param string $clean_url    The target URL, which has no query parameters.
	 * @return string The target URL with the source query parameters appended.
	 */
	public static function reapply_query_parameters( string $original_url, string $clean_url ): string {
		$query = (string) wp_parse_url( $original_url, PHP_URL_QUERY );

		if ( ! $query ) {
			return $clean_url;
		}

		$params = array();
		parse_str( $query, $params );

		return $clean_url . '?' . http_build_query( $params );
	}

	/**
	 * Gets attachment ID from URL using VIP-optimized function when available.
	 *
	 * @param string $url Attachment URL.
	 * @return int Attachment ID, or 0 if not found.
	 */
	public function get_attachment_id_from_url( string $url ): int {
		// Use VIP-optimized function when available, fallback to core function.
		if ( function_exists( 'wpcom_vip_attachment_url_to_postid' ) ) {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.attachment_url_to_postid_wpcom_vip_attachment_url_to_postid
			return wpcom_vip_attachment_url_to_postid( $url );
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.attachment_url_to_postid_attachment_url_to_postid
		return attachment_url_to_postid( $url );
	}

	/**
	 * Preserves the full-resolution original during a sideload. Uses a named
	 * callback, not the shared '__return_false', so removing it cannot detach
	 * another plugin's big_image_size_threshold filter.
	 *
	 * @return bool Always false.
	 */
	public function disable_big_image_scaling(): bool {
		return false;
	}

	/**
	 * Adds WebP MIME type to allowed uploads.
	 *
	 * @param array $mime_types Current allowed MIME types.
	 * @return array Updated MIME types with WebP support.
	 */
	public function add_webp_mime_type( array $mime_types ): array {
		$mime_types['webp'] = 'image/webp';
		return $mime_types;
	}

	/**
	 * Handles WebP file type validation during upload.
	 *
	 * @param array  $wp_check_filetype_and_ext File data with 'ext', 'type', 'proper_filename' keys.
	 * @param string $_file                     Full path to the file.
	 * @param string $filename                  File name (may differ from $file if in tmp dir).
	 * @return array Modified file data.
	 */
	public function handle_webp_filetype(
		array $wp_check_filetype_and_ext,
		string $_file,
		string $filename
	): array {
		if ( ! $wp_check_filetype_and_ext['type'] && ! $wp_check_filetype_and_ext['ext'] ) {
			$info = pathinfo( $filename );
			if ( isset( $info['extension'] ) && 'webp' === strtolower( $info['extension'] ) ) {
				$wp_check_filetype_and_ext['ext']  = 'webp';
				$wp_check_filetype_and_ext['type'] = 'image/webp';
			}
		}
		return $wp_check_filetype_and_ext;
	}

	/**
	 * Resolves the filename to sideload a downloaded file under.
	 *
	 * When the URL basename already maps to a known type, it is used as-is and
	 * media_handle_sideload() validates the bytes against it. Otherwise an
	 * extension is derived from the downloaded bytes so extensionless media
	 * still imports.
	 *
	 * @param string $temp_file Path to the downloaded file.
	 * @param string $basename  Filename derived from the source URL.
	 * @return string Filename to sideload, or '' when the content is not an
	 *                allowed upload type.
	 */
	private function resolve_media_filename( string $temp_file, string $basename ): string {
		$filetype = wp_check_filetype( $basename );

		if ( false !== $filetype['type'] ) {
			return $basename;
		}

		$extension = $this->detect_extension_from_content( $temp_file );

		if ( '' === $extension ) {
			return '';
		}

		return ( '' === $basename ? 'file' : $basename ) . '.' . $extension;
	}

	/**
	 * Reports whether a downloaded file's real content matches an allowed upload
	 * type for the given filename. Distinguishes a genuine media file from a page
	 * served at a media-looking URL before sideloading it.
	 *
	 * Content validation relies on the fileinfo extension; where it is
	 * unavailable, wp_check_filetype_and_ext() trusts the URL extension, so a
	 * page served at a media URL cannot be distinguished from real media.
	 *
	 * @param string $temp_file Path to the downloaded file.
	 * @param string $filename  Filename the file would be sideloaded under.
	 * @return bool True when the content is an allowed upload type.
	 */
	private function is_media_content( string $temp_file, string $filename ): bool {
		// Verify the content without the WebP shim, which would otherwise
		// re-assert image/webp for a page served at a .webp URL and pass it off
		// as media. Restore it afterward for the sideload that follows.
		$shim_priority = has_filter(
			'wp_check_filetype_and_ext',
			array( $this, 'handle_webp_filetype' )
		);
		if ( false !== $shim_priority ) {
			remove_filter( 'wp_check_filetype_and_ext', array( $this, 'handle_webp_filetype' ) );
		}

		$verified = wp_check_filetype_and_ext( $temp_file, $filename );

		if ( false !== $shim_priority ) {
			add_filter( 'wp_check_filetype_and_ext', array( $this, 'handle_webp_filetype' ), 10, 3 );
		}

		return false !== $verified['type'];
	}

	/**
	 * Detects a sideloadable media extension from a file's actual content.
	 *
	 * Uses WordPress' image detection first, then fileinfo for other types, so
	 * the result reflects the bytes rather than a URL extension or response
	 * header. Only image, video, audio, and PDF content is accepted, so an
	 * extensionless URL resolving to a page, script, archive, or document is
	 * left as a link. Returns an empty string when the content is not media.
	 *
	 * @param string $temp_file Path to the downloaded file.
	 * @return string Extension without a leading dot, or '' when not media.
	 */
	private function detect_extension_from_content( string $temp_file ): string {
		$mime = wp_get_image_mime( $temp_file );

		if ( ! is_string( $mime ) && extension_loaded( 'fileinfo' ) ) {
			$detected = ( new \finfo( FILEINFO_MIME_TYPE ) )->file( $temp_file );

			if ( is_string( $detected ) && '' !== $detected ) {
				$mime = $detected;
			}
		}

		if ( ! is_string( $mime ) || ! $this->is_sideloadable_media_mime( $mime ) ) {
			return '';
		}

		$extension = wp_get_default_extension_for_mime_type( $mime );

		return is_string( $extension ) ? $extension : '';
	}

	/**
	 * Reports whether a MIME type is one this importer sideloads: image, video,
	 * audio, or PDF. Other types (pages, scripts, archives, office documents)
	 * are left as links rather than pulled into the media library.
	 *
	 * @param string $mime MIME type to test.
	 * @return bool True when the type is sideloadable media.
	 */
	private function is_sideloadable_media_mime( string $mime ): bool {
		return str_starts_with( $mime, 'image/' )
			|| str_starts_with( $mime, 'video/' )
			|| str_starts_with( $mime, 'audio/' )
			|| 'application/pdf' === $mime;
	}

	/**
	 * Ensures WordPress media functions are loaded.
	 *
	 * @psalm-suppress MissingFile
	 */
	private function ensure_media_functions_loaded(): void {
		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
	}

	/**
	 * Determines whether a URL already points at this site's uploads directory.
	 *
	 * Matches the full uploads base URL, not just its path, so media on the
	 * same host but a different port stays remote and is still imported — a
	 * distinction the hostname-only third-party guard cannot make. Skipping
	 * such an already-localized URL keeps a same-host migration from
	 * re-importing it and duplicating the attachment.
	 *
	 * @param string $media_url Absolute media URL to test.
	 * @return bool True when the URL is under the local uploads base URL.
	 */
	private function is_local_media_url( string $media_url ): bool {
		$uploads = wp_get_upload_dir();

		if ( ! empty( $uploads['error'] ) || ! isset( $uploads['baseurl'] ) ) {
			return false;
		}

		$base = untrailingslashit( strtok( $uploads['baseurl'], '?' ) );

		if ( '' === $base ) {
			return false;
		}

		$candidate = strtok( $media_url, '?' );

		return $candidate === $base || str_starts_with( $candidate, $base . '/' );
	}

	/**
	 * Gets attachment ID by original URL.
	 *
	 * @param string $original_url Original source URL.
	 * @return int|false Attachment ID on success, false on failure.
	 */
	private function get_attachment_by_url( string $original_url ): int|false {
		// Check by the exact URL stored in metadata.
		$attachments = get_posts(
			array(
				'post_type'        => 'attachment',
				'meta_key'         => Options::META_ORIGINAL_URL,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'meta_value'       => $original_url,
				'posts_per_page'   => 1,
				// Don't suppress posts_* filters; required for cache plugins.
				'suppress_filters' => false,
			)
		);

		return ! empty( $attachments ) ? $attachments[0]->ID : false;
	}

	/**
	 * Gets attachment ID by source featured media ID.
	 *
	 * @param int    $featured_media_id Source featured media ID.
	 * @param string $source_site_url   Source site URL.
	 * @return int|false Attachment ID on success, false on failure.
	 */
	private function get_attachment_by_featured_media_id(
		int $featured_media_id,
		string $source_site_url
	): int|false {
		$attachments = get_posts(
			array(
				'post_type'        => 'attachment',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'       => array(
					'relation' => 'AND',
					array(
						'key'   => Options::META_FEATURED_MEDIA_ID,
						'value' => $featured_media_id,
					),
					array(
						'key'   => Options::META_IMPORTED_FROM,
						'value' => $source_site_url,
					),
				),
				'posts_per_page'   => 1,
				// Don't suppress posts_* filters; required for cache plugins.
				'suppress_filters' => false,
			)
		);

		return ! empty( $attachments ) ? $attachments[0]->ID : false;
	}

	/**
	 * Checks if WebP is supported by WordPress.
	 *
	 * @return bool True if WebP is supported.
	 */
	private function is_webp_supported(): bool {
		$mime_types = get_allowed_mime_types();
		return isset( $mime_types['webp'] ) || in_array( 'image/webp', $mime_types, true );
	}
}
