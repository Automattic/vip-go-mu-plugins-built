<?php
/**
 * Permission Manager class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Auth;

use Safe_Publish\API\Dispatch_Logger;
use Safe_Publish\API\Export_Logger;
use Safe_Publish\API\Request_Actions;
use WP_Error;
use WP_HTTP_Response;
use WP_Post;
use WP_Post_Type;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_User;

/**
 * Manages permissions for authenticated Safe Publish requests.
 *
 * Grants and overrides WordPress capabilities and REST API permission
 * callbacks for requests authenticated via HMAC-SHA256.
 */
class Permission_Manager {

	/**
	 * Logger instance.
	 *
	 * @var Auth_Logger
	 */
	private Auth_Logger $logger;

	/**
	 * Export logger instance.
	 *
	 * @var Export_Logger
	 */
	private Export_Logger $export_logger;

	/**
	 * Dispatch logger instance for non-export REST dispatch outcomes.
	 *
	 * @var Dispatch_Logger
	 */
	private Dispatch_Logger $dispatch_logger;

	/**
	 * Whether the current request is authenticated.
	 *
	 * @var bool
	 */
	private bool $authenticated = false;

	/**
	 * Whether a context permission override re-dispatch is in progress.
	 *
	 * @var bool
	 */
	private bool $context_override = false;

	/**
	 * Suppresses every rest_post_dispatch firing after the first per HTTP
	 * request. Primarily blocks the _embed subrequest log cascade for
	 * import calls (subrequests inherit $_SERVER, including the action
	 * header, so would otherwise log spurious CONTENT_EXPORTED rows for
	 * authors, featured media, and terms). Also a generic guard against
	 * any other re-dispatch path. Latched after the action-validity check
	 * so unrecognized requests don't consume the flag.
	 *
	 * @var bool
	 */
	private bool $dispatch_logged = false;

	/**
	 * Constructor.
	 *
	 * @param Auth_Logger     $logger          Auth logger instance.
	 * @param Export_Logger   $export_logger   Export logger instance.
	 * @param Dispatch_Logger $dispatch_logger Dispatch logger instance.
	 */
	public function __construct(
		Auth_Logger $logger,
		Export_Logger $export_logger,
		Dispatch_Logger $dispatch_logger
	) {
		$this->logger          = $logger;
		$this->export_logger   = $export_logger;
		$this->dispatch_logger = $dispatch_logger;
	}

	/**
	 * Checks whether the current request is authenticated.
	 *
	 * @return bool True if authenticated.
	 */
	public function is_authenticated(): bool {
		return $this->authenticated;
	}

	/**
	 * Sets up authenticated context for Safe Publish requests.
	 *
	 * Grants necessary permissions for REST API operations.
	 *
	 * @param WP_REST_Request $request Authenticated REST request.
	 */
	public function setup_authenticated_context(
		WP_REST_Request $request
	): void {
		$this->authenticated = true;

		add_filter( 'user_has_cap', array( $this, 'grant_api_capabilities' ), 10, 4 );

		// Grant caps via filter — HMAC already authenticated the caller, so we
		// don't need a real WP user.
		$this->logger->authenticated_context_installed(
			$request->get_route(),
			$request->get_method(),
			'capability_only',
			'HMAC already authenticated the caller'
		);

		add_filter( 'rest_pre_dispatch', array( $this, 'bypass_permission_checks' ), 11, 3 );
		add_filter( 'rest_post_collection_params', array( $this, 'override_collection_params' ), 10, 2 );
		add_filter( 'rest_prepare_post', array( $this, 'ensure_edit_context_access' ), 10, 3 );
		add_filter( 'rest_prepare_page', array( $this, 'ensure_edit_context_access' ), 10, 3 );
		add_filter( 'rest_endpoints', array( $this, 'override_endpoint_permissions' ) );
		add_filter( 'map_meta_cap', array( $this, 'override_meta_capabilities' ), 10, 4 );
		add_filter( 'rest_post_dispatch', array( $this, 'override_context_permissions' ), 5, 3 );
		add_filter( 'rest_post_dispatch', array( $this, 'log_dispatch_event' ), 20, 3 );

		// Drop the elevation when the dispatch finishes so a subsequent REST
		// request handled by the same PHP process does not inherit the
		// authenticated context. Runs after log_dispatch_event so the audit
		// log still sees the authenticated flag.
		add_filter( 'rest_post_dispatch', array( $this, 'tear_down_authenticated_context' ), PHP_INT_MAX, 3 );
	}

