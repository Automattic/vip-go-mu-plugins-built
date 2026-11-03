<?php

namespace WordPress\Reprint\Server;

/**
 * A signer that can authenticate a request whose body is not signed.
 *
 * Push uploads stream bodies of any size, so the signature covers the
 * method and request target and leaves the body to TLS. Both the HMAC and
 * public-key clients provide this; the push stream client depends on nothing
 * else about a signer.
 */
interface EnvelopeSigner {

    /**
     * Returns X-Auth-* headers for a request whose body is not signed.
     *
     * @param string $method HTTP method, uppercased into the signature.
     * @param string $url    Full request URL; only path and query are signed.
     * @return array<string,string> Header name => value.
     */
    public function get_envelope_auth_headers(string $method, string $url): array;
}
