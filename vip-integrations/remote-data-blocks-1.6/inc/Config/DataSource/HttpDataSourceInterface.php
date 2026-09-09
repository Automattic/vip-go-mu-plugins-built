<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\DataSource;

use WP_Error;

/**
 * HttpDataSourceInterface
 *
 * Interface used to define a Remote Data Blocks DataSource for an HTTP API. It
 * defines the properties of an API that will be shared by queries against that
 * API.
 *
 * Assumptions:
 * - The API speaks valid JSON, both for request and response bodies.
 * - The API returns 2XX for successful requests.
 * - The API returns 3XX for redirects with a maximum of 5 redirects.
 * - The API returns 4XX or 5XX for unrecoverable errors, in which case the
 *   response should be ignored.
 *
 * If you are a WPVIP customer, data sources are automatically provided by VIP.
 * Only implement this interface if you have custom data sources not provided by VIP.
 *
 */
interface HttpDataSourceInterface extends DataSourceInterface {
	/**
	 * Get the endpoint for the query. Note that the query configuration has an
	 * opportunity to change / override the endpoint at request time. For REST
	 * APIs, a useful pattern is for the data source to define a base endpoint and
	 * the query config to target a specific resource.
	 *
	 * @return string The endpoint for the query.
	 */
	public function get_endpoint(): string;

	/**
	 * Get the request headers. Override this method to provide authorization or
	 * other custom request headers. Note that the query configuration can override
	 * or extend these headers at request time.
	 *
	 * @return array Associative array of request headers.
	 */
	public function get_request_headers(): array|WP_Error;
}
