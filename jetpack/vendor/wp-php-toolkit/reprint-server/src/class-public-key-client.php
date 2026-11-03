<?php

namespace WordPress\Reprint\Server;

use InvalidArgumentException;
use RuntimeException;

/**
 * Signs Reprint API requests with an RSA private key.
 *
 * The site holds only the public half, so nothing a site stores can produce
 * one of these signatures. The signed message covers the protocol label,
 * the key id, the freshness fields, the method, and the request target,
 * whose query names the endpoint. The key
 * authenticates the sender and TLS protects the request, so no request body
 * is signed: every request is signed the way the push envelope is.
 */
final class PublicKeyClient implements EnvelopeSigner {

    public const ALGORITHM = 'reprint-rsa-sha256-v1';

    /** @var resource|object Private key handle: openssl_pkey_get_private() returns a resource on PHP 7 and an OpenSSLAsymmetricKey object on PHP 8. */
    private $private_key;

    /** @var string One-line base64 public key. */
    private $public_key_one_line;

    /** @var string */
    private $key_id;

    /**
     * @param string $private_key_pem RSA private key in PEM form.
     * @throws InvalidArgumentException When the PEM is not an RSA private key.
     * @throws RuntimeException When OpenSSL is unavailable.
     */
    public function __construct(string $private_key_pem) {
        self::assert_openssl_available();
        $private_key = @openssl_pkey_get_private($private_key_pem);
        if ($private_key === false) {
            Utils::drain_openssl_error_queue();
            throw new InvalidArgumentException('The private key could not be parsed. Expected an RSA private key in PEM form.');
        }
        $details = openssl_pkey_get_details($private_key);
        if (!is_array($details) || ( $details['type'] ?? null ) !== OPENSSL_KEYTYPE_RSA) {
            throw new InvalidArgumentException('The private key is not an RSA key.');
        }
        $this->private_key = $private_key;
        $public_key_pem = (string) $details['key'];
        $this->public_key_one_line = Utils::normalize_public_key($public_key_pem);
        $this->key_id = Utils::public_key_fingerprint($this->public_key_one_line);
    }

    /**
     * Generates a 3072-bit RSA keypair.
     *
     * @return array{0:string,1:string} Private key PEM and one-line public key.
     * @throws RuntimeException When OpenSSL is unavailable or generation fails.
     */
    public static function generate_keypair(): array {
        self::assert_openssl_available();
        $configargs = [
            'private_key_bits' => 3072,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ];
        $keypair = @openssl_pkey_new($configargs);
        $temporary_config_path = null;
        try {
            if ($keypair === false) {
                // PHP reads openssl.cnf (OPENSSL_CONF or <OPENSSLDIR>/openssl.cnf)
                // before generating or exporting and refuses when the file is
                // missing, as on Windows and some CI PHP builds. Every setting is
                // passed explicitly, so an empty file stands in for it.
                // The failed attempt left config errors queued; drop them so a
                // failure below reports its own cause.
                Utils::drain_openssl_error_queue();
                $temporary_config_path = tempnam(sys_get_temp_dir(), 'reprint-openssl-');
                if ($temporary_config_path === false) {
                    throw new RuntimeException('Key generation failed: cannot create a temporary OpenSSL config.');
                }
                $configargs['config'] = $temporary_config_path;
                $keypair = openssl_pkey_new($configargs);
            }
            if ($keypair === false) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- OpenSSL error text, never HTML output.
                throw new RuntimeException('Key generation failed: ' . (string) openssl_error_string());
            }
            $private_key_pem = '';
            if (!openssl_pkey_export($keypair, $private_key_pem, null, $configargs)) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- OpenSSL error text, never HTML output.
                throw new RuntimeException('Could not export the private key: ' . (string) openssl_error_string());
            }
        } finally {
            if ($temporary_config_path !== null) {
                @unlink($temporary_config_path);
            }
        }
        $details = openssl_pkey_get_details($keypair);
        if (!is_array($details) || !isset($details['key']) || !is_string($details['key'])) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- OpenSSL error text, never HTML output.
            throw new RuntimeException('Could not read the generated public key: ' . (string) openssl_error_string());
        }
        // Generation and export can queue warnings even when they succeed.
        Utils::drain_openssl_error_queue();
        return [$private_key_pem, Utils::normalize_public_key($details['key'])];
    }

    public function get_public_key(): string {
        return $this->public_key_one_line;
    }

    public function get_key_id(): string {
        return $this->key_id;
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
     * Builds the newline-delimited message both sides sign.
     *
     * Newlines are a safe delimiter because no field can contain one: hex,
     * decimal, uppercase letters, or a request line.
     */
    public static function build_message(
        string $key_id,
        string $nonce,
        string $timestamp,
        string $method,
        string $request_target
    ): string {
        return self::ALGORITHM . "\n"
            . $key_id . "\n"
            . $nonce . "\n"
            . $timestamp . "\n"
            . strtoupper($method) . "\n"
            . $request_target;
    }

    /**
     * Returns the X-Auth-* headers for a request.
     *
     * @param string $method HTTP method.
     * @param string $url    Full request URL; only path and query are signed.
     * @return array<string,string>
     */
    public function get_auth_headers(string $method, string $url): array {
        $nonce = $this->generate_nonce();
        $timestamp = $this->get_timestamp();
        $message = self::build_message(
            $this->key_id,
            $nonce,
            $timestamp,
            $method,
            \Site_Export_HMAC_Client::request_target($url)
        );
        $signature = '';
        if (!openssl_sign($message, $signature, $this->private_key, OPENSSL_ALGO_SHA256)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- OpenSSL error text, never HTML output.
            throw new RuntimeException('Signing failed: ' . (string) openssl_error_string());
        }
        return [
            'X-Auth-Key-Id' => $this->key_id,
            'X-Auth-Signature' => base64_encode($signature),
            'X-Auth-Nonce' => $nonce,
            'X-Auth-Timestamp' => $timestamp,
        ];
    }

    /**
     * EnvelopeSigner for the push stream client. A key signature never covers
     * a body, so this is the same signature get_auth_headers() makes.
     *
     * @return array<string,string>
     */
    public function get_envelope_auth_headers(string $method, string $url): array {
        return $this->get_auth_headers($method, $url);
    }

    /** @return string[] ["Name: value", ...] for CURLOPT_HTTPHEADER. */
    public function get_curl_headers(string $method, string $url): array {
        $curl_headers = [];
        foreach ($this->get_auth_headers($method, $url) as $name => $value) {
            $curl_headers[] = $name . ': ' . $value;
        }
        return $curl_headers;
    }

    private static function assert_openssl_available(): void {
        if (!function_exists('openssl_sign') || !function_exists('openssl_pkey_new')) {
            throw new RuntimeException('Public-key signing requires the OpenSSL PHP extension.');
        }
    }
}
