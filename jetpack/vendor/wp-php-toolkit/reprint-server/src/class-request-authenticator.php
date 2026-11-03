<?php

namespace WordPress\Reprint\Server;

/**
 * The one authentication entry point embedders should call.
 *
 * Holds whatever credentials the embedder stores and routes to the verifier
 * the host requires. The embedder decides nothing: it passes both kinds of
 * credential if it has both, and core ignores the one the host does not
 * accept.
 */
final class RequestAuthenticator {

    public const REASON_CLIENT_UPDATE_REQUIRED = 'client_update_required';
    public const REASON_NOT_CONFIGURED = 'not_configured';
    public const REASON_NO_KEYS_ENROLLED = 'no_keys_enrolled';
    public const REASON_REQUIRES_KEY_AUTH = HMACServer::REASON_REQUIRES_KEY_AUTH;
    public const REASON_REQUIRES_TOKEN_AUTH = PublicKeyServer::REASON_REQUIRES_TOKEN_AUTH;
    public const REASON_UNKNOWN_KEY = PublicKeyServer::REASON_UNKNOWN_KEY;
    public const REASON_AUTH_FAILED = 'auth_failed';

    /**
     * Authentication refusal reasons shared with client error diagnosis.
     *
     * Use the verifier constants so changes to server reasons reach the client.
     * Keep content_hash_mismatch for plugins using the earlier token protocol.
     * Current plugin errors also report auth_version; older plugin errors can
     * carry these reasons without it.
     */
    public const AUTHENTICATION_REASONS = [
        self::REASON_AUTH_FAILED,
        HMACServer::REASON_MISSING_HEADER,
        HMACServer::REASON_TIMESTAMP_EXPIRED,
        HMACServer::REASON_SIGNATURE_MISMATCH,
        'content_hash_mismatch',
        self::REASON_REQUIRES_KEY_AUTH,
        self::REASON_REQUIRES_TOKEN_AUTH,
        self::REASON_UNKNOWN_KEY,
        self::REASON_NOT_CONFIGURED,
        self::REASON_NO_KEYS_ENROLLED,
        self::REASON_CLIENT_UPDATE_REQUIRED,
    ];

    /** @var string|null */
    private $hmac_secret;

    /** @var array<string,string> */
    private $public_keys_by_id;

    /** @var int */
    private $timestamp_tolerance;

    /** @var string|null */
    private $last_error_reason = null;

    /** @var string|null */
    private $authenticated_key_id = null;

    /**
     * @param string|null          $hmac_secret         Stored connection token, or null when none.
     * @param array<string,string> $public_keys_by_id   Enrolled keys, key id => one-line public key.
     * @param int                  $timestamp_tolerance Seconds either side of now.
     */
    public function __construct(?string $hmac_secret, array $public_keys_by_id, int $timestamp_tolerance = 300) {
        $this->hmac_secret = $hmac_secret === '' ? null : $hmac_secret;
        $this->public_keys_by_id = $public_keys_by_id;
        $this->timestamp_tolerance = $timestamp_tolerance;
    }

    /**
     * Verifies one request from explicit inputs. Null on success, else an
     * error string with a stable code from last_error_reason().
     */
    public function verify(array $headers, string $method, string $request_target, ?float $now = null): ?string {
        $this->last_error_reason = null;
        $this->authenticated_key_id = null;

        // A released token client signs a message this server no longer verifies.
        $client_update_error = Utils::client_update_error($headers);
        if ($client_update_error !== null) {
            return $this->fail(self::REASON_CLIENT_UPDATE_REQUIRED, $client_update_error);
        }
        $has_key_id = Utils::request_header($headers, 'X-Auth-Key-Id') !== null;

        if (!Utils::key_auth_required()) {
            if ($has_key_id) {
                return $this->fail(self::REASON_REQUIRES_TOKEN_AUTH, 'This host accepts connection-token authentication only');
            }
            if ($this->hmac_secret === null) {
                return $this->fail(self::REASON_NOT_CONFIGURED, 'Export not configured: no connection token is stored');
            }
            $hmac_server = new HMACServer($this->hmac_secret, $this->timestamp_tolerance);
            $error = $hmac_server->verify($headers, $method, $request_target, $now);
            if ($error !== null) {
                return $this->fail($hmac_server->last_error_reason() ?? self::REASON_AUTH_FAILED, $error);
            }
            return null;
        }

        // No keys enrolled answers first: a site that upgraded with only a
        // token stored tells its token clients to enroll a key rather than
        // reporting a scheme mismatch they cannot act on.
        if (empty($this->public_keys_by_id)) {
            return $this->fail(self::REASON_NO_KEYS_ENROLLED, 'Export not configured: this host requires key authentication and no keys are enrolled');
        }
        if (!$has_key_id) {
            return $this->fail(self::REASON_REQUIRES_KEY_AUTH, 'This host requires key authentication; connection tokens are not accepted');
        }
        $public_key_server = new PublicKeyServer($this->public_keys_by_id, $this->timestamp_tolerance);
        $error = $public_key_server->verify($headers, $method, $request_target, $now);
        if ($error !== null) {
            return $this->fail($public_key_server->last_error_reason() ?? self::REASON_AUTH_FAILED, $error);
        }
        $this->authenticated_key_id = $public_key_server->authenticated_key_id();
        return null;
    }

    /** Verifies the current PHP request without reading its body. */
    public function verify_globals(?float $now = null): ?string {
        // phpcs:disable WordPress.Security.ValidatedSanitizedInput -- Exact request-line values are covered by the signature.
        $method = (string) ( $_SERVER['REQUEST_METHOD'] ?? '' );
        $request_target = (string) ( $_SERVER['REQUEST_URI'] ?? '' );
        // phpcs:enable WordPress.Security.ValidatedSanitizedInput

        return $this->verify(Utils::request_headers(), $method, $request_target, $now);
    }

    public function last_error_reason(): ?string {
        return $this->last_error_reason;
    }

    public function authenticated_key_id(): ?string {
        return $this->authenticated_key_id;
    }

    private function fail(string $reason, string $message): string {
        $this->last_error_reason = $reason;
        return $message;
    }
}
