<?php
/**
 * Import Actions AJAX Handler class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Telemetry_Events;
use Safe_Publish\Utils\Telemetry_Service;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the item rollback AJAX endpoint consumed by row actions on the
 * Manage page. Kept out of Admin_Ajax_Controller to isolate the rollback
 * service dependency and keep the central controller focused on import flow.
 */
final class Import_Actions_Ajax_Handler {

	use Verifies_Ajax_Request;

	/**
	 * Rollback service instance.
	 *
	 * @var Session_Rollback_Service
	 */
	private Session_Rollback_Service $rollback_service;

	/**
	 * Telemetry service used to emit rollback events.
	 *
	 * @var Telemetry_Service
	 */
	private Telemetry_Service $telemetry;

	/**
	 * Constructs the handler.
	 *
	 * @param Session_Rollback_Service $rollback_service Rollback service.
	 * @param Telemetry_Service        $telemetry        Telemetry service.
	 */
	public function __construct(
		Session_Rollback_Service $rollback_service,
		Telemetry_Service $telemetry
	) {
		$this->rollback_service = $rollback_service;
		$this->telemetry        = $telemetry;
	}

	/**
	 * Registers the AJAX action hooks.
	 */
	public function init(): void {
		add_action( 'wp_ajax_safe_publish_rollback_item', array( $this, 'ajax_rollback_item' ) );
	}

	/**
	 * Rolls back a single item by id.
	 */
	public function ajax_rollback_item(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$item_id = absint( $_POST['item_id'] ?? 0 );

		if ( ! $item_id ) {
			wp_send_json_error( __( 'Invalid item ID', 'safe-publish' ) );
		}

		$result = $this->rollback_service->rollback_item( $item_id );

		if ( is_wp_error( $result ) ) {
			// A per-item WP_Error is a failed rollback, not a silently-dropped
			// request.
			$this->telemetry->record_event(
				Telemetry_Events::ROLLBACK_PERFORMED,
				array(
					'scope'          => Telemetry_Events::ROLLBACK_SCOPE_ITEM,
					'deleted_count'  => 0,
					'restored_count' => 0,
					'failed_count'   => 1,
					'outcome'        => Telemetry_Events::ROLLBACK_OUTCOME_FAILED,
				)
			);

			wp_send_json_error( $result->get_error_message() );
		}

		$deleted  = 'deleted' === $result['action'] ? 1 : 0;
		$restored = 'restored' === $result['action'] ? 1 : 0;
		$outcome  = Telemetry_Events::ROLLBACK_OUTCOME_SUCCESS;

		$this->telemetry->record_event(
			Telemetry_Events::ROLLBACK_PERFORMED,
			array(
				'scope'          => Telemetry_Events::ROLLBACK_SCOPE_ITEM,
				'deleted_count'  => $deleted,
				'restored_count' => $restored,
				'failed_count'   => 0,
				'outcome'        => $outcome,
			)
		);

		$omissions = $result['omissions'] ?? array();
		$messages  = array(
			'deleted'  => __( 'Post permanently deleted.', 'safe-publish' ),
			'restored' => array() === $omissions
				? __( 'Post restored to its previous version.', 'safe-publish' )
				: __(
					'Post restored with some values retained. Review the Audit Log for details.',
					'safe-publish'
				),
		);

		$result['message'] = $messages[ $result['action'] ] ?? $result['action'];

		wp_send_json_success( $result );
	}
}
