<?php
/**
 * Audit Log REST API controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Admin\Settings;
use VIPWorkflows\Database\Schema;
use VIPWorkflows\Workflow\Actor;
use VIPWorkflows\Workflow\StatusManager;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * REST controller for audit log operations.
 */
class AuditLogController extends WP_REST_Controller {


	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'audit-log';
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// GET /audit-log - List events.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_events' ),
					'permission_callback' => array( $this, 'get_events_permissions_check' ),
					'args'                => array(
						'page'       => array(
							'description' => 'Page number.',
							'type'        => 'integer',
							'default'     => 1,
							'minimum'     => 1,
						),
						'per_page'   => array(
							'description' => 'Items per page.',
							'type'        => 'integer',
							'default'     => 25,
							'minimum'     => 1,
							'maximum'     => 100,
						),
						'event_type' => array(
							'description' => 'Filter by one or more event types.',
							'type'        => array( 'array', 'string' ),
							'items'       => array( 'type' => 'string' ),
						),
						'user_id'    => array(
							'description' => 'Filter by one or more user IDs.',
							'type'        => array( 'array', 'integer' ),
							'items'       => array( 'type' => 'integer' ),
						),
						'post_id'    => array(
							'description' => 'Filter by post ID.',
							'type'        => 'integer',
						),
						'search'     => array(
							'description' => 'Search event type and post title.',
							'type'        => 'string',
						),
						'orderby'    => array(
							'description' => 'Order by field.',
							'type'        => 'string',
							'default'     => 'created_at',
							'enum'        => array( 'created_at', 'event_type', 'post_id' ),
						),
						'order'      => array(
							'description' => 'Order direction.',
							'type'        => 'string',
							'default'     => 'desc',
							'enum'        => array( 'asc', 'desc' ),
						),
					),
				),
			)
		);

		// GET /audit-log/event-types - List available event types.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/event-types',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_event_types' ),
					'permission_callback' => array( $this, 'get_events_permissions_check' ),
				),
			)
		);

		// GET /audit-log/users - List users with activity.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/users',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_users' ),
					'permission_callback' => array( $this, 'get_events_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Get audit log events.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_events( $request ) {
		global $wpdb;

		$page     = (int) $request->get_param( 'page' );
		$per_page = (int) $request->get_param( 'per_page' );

		// Filters accept either a single value or an array; normalize to arrays.
		$event_types = array_values( array_filter( array_map( 'strval', (array) $request->get_param( 'event_type' ) ) ) );
		$user_ids    = array_values( array_filter( array_map( 'intval', (array) $request->get_param( 'user_id' ) ) ) );
		$post_id     = (int) $request->get_param( 'post_id' );
		$search      = trim( (string) $request->get_param( 'search' ) );

		$allowed_orderby = array( 'created_at', 'event_type', 'post_id' );
		$orderby         = in_array( $request->get_param( 'orderby' ), $allowed_orderby, true )
			? $request->get_param( 'orderby' )
			: 'created_at';
		$order           = 'ASC' === strtoupper( $request->get_param( 'order' ) ) ? 'ASC' : 'DESC';

		$table = Schema::get_table_name( 'workflows_events' );

		// Build WHERE clause. Columns are aliased to `e` so a search JOIN against
		// the posts table can disambiguate.
		$where  = array();
		$values = array();

		// The EventBus's bookkeeping copies of a stage change never surface
		// here — the canonical `status_transition` row is the audit entry.
		// See StatusManager::STAGE_CHANGE_BUS_EVENT for the full account.
		$exclusion = StatusManager::bus_bookkeeping_exclusion( 'e.event_type' );
		$where[]   = $exclusion['sql'];
		$values    = array_merge( $values, $exclusion['values'] );

		// If user can't see all logs, filter to their own activity.
		if ( ! Settings::can_user_view_all_audit_logs() ) {
			$where[]  = 'e.actor_id = %d';
			$values[] = get_current_user_id();
		}

		if ( ! empty( $event_types ) ) {
			$placeholders = implode( ', ', array_fill( 0, count( $event_types ), '%s' ) );
			$where[]      = "e.event_type IN ( {$placeholders} )";
			foreach ( $event_types as $event_type ) {
				$values[] = $event_type;
			}
		}

		if ( ! empty( $user_ids ) ) {
			$placeholders = implode( ', ', array_fill( 0, count( $user_ids ), '%d' ) );
			$where[]      = "e.actor_id IN ( {$placeholders} )";
			foreach ( $user_ids as $uid ) {
				$values[] = $uid;
			}
		}

		if ( $post_id ) {
			$where[]  = 'e.post_id = %d';
			$values[] = $post_id;
		}

		// Global search matches the event type slug and the related post title.
		// The friendly event label is computed in PHP and is not searchable.
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '( e.event_type LIKE %s OR p.post_title LIKE %s )';
			$values[] = $like;
			$values[] = $like;
		}

		$where_clause = ! empty( $where ) ? 'WHERE ' . implode( ' AND ', $where ) : '';
		// Only join the posts table when searching, to keep the common case lean.
		$join_clause = '' !== $search ? "LEFT JOIN {$wpdb->posts} p ON p.ID = e.post_id" : '';

		// Count total.
		$count_sql = "SELECT COUNT(*) FROM {$table} e {$join_clause} {$where_clause}";
		if ( ! empty( $values ) ) {
			$count_sql = $wpdb->prepare( $count_sql, $values ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		}
		$total = (int) $wpdb->get_var( $count_sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		// Get events.
		$offset = ( $page - 1 ) * $per_page;
		$sql    = "SELECT e.* FROM {$table} e {$join_clause} {$where_clause} ORDER BY e.{$orderby} {$order} LIMIT %d OFFSET %d";

		$query_values   = $values;
		$query_values[] = $per_page;
		$query_values[] = $offset;

		$events = $wpdb->get_results(
			$wpdb->prepare( $sql, $query_values ) // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		);

		// Enrich events with additional data.
		$enriched_events = array_map( array( $this, 'enrich_event' ), $events );

		return new WP_REST_Response(
			array(
				'events'      => $enriched_events,
				'total'       => $total,
				'total_pages' => (int) ceil( $total / $per_page ),
				'page'        => $page,
				'per_page'    => $per_page,
			)
		);
	}

	/**
	 * Get available event types.
	 *
	 * @return WP_REST_Response
	 */
	public function get_event_types() {
		global $wpdb;

		$table = Schema::get_table_name( 'workflows_events' );

		// The same exclusion get_events() applies: the bus's bookkeeping rows
		// are never served, so offering them as filter options would offer
		// choices that always come back empty.
		$exclusion = StatusManager::bus_bookkeeping_exclusion( 'event_type' );

		$types = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT event_type FROM {$table} WHERE {$exclusion['sql']} ORDER BY event_type", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$exclusion['values']
			)
		);

		$labeled_types = array_map(
			function ( $type ) {
				return array(
					'value' => $type,
					'label' => $this->get_event_type_label( $type ),
				);
			},
			$types
		);

		return new WP_REST_Response( $labeled_types );
	}

	/**
	 * Get users with activity.
	 *
	 * @return WP_REST_Response
	 */
	public function get_users() {
		global $wpdb;

		$table = Schema::get_table_name( 'workflows_events' );

		// Same structural exclusion as every other audit read: an actor must
		// not become a filter option on the strength of bookkeeping rows the
		// stream will never serve.
		$exclusion = StatusManager::bus_bookkeeping_exclusion( 'event_type' );

		$user_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT actor_id FROM {$table} WHERE actor_id > 0 AND {$exclusion['sql']} ORDER BY actor_id", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$exclusion['values']
			)
		);

		$users = array_map(
			function ( $user_id ) {
				$user = get_userdata( $user_id );
				return array(
					'value' => (int) $user_id,
					/* translators: %d: user ID. */
					'label' => $user ? $user->display_name : sprintf( __( 'User #%d', 'vip-workflows' ), $user_id ),
				);
			},
			$user_ids
		);

		return new WP_REST_Response( $users );
	}

	/**
	 * Enrich an event with additional data.
	 *
	 * @param  object $event Raw event row.
	 * @return array Enriched event.
	 */
	private function enrich_event( $event ): array {
		$event_data = json_decode( $event->event_data, true ) ?? array();

		// Agent-driven events (actor_type='agent') are credited to the acting
		// ability, not the human the runner impersonated for the write. The
		// `type` field lets the audit view badge agent vs human distinctly. Shared
		// with the post-history route so both serve the same actor object.
		$actor = Actor::from_event(
			array(
				'actor_id'   => (int) $event->actor_id,
				'actor_type' => $event->actor_type ?? 'user',
				'event_data' => $event_data,
			)
		);

		$post = null;
		if ( $event->post_id ) {
			$post_obj = get_post( $event->post_id );
			if ( $post_obj ) {
				$post = array(
					'id'        => (int) $event->post_id,
					'title'     => $post_obj->post_title ? $post_obj->post_title : __( '(no title)', 'vip-workflows' ),
					'edit_link' => get_edit_post_link( $event->post_id, 'raw' ),
				);
			}
		}

		return array(
			'id'              => (int) $event->id,
			'event_type'      => $event->event_type,
			'event_type_label' => $this->get_event_type_label( $event->event_type ),
			'event_data'      => $event_data,
			'actor'           => $actor,
			'post'            => $post,
			'created_at'      => $event->created_at,
			'created_at_human' => human_time_diff( strtotime( $event->created_at ), current_time( 'timestamp' ) ) . ' ' . __( 'ago', 'vip-workflows' ),
		);
	}

	/**
	 * Get human-readable label for event type.
	 *
	 * The vocabulary itself lives on StatusManager, which owns the events table:
	 * a post's history route labels its events from the same map, so an event
	 * reads the same wherever it is served.
	 *
	 * @param  string $event_type Event type.
	 * @return string Label.
	 */
	private function get_event_type_label( string $event_type ): string {
		return StatusManager::event_type_label( $event_type );
	}

	/**
	 * Permission check for viewing events.
	 *
	 * @return bool|WP_Error
	 */
	public function get_events_permissions_check() {
		if ( ! Settings::can_user_view_audit_log() ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to view the audit log.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}
		return true;
	}
}
