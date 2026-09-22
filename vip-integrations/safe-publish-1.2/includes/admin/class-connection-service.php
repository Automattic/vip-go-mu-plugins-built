<?php
/**
 * Connection read service
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\API\Source_Posts_API;
use Safe_Publish\Auth\Auth_Logger;
use Safe_Publish\Auth\VIP_Safe_Auth;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Telemetry_Events;
use Safe_Publish\Utils\Telemetry_Service;
use WP_Error;

/**
 * Tests connections and caches the configured source's authorization status.
 */
final class Connection_Service {

	/** Site transient key for the cached auth probe. */
	public const AUTH_STATUS_TRANSIENT = 'safe_publish_auth_status';

	/** Auth probe cache lifetime in seconds. */
	public const AUTH_STATUS_TTL = 5 * MINUTE_IN_SECONDS;

	/**
	 * Constructs the connection service.
	 *
	 * @param Source_Posts_API  $api       Source API.
	 * @param Telemetry_Service $telemetry Telemetry recorder.
	 */
	public function __construct(
		private Source_Posts_API $api,
		private Telemetry_Service $telemetry
	) {}

	/**
	 * Tests an unslashed connection form without saving its values.
	 *
	 * @param array $input Unslashed form fields.
	 * @psalm-param array{connected_site_url?: mixed, username?: mixed,
	 *     password?: mixed, ...} $input
	 * @return array<string, mixed>|WP_Error Probe or validation error.
	 */
	public function test_connection( array $input ): array|WP_Error {
		$connected_site_url = sanitize_text_field(
			$input['connected_site_url'] ?? ''
		);
		if ( '' === $connected_site_url || '0' === $connected_site_url ) {
			return new WP_Error(
				'connected_site_url_required',
				__( 'Connected site URL is required.', 'safe-publish' )
			);
		}

		$auth_credentials = $this->validate_credentials();
		if ( is_wp_error( $auth_credentials ) ) {
			return $auth_credentials;
		}

		// Explicitly cleared form fields override saved Basic Auth credentials.
		if (
			array_key_exists( 'username', $input )
			&& array_key_exists( 'password', $input )
		) {
			$username = sanitize_text_field( $input['username'] );
			$password = sanitize_text_field( $input['password'] );

			if (
				'' !== $username && '0' !== $username
				&& '' !== $password && '0' !== $password
			) {
				$auth_credentials['username'] = $username;
				$auth_credentials['password'] = $password;
			} else {
				unset(
					$auth_credentials['username'],
					$auth_credentials['password']
				);
			}
		}

		$results = $this->api->test_connection(
			$connected_site_url,
			$auth_credentials
		);

		$this->telemetry->record_event(
			Telemetry_Events::CONNECTION_TEST_COMPLETED,
			array(
				'outcome' => Telemetry_Events::normalize_connection_outcome(
					(string) ( $results['status'] ?? '' )
				),
			)
		);

		return $results;
	}

	// Uniform read input contract.
	// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.Found
	/**
	 * Returns the configured source's cached status with a localized message.
	 *
	 * @param array{} $_input No input fields are required.
	 * @return array<string, mixed>|WP_Error Authorization status.
	 */
	public function auth_status( array $_input ): array|WP_Error {
		$probe = $this->get_cached_auth_status();

		// Translate on every read while keeping the cached probe unchanged.
		$probe['message'] = Source_Posts_API::describe_auth_status(
			(string) ( $probe['status'] ?? '' ),
			(string) ( $probe['error_code'] ?? '' )
		);

		return $probe;
	}
	// phpcs:enable Generic.CodeAnalysis.UnusedFunctionParameter.Found

	/**
	 * Deletes the cached auth-status site transient.
	 */
	public static function bust_auth_status_cache(): void {
		delete_site_transient( self::AUTH_STATUS_TRANSIENT );
	}

	/**
	 * Returns the cached auth-status probe result, refreshing it if absent.
	 *
	 * @return array Probe result from VIP_Safe_Auth::test_authorization().
	 */
	private function get_cached_auth_status(): array {
		$cached = get_site_transient( self::AUTH_STATUS_TRANSIENT );
		if ( is_array( $cached ) && isset( $cached['status'] ) ) {
			return $cached;
		}

		$result = VIP_Safe_Auth::test_authorization(
			get_option( Options::OPTION_CONNECTED_SITE_URL, '' ),
			Auth_Credential_Provider::get_credentials()
		);

		set_site_transient(
			self::AUTH_STATUS_TRANSIENT,
			$result,
			self::AUTH_STATUS_TTL
		);

		// Persist non-authorized outcomes so the destination has a trail of why
		// it cannot connect. Logging only cold-cache reads throttles these rows.
		$status = (string) ( $result['status'] ?? '' );
		if (
			VIP_Safe_Auth::STATUS_UNAUTHORIZED === $status
			|| VIP_Safe_Auth::STATUS_BLOCKED === $status
			|| VIP_Safe_Auth::STATUS_UNREACHABLE === $status
		) {
			( new Auth_Logger() )->connection_probe_failed(
				$status,
				(int) ( $result['code'] ?? 0 ),
				(string) ( $result['error_code'] ?? '' )
			);
		}

		return $result;
	}

	/**
	 * Validates the saved shared secret before probing a form connection.
	 *
	 * @return array<string, string>|WP_Error Credentials or validation error.
	 */
	private function validate_credentials(): array|WP_Error {
		$credentials = Auth_Credential_Provider::get_credentials();
		if ( VIP_Safe_Auth::has_valid_credential_format( $credentials ) ) {
			return $credentials;
		}

		$message = '' === ( $credentials['shared_secret'] ?? '' )
			? __(
				'Shared Secret is not configured. Add SAFE_PUBLISH_SHARED_SECRET to wp-config.php on both sites.',
				'safe-publish'
			)
			: __(
				'Shared Secret is too short. SAFE_PUBLISH_SHARED_SECRET must be at least 16 characters.',
				'safe-publish'
			);

		return new WP_Error(
			'invalid_shared_secret',
			$message,
			array( 'status' => 401 )
		);
	}
}