	/**
	 * Removes the filters installed by setup_authenticated_context.
	 *
	 * @param WP_REST_Response|WP_HTTP_Response|WP_Error $result   Response.
	 * @param WP_REST_Server                             $_server  Server instance.
	 * @param WP_REST_Request                            $_request Request object.
	 * @return WP_REST_Response|WP_HTTP_Response|WP_Error Response, unchanged.
	 */
	public function tear_down_authenticated_context( // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		WP_REST_Response|WP_HTTP_Response|WP_Error $result,
		WP_REST_Server $_server,
		WP_REST_Request $_request
	): WP_REST_Response|WP_HTTP_Response|WP_Error {
		// Skip during the inner rest_forbidden_context re-dispatch — otherwise
		// teardown fires before log_dispatch_event writes the outer audit row.
		if ( ! $this->authenticated || $this->context_override ) {
			return $result;
		}

		remove_filter( 'user_has_cap', array( $this, 'grant_api_capabilities' ), 10 );
		remove_filter( 'user_has_cap', array( $this, 'apply_request_caps' ), 5 );
		remove_filter( 'user_has_cap', array( $this, 'apply_context_caps' ), 999 );
		remove_filter( 'user_has_cap', array( $this, 'apply_edit_context_caps' ), 999 );

		remove_filter( 'rest_pre_dispatch', array( $this, 'bypass_permission_checks' ), 11 );
		remove_filter( 'rest_post_collection_params', array( $this, 'override_collection_params' ), 10 );
		remove_filter( 'rest_prepare_post', array( $this, 'ensure_edit_context_access' ), 10 );
		remove_filter( 'rest_prepare_page', array( $this, 'ensure_edit_context_access' ), 10 );
		remove_filter( 'rest_endpoints', array( $this, 'override_endpoint_permissions' ) );
		remove_filter( 'map_meta_cap', array( $this, 'override_meta_capabilities' ), 10 );
		remove_filter( 'rest_post_dispatch', array( $this, 'override_context_permissions' ), 5 );
		remove_filter( 'rest_post_dispatch', array( $this, 'log_dispatch_event' ), 20 );

		remove_filter( 'rest_allow_anonymous_comments', '__return_true' );
		remove_filter( 'rest_prepare_post', array( $this, 'prepare_post_for_edit_context' ), 10 );
		remove_filter( 'rest_prepare_page', array( $this, 'prepare_post_for_edit_context' ), 10 );
		remove_filter( 'rest_post_dispatch', array( $this, 'ensure_response_success' ), 10 );

		remove_filter( 'rest_post_dispatch', array( $this, 'tear_down_authenticated_context' ), PHP_INT_MAX );

		$this->authenticated    = false;
		$this->context_override = false;
		$this->dispatch_logged  = false;

		return $result;
	}

