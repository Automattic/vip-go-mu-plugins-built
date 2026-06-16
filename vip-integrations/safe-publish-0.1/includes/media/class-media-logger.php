<?php
/**
 * Media Logger class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Media;

use Safe_Publish\Utils\Log_Events;
use Safe_Publish\Utils\Logger;

/**
 * Logger for Safe Publish media import events.
 */
class Media_Logger extends Logger {

	/**
	 * Constructs the Media_Logger instance.
	 */
	public function __construct() {
		$this->channel = 'media';
	}

	/**
	 * Logs a media download failure.
	 *
	 * @param string $url             Media URL that failed to download.
	 * @param string $source_site_url Source site the media originated from.
	 * @param string $error           Error message from the downloader.
	 */
	public function media_download_failed(
		string $url,
		string $source_site_url,
		string $error
	): void {
		$this->log_error(
			Log_Events::MEDIA_DOWNLOAD_FAILED,
			array(
				'url'             => $url,
				'source_site_url' => $source_site_url,
				'error'           => $error,
			)
		);
	}

	/**
	 * Logs a sideload failure surfaced by media_handle_sideload.
	 *
	 * @param string $url             Media URL whose sideload failed.
	 * @param string $source_site_url Source site the media originated from.
	 * @param string $error           Error message from media_handle_sideload.
	 * @param string $import_path     'inline' (in-content media) or
	 *                                'attachment' (tracked attachments).
	 */
	public function media_sideload_failed(
		string $url,
		string $source_site_url,
		string $error,
		string $import_path
	): void {
		$this->log_error(
			Log_Events::MEDIA_SIDELOAD_FAILED,
			array(
				'url'             => $url,
				'source_site_url' => $source_site_url,
				'error'           => $error,
				'import_path'     => $import_path,
			)
		);
	}

	/**
	 * Logs a media import that was rejected because the file type was not
	 * recognized.
	 *
	 * @param string $url                Media URL that was rejected.
	 * @param string $source_site_url    Source site the media originated from.
	 * @param string $detected_extension Extension parsed from the URL path.
	 */
	public function media_unsupported_file_type(
		string $url,
		string $source_site_url,
		string $detected_extension
	): void {
		$this->log_error(
			Log_Events::MEDIA_UNSUPPORTED_FILE_TYPE,
			array(
				'url'                => $url,
				'source_site_url'    => $source_site_url,
				'detected_extension' => $detected_extension,
			)
		);
	}

	/**
	 * Logs that the attachment ID returned by media_handle_sideload was not
	 * a positive numeric value.
	 *
	 * @param string $url             Media URL whose import returned a bad ID.
	 * @param string $source_site_url Source site the media originated from.
	 * @param mixed  $attachment_id   Value returned in place of a valid attachment ID.
	 */
	public function invalid_attachment_id(
		string $url,
		string $source_site_url,
		mixed $attachment_id
	): void {
		$this->log_error(
			Log_Events::INVALID_ATTACHMENT_ID,
			array(
				'url'             => $url,
				'source_site_url' => $source_site_url,
				'attachment_id'   => $attachment_id,
			)
		);
	}

	/**
	 * Logs a failure to fetch a featured image's details from the source site.
	 *
	 * @param int    $media_id        Source media ID being fetched.
	 * @param string $source_site_url Source site the request targeted.
	 * @param string $error           WP_Error message from the request.
	 */
	public function featured_image_fetch_failed(
		int $media_id,
		string $source_site_url,
		string $error
	): void {
		$this->log_error(
			Log_Events::FEATURED_IMAGE_FETCH_FAILED,
			array(
				'media_id'        => $media_id,
				'source_site_url' => $source_site_url,
				'error'           => $error,
			)
		);
	}

	/**
	 * Logs a featured image response whose payload lacked source_url.
	 *
	 * @param int    $media_id        Source media ID that was fetched.
	 * @param string $source_site_url Source site the request targeted.
	 */
	public function featured_image_source_missing(
		int $media_id,
		string $source_site_url
	): void {
		$this->log_error(
			Log_Events::FEATURED_IMAGE_SOURCE_MISSING,
			array(
				'media_id'        => $media_id,
				'source_site_url' => $source_site_url,
			)
		);
	}
}
