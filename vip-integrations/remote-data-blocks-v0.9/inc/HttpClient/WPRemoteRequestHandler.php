<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use Exception;
use GuzzleHttp\Promise\FulfilledPromise;
use GuzzleHttp\Promise\PromiseInterface;
use GuzzleHttp\Promise\RejectedPromise;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\RequestInterface;
use WpOrg\Requests\Utility\CaseInsensitiveDictionary;
use function is_wp_error;
use function wp_remote_request;
use function wp_remote_retrieve_body;
use function wp_remote_retrieve_headers;
use function wp_remote_retrieve_response_code;

class WPRemoteRequestHandler {
	const DEFAULT_HTTP_VERSION = '1.1';
	const DEFAULT_TIMEOUT = 5;

	/**
	 * Handle a PSR-7 request via wp_remote_request and return a promise.
	 *
	 * @param RequestInterface $request The PSR-7 request to send.
	 * @param array            $options Request options.
	 * @return PromiseInterface A promise that resolves with a PSR-7 response.
	 */
	public function __invoke( RequestInterface $request, array $options ): PromiseInterface {
		try {
			// Convert Guzzle request to arguments for wp_remote_request.
			$url = (string) $request->getUri();
			$headers = [];

			// If we are running on WordPress Playground, use the provided CORS proxy.
			if ( defined( 'USE_PLAYGROUND_CORS_PROXY' ) && true === USE_PLAYGROUND_CORS_PROXY ) {
				$new_uri = $request->getUri()
					->withHost( 'playground.wordpress.net' )
					->withScheme( 'https' )
					->withPath( '/cors-proxy.php' )
					->withQuery( $url );
				$request = $request->withUri( $new_uri );
				$url = (string) $new_uri;
				$headers['X-Cors-Proxy-Allowed-Request-Headers'] = 'Authorization';
			}

			$args = [
				'body' => (string) $request->getBody(), // Stream has been read, let __toString() rewind and read it.
				'headers' => $headers,
				'httpversion' => $options['httpversion'] ?? self::DEFAULT_HTTP_VERSION,
				'method' => $request->getMethod(),
				'timeout' => $options['timeout'] ?? self::DEFAULT_TIMEOUT,
			];

			// Collapse duplicate headers into a single comma-separated header.
			foreach ( $request->getHeaders() as $name => $values ) {
				$args['headers'][ $name ] = implode( ', ', $values );
			}

			// Make the request.
			$response = wp_remote_request( $url, $args );

			// Handle errors.
			if ( is_wp_error( $response ) ) {
				return new RejectedPromise( new Exception( $response->get_error_message() ) );
			}

			// Get the response data
			$response_code = wp_remote_retrieve_response_code( $response );
			$response_body = wp_remote_retrieve_body( $response );
			$response_headers = wp_remote_retrieve_headers( $response );

			// Convert the response headers to an array.
			if ( $response_headers instanceof CaseInsensitiveDictionary ) {
				$response_headers = $response_headers->getAll();
			}

			// Create a Guzzle-compatible promise response.
			return new FulfilledPromise(
				new Response(
					$response_code,
					$response_headers,
					$response_body,
					$args['httpversion'],
				)
			);
		} catch ( Exception $e ) {
			// Return rejected promise in case of an exception
			return new RejectedPromise( $e );
		}
	}
}