	/**
	 * Handles permission checks before REST callbacks are executed.
	 *
	 * Intercepts the permission check that causes rest_forbidden_context errors
	 * and grants a comprehensive set of capabilities for Safe Publish requests.
	 *
	 * @param WP_REST_Response|WP_HTTP_Response|WP_Error|null $response Response to replace.
	 * @param array                                           $handler  Route handler used for the request.
	 * @param WP_REST_Request                                 $request  Request used to generate the response.
	 * @return WP_REST_Response|WP_HTTP_Response|WP_Error|null Modified response.
	 */
	public function handle_permission_check(
		WP_REST_Response|WP_HTTP_Response|WP_Error|null $response,
		array $handler,
		WP_REST_Request $request
	): WP_REST_Response|WP_HTTP_Response|WP_Error|null {
		if ( ! $this->authenticated ) {
			return $response;
		}

		$route = $request->get_route();
		if ( ! $route || strpos( $route, '/wp/v2/' ) !== 0 ) {
			return $response;
		}

		add_filter( 'user_has_cap', array( $this, 'apply_request_caps' ), 5, 4 );

		$this->logger->permission_check_intercepted(
			$route,
			$request->get_method(),
			$request->get_param( 'context' ),
			isset( $handler['callback'] ) ? 'set' : 'not_set'
		);

		return $response;
	}

	/**
	 * Overrides meta capabilities for Safe Publish authenticated requests.
	 *
	 * Handles capability mapping that occurs before user_has_cap.
	 *
	 * @param array  $caps    Required capabilities.
	 * @param string $cap     Capability being checked.
	 * @param int    $user_id User ID.
	 * @param array  $_args   Arguments passed to capability check.
	 * @return array Modified capabilities.
	 */
	public function override_meta_capabilities( // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		array $caps,
		string $cap,
		int $user_id,
		array $_args
	): array {
		if ( ! $this->authenticated ) {
			return $caps;
		}

		$edit_caps = array(
			'edit_post',
			'edit_posts',
			'edit_others_posts',
			'edit_private_posts',
			'edit_published_posts',
			'read_post',
			'read_private_posts',
			'delete_post',
			'delete_posts',
			'delete_others_posts',
			'delete_private_posts',
			'delete_published_posts',
		);

		if ( ! in_array( $cap, $edit_caps, true ) ) {
			return $caps;
		}

		$this->logger->meta_cap_overridden( $cap, $user_id, $caps );

		// Grant the capability by returning 'exist' (always granted).
		return array( 'exist' );
	}

	/**
	 * `user_has_cap` callback used by handle_permission_check to grant the
	 * full request-level capability bag once HMAC has authenticated.
	 *
	 * @param array $allcaps Existing caps.
	 * @return array Modified caps.
	 */
	public function apply_request_caps( array $allcaps ): array {
		if ( ! $this->authenticated ) {
			return $allcaps;
		}

		$caps = array(
			'read',
			'edit_posts',
			'edit_others_posts',
			'edit_private_posts',
			'edit_published_posts',
			'publish_posts',
			'delete_posts',
			'delete_others_posts',
			'delete_private_posts',
			'delete_published_posts',
			'read_private_posts',
			'edit_pages',
			'edit_others_pages',
			'edit_private_pages',
			'edit_published_pages',
			'publish_pages',
			'delete_pages',
			'delete_others_pages',
			'delete_private_pages',
			'delete_published_pages',
			'read_private_pages',
			'manage_categories',
			'manage_options',
			'upload_files',
			'edit_files',
			'unfiltered_html',
			// wp_navigation maps every post cap to edit_theme_options;
			// granting it lets the destination GET /wp/v2/navigation/{id}.
			'edit_theme_options',
		);

		foreach ( $caps as $cap ) {
			$allcaps[ $cap ] = true;
		}

		return $allcaps;
	}

	/**
	 * `user_has_cap` callback used by override_context_permissions during the
	 * re-dispatch of a forbidden-context error. Removed immediately after the
	 * inner dispatch completes.
	 *
	 * @param array $allcaps Existing caps.
	 * @return array Modified caps.
	 */
	public function apply_context_caps( array $allcaps ): array {
		if ( ! $this->authenticated ) {
			return $allcaps;
		}

		$allcaps['edit_posts']         = true;
		$allcaps['edit_others_posts']  = true;
		$allcaps['edit_private_posts'] = true;
		$allcaps['read_private_posts'] = true;
		$allcaps['edit_pages']         = true;
		$allcaps['edit_others_pages']  = true;
		$allcaps['edit_private_pages'] = true;
		$allcaps['read_private_pages'] = true;

		return $allcaps;
	}

