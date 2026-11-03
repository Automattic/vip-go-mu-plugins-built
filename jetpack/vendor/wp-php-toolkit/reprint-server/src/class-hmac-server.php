<?php

namespace WordPress\Reprint\Server;

/**
 * Verifies requests signed by Site_Export_HMAC_Client.
 *
 * A signature covers the protocol label, a nonce, a timestamp, the method,
 * and the request target, whose query names the endpoint. No body is read:
 * TLS protects the request, and a push endpoint streams php://input itself.
 */
final class HMACServer {

    public const REASON_CLIENT_UPDATE_REQUIRED = 'client_update_required';
    public const REASON_REQUIRES_KEY_AUTH = 'requires_key_auth';
    public const REASON_MISSING_HEADER = 'missing_header';
    public const REASON_TIMESTAMP_EXPIRED = 'timestamp_expired';
    public const REASON_SIGNATURE_MISMATCH = 'signature_mismatch';
    public const REASON_AUTH_FAILED = 'auth_failed';

    /** @var string */
    private $secret;

    /** @var int */
    private $timestamp_tolerance;

    /** @var string|null */
    private $last_error_reason = null;

    public function __construct(string $secret, int $timestamp_tolerance = 300) {
        $this->secret = $secret;
        $this->timestamp_tolerance = $timestamp_tolerance;
    }

    /** Stable reason code for the last error, or null after success. */
    public function last_error_reason(): ?string {
        return $this->last_error_reason;
    }

    /**
     * Verifies one request from explicit inputs. Returns null on success or an
     * error string, with a stable code available from last_error_reason().
     *
     * @param array      $headers        Request headers, either convention.
     * @param string     $method         HTTP method as received.
     * @param string     $request_target path?query as received.
     * @param float|null $now            Current time. Tests pass a fixed value.
     */
    public function verify(array $headers, string $method, string $request_target, ?float $now = null): ?string {
        $this->last_error_reason = null;

        // A released token client signs a message this server no longer verifies.
        $client_update_error = Utils::client_update_error($headers);
        if ($client_update_error !== null) {
            return $this->fail(self::REASON_CLIENT_UPDATE_REQUIRED, $client_update_error);
        }
        // The host rule, enforced here so no embedder can accept a token on a
        // host that requires keys by calling this class directly.
        if (Utils::key_auth_required()) {
            return $this->fail(self::REASON_REQUIRES_KEY_AUTH, 'This host requires key authentication; connection tokens are not accepted');
        }

        $signature = Utils::request_header($headers, 'X-Auth-Signature');
        $nonce = Utils::request_header($headers, 'X-Auth-Nonce');
        $timestamp = Utils::request_header($headers, 'X-Auth-Timestamp');
        foreach ([
            'X-Auth-Signature' => $signature,
            'X-Auth-Nonce' => $nonce,
            'X-Auth-Timestamp' => $timestamp,
        ] as $name => $value) {
            if ($value === null) {
                return $this->fail(self::REASON_MISSING_HEADER, 'Missing ' . $name . ' header');
            }
        }

        $freshness_error = Utils::freshness_error($nonce, $timestamp, $this->timestamp_tolerance, $now);
        if ($freshness_error !== null) {
            return $this->fail($freshness_error[0], $freshness_error[1]);
        }

        $message = \Site_Export_HMAC_Client::build_message($nonce, $timestamp, $method, $request_target);
        if (!hash_equals(hash_hmac('sha256', $message, $this->secret), $signature)) {
            return $this->fail(self::REASON_SIGNATURE_MISMATCH, 'HMAC signature verification failed');
        }

        return null;
    }

    private function fail(string $reason, string $message): string {
        $this->last_error_reason = $reason;
        return $message;
    }
}

if (!class_exists('Site_Export_HMAC_Server', false)) {
    class_alias(HMACServer::class, 'Site_Export_HMAC_Server');
}
