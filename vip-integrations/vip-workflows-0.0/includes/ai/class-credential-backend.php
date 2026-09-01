<?php
/**
 * Credential backend interface.
 *
 * A backend resolves a raw API key for a logical service id. The Credentials
 * facade selects one backend by capability and layers the constant/env bridge
 * on top, so backends only need to answer "what key is stored for this service".
 *
 * @package VIPWorkflows\AI
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Resolves stored API keys for a credential backend.
 */
interface CredentialBackend {

	/**
	 * Get the API key for a service.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $service Logical service id (e.g. 'openai', 'tavily').
	 * @return string The key, or '' when unset/unknown.
	 */
	public function get_api_key( string $service ): string;
}
