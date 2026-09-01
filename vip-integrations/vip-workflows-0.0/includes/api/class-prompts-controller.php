<?php
/**
 * Prompts REST API controller.
 *
 * Admin-gated surface for configuring AI system prompts: a read-only list of
 * registered prompts (grouped, with defaults + current overrides) plus a
 * per-prompt override save/reset. Mirrors the ToolsController pattern.
 *
 * @package VIPWorkflows\API
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\PromptSettings;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * REST controller for prompt configuration.
 */
class PromptsController extends WP_REST_Controller {

	/**
	 * Maximum accepted override length, in bytes.
	 *
	 * Bounds what an admin can persist into the `vip_workflows_prompts` option
	 * and later feed into AI calls. Generous enough for long system prompts.
	 */
	private const MAX_PROMPT_LENGTH = 20000;

	/**
	 * Construct the PromptsController instance.
	 *
	 * @since 0.0.1
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'prompts';
	}

	/**
	 * Register REST API routes.
	 *
	 * @since 0.0.1
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[a-z0-9_/-]+)',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_override' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
				'args'                => array(
					'id' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
			)
		);
	}

	/**
	 * List all registered prompts with their defaults and current overrides.
	 *
	 * @since 0.0.1
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		unset( $request );

		$data = array();
		foreach ( PromptRegistry::get_instance()->get_all() as $definition ) {
			$data[] = $this->prepare_prompt( $definition );
		}

		return new WP_REST_Response( $data );
	}

	/**
	 * Set or reset the override for a single prompt.
	 *
	 * Body: { prompt: string }. An empty/whitespace value resets to the default.
	 *
	 * @since 0.0.1
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_override( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$id     = (string) $request->get_param( 'id' );
		$params = $request->get_json_params();

		if ( ! is_array( $params ) || ! array_key_exists( 'prompt', $params ) ) {
			return new WP_Error(
				'invalid_payload',
				__( 'Request must include a "prompt" value.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		$prompt = $params['prompt'];
		if ( ! is_string( $prompt ) ) {
			return new WP_Error(
				'invalid_prompt',
				__( 'Prompt must be a string.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		// Strip invalid UTF-8 but preserve prompt fidelity (newlines, markdown,
		// {variables}, [ACTION] blocks). These are stored verbatim and sent to
		// the AI, not rendered as HTML, so HTML-escaping would corrupt them.
		$prompt = wp_check_invalid_utf8( $prompt, true );

		if ( strlen( $prompt ) > self::MAX_PROMPT_LENGTH ) {
			return new WP_Error(
				'prompt_too_large',
				/* translators: %d: maximum prompt length in characters. */
				sprintf( __( 'Prompt is too large. Maximum is %d characters.', 'vip-workflows' ), self::MAX_PROMPT_LENGTH ),
				array( 'status' => 413 )
			);
		}

		$registry   = PromptRegistry::get_instance();
		$definition = $registry->get_definition( $id );
		if ( null === $definition ) {
			return new WP_Error(
				'unknown_prompt',
				__( 'Unknown prompt.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		if ( ! PromptSettings::get_instance()->set_override( $id, $prompt ) ) {
			return new WP_Error(
				'save_failed',
				__( 'Failed to save the prompt override.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $this->prepare_prompt( $definition ) );
	}

	/**
	 * Check whether the current user can administer this endpoint.
	 *
	 * @since 0.0.1
	 *
	 * @return bool
	 */
	public function admin_permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Build the response shape for a single prompt.
	 *
	 * @param  array $definition Registry definition.
	 * @return array<string, mixed>
	 */
	private function prepare_prompt( array $definition ): array {
		return array(
			'id'          => $definition['id'],
			'label'       => $definition['label'],
			'group'       => $definition['group'],
			'description' => $definition['description'],
			'variables'   => $definition['variables'],
			'default'     => $definition['default'],
			'override'    => PromptSettings::get_instance()->get_override( $definition['id'] ),
		);
	}
}
