<?php
/**
 * General Settings REST Controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Admin\Settings;
use VIPWorkflows\AI\Credentials;
use VIPWorkflows\AI\AiModels;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Handles general workflow settings.
 */
class GeneralSettingsController extends WP_REST_Controller {


	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'vip-workflows/v1';
		$this->rest_base = 'settings/general';
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_settings' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);

		// Endpoint to get available roles.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/roles',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_roles' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);
	}

	/**
	 * Check admin permissions.
	 *
	 * @return bool
	 */
	public function admin_permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get general settings.
	 *
	 * @return WP_REST_Response
	 */
	public function get_settings(): WP_REST_Response {
		$settings = Settings::get_settings();

		return new WP_REST_Response(
			array(
				'workflow_enforcement'         => $settings['workflow_enforcement'] ?? false,
				'workflow_enforcement_mode'    => $settings['workflow_enforcement_mode'] ?? 'require',
				'allow_self_review'            => $settings['allow_self_review'] ?? false,
				'bypass_workflow_roles'        => $settings['bypass_workflow_roles'] ?? array( 'administrator' ),
				'bypass_tool_check_roles'      => $settings['bypass_tool_check_roles'] ?? array( 'administrator' ),
				'audit_log_roles'              => $settings['audit_log_roles'] ?? array( 'administrator', 'editor' ),
				'audit_log_full_access_roles'  => $settings['audit_log_full_access_roles'] ?? array( 'administrator' ),
				// General AI provider + model (media/ideation/research), distinct
				// from the AI Agent's own model. Stored in their own options via
				// Credentials. `ai_provider` may be derived from a lone credential
				// rather than chosen, and may be '' when nothing resolves, so the
				// client is told which — a derived selection is unsaved, and the
				// form has to show it as such and let one click pin it.
				'ai_provider'                  => Credentials::get_instance()->provider(),
				'ai_provider_selected'         => Credentials::get_instance()->has_explicit_provider(),
				'ai_providers'                 => Credentials::get_instance()->available_providers(),
				'ai_model'                     => Credentials::get_instance()->model(),
				'ai_models'                    => self::provider_model_map(),
			)
		);
	}

	/**
	 * Save general settings.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function save_settings( WP_REST_Request $request ): WP_REST_Response {
		$settings = Settings::get_settings();
		$input    = $request->get_json_params();

		// Sanitize and update each setting.
		if ( isset( $input['workflow_enforcement'] ) ) {
			$settings['workflow_enforcement'] = (bool) $input['workflow_enforcement'];
		}

		if ( isset( $input['workflow_enforcement_mode'] ) ) {
			$settings['workflow_enforcement_mode'] = in_array( $input['workflow_enforcement_mode'], array( 'require', 'recommend' ), true )
				? $input['workflow_enforcement_mode']
				: 'require';
		}

		if ( isset( $input['allow_self_review'] ) ) {
			$settings['allow_self_review'] = (bool) $input['allow_self_review'];
		}

		if ( isset( $input['bypass_workflow_roles'] ) ) {
			$settings['bypass_workflow_roles'] = $this->sanitize_roles( $input['bypass_workflow_roles'] );
		}

		if ( isset( $input['bypass_tool_check_roles'] ) ) {
			$settings['bypass_tool_check_roles'] = $this->sanitize_roles( $input['bypass_tool_check_roles'] );
		}

		if ( isset( $input['audit_log_roles'] ) ) {
			$settings['audit_log_roles'] = $this->sanitize_roles( $input['audit_log_roles'] );
		}

		if ( isset( $input['audit_log_full_access_roles'] ) ) {
			$settings['audit_log_full_access_roles'] = $this->sanitize_roles( $input['audit_log_full_access_roles'] );
		}

		// General AI provider + model live in their own options (read by
		// Credentials::provider()/model()), not in vip_workflows_settings.
		// Resolve the target provider from this request first so the model is
		// validated against the provider being saved.
		$ai_provider     = Credentials::get_instance()->provider();
		$provider_posted = isset( $input['ai_provider'] );
		$provider_taken  = $provider_posted && in_array( (string) $input['ai_provider'], Credentials::get_instance()->available_providers(), true );

		if ( $provider_taken ) {
			$ai_provider = (string) $input['ai_provider'];
			update_option( 'vip_workflows_ai_provider', $ai_provider );
		}

		/*
		 * Persist the model into the per-provider map, validated against the
		 * provider's live catalog (an empty catalog accepts any non-empty id).
		 *
		 * Skipped when no provider resolved, because the map is keyed by provider
		 * and a model filed under '' is unreachable. Skipped again when a provider
		 * was posted and rejected: `$ai_provider` still holds the *previously*
		 * selected one, so continuing would file the caller's model under a vendor
		 * they were not addressing — and answer 200 as though it had been saved.
		 */
		$model_targets_this_provider = ! $provider_posted || $provider_taken;

		if ( $model_targets_this_provider && '' !== $ai_provider && isset( $input['ai_model'] ) && AiModels::is_valid( $ai_provider, (string) $input['ai_model'] ) ) {
			$ai_models = get_option( 'vip_workflows_ai_models', array() );
			if ( ! is_array( $ai_models ) ) {
				$ai_models = array();
			}
			$ai_models[ $ai_provider ] = (string) $input['ai_model'];
			update_option( 'vip_workflows_ai_models', $ai_models );
		}

		update_option( 'vip_workflows_settings', $settings );

		return $this->get_settings();
	}

	/**
	 * Get available WordPress roles.
	 *
	 * @return WP_REST_Response
	 */
	public function get_roles(): WP_REST_Response {
		// get_editable_roles() requires admin includes.
		if ( ! function_exists( 'get_editable_roles' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}

		$editable_roles = get_editable_roles();
		$roles          = array();

		foreach ( $editable_roles as $role_key => $role_info ) {
			$roles[] = array(
				'key'  => $role_key,
				'name' => translate_user_role( $role_info['name'] ),
			);
		}

		return new WP_REST_Response( $roles );
	}

	/**
	 * Sanitize an array of role keys.
	 *
	 * @param array $roles Raw roles array.
	 * @return array Sanitized roles.
	 */
	private function sanitize_roles( array $roles ): array {
		if ( ! function_exists( 'get_editable_roles' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}

		$editable_roles = array_keys( get_editable_roles() );

		return array_values(
			array_filter(
				array_map( 'sanitize_key', $roles ),
				function ( $role ) use ( $editable_roles ) {
					return in_array( $role, $editable_roles, true );
				}
			)
		);
	}

	/**
	 * Build a provider id => text-generation model ids map for every available
	 * provider, so the settings UI can switch the model dropdown locally without
	 * a round trip when the provider changes.
	 *
	 * @return array<string, string[]>
	 */
	private static function provider_model_map(): array {
		$map = array();
		foreach ( Credentials::get_instance()->available_providers() as $provider ) {
			$map[ $provider ] = AiModels::for_provider( $provider );
		}
		return $map;
	}
}
