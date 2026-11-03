<?php

use WordPress\Reprint\Server\EnvelopeSigner;
use WordPress\Reprint\Server\Utils;

/**
 * HMAC client for the Reprint Server API.
 *
 * Signs every request with the shared connection token over the protocol
 * label, a nonce, a timestamp, the method, and the request target, whose
 * query names the endpoint. No request body is signed: TLS protects the
 * request.
 *
 * Usage:
 *   $client = new Site_Export_HMAC_Client($shared_secret);
 *   $headers = $client->get_auth_headers('POST', Utils::endpoint_url($api_url, 'preflight'));
 */
class Site_Export_HMAC_Client implements EnvelopeSigner {

    public const ALGORITHM = 'reprint-hmac-sha256-v2';

    /** @var string */
    private $secret;

    public function __construct(string $secret) {
        $this->secret = $secret;
    }

    /** @return string Hex-encoded 16-byte nonce. */
    public function generate_nonce(): string {
        return bin2hex(Utils::generate_random_bytes(16));
    }

    /** @return string Microsecond-precision Unix timestamp. */
    public function get_timestamp(): string {
        return sprintf('%.6f', microtime(true));
    }

    /**
     * Builds the newline-delimited message both sides sign. No field can
     * contain a newline: the nonce is hex, the timestamp digits with an optional
     * fraction (the server refuses anything else), the method letters, and the
     * request target a URL.
     */
    public static function build_message(string $nonce, string $timestamp, string $method, string $request_target): string {
        return self::ALGORITHM . "\n"
            . $nonce . "\n"
            . $timestamp . "\n"
            . strtoupper($method) . "\n"
            . $request_target;
    }

    /**
     * Returns the X-Auth-* headers for one request.
     *
     * @param string $method HTTP method.
     * @param string $url    Full request URL. Only its path and query are signed.
     * @return array<string,string>
     */
    public function get_auth_headers(string $method, string $url): array {
        $nonce = $this->generate_nonce();
        $timestamp = $this->get_timestamp();
        $message = self::build_message($nonce, $timestamp, $method, self::request_target($url));

        return [
            'X-Auth-Signature' => hash_hmac('sha256', $message, $this->secret),
            'X-Auth-Nonce' => $nonce,
            'X-Auth-Timestamp' => $timestamp,
        ];
    }

    /**
     * EnvelopeSigner for the push stream client. Every request is signed the
     * same way, so this is the signature get_auth_headers() makes.
     *
     * @return array<string,string>
     */
    public function get_envelope_auth_headers(string $method, string $url): array {
        return $this->get_auth_headers($method, $url);
    }

    /**
     * Normalizes a URL to the "path?query" form both sides sign, the same
     * shape PHP exposes as $_SERVER['REQUEST_URI'] on the receiving end.
     */
    public static function request_target(string $url): string {
        $path = parse_url($url, PHP_URL_PATH);
        $query = parse_url($url, PHP_URL_QUERY);
        $target = is_string($path) && $path !== '' ? $path : '/';

        return is_string($query) && $query !== '' ? $target . '?' . $query : $target;
    }

    /** @return string[] ["Name: value", ...] for CURLOPT_HTTPHEADER. */
    public function get_curl_headers(string $method, string $url): array {
        $curl_headers = [];
        foreach ($this->get_auth_headers($method, $url) as $name => $value) {
            $curl_headers[] = "{$name}: {$value}";
        }
        return $curl_headers;
    }
}
