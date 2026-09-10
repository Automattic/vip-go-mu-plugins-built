<?php

/**
 * HMAC verifier for Reprint API requests.
 *
 * This class verifies requests signed by Site_Export_HMAC_Client. It validates
 * the required X-Auth-* headers and checks request freshness before hashing a
 * received body.
 */
final class Site_Export_HMAC_Server {

    /**
     * Value of the X-Auth-Content-Hash header when the request body is
     * deliberately not signed: this literal string stands where a body hash
     * would otherwise be. Must match Site_Export_HMAC_Client::UNSIGNED_PAYLOAD.
     */
    public const UNSIGNED_PAYLOAD = 'UNSIGNED-PAYLOAD';

    /** @var string */
    private $secret;

    /** @var int */
    private $timestamp_tolerance;

    public function __construct(string $secret, int $timestamp_tolerance = 300) {
        $this->secret = $secret;
        $this->timestamp_tolerance = $timestamp_tolerance;
    }

    /**
     * Verify one body-signed pull request using explicit inputs.
     *
     * Returns null on success, or an error string on failure. Push uploads use
     * envelope authentication instead of whole-body HMAC verification.
     *
     * When $files is non-empty, the content hash is computed from uploaded file
     * contents rather than $body so multipart uploads verify consistently.
     */
    public function verify(array $headers = [], ?string $body = null, array $files = [], ?float $now = null): ?string {
        $auth = $this->collect_auth_headers($headers);
        $auth_error = $this->verify_auth_headers($auth, $now);
        if ($auth_error !== null) {
            return $auth_error;
        }

        try {
            $actual_content_hash = $this->compute_received_content_hash($body, $files);
        } catch (RuntimeException $e) {
            return $e->getMessage();
        }

        if (!hash_equals($auth['content_hash'], $actual_content_hash)) {
            return 'Content hash mismatch: body was modified in transit';
        }

        return null;
    }

    /**
     * Verify a request whose body is deliberately not signed.
     *
     * Instead of a body hash, the signature covers exactly four values:
     * the nonce, the timestamp, the HTTP method, and the request target
     * (the "path?query" part of the URL). A request body of any size can then
     * stream through without either side hashing it, and a captured set of
     * auth headers still cannot be reused for a different endpoint or
     * method. Protecting the body from tampering is TLS's job.
     *
     * The X-Auth-Content-Hash header must be the literal string
     * UNSIGNED-PAYLOAD. Because of that, headers signed for this check can
     * never pass the body-signed checks and vice versa — the two signatures
     * are computed over strings that can never be equal. Each route decides
     * which check it calls, so a client cannot make a pull endpoint accept
     * this body-less check.
     *
     * @param string $request_target The "path?query" form of the request URL.
     */
    public function verify_envelope(array $headers, string $method, string $request_target, ?float $now = null): ?string {
        $auth = $this->collect_auth_headers($headers);
        if ($auth['content_hash'] !== self::UNSIGNED_PAYLOAD) {
            return 'Envelope verification requires the literal UNSIGNED-PAYLOAD content hash';
        }

        $freshness_error = $this->verify_freshness($auth, $now);
        if ($freshness_error !== null) {
            return $freshness_error;
        }

        $message = $auth['nonce'] . $auth['timestamp'] . self::UNSIGNED_PAYLOAD . "\n" . strtoupper($method) . "\n" . $request_target;
        $expected_signature = hash_hmac('sha256', $message, $this->secret);
        if (!hash_equals($expected_signature, $auth['signature'])) {
            return 'HMAC signature verification failed';
        }

        return null;
    }

    /**
     * Verify the current PHP request using superglobals.
     *
     * Returns null on success, or an error string on failure. Pull endpoints
     * use body signatures; push uploads use verify_envelope().
     */
    public function verify_globals(?float $now = null): ?string {
        $body = file_get_contents('php://input');
        if ($body === false) {
            $body = '';
        }

        return $this->verify($this->collect_global_headers(), $body, $_FILES, $now);
    }