	/**
	 * `user_has_cap` callback used by ensure_edit_context_access during the
	 * per-row rest_prepare_* preparation step.
	 *
	 * @param array $allcaps Existing caps.
	 * @return array Modified caps.
	 */
	public function apply_edit_context_caps( array $allcaps ): array {
		if ( ! $this->authenticated ) {
			return $allcaps;
		}

		$allcaps['edit_posts']         = true;
		$allcaps['edit_others_posts']  = true;
		$allcaps['edit_private_posts'] = true;
		$allcaps['read_private_posts'] = true;

		return $allcaps;
	}

	/**
	 * Grants API capabilities for Safe Publish authenticated requests.
	 *
	 * @param array   $allcaps All capabilities for the user.
	 * @param array   $_caps   Required capabilities.
	 * @param array   $_args   Arguments for capability check.
	 * @param WP_User $_user   User object.
	 * @return array Modified capabilities.
	 */
	public function grant_api_capabilities( // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		array $allcaps,
		array $_caps,
		array $_args,
		WP_User $_user
	): array {
		if ( ! $this->authenticated ) {
			return $allcaps;
		}

		$api_caps = array(
			'read',
			'edit_posts',
		);

		foreach ( $api_caps as $cap ) {
			$allcaps[ $cap ] = true;
		}

		return $allcaps;
	}

	/**
	 * Permission callback that allows all operations for Safe Publish authenticated requests.
	 *
	 * @param WP_REST_Request|null $request Optional. REST request object.
	 * @return bool True for Safe Publish authenticated requests, otherwise result of capability check.
	 */
	public function allow_all_permissions(
		?WP_REST_Request $request = null
	): bool {
		if ( ! $this->authenticated ) {
			return current_user_can( 'read' );
		}

		$this->logger->permission_override_applied(
			$request ? $request->get_route() : 'unknown',
			$request ? $request->get_method() : 'unknown',
			$request ? $request->get_param( 'context' ) : 'unknown'
		);

		return true;
	}

	/**
	 * Overrides REST endpoint permissions for Safe Publish authenticated requests.
	 *
	 * @param array $endpoints Registered REST endpoints.
	 * @return array Modified endpoints.
	 */
	public function override_endpoint_permissions( array $endpoints ): array {
		if ( ! $this->authenticated ) {
			return $endpoints;
		}

		$post_routes = array( '/wp/v2/posts', '/wp/v2/pages' );

		foreach ( $post_routes as $route ) {
			if ( ! isset( $endpoints[ $route ] ) ) {
				continue;
			}

			foreach ( $endpoints[ $route ] as &$handler ) {
				if (
					! isset( $handler['methods'] ) ||
					( 'GET' !== $handler['methods'] && false === strpos( $handler['methods'], 'GET' ) )
				) {
					continue;
				}

				$handler['permission_callback'] = array( $this, 'allow_all_permissions' );

				$this->logger->permission_callback_overridden( $route, $handler['methods'] );
			}
		}

		return $endpoints;
	}

	/**
	 * Overrides collection parameters to allow edit context for Safe Publish.
	 *
	 * @param array        $params    Collection parameters.
	 * @param WP_Post_Type $post_type Post type object.
	 * @return array Modified collection parameters.
	 */
	public function override_collection_params(
		array $params,
		WP_Post_Type $post_type
	): array {
		if ( ! $this->authenticated ) {
			return $params;
		}

		if ( ! isset( $params['context'] ) ) {
			return $params;
		}

		$params['context']['default'] = 'edit';
		unset( $params['context']['required'] );

		$this->logger->collection_params_overridden( $post_type->name, 'edit' );

		return $params;
	}

