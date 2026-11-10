<?php
/**
 * Connectors credential backend.
 *
 * Resolves keys through the WordPress Connectors API (native on WP 7.0, via
 * Gutenberg 23.0+ on 6.9). AI providers (openai/anthropic/google) are core's
 * default connectors; Tavily and YouTube are registered here as custom
 * `api_key` connectors so they appear in Settings → Connectors. Keys are
 * resolved with the same env → constant → database precedence core uses.
 *
 * See docs/specs/ai-connectors-audit.md.
 *
 * @package VIPWorkflows\AI
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Resolves keys via the WordPress Connectors API.
 */
final class ConnectorsCredentialBackend implements CredentialBackend {

	/**
	 * Logical service id => connector id. (1:1 today, kept explicit for clarity.)
	 */
	private const SERVICE_CONNECTORS = array(
		'openai'    => 'openai',
		'anthropic' => 'anthropic',
		'google'    => 'google',
		'tavily'    => 'tavily',
		'youtube'   => 'youtube',
	);

	/**
	 * Custom (non-AI-provider) connectors this plugin registers.
	 *
	 * @var array<string, array<string, string>>
	 */
	private const CUSTOM_CONNECTORS = array(
		'tavily'  => array(
			'name'            => 'Tavily',
			'description'     => 'Web search and media discovery for ideation research.',
			'setting_name'    => 'vip_workflows_tavily_api_key',
			'constant_name'   => 'VIP_WORKFLOWS_TAVILY_KEY',
			'env_var_name'    => 'VIP_WORKFLOWS_TAVILY_KEY',
			'credentials_url' => 'https://tavily.com/#api',
		),
		'youtube' => array(
			'name'            => 'YouTube Data API',
			'description'     => 'YouTube video lookup for ideation research.',
			'setting_name'    => 'vip_workflows_youtube_api_key',
			'constant_name'   => 'VIP_WORKFLOWS_YOUTUBE_KEY',
			'env_var_name'    => 'VIP_WORKFLOWS_YOUTUBE_KEY',
			'credentials_url' => 'https://console.cloud.google.com/apis/credentials',
		),
	);

	/**
	 * Get the API key for a service from its connector.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $service Logical service id.
	 * @return string The key, or '' when unset/unknown.
	 */
	public function get_api_key( string $service ): string {
		$connector_id = self::SERVICE_CONNECTORS[ $service ] ?? '';
		if ( '' === $connector_id || ! function_exists( 'wp_get_connector' ) ) {
			return '';
		}

		$connector = wp_get_connector( $connector_id );
		if ( ! is_array( $connector ) || empty( $connector['authentication'] ) ) {
			return '';
		}

		$auth = $connector['authentication'];
		if ( ( $auth['method'] ?? '' ) !== 'api_key' ) {
			return '';
		}

		return self::resolve_key(
			(string) ( $auth['setting_name'] ?? '' ),
			(string) ( $auth['env_var_name'] ?? '' ),
			(string) ( $auth['constant_name'] ?? '' )
		);
	}

	/**
	 * Register the plugin's custom (non-AI) connectors.
	 *
	 * Hooked on `wp_connectors_init`. AI providers are registered by core; this
	 * adds Tavily + YouTube as `api_key` connectors so they share the Settings →
	 * Connectors surface.
	 *
	 * @since 0.0.1
	 *
	 * @param  object $registry The WP_Connector_Registry instance.
	 * @return void
	 */
	public static function register_custom_connectors( $registry ): void {
		if ( ! is_object( $registry ) || ! method_exists( $registry, 'register' ) ) {
			return;
		}

		foreach ( self::CUSTOM_CONNECTORS as $id => $def ) {
			if ( method_exists( $registry, 'is_registered' ) && $registry->is_registered( $id ) ) {
				continue;
			}
			$registry->register(
				$id,
				array(
					'name'           => $def['name'],
					'description'    => $def['description'],
					'type'           => 'service',
					'authentication' => array(
						'method'          => 'api_key',
						'credentials_url' => $def['credentials_url'],
						'setting_name'    => $def['setting_name'],
						'constant_name'   => $def['constant_name'],
						'env_var_name'    => $def['env_var_name'],
					),
				)
			);
		}
	}

	/**
	 * Resolve a key with env → constant → database precedence (mirrors core).
	 *
	 * @param  string $setting_name  Option name.
	 * @param  string $env_var_name  Environment variable name.
	 * @param  string $constant_name PHP constant name.
	 * @return string Resolved key, or ''.
	 */
	private static function resolve_key( string $setting_name, string $env_var_name, string $constant_name ): string {
		if ( '' !== $env_var_name ) {
			$env = getenv( $env_var_name );
			if ( false !== $env && '' !== $env ) {
				return $env;
			}
		}

		if ( '' !== $constant_name && defined( $constant_name ) ) {
			$value = constant( $constant_name );
			if ( is_string( $value ) && '' !== $value ) {
				return $value;
			}
		}

		if ( '' !== $setting_name ) {
			$value = get_option( $setting_name, '' );
			if ( is_string( $value ) && '' !== $value ) {
				return $value;
			}
		}

		return '';
	}
}
