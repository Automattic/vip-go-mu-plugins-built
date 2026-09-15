<?php
/**
 * Import Logger class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Log_Events;
use Safe_Publish\Utils\Logger;

/**
 * Logger for Safe Publish import session and item lifecycle events.
 */
class Import_Logger extends Logger {

	/**
	 * Failure codes treated as unexpected and escalated to the server log via
	 * log_error. Every other code is an expected domain failure routed to
	 * log_failure, which records the audit row without a server-log line.
	 *
	 * @var string[]
	 */
	private const UNEXPECTED_FAILURE_CODES = array( 'unexpected_exception' );

	/**
	 * Constructs the Import_Logger instance.
	 */
	public function __construct() {
		$this->channel = 'import';
	}

	/**
	 * Logs a successful single-item rollback, including any omissions.
	 *
	 * @param int   $item_id    Item that was marked rolled back.
	 * @param int   $session_id Parent session of the item.
	 * @param int   $post_id    Local WP post the item rolled back.
	 * @param array $omissions Optional. References omitted from the rollback.
	 */
	public function item_rolled_back(
		int $item_id,
		int $session_id,
		int $post_id,
		array $omissions = array()
	): void {
		$data = array(
			'item_id'    => $item_id,
			'session_id' => $session_id,
			'post_id'    => $post_id,
		);

		if ( array() === $omissions ) {
			$this->log_event( Log_Events::ITEM_ROLLED_BACK, $data );
			return;
		}

		$data['omissions_version'] = 1;
		$data['omissions']         = $omissions;
		$this->log_warning(
			Log_Events::ITEM_ROLLED_BACK_WITH_OMISSIONS,
			$data
		);
	}

	/**
	 * Logs an item rollback that affected no rows (already rolled back).
	 *
	 * @param int $item_id    Item that was already in the rolled-back state.
	 * @param int $session_id Parent session of the item.
	 * @param int $post_id    Local WP post the item rolled back.
	 */
	public function item_already_rolled_back(
		int $item_id,
		int $session_id,
		int $post_id
	): void {
		$this->log_event(
			Log_Events::ITEM_ALREADY_ROLLED_BACK,
			array(
				'item_id'    => $item_id,
				'session_id' => $session_id,
				'post_id'    => $post_id,
			)
		);
	}

	/**
	 * Logs an item rollback that failed at the SQL layer.
	 *
	 * @param int    $item_id    Item whose rollback UPDATE failed.
	 * @param int    $session_id Parent session of the item.
	 * @param int    $post_id    Local WP post the item rolled back.
	 * @param string $wpdb_error Last MySQL error from $wpdb->last_error.
	 */
	public function item_rollback_failed(
		int $item_id,
		int $session_id,
		int $post_id,
		string $wpdb_error
	): void {
		$this->log_error(
			Log_Events::ITEM_ROLLBACK_FAILED,
			array(
				'item_id'    => $item_id,
				'session_id' => $session_id,
				'post_id'    => $post_id,
				'wpdb_error' => $wpdb_error,
			)
		);
	}

	/**
	 * Logs a session deletion (session row plus all its items removed).
	 *
	 * @param int    $session_id      Session ID that was deleted.
	 * @param string $source_site_url Source site of the session (snapshot).
	 * @param int    $items_deleted   Number of items deleted with the session.
	 */
	public function session_deleted(
		int $session_id,
		string $source_site_url,
		int $items_deleted
	): void {
		$this->log_event(
			Log_Events::SESSION_DELETED,
			array(
				'session_id'      => $session_id,
				'source_site_url' => $source_site_url,
				'items_deleted'   => $items_deleted,
			)
		);
	}

	/**
	 * Logs a session deletion that failed at the SQL layer.
	 *
	 * @param int    $session_id      Session whose delete failed.
	 * @param string $source_site_url Source site of the session (snapshot).
	 * @param string $wpdb_error      Last MySQL error from $wpdb->last_error.
	 */
	public function session_delete_failed(
		int $session_id,
		string $source_site_url,
		string $wpdb_error
	): void {
		$this->log_error(
			Log_Events::SESSION_DELETE_FAILED,
			array(
				'session_id'      => $session_id,
				'source_site_url' => $source_site_url,
				'wpdb_error'      => $wpdb_error,
			)
		);
	}

	/**
	 * Logs a per-item import failure, routing by error code (see
	 * UNEXPECTED_FAILURE_CODES).
	 *
	 * @param int      $session_id     Session the failed item belongs to.
	 * @param int|null $source_post_id Source post ID, or null when unknown.
	 * @param string   $error_code     Failure reason code (e.g. post_update_failed).
	 * @param string   $error_message  Human-readable failure message.
	 * @param array    $context        Optional. Extra event data merged in.
	 */
	public function item_failed(
		int $session_id,
		?int $source_post_id,
		string $error_code,
		string $error_message,
		array $context = array()
	): void {
		$data = array(
			'session_id'     => $session_id,
			'source_post_id' => $source_post_id,
			'error_code'     => $error_code,
			'error_message'  => $error_message,
		) + $context;

		if ( in_array( $error_code, self::UNEXPECTED_FAILURE_CODES, true ) ) {
			$this->log_error( Log_Events::IMPORT_ITEM_FAILED, $data );
			return;
		}

		$this->log_failure( Log_Events::IMPORT_ITEM_FAILED, $data );
	}
}
