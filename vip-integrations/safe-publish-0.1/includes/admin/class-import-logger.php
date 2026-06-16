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
 * Logger for Safe Publish import-history events such as session and item
 * rollbacks.
 */
class Import_Logger extends Logger {

	/**
	 * Constructs the Import_Logger instance.
	 */
	public function __construct() {
		$this->channel = 'import';
	}

	/**
	 * Logs a successful session rollback.
	 *
	 * @param int $session_id Session that was marked rolled back.
	 */
	public function session_rolled_back( int $session_id ): void {
		$this->log_event(
			Log_Events::SESSION_ROLLED_BACK,
			array( 'session_id' => $session_id )
		);
	}

	/**
	 * Logs a session rollback that affected no rows (already rolled back).
	 *
	 * @param int $session_id Session that was already in the rolled-back state.
	 */
	public function session_already_rolled_back( int $session_id ): void {
		$this->log_event(
			Log_Events::SESSION_ALREADY_ROLLED_BACK,
			array( 'session_id' => $session_id )
		);
	}

	/**
	 * Logs a session rollback that failed at the SQL layer.
	 *
	 * @param int    $session_id Session whose rollback UPDATE failed.
	 * @param string $wpdb_error Last MySQL error from $wpdb->last_error.
	 */
	public function session_rollback_failed(
		int $session_id,
		string $wpdb_error
	): void {
		$this->log_error(
			Log_Events::SESSION_ROLLBACK_FAILED,
			array(
				'session_id' => $session_id,
				'wpdb_error' => $wpdb_error,
			)
		);
	}

	/**
	 * Logs a successful single-item rollback.
	 *
	 * @param int $item_id    Item that was marked rolled back.
	 * @param int $session_id Parent session of the item.
	 * @param int $post_id    Local WP post the item rolled back.
	 */
	public function item_rolled_back(
		int $item_id,
		int $session_id,
		int $post_id
	): void {
		$this->log_event(
			Log_Events::ITEM_ROLLED_BACK,
			array(
				'item_id'    => $item_id,
				'session_id' => $session_id,
				'post_id'    => $post_id,
			)
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
}