	/**
	 * Overrides context permissions for REST API responses.
	 *
	 * Specifically handles the rest_forbidden_context error by re-dispatching
	 * the request with elevated permissions.
	 *
	 * @param WP_REST_Response|WP_Error $result  Response object.
	 * @param WP_REST_Server            $server  Server instance.
	 * @param WP_REST_Request           $request Request object.
	 * @return WP_REST_Response|WP_Error Modified or re-dispatched response.
	 */
	public function override_context_permissions(
		WP_REST_Response|WP_Error $result,
		WP_REST_Server $server,
		WP_REST_Request $request
	): WP_REST_Response|WP_Error {
		if ( ! $this->authenticated ) {
			return $result;
		}

		// Prevent infinite recursion if re-dispatch also returns a forbidden error.
		if ( $this->context_override ) {
			return $result;
		}

		if ( ! is_wp_error( $result ) || 'rest_forbidden_context' !== $result->get_error_code() ) {
			return $result;
		}

		$this->logger->context_error_overridden(
			$result->get_error_message(),
			$request->get_route(),
			$request->get_method(),
			$request->get_param( 'context' )
		);

		$this->context_override = true;

		add_filter( 'user_has_cap', array( $this, 'apply_context_caps' ), 999, 4 );

		$new_result = $server->dispatch( $request );

		remove_filter( 'user_has_cap', array( $this, 'apply_context_caps' ), 999 );

		$this->context_override = false;

		return $new_result;
	}

	/**
	 * Ensures edit context access for Safe Publish authenticated requests.
	 *
	 * @param WP_REST_Response $response Response object.
	 * @param WP_Post          $_post    Post object (unused; required by filter signature).
	 * @param WP_REST_Request  $_request Request object (unused; required by filter signature).
	 * @return WP_REST_Response Response object, unchanged.
	 */
	public function ensure_edit_context_access( // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		WP_REST_Response $response,
		WP_Post $_post,
		WP_REST_Request $_request
	): WP_REST_Response {
		if ( ! $this->authenticated ) {
			return $response;
		}

		// Stable named-method registration; idempotent across the per-row
		// rest_prepare_* firings in a list response.
		if ( ! has_filter( 'user_has_cap', array( $this, 'apply_edit_context_caps' ) ) ) {
			add_filter( 'user_has_cap', array( $this, 'apply_edit_context_caps' ), 999, 4 );
		}

		return $response;
	}

	/**
	 * Bypasses additional permission checks for Safe Publish authenticated requests.
	 *
	 * @param WP_REST_Response|WP_Error|null $result  Response to replace the requested version with.
	 * @param WP_REST_Server                 $_server Server instance.
	 * @param WP_REST_Request                $_request Request used to generate the response.
	 * @return WP_REST_Response|WP_Error|null Original result, unchanged.
	 */
	public function bypass_permission_checks( // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		WP_REST_Response|WP_Error|null $result,
		WP_REST_Server $_server,
		WP_REST_Request $_request
	): WP_REST_Response|WP_Error|null {
		if ( ! $this->authenticated ) {
			return $result;
		}

		add_filter( 'rest_allow_anonymous_comments', '__return_true' );
		add_filter( 'rest_prepare_post', array( $this, 'prepare_post_for_edit_context' ), 10, 3 );
		add_filter( 'rest_prepare_page', array( $this, 'prepare_post_for_edit_context' ), 10, 3 );
		add_filter( 'rest_post_dispatch', array( $this, 'ensure_response_success' ), 10, 3 );

		return $result;
	}

	/**
	 * Prepares post data for edit context when Safe Publish is authenticated.
	 *
	 * @param WP_REST_Response $response Response object.
	 * @param WP_Post          $post     Post object.
	 * @param WP_REST_Request  $request  Request object.
	 * @return WP_REST_Response Response object, unchanged.
	 */
	public function prepare_post_for_edit_context(
		WP_REST_Response $response,
		WP_Post $post,
		WP_REST_Request $request
	): WP_REST_Response {
		if ( ! $this->authenticated ) {
			return $response;
		}

		if ( 'edit' === $request->get_param( 'context' ) ) {
			$this->logger->edit_context_allowed(
				$post->ID,
				$post->post_type,
				$request->get_route()
			);
		}

		return $response;
	}

