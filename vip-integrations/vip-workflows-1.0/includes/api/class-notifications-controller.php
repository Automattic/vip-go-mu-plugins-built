<?php
/**
 * Notifications REST Controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;
use VIPWorkflows\Notifications\Channels\SlackChannel;
use VIPWorkflows\Notifications\NotificationDispatcher;

/**
 * REST controller for notification channels, event-to-channel routing and
 * the Slack destination list.
 */
class NotificationsController extends WP_REST_Controller {


	/**
	 * Dispatcher instance.
	 *
	 * @var NotificationDispatcher
	 */
	private NotificationDispatcher $dispatcher;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace  = 'vip-workflows/v1';
		$this->rest_base  = 'notifications';
		$this->dispatcher = new NotificationDispatcher();
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// GET /notifications/channels.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/channels',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_channels' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);

		// GET /notifications/events.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/events',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_events' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);

		// GET/POST /notifications/{channel}/settings.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<channel>[a-z0-9-]+)/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_channel_settings' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_channel_settings' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);

		// POST /notifications/{channel}/test.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<channel>[a-z0-9-]+)/test',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'test_channel' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
				'args'                => array(
					'channel' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);

		// GET/POST /notification-routing.
		register_rest_route(
			$this->namespace,
			'/notification-routing',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_routing' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_routing' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);

		// GET/POST /notification-debug.
		register_rest_route(
			$this->namespace,
			'/notification-debug',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_debug' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_debug' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);

