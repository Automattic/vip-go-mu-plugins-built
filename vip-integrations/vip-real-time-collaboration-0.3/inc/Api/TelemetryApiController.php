<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Api;

defined( 'ABSPATH' ) || exit();

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

use function current_user_can;
use function do_action;
use function register_rest_route;
use function rest_ensure_response;

/**
 * REST API controller for plugin-emitted telemetry events from the editor.
 */
final class TelemetryApiController extends WP_REST_Controller {
	public function __construct() {
		$this->namespace = RestApi::NAMESPACE;
		$this->rest_base = '/telemetry/limit-dialog';
		$this->schema = [];
	}

	/**
	 * Register REST API routes.
	 */
	#[\Override]
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			[
				'methods' => 'POST',
				'callback' => [ $this, 'record_limit_dialog_shown' ],
				'permission_callback' => [ $this, 'permissions_check' ],
			]
		);
	}

	/**
	 * Fire the plugin's telemetry action for the collaborator-limit dialog.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function record_limit_dialog_shown( WP_REST_Request $_request ): WP_REST_Response {
		do_action( 'vip_real_time_collaboration_track_event', 'collaborator_limit_dialog_shown', [] );

		return rest_ensure_response( [ 'recorded' => true ] );
	}

	/**
	 * Only users who can edit posts can record this event — they're the only ones
	 * who could have triggered the dialog in the editor in the first place.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function permissions_check( WP_REST_Request $_request ): bool|WP_Error {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You are not allowed to access this endpoint.', 'vip-real-time-collaboration' )
			);
		}

		return true;
	}
}
