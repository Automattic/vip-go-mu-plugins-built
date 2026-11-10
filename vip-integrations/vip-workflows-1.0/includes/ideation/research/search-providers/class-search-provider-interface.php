<?php
/**
 * Search Provider Interface.
 *
 * Contract that all search providers must implement.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Research\SearchProviders;

/**
 * Interface for search providers.
 */
interface SearchProviderInterface {


	/**
	 * Get the provider's unique identifier.
	 *
	 * @return string Provider ID (e.g., 'tavily', 'google', 'brave').
	 */
	public function get_id(): string;

	/**
	 * Get the provider's display name.
	 *
	 * @return string Human-readable name.
	 */
	public function get_name(): string;

	/**
	 * Get the provider's description.
	 *
	 * @return string Description of the provider.
	 */
	public function get_description(): string;

	/**
	 * Check if the provider is configured and ready to use.
	 *
	 * @return bool True if provider has required API keys/config.
	 */
	public function is_configured(): bool;

	/**
	 * Get the configuration error message if not configured.
	 *
	 * @return string|null Error message or null if configured.
	 */
	public function get_configuration_error(): ?string;

	/**
	 * Execute a search query.
	 *
	 * @param string $query       The search query.
	 * @param int    $max_results Maximum number of results to return.
	 * @return array|\WP_Error Array of results or WP_Error on failure.
	 */
	public function search( string $query, int $max_results = 10 );
}
