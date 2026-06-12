<?php
/**
 * Customer-friendly error catalog for ingestion WP-CLI output.
 *
 * Maps stable error codes to customer-friendly messages so the setup wizard
 * can render an on-design notice instead of leaking the raw, developer-facing
 * text emitted by the WP-CLI commands.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Stable error codes and the customer-friendly copy that maps to them.
 */
class Ingestion_Error {
	public const FILTER_NOT_REGISTERED = 'filter_not_registered';
	public const SYNC_IN_PROGRESS      = 'sync_in_progress';
	public const NO_PUBLISHED_POSTS    = 'no_published_posts';
	public const SYNC_START_FAILED     = 'sync_start_failed';
	public const MISSING_API_CONFIG    = 'missing_api_config';
	public const TOKEN_EXPIRED         = 'token_expired';
	public const TOKEN_INVALID         = 'token_invalid';
	public const AUTH_FAILED           = 'auth_failed';
	public const RATE_LIMITED          = 'rate_limited';
	public const SERVER_ERROR          = 'server_error';
	public const NETWORK_ERROR         = 'network_error';
	public const SYNC_FAILED           = 'sync_failed';

	/**
	 * Stable error code => customer-friendly message.
	 *
	 * @var array<string, string>
	 */
	private const MESSAGES = [
		self::FILTER_NOT_REGISTERED => "Content sync isn't set up for this site yet. Finish the Agentforce setup steps, then start the sync again.",
		self::SYNC_IN_PROGRESS      => 'A sync is already running. Wait for it to finish before starting another one.',
		self::NO_PUBLISHED_POSTS    => "There's no published content to sync yet. Publish a post and try again.",
		self::SYNC_START_FAILED     => "We couldn't start the sync. Please try again in a moment.",
		self::MISSING_API_CONFIG    => "Agentforce isn't fully connected yet. Finish connecting your Salesforce account in the setup wizard, then try again.",
		self::TOKEN_EXPIRED         => 'Your Salesforce connection has expired. Reconnect your account to continue syncing.',
		self::TOKEN_INVALID         => "There's a problem with your Salesforce connection. Reconnect your account to continue syncing.",
		self::AUTH_FAILED           => "We couldn't authenticate with Salesforce. Reconnect your account and try again.",
		self::RATE_LIMITED          => 'Salesforce is temporarily limiting requests. The sync will resume on its own — please try again shortly.',
		self::SERVER_ERROR          => 'Salesforce ran into a temporary problem. Please try again in a few minutes.',
		self::NETWORK_ERROR         => "We couldn't reach Salesforce. Check the connection and try again.",
		self::SYNC_FAILED           => "The sync didn't finish. Please try again.",
	];

	/**
	 * Get the customer-friendly message for a stable error code.
	 *
	 * Falls back to the generic sync-failed message for unknown codes so the
	 * wizard never has to display raw developer text.
	 *
	 * @param string $code Stable error code (one of the class constants).
	 * @return string Customer-friendly message.
	 */
	public static function message( string $code ): string {
		return self::MESSAGES[ $code ] ?? self::MESSAGES[ self::SYNC_FAILED ];
	}

	/**
	 * Map the low-cardinality error_class taxonomy to a stable error code.
	 *
	 * Runtime API/sync failures are tracked by a coarse `error_class`
	 * (config, auth, rate_limit, server, network, client, unexpected). This
	 * translates that into the customer-facing error code the wizard renders.
	 *
	 * @param string|null $error_class Low-cardinality error class.
	 * @return string Stable error code.
	 */
	public static function code_for_error_class( ?string $error_class ): string {
		switch ( $error_class ) {
			case 'config':
				return self::MISSING_API_CONFIG;
			case 'auth':
				return self::AUTH_FAILED;
			case 'rate_limit':
				return self::RATE_LIMITED;
			case 'server':
				return self::SERVER_ERROR;
			case 'network':
				return self::NETWORK_ERROR;
			default:
				return self::SYNC_FAILED;
		}
	}
}
