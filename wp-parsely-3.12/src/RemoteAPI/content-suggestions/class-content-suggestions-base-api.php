<?php
/**
 * Remote API: Base class for all Parse.ly Content Suggestion API endpoints
 *
 * @package Parsely
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Parsely;
use Parsely\RemoteAPI\Base_Endpoint_Remote;

/**
 * Base API for all Parse.ly Content Suggestion API endpoints.
 *
 * @since 3.12.0
 */
class Content_Suggestions_Base_API extends Base_Endpoint_Remote {
	protected const API_BASE_URL = Parsely::PUBLIC_SUGGESTIONS_API_BASE_URL;

	/**
	 * Returns the request's options for the remote API call.
	 *
	 * @since 3.12.0
	 *
	 * @return array<string, mixed> The array of options.
	 */
	protected function get_request_options(): array {
		return array(
			'headers'     => array( 'Content-Type' => 'application/json; charset=utf-8' ),
			'data_format' => 'body',
			'timeout'     => 60, //phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout
			'body'        => '{}',
		);
	}
}