	/**
	 * Ensures response success for valid Safe Publish operations.
	 *
	 * Logs permission errors for diagnostic purposes.
	 *
	 * @param WP_REST_Response|WP_Error $response Response object.
	 * @param WP_REST_Server            $_server  Server instance.
	 * @param WP_REST_Request           $request  Request used to generate the response.
	 * @return WP_REST_Response|WP_Error Response, potentially modified.
	 */
	public function ensure_response_success(
		WP_REST_Response|WP_Error $response,
		// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
		WP_REST_Server $_server,
		WP_REST_Request $request
	): WP_REST_Response|WP_Error {
		if ( ! $this->authenticated ) {
			return $response;
		}

		if ( ! is_wp_error( $response ) ) {
			return $response;
		}

		$error_code = $response->get_error_code();

		if ( ! in_array( $error_code, array( 'rest_forbidden', 'rest_cannot_edit', 'rest_forbidden_context' ), true ) ) {
			return $response;
		}

		$this->logger->permission_error_intercepted(
			$error_code,
			$response->get_error_message(),
			$request->get_route(),
			$request->get_method(),
			$request->get_param( 'context' )
		);

		return $response;
	}

	/**
	 * Routes each authenticated REST dispatch outcome to the appropriate
	 * audit channel based on the declared X-Safe-Publish-Action header.
	 *
	 * - import / media-import → export channel: CONTENT_EXPORTED on
	 *   success, EXPORT_REQUEST_ERROR for WP_Error, EXPORT_RESPONSE_BAD_STATUS
	 *   for non-200.
	 * - list / preview / probe → dispatch channel: DISPATCH_REQUEST_ERROR
	 *   or DISPATCH_RESPONSE_BAD_STATUS on failure. Successes go unlogged
	 *   here — REQUEST_AUTHENTICATED in the auth channel records them.
	 * - Missing / unrecognized action → nothing written. The auth channel
	 *   covers it via REQUEST_AUTHENTICATED plus REQUEST_ACTION_UNRECOGNIZED.
	 *
	 * Hooked on rest_post_dispatch at priority 20, after permission
	 * overrides and context re-dispatches. Skipped for unauthenticated
	 * requests, context-override re-dispatch, and once $dispatch_logged
	 * has latched (see that field's doc for why).
	 *
	 * @param WP_REST_Response|WP_Error $response Response object.
	 * @param WP_REST_Server            $_server  Server instance.
	 * @param WP_REST_Request           $request  Request used to generate the response.
	 * @return WP_REST_Response|WP_Error Unmodified response.
	 */
	public function log_dispatch_event(
		WP_REST_Response|WP_Error $response,
		// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
		WP_REST_Server $_server,
		WP_REST_Request $request
	): WP_REST_Response|WP_Error {
		if ( ! $this->authenticated || $this->context_override || $this->dispatch_logged ) {
			return $response;
		}

		// Source: $_SERVER, not $request->get_headers(). Synthetic _embed
		// subrequests don't inherit headers, so reading from $request would
		// skip them implicitly via the empty-action branch and obscure
		// $dispatch_logged's role; $_SERVER persists across subrequest
		// dispatch, keeping the flag as the explicit dedup mechanism.
		// Not sanitized: HMAC_Authenticator signs the raw value, so any
		// normalization here could let a crafted header classify differently
		// than it verified. Request_Actions::is_valid() is the actual gate.
		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$action = isset( $_SERVER['HTTP_X_SAFE_PUBLISH_ACTION'] )
			? (string) wp_unslash( $_SERVER['HTTP_X_SAFE_PUBLISH_ACTION'] )
			: '';
		// phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

		if ( ! Request_Actions::is_valid( $action ) ) {
			return $response;
		}

		// Latch the flag before routing so any _embed subrequests that re-fire
		// rest_post_dispatch after we return are short-circuited above.
		$this->dispatch_logged = true;

		$route = $request->get_route();
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___SERVER__HTTP_USER_AGENT__
		$raw_user_agent       = $_SERVER['HTTP_USER_AGENT'] ?? '';
		$destination_site_url = $this->parse_destination_site_url( $raw_user_agent );

		if ( Request_Actions::is_export( $action ) ) {
			$this->log_export_outcome( $response, $route, $destination_site_url );
		} else {
			$this->log_non_export_outcome( $response, $action, $route, $destination_site_url );
		}

		return $response;
	}

