<?php

namespace WordPress\Reprint\Server;

use InvalidArgumentException;

/**
 * Verifies requests signed by PublicKeyClient against enrolled public keys.
 *
 * A signature covers who sent the request, when, and the method and the
 * request target, whose query names the endpoint. No body is read: TLS
 * protects the request.
 *
 * The host rule is enforced here, not in a wrapper an embedder might skip:
 * on a host that does not accept key signatures this class refuses every
 * request before reading a credential.
 */
final class PublicKeyServer {

    public const ALGORITHM = 'reprint-rsa-sha256-v1';

    public const REASON_REQUIRES_TOKEN_AUTH = 'requires_token_auth';
    public const REASON_UNKNOWN_KEY = 'unknown_key';
    public const REASON_MISSING_HEADER = 'missing_header';
    public const REASON_TIMESTAMP_EXPIRED = 'timestamp_expired';
    public const REASON_SIGNATURE_MISMATCH = 'signature_mismatch';
    public const REASON_AUTH_FAILED = 'auth_failed';

    /** @var array<string,string> key id => one-line public key */
    private $public_keys_by_id;

    /** @var int */
    private $timestamp_tolerance;

    /** @var string|null */
    private $last_error_reason = null;

    /** @var string|null */
    private $authenticated_key_id = null;

    /**
     * @param array<string,string> $public_keys_by_id   key id => one-line public key.
     * @param int                  $timestamp_tolerance Seconds either side of now.
     */
    public function __construct(array $public_keys_by_id, int $timestamp_tolerance = 300) {
        $this->public_keys_by_id = $public_keys_by_id;
        $this->timestamp_tolerance = $timestamp_tolerance;
    }

    /**
     * Verifies one request from explicit inputs. Returns null on success or an
     * error string, with a stable code available from last_error_reason().
     *
     * @param array      $headers        Request headers, either convention.
     * @param string     $method         HTTP method as received.
     * @param string     $request_target path?query as received.
     * @param float|null $now            Current time; tests pass a fixed value.
     */
    public function verify(array $headers, string $method, string $request_target, ?float $now = null): ?string {
        $this->last_error_reason = null;
        $this->authenticated_key_id = null;

        if (!Utils::key_auth_required()) {
            return $this->fail(self::REASON_REQUIRES_TOKEN_AUTH, 'This host accepts connection-token authentication only');
        }
        if (!function_exists('openssl_verify')) {
            // Unreachable unless a test overrides the host rule; fails closed.
            return $this->fail(self::REASON_REQUIRES_TOKEN_AUTH, 'This host cannot verify key signatures');
        }

        $key_id = Utils::request_header($headers, 'X-Auth-Key-Id');
        $signature_base64 = Utils::request_header($headers, 'X-Auth-Signature');
        $nonce = Utils::request_header($headers, 'X-Auth-Nonce');
        $timestamp = Utils::request_header($headers, 'X-Auth-Timestamp');

        foreach ([
            'X-Auth-Key-Id' => $key_id,
            'X-Auth-Signature' => $signature_base64,
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

        if (!isset($this->public_keys_by_id[$key_id])) {
            return $this->fail(self::REASON_UNKNOWN_KEY, 'Key ' . $key_id . ' is not enrolled on this site');
        }

        $signature = base64_decode($signature_base64, true);
        if ($signature === false || $signature === '') {
            return $this->fail(self::REASON_AUTH_FAILED, 'Malformed signature');
        }
        try {
            $public_key_pem = Utils::public_key_to_pem($this->public_keys_by_id[$key_id]);
        } catch (InvalidArgumentException $e) {
            return $this->fail(self::REASON_AUTH_FAILED, 'Stored public key ' . $key_id . ' could not be parsed');
        }
        $public_key = @openssl_pkey_get_public($public_key_pem);
        if ($public_key === false) {
            Utils::drain_openssl_error_queue();
            return $this->fail(self::REASON_AUTH_FAILED, 'Stored public key ' . $key_id . ' could not be parsed');
        }
        // Callers are expected to store keys through assert_valid_public_key(),
        // but a key that reached the map another way must still meet its rules.
        $public_key_details = openssl_pkey_get_details($public_key);
        if (
            !is_array($public_key_details)
            || ( $public_key_details['type'] ?? null ) !== OPENSSL_KEYTYPE_RSA
            || ( $public_key_details['bits'] ?? 0 ) < 3072
        ) {
            return $this->fail(self::REASON_AUTH_FAILED, 'Stored public key ' . $key_id . ' is not an RSA key of at least 3072 bits');
        }
        $message = PublicKeyClient::build_message($key_id, $nonce, $timestamp, $method, $request_target);
        $result = openssl_verify($message, $signature, $public_key, OPENSSL_ALGO_SHA256);
        Utils::drain_openssl_error_queue();
        if ($result !== 1) {
            return $this->fail(self::REASON_SIGNATURE_MISMATCH, 'Signature verification failed');
        }

        $this->authenticated_key_id = $key_id;
        return null;
    }

    public function last_error_reason(): ?string {
        return $this->last_error_reason;
    }

    public function authenticated_key_id(): ?string {
        return $this->authenticated_key_id;
    }

    /**
     * Validates a key at enrollment and returns its one-line form.
     *
     * The result is the SubjectPublicKeyInfo encoding OpenSSL produces, not
     * the pasted bytes, so its fingerprint matches the key id the client
     * computes from its private key.
     *
     * @throws InvalidArgumentException With a message naming what was wrong.
     */
    public static function assert_valid_public_key(string $pem_or_one_line): string {
        if (strpos($pem_or_one_line, 'PRIVATE KEY') !== false) {
            throw new InvalidArgumentException('That is a private key. Paste the public key instead.');
        }
        if (strpos($pem_or_one_line, 'BEGIN RSA PUBLIC KEY') !== false) {
            throw new InvalidArgumentException('That is a PKCS#1 RSA public key. Paste the public key printed by "reprint keygen" instead.');
        }
        $one_line = Utils::normalize_public_key($pem_or_one_line);
        if (!function_exists('openssl_pkey_get_public')) {
            throw new InvalidArgumentException('This host cannot parse public keys: the OpenSSL extension is missing.');
        }
        $public_key = @openssl_pkey_get_public(Utils::public_key_to_pem($one_line));
        if ($public_key === false) {
            Utils::drain_openssl_error_queue();
            throw new InvalidArgumentException('Not a parseable public key.');
        }
        $details = openssl_pkey_get_details($public_key);
        if (!is_array($details) || ( $details['type'] ?? null ) !== OPENSSL_KEYTYPE_RSA) {
            throw new InvalidArgumentException('Public key must be RSA.');
        }
        if (( $details['bits'] ?? 0 ) < 3072) {
            throw new InvalidArgumentException('RSA key must be at least 3072 bits. This one has ' . (int) $details['bits'] . '.');
        }
        $canonical_public_key_pem = (string) $details['key'];
        return Utils::normalize_public_key($canonical_public_key_pem);
    }

    private function fail(string $reason, string $message): string {
        $this->last_error_reason = $reason;
        return $message;
    }
}