    private function collect_auth_headers(array $headers): array {
        return [
            'signature' => $this->get_header($headers, 'X-Auth-Signature'),
            'nonce' => $this->get_header($headers, 'X-Auth-Nonce'),
            'timestamp' => $this->get_header($headers, 'X-Auth-Timestamp'),
            'content_hash' => $this->get_header($headers, 'X-Auth-Content-Hash'),
        ];
    }

    private function verify_auth_headers(array $auth, ?float $now = null): ?string {
        $freshness_error = $this->verify_freshness($auth, $now);
        if ($freshness_error !== null) {
            return $freshness_error;
        }

        $expected_signature = hash_hmac('sha256', $auth['nonce'] . $auth['timestamp'] . $auth['content_hash'], $this->secret);
        if (!hash_equals($expected_signature, $auth['signature'])) {
            return 'HMAC signature verification failed';
        }

        return null;
    }

    /**
     * Checks header presence, timestamp tolerance, and nonce length —
     * everything except the signature. Body-signed and envelope-signed
     * requests compute their signatures over different strings, so each
     * caller does its own signature check after this passes.
     */
    private function verify_freshness(array $auth, ?float $now = null): ?string {
        $signature = $auth['signature'];
        $nonce = $auth['nonce'];
        $timestamp = $auth['timestamp'];
        $signed_content_hash = $auth['content_hash'];
        if ($signature === null || $signature === '') {
            return 'Missing X-Auth-Signature header';
        }
        if ($nonce === null || $nonce === '') {
            return 'Missing X-Auth-Nonce header';
        }
        if ($timestamp === null || $timestamp === '') {
            return 'Missing X-Auth-Timestamp header';
        }
        if ($signed_content_hash === null || $signed_content_hash === '') {
            return 'Missing X-Auth-Content-Hash header';
        }

        if (!is_numeric($timestamp)) {
            return 'Invalid timestamp format';
        }

        $request_time = (float) $timestamp;
        $current_time = $now ?? microtime(true);
        $time_diff = abs($current_time - $request_time);

        if ($time_diff > $this->timestamp_tolerance) {
            return sprintf(
                'Request timestamp expired. Difference: %.2f seconds, max allowed: %d seconds',
                $time_diff,
                $this->timestamp_tolerance
            );
        }

        if (strlen($nonce) < 16) {
            return 'Nonce must be at least 16 characters';
        }

        return null;
    }

    private function collect_global_headers(): array {
        $headers = [];

        if (function_exists('getallheaders')) {
            $all_headers = getallheaders();
            if (is_array($all_headers)) {
                $headers = $all_headers;
            }
        }

        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') !== 0 || !is_string($value)) {
                continue;
            }

            $headers[$key] = $value;
        }

        return $headers;
    }

    private function get_header(array $headers, string $name): ?string {
        foreach ($headers as $key => $value) {
            if (!is_string($value)) {
                continue;
            }

            if (strcasecmp($key, $name) === 0) {
                return $value;
            }

            if (strcasecmp($key, 'HTTP_' . strtoupper(str_replace('-', '_', $name))) === 0) {
                return $value;
            }
        }

        return null;
    }

    private function compute_received_content_hash(?string $body, array $files): string {
        if (empty($files)) {
            return hash('sha256', $body ?? '');
        }

        $context = hash_init('sha256');
        $this->append_file_hashes($context, $files);
        return hash_final($context);
    }

    /**
     * Walk a PHP $_FILES-style structure in a deterministic order.
     */
    private function append_file_hashes($context, array $files): void {
        ksort($files);

        foreach ($files as $file_info) {
            if (!is_array($file_info)) {
                continue;
            }

            $tmp_name = $file_info['tmp_name'] ?? null;
            $this->append_tmp_name_hash($context, $tmp_name);
        }
    }

    private function append_tmp_name_hash($context, $tmp_name): void {
        if (is_array($tmp_name)) {
            ksort($tmp_name);
            foreach ($tmp_name as $nested_tmp_name) {
                $this->append_tmp_name_hash($context, $nested_tmp_name);
            }
            return;
        }

        if (!is_string($tmp_name) || $tmp_name === '' || !is_readable($tmp_name)) {
            return;
        }

        if (!@hash_update_file($context, $tmp_name)) {
            throw new RuntimeException('Cannot hash uploaded file.');
        }
    }
}