		// GET/POST /slack-destinations.
		register_rest_route(
			$this->namespace,
			'/slack-destinations',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_slack_destinations' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_slack_destinations' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check admin permissions.
	 *
	 * @return bool
	 */
	public function admin_permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get available notification channels.
	 *
	 * @return WP_REST_Response
	 */
	public function get_channels(): WP_REST_Response {
		$this->dispatcher->init();
		$channels = array();

		foreach ( $this->dispatcher->get_channels() as $channel ) {
			$channels[] = $channel->to_array();
		}

		return new WP_REST_Response( $channels );
	}

	/**
	 * Get available event types.
	 *
	 * @return WP_REST_Response
	 */
	public function get_events(): WP_REST_Response {
		$events = array();

		foreach ( NotificationDispatcher::get_event_types() as $id => $label ) {
			$events[] = array(
				'id'    => $id,
				'label' => $label,
			);
		}

		return new WP_REST_Response( $events );
	}

	/**
	 * Test a notification channel.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function test_channel( WP_REST_Request $request ) {
		$channel_id = $request->get_param( 'channel' );

		$this->dispatcher->init();
		$channel = $this->dispatcher->get_channel( $channel_id );

		if ( ! $channel ) {
			return new WP_Error(
				'channel_not_found',
				/* translators: %s: notification channel ID. */
				sprintf( __( 'Channel "%s" not found.', 'vip-workflows' ), $channel_id ),
				array( 'status' => 404 )
			);
		}

		$result = $channel->test_connection();

		if ( true === $result ) {
			return new WP_REST_Response(
				array(
					'success' => true,
					'message' => __( 'Test message sent!', 'vip-workflows' ),
				)
			);
		}

		if ( is_wp_error( $result ) ) {
			return new WP_Error(
				$result->get_error_code(),
				$result->get_error_message(),
				array( 'status' => 400 )
			);
		}

		return new WP_Error( 'test_failed', $result, array( 'status' => 400 ) );
	}

	/**
	 * Get channel settings.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_channel_settings( WP_REST_Request $request ) {
		$channel_id = $request->get_param( 'channel' );

		$this->dispatcher->init();
		$channel = $this->dispatcher->get_channel( $channel_id );

		if ( ! $channel ) {
			return new WP_Error(
				'channel_not_found',
				/* translators: %s: notification channel ID. */
				sprintf( __( 'Channel "%s" not found.', 'vip-workflows' ), $channel_id ),
				array( 'status' => 404 )
			);
		}

		$settings = $channel->get_settings();

		// Allow channels to add computed fields.
		$settings = apply_filters( 'vip_workflows_channel_settings', $settings, $channel_id, $channel );

		return new WP_REST_Response( $settings );
	}

	/**
	 * Save channel settings.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function save_channel_settings( WP_REST_Request $request ) {
		$channel_id = $request->get_param( 'channel' );

		$this->dispatcher->init();
		$channel = $this->dispatcher->get_channel( $channel_id );

		if ( ! $channel ) {
			return new WP_Error(
				'channel_not_found',
				/* translators: %s: notification channel ID. */
				sprintf( __( 'Channel "%s" not found.', 'vip-workflows' ), $channel_id ),
				array( 'status' => 404 )
			);
		}

		// Get input data.
		$input = $request->get_json_params();
		if ( empty( $input ) ) {
			$input = $request->get_body_params();
		}

		// Sanitize through channel's sanitize method.
		$sanitized = $channel->sanitize_settings( $input );

		// Save settings.
		$channel->update_settings( $sanitized );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'settings' => $channel->get_settings(),
			)
		);
	}

	/**
	 * Get the event-to-channel routing configuration.
	 *
	 * @return WP_REST_Response
	 */
	public function get_routing(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'routing' => $this->read_routing(),
			)
		);
	}

	/**
	 * Save the event-to-channel routing configuration.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function save_routing( WP_REST_Request $request ) {
		$routing = $request->get_json_params();

		if ( ! is_array( $routing ) ) {
			return new WP_Error( 'invalid_data', 'Routing must be an array', array( 'status' => 400 ) );
		}

		update_option( NotificationDispatcher::ROUTING_OPTION, $routing );

		return new WP_REST_Response(
			array(
				'success' => true,
				'routing' => $this->read_routing(),
			)
		);
	}

	/**
	 * Get the debug/mirror settings.
	 *
	 * @return WP_REST_Response
	 */
	public function get_debug(): WP_REST_Response {
		return new WP_REST_Response( $this->read_debug_settings() );
	}

	/**
	 * Save the debug/mirror settings.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function save_debug( WP_REST_Request $request ) {
		$settings = $request->get_json_params();

		if ( ! is_array( $settings ) ) {
			return new WP_Error( 'invalid_data', 'Settings must be an array', array( 'status' => 400 ) );
		}

		update_option(
			NotificationDispatcher::DEBUG_OPTION,
			array(
				'enabled'  => ! empty( $settings['enabled'] ),
				'channels' => $settings['channels'] ?? array(),
			)
		);

		return new WP_REST_Response(
			array(
				'success'  => true,
				'settings' => $this->read_debug_settings(),
			)
		);
	}

	/**
	 * Get the configured Slack destinations.
	 *
	 * @return WP_REST_Response
	 */
	public function get_slack_destinations(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'destinations' => SlackChannel::get_destinations(),
			)
		);
	}

	/**
	 * Save the Slack destinations.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function save_slack_destinations( WP_REST_Request $request ) {
		$destinations = $request->get_json_params();

		if ( ! is_array( $destinations ) ) {
			return new WP_Error( 'invalid_data', 'Destinations must be an array', array( 'status' => 400 ) );
		}

		SlackChannel::save_destinations( $destinations );

		return new WP_REST_Response(
			array(
				'success'      => true,
				'destinations' => SlackChannel::get_destinations(),
			)
		);
	}

	/**
	 * Read the stored event-to-channel routing configuration.
	 *
	 * @return array
	 */
	private function read_routing(): array {
		return get_option( NotificationDispatcher::ROUTING_OPTION, array() );
	}

	/**
	 * Read the stored debug/mirror settings.
	 *
	 * @return array
	 */
	private function read_debug_settings(): array {
		return get_option(
			NotificationDispatcher::DEBUG_OPTION,
			array(
				'enabled'  => false,
				'channels' => array(),
			)
		);
	}
}
