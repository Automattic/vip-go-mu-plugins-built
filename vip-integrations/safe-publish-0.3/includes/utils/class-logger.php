<?php
/**
 * Logger class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

/**
 * Abstract base logger for Safe Publish events.
 *
 * Info and warning events are stored in the database and fire a WordPress
 * action hook. Error events additionally write to the server error log.
 * Subclasses define the channel and expose typed per-event helper methods
 * (e.g. Auth_Logger::request_authenticated) that internally call
 * log_event/log_warning/log_error. Those methods are the only entry point —
 * log_event, log_warning, and log_error are protected so each event's payload
 * shape is locked to a single contract.
 */
abstract class Logger {

	/**
	 * The logging channel identifier (e.g. 'auth', 'media').
	 *
	 * Drives the database option key, server log prefix, and hook channel
	 * argument.
	 *
	 * @var string
	 */
	protected string $channel;

	/**
	 * Logs an informational event to the database and fires a hook.
	 *
	 * Protected so callers must go through a channel logger's typed helper
	 * method, keeping each event's payload shape under a single contract.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_event( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'info' );
	}

	/**
	 * Logs a degradation event: the operation completed but left a degraded,
	 * user-remediable result such as an unresolved reference.
	 *
	 * Protected so callers must go through a channel logger's typed helper
	 * method, keeping each event's payload shape under a single contract.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_warning( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'warning' );
	}

	/**
	 * Logs a failure event to the server error log and the database, and fires
	 * a hook.
	 *
	 * Protected so callers must go through a channel logger's typed helper
	 * method, keeping each event's payload shape under a single contract.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_error( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'error' );
	}

	/**
	 * Writes a log entry to the configured targets.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Additional event data.
	 * @param string $level Event level: 'info', 'warning', or 'error'.
	 */
	private function write( string $event, array $data, string $level ): void {
		$log_data = $this->build_log_data( $event, $data );

		if ( ! defined( 'WP_TESTS_DOMAIN' ) && 'error' === $level ) {
			$prefix = '[Safe-Publish-' . ucfirst( $this->channel ) . '] ';
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $prefix . $event . ': ' . wp_json_encode( $log_data, JSON_UNESCAPED_SLASHES ) );
		}

		global $wpdb;

		if ( isset( $wpdb ) ) {
			$this->store_log_event( $level, $event, $log_data );
		}

		if ( function_exists( 'do_action' ) ) {
			do_action( 'safe_publish_event_logged', $this->channel, $event, $log_data );
		}
	}

	/**
	 * Builds the standard log data payload for an event.
	 *
	 * Captures the acting user (id and display name snapshot) and the
	 * invocation context so every audit entry records who triggered it and
	 * how. Unauthenticated contexts (e.g. webhook callbacks) record
	 * actor_user_id of 0 and an empty display name; actor_source then
	 * disambiguates between cli, cron, hmac, and other origins.
	 *
	 * Reserved keys (event, timestamp, site_url, user_agent, request_uri,
	 * actor_user_id, actor_display_name, actor_source) are auto-captured
	 * and cannot be overridden by caller-supplied $data — this guarantees
	 * forensic fields stay truthful regardless of channel-specific keys.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Caller-supplied event data to merge.
	 * @return array Complete log data array.
	 */
	private function build_log_data( string $event, array $data ): array {
		// phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
		$timestamp = function_exists( 'current_time' )
			? current_time( 'mysql', true )
			: gmdate( 'Y-m-d H:i:s' );
		// Data only used for logging; escaped with esc_html() when output to HTML.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$site_url = function_exists( 'get_site_url' ) ? get_site_url() : ( $_SERVER['HTTP_HOST'] ?? 'unknown' );
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___SERVER__HTTP_USER_AGENT__
		$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$request_uri = $_SERVER['REQUEST_URI'] ?? 'unknown';

		$actor_user_id      = function_exists( 'get_current_user_id' )
			? get_current_user_id()
			: 0;
		$actor_display_name = '';
		if ( $actor_user_id > 0 && function_exists( 'get_userdata' ) ) {
			$user = get_userdata( $actor_user_id );
			if ( $user ) {
				$actor_display_name = $user->display_name;
			}
		}

		$actor_source = $this->detect_actor_source();

		$base = array(
			'event'              => $event,
			'timestamp'          => $timestamp,
			'site_url'           => $site_url,
			'user_agent'         => $user_agent,
			'request_uri'        => $request_uri,
			'actor_user_id'      => $actor_user_id,
			'actor_display_name' => $actor_display_name,
			'actor_source'       => $actor_source,
		);

		return $base + $data;
	}

	/**
	 * Detects the invocation context that triggered the event.
	 *
	 * Resolves to a single label so forensic queries can distinguish, for
	 * example, an HMAC service request from a wp-cli command from an
	 * admin browser action — all of which can record actor_user_id of 0
	 * for different reasons.
	 *
	 * Precedence (most specific first): cli, cron, hmac, xmlrpc, ajax,
	 * rest, admin, front, unknown.
	 *
	 * HMAC is detected by the presence of the signature header rather
	 * than validation state, so failed-auth events are still tagged as
	 * hmac (the request was attempting HMAC).
	 *
	 * @return string Actor source identifier.
	 */
	private function detect_actor_source(): string {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$signature = $_SERVER['HTTP_X_SAFE_PUBLISH_SIGNATURE'] ?? '';
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$method       = $_SERVER['REQUEST_METHOD'] ?? '';
		$has_hmac_sig = '' !== $signature;
		$has_http_req = '' !== $method;

		if ( self::constant_is_truthy( 'WP_CLI' ) ) {
			$source = 'cli';
		} elseif ( self::constant_is_truthy( 'DOING_CRON' ) ) {
			$source = 'cron';
		} elseif ( $has_hmac_sig ) {
			$source = 'hmac';
		} elseif ( self::constant_is_truthy( 'XMLRPC_REQUEST' ) ) {
			$source = 'xmlrpc';
		} elseif ( function_exists( 'wp_doing_ajax' ) && wp_doing_ajax() ) {
			$source = 'ajax';
		} elseif ( self::constant_is_truthy( 'REST_REQUEST' ) ) {
			$source = 'rest';
		} elseif ( function_exists( 'is_admin' ) && is_admin() ) {
			$source = 'admin';
		} elseif ( $has_http_req ) {
			$source = 'front';
		} else {
			$source = 'unknown';
		}

		return $source;
	}

	/**
	 * Returns true when the named constant is defined and resolves truthy.
	 *
	 * @param string $name Constant name.
	 * @return bool
	 */
	private static function constant_is_truthy( string $name ): bool {
		return defined( $name ) && (bool) constant( $name );
	}

	/**
	 * Stores an event in the audit log table.
	 *
	 * Subclasses may override this method to add side effects while calling
	 * parent::store_log_event() to preserve the base storage behavior.
	 *
	 * @param string $level    Event level: 'info', 'warning', or 'error'.
	 * @param string $event    Event type.
	 * @param array  $log_data Full event data.
	 */
	protected function store_log_event( string $level, string $event, array $log_data ): void {
		$created_at_gmt = $log_data['timestamp'];
		$data           = $log_data;

		// These are stored as dedicated columns.
		unset( $data['event'], $data['timestamp'] );

		Audit_Log_Table::insert(
			$this->channel,
			$level,
			$event,
			$created_at_gmt,
			$data
		);
	}
}