	/**
	 * Records a real export (import / media-import) outcome in the export
	 * channel.
	 *
	 * @param WP_REST_Response|WP_Error $response             Response object.
	 * @param string                    $route                REST route of the request.
	 * @param string                    $destination_site_url URL of the destination that called.
	 */
	private function log_export_outcome(
		WP_REST_Response|WP_Error $response,
		string $route,
		string $destination_site_url
	): void {
		if ( is_wp_error( $response ) ) {
			$this->export_logger->export_request_error(
				$route,
				$destination_site_url,
				$response->get_error_code(),
				$response->get_error_message()
			);
			return;
		}

		$status = $response->get_status();

		if ( 200 !== $status ) {
			$this->export_logger->export_response_bad_status( $route, $destination_site_url, $status );
			return;
		}

		// content_exported needs the rest_base and a post_id. If the route
		// doesn't match the single-resource shape, neither is reliably
		// available, so we skip rather than log a malformed row.
		if ( 1 !== preg_match( '#^/wp/v2/([^/]+)/(\d+)$#', $route, $matches ) ) {
			return;
		}

		$data    = $response->get_data();
		$post_id = is_array( $data ) && isset( $data['id'] ) && is_int( $data['id'] )
			? $data['id']
			: (int) $matches[2];

		$this->export_logger->content_exported(
			$matches[1],
			$destination_site_url,
			array( $post_id )
		);
	}

	/**
	 * Records a non-export (list/preview/probe) failure in the dispatch
	 * channel. Successes go unrecorded — REQUEST_AUTHENTICATED in the
	 * auth channel covers them.
	 *
	 * @param WP_REST_Response|WP_Error $response             Response object.
	 * @param string                    $action               Declared request action.
	 * @param string                    $route                REST route of the request.
	 * @param string                    $destination_site_url URL of the destination that called.
	 */
	private function log_non_export_outcome(
		WP_REST_Response|WP_Error $response,
		string $action,
		string $route,
		string $destination_site_url
	): void {
		if ( is_wp_error( $response ) ) {
			$this->dispatch_logger->dispatch_request_error(
				$route,
				$action,
				$destination_site_url,
				$response->get_error_code(),
				$response->get_error_message()
			);
			return;
		}

		$status = $response->get_status();

		if ( 200 !== $status ) {
			$this->dispatch_logger->dispatch_response_bad_status(
				$route,
				$action,
				$destination_site_url,
				$status
			);
		}
	}

	/**
	 * Extracts the destination site URL from a Safe Publish User-Agent string.
	 *
	 * The destination sends: "Safe Publish/VERSION; https://dest.example.com".
	 * Returns the URL portion, or the full string if the expected format is not
	 * matched.
	 *
	 * @param string $user_agent Raw HTTP_USER_AGENT value.
	 * @return string Destination URL, or empty string if header is absent.
	 */
	private function parse_destination_site_url( string $user_agent ): string {
		if ( '' === $user_agent ) {
			return '';
		}

		// Format: "Safe Publish/x.y.z; https://dest.example.com".
		$parts = explode( '; ', $user_agent, 2 );

		return isset( $parts[1] ) ? trim( $parts[1] ) : $user_agent;
	}
}
