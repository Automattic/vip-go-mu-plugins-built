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
 * Two independent axes govern an event: its audit-DB level (info, warning,
 * error) and whether it also reaches the server error log. Only log_error
 * writes to the server log, and only as a PII-free skeleton; log_failure
 * stores an error-level audit row without touching the server log. Subclasses
 * expose typed per-event helpers that call the protected log_* methods,
 * locking each event's payload shape to a single contract.
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
	 * Logs an informational event to the audit database.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_event( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'info', false );
	}

	/**
	 * Logs a degradation event: the operation completed but left a degraded,
	 * user-remediable result such as an unresolved reference.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_warning( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'warning', false );
	}

	/**
	 * Logs an operator-actionable fault to the audit database (level error)
	 * and, as a PII-free skeleton, to the server error log.
	 *
	 * For faults worth surfacing beyond the audit trail: missing config,
	 * failed rollback, unexpected exception. Expected domain failures use
	 * log_failure.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_error( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'error', true );
	}

	/**
	 * Logs an expected plugin-domain failure to the audit database at level
	 * error, without writing to the server error log.
	 *
	 * For handled failures (rejected auth, unsupported media, unresolved
	 * reference) that belong in the audit trail but must not pollute the
	 * server log. Operator-actionable faults use log_error.
	 *
	 * @param string $event Event type.
	 * @param array  $data  Optional. Additional event data. Default empty array.
	 */
	protected function log_failure( string $event, array $data = array() ): void {
		$this->write( $event, $data, 'error', false );
	}

	/**
	 * Writes a log entry to the configured targets.
	 *
	 * @param string $event      Event type.
	 * @param array  $data       Additional event data.
	 * @param string $level      Event level: 'info', 'warning', or 'error'.
	 * @param bool   $server_log Whether to also emit a server-log line.
	 */
	private function write(
		string $event,
		array $data,
		string $level,
		bool $server_log
	): void {
		$log_data = $this->build_log_data( $event, $data );

		if ( $server_log ) {
			$skeleton = $this->build_server_log_skeleton( $level, $log_data );
			$this->write_server_log( $event, $skeleton );
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
	 * Writes the PII-free skeleton to the server error log. The sole
	 * server-log sink; skipped under the test harness, and overridable so
	 * tests can observe the write.
	 *
	 * @param string $event    Event type.
	 * @param array  $skeleton PII-free projection built for the server log.
	 */
	protected function write_server_log( string $event, array $skeleton ): void {
		if ( defined( 'WP_TESTS_DOMAIN' ) ) {
			return;
		}

		$prefix = '[Safe-Publish-' . ucfirst( $this->channel ) . '] ';
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( $prefix . $event . ': ' . wp_json_encode( $skeleton, JSON_UNESCAPED_SLASHES ) );
	}

	/**
	 * Projects the full log data down to a PII-free server-log skeleton.
	 *
	 * Allowlist only: forensic scalars and a fixed set of non-identifying
	 * context keys. Free-text messages, actor display name, request URI, user
	 * agent, and site URL stay in the audit DB, never the server log.
	 *
	 * @param string $level    Event level stored in the audit DB.
	 * @param array  $log_data Full event data from build_log_data().
	 * @return array PII-free subset safe for the server error log.
	 */
	private function build_server_log_skeleton(
		string $level,
		array $log_data
	): array {
		$skeleton = array(
			'event'         => $log_data['event'] ?? '',
			'timestamp'     => $log_data['timestamp'] ?? '',
			'channel'       => $this->channel,
			'level'         => $level,
			'actor_source'  => $log_data['actor_source'] ?? '',
			'actor_user_id' => (int) ( $log_data['actor_user_id'] ?? 0 ),
		);

		// These must hold structured, non-PII scalars; never free text.
		$context_allowlist = array(
			'session_id',
			'source_post_id',
			'action',
			'error_code',
			'reason',
			'parent_id',
			'status',
		);

		foreach ( $context_allowlist as $key ) {
			if ( isset( $log_data[ $key ] ) && is_scalar( $log_data[ $key ] ) ) {
				$skeleton[ $key ] = $log_data[ $key ];
			}
		}

		return $skeleton;
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
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- data only used for logging; escaped with esc_html() when output to HTML.
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
