<?php

use function WordPress\Reprint\Server\generate_random_bytes;

require_once __DIR__ . '/utils.php';

/**
 * HMAC Client for the Site Export API.
 *
 * This class generates the required HMAC signatures for authenticating
 * requests to the Site Export API. The importing side uses this to sign
 * all outgoing requests.
 *
 * Usage:
 *   $client = new Site_Export_HMAC_Client($shared_secret);
 *   $headers = $client->get_auth_headers($request_body);
 *   // Add $headers to your HTTP request
 *
 */
class Site_Export_HMAC_Client {

    /**
     * Value of the X-Auth-Content-Hash header when the request body is
     * deliberately not signed: this literal string stands where a body hash
     * would otherwise be. Must match Site_Export_HMAC_Server::UNSIGNED_PAYLOAD.
     */
    public const UNSIGNED_PAYLOAD = 'UNSIGNED-PAYLOAD';

    /** @var string */
    private $secret;

    public function __construct(string $secret) {
        $this->secret = $secret;
    }

    /** @return string Hex-encoded 16-byte nonce. */
    public function generate_nonce(): string {
        return bin2hex(generate_random_bytes(16));
    }

    /** @return string Microsecond-precision Unix timestamp. */
    public function get_timestamp(): string {
        return sprintf('%.6f', microtime(true));
    }

    /**
     * Compute the HMAC signature for a request.
     *
     * The signature covers a SHA-256 hash of the body rather than the raw
     * bytes. This avoids having to predict the exact encoding that libcurl
     * will produce for multipart/form-data uploads while still binding the
     * request to a digest: the server verifies the timestamp, nonce, and HMAC
     * over X-Auth-Content-Hash before it computes or compares any body hash.
     *
     * This is intended for small command requests such as preflight or plan
     * confirmation. Large data transfers
     * should use an authenticated session and per-chunk hashes instead of
     * HMAC-signing one large request body.
     *
     * Signature = HMAC-SHA256(nonce + timestamp + SHA256(body), secret)
     *
     * @param string $nonce        Random nonce for this request
     * @param string $timestamp    Request timestamp
     * @param string $content_hash Hex SHA-256 hash of the request body
     * @return string Hex-encoded HMAC signature
     */
    public function compute_signature(string $nonce, string $timestamp, string $content_hash = ''): string {
        if ($content_hash === '') {
            $content_hash = hash('sha256', '');
        }
        $message = $nonce . $timestamp . $content_hash;
        return hash_hmac('sha256', $message, $this->secret);
    }

    /** Returns all four X-Auth-* headers for a single request. */
    public function get_auth_headers(string $body = ''): array {
        $nonce = $this->generate_nonce();
        $timestamp = $this->get_timestamp();
        $content_hash = hash('sha256', $body);
        $signature = $this->compute_signature($nonce, $timestamp, $content_hash);

        return [
            'X-Auth-Signature' => $signature,
            'X-Auth-Nonce' => $nonce,
            'X-Auth-Timestamp' => $timestamp,
            'X-Auth-Content-Hash' => $content_hash,
        ];
    }

    /**
     * Returns X-Auth-* headers for a request whose body is not signed.
     *
     * The signature covers the nonce, the timestamp, the method, and the
     * request target instead of a body hash, so a body of any size streams
     * through without either side hashing it, and captured auth headers still cannot be reused for a
     * different endpoint or method. Protecting the body from tampering is
     * TLS's job — over --force-http a tampered body would be accepted,
     * which is what that flag's help text warns about.
     *
     * Signature = HMAC-SHA256(nonce + timestamp + "UNSIGNED-PAYLOAD\n" + METHOD + "\n" + target, secret)
     *
     * @param string $method Uppercased into the signature (GET, POST, ...).
     * @param string $url    Full request URL; only path and query are signed.
     */
    public function get_envelope_auth_headers(string $method, string $url): array {
        $nonce = $this->generate_nonce();
        $timestamp = $this->get_timestamp();
        $message = $nonce . $timestamp . self::UNSIGNED_PAYLOAD . "\n" . strtoupper($method) . "\n" . self::request_target($url);

        return [
            'X-Auth-Signature' => hash_hmac('sha256', $message, $this->secret),
            'X-Auth-Nonce' => $nonce,
            'X-Auth-Timestamp' => $timestamp,
            'X-Auth-Content-Hash' => self::UNSIGNED_PAYLOAD,
        ];
    }

    /**
     * Normalizes a URL to the "path?query" form both sides sign — the same
     * shape PHP exposes as $_SERVER['REQUEST_URI'] on the receiving end.
     */
    public static function request_target(string $url): string {
        $path = parse_url($url, PHP_URL_PATH);
        $query = parse_url($url, PHP_URL_QUERY);
        $target = is_string($path) && $path !== '' ? $path : '/';

        return is_string($query) && $query !== '' ? $target . '?' . $query : $target;
    }

    /** Returns auth headers formatted for CURLOPT_HTTPHEADER (["Name: value", ...]). */
    public function get_curl_headers(string $body = ''): array {
        $headers = $this->get_auth_headers($body);
        $curl_headers = [];
        foreach ($headers as $name => $value) {
            $curl_headers[] = "{$name}: {$value}";
        }
        return $curl_headers;
    }
}
