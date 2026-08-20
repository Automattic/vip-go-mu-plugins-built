<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Google\Auth;

use WP_Error;

/**
 * @psalm-suppress PossiblyUnusedProperty
 */
class GoogleServiceAccountKey {
	public string $type;
	public string $project_id;
	public string $private_key_id;
	public string $private_key;
	public string $client_email;
	public string $client_id;
	public string $auth_uri;
	public string $token_uri;
	public string $auth_provider_x509_cert_url;
	public string $client_x509_cert_url;
	public string $universe_domain;

	/**
	 * Validate the raw service account data.
	 *
	 * This function checks if the required fields are present in the raw service account data.
	 * It returns a WP_Error if any of the required fields are missing or invalid.
	 *
	 * Currently only validates the fields which are required to generate a JWT for getting Google
	 * Access Token.
	 *
	 * @param array $raw_service_account The raw service account data to validate.
	 * @return true|WP_Error Returns true if validation passes, or a WP_Error array if validation fails.
	 */
	public static function validate( array $raw_service_account_key ): WP_Error|bool {
		if ( ! isset( $raw_service_account_key['type'] ) ) {
			return new WP_Error( 'missing_type', __( 'type is required', 'remote-data-blocks' ) );
		}

		if ( 'service_account' !== $raw_service_account_key['type'] ) {
			return new WP_Error( 'invalid_type', __( 'type must be service_account', 'remote-data-blocks' ) );
		}

		if ( ! isset( $raw_service_account_key['project_id'] ) ) {
			return new WP_Error( 'missing_project_id', __( 'project_id is required', 'remote-data-blocks' ) );
		}

		if ( ! isset( $raw_service_account_key['private_key'] ) ) {
			return new WP_Error( 'missing_private_key', __( 'private_key is required', 'remote-data-blocks' ) );
		}

		if ( ! isset( $raw_service_account_key['client_email'] ) ) {
			return new WP_Error( 'missing_client_email', __( 'client_email is required', 'remote-data-blocks' ) );
		}

		if ( ! isset( $raw_service_account_key['token_uri'] ) ) {
			return new WP_Error( 'missing_token_uri', __( 'token_uri is required', 'remote-data-blocks' ) );
		}

		return true;
	}

	public function __construct( array $raw_service_account_key ) {
		$this->type = $raw_service_account_key['type'];
		$this->project_id = $raw_service_account_key['project_id'];
		$this->private_key_id = $raw_service_account_key['private_key_id'];
		$this->private_key = $raw_service_account_key['private_key'];
		$this->client_email = $raw_service_account_key['client_email'];
		$this->client_id = $raw_service_account_key['client_id'];
		$this->auth_uri = $raw_service_account_key['auth_uri'];
		$this->token_uri = $raw_service_account_key['token_uri'];
		$this->auth_provider_x509_cert_url = $raw_service_account_key['auth_provider_x509_cert_url'];
		$this->client_x509_cert_url = $raw_service_account_key['client_x509_cert_url'];
		$this->universe_domain = $raw_service_account_key['universe_domain'];
	}

	public static function from_array( array $raw_service_account_key ): WP_Error|GoogleServiceAccountKey {
		$validation_error = self::validate( $raw_service_account_key );
		if ( is_wp_error( $validation_error ) ) {
			return new WP_Error(
				'invalid_service_account_key',
				__( 'Invalid service account key:', 'remote-data-blocks' ) . ' ' . $validation_error->get_error_message(),
				$validation_error
			);
		}

		return new self( $raw_service_account_key );
	}
}
