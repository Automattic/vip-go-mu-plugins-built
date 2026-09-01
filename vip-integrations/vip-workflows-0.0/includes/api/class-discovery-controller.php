<?php
/**
 * Discovery REST API Controller.
 *
 * Endpoints for the Story Discovery framework: provider listing,
 * recommendations, search, filters, and prompt selection.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Discovery\DiscoveryProviderRegistry;
use VIPWorkflows\Ideation\Assistants\IdeationOrchestrator;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * Discovery Controller.
 */
class DiscoveryController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @var mixed
	 */
	protected $namespace = 'vip-workflows/v1';
	/**
	 * REST route base.
	 *
	 * @var mixed
	 */
	protected $rest_base = 'discovery';

	/**
	 * Registry.
	 *
	 * @var DiscoveryProviderRegistry
	 */
	private DiscoveryProviderRegistry $registry;
	/**
	 * Orchestrator.
	 *
	 * @var IdeationOrchestrator
	 */
	private IdeationOrchestrator $orchestrator;

	/**
	 * Construct the DiscoveryController instance.
	 */
	public function __construct() {
		$this->registry     = DiscoveryProviderRegistry::get_instance();
		$this->orchestrator = new IdeationOrchestrator();
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/providers',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_providers' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/recommend',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_recommendations' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
				'args'                => array(
					'provider' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/search',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'search' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
				'args'                => array(
					'provider' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'text' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'filters' => array(
						'type' => 'string',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/filters',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_filters' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
				'args'                => array(
					'provider' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/select',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'select_prompt' ),
				'permission_callback' => array( $this, 'create_permissions_check' ),
				'args'                => array(
					'provider' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'prompt' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);
	}

	/**
	 * List registered discovery providers with availability and enabled status.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_providers( WP_REST_Request $request ): WP_REST_Response {
		$providers = array();
		$settings  = $this->get_all_settings();

		foreach ( $this->registry->get_all() as $slug => $provider ) {
			/*
			 * `is_available()` is `get_availability()->is_available()`, so reading the
			 * structured result and taking its bool is the same value the bool
			 * accessor produced — with the callback invoked once, not twice.
			 */
			$availability = AvailabilitySerializer::serialize( $this->registry->get_availability( $slug ) );

			$providers[] = array(
				'slug'         => $slug,
				'label'        => $provider['label'],
				'description'  => $provider['description'],
				'icon'         => $provider['icon'],
				'features'     => $provider['features'],
				'available'    => $availability['available'],
				'availability' => $availability,
				'enabled'      => $settings[ $slug ]['enabled'] ?? true,
			);
		}

		return new WP_REST_Response( $providers );
	}

	/**
	 * Get recommended story prompts from available providers.
	 *
	 * Each provider returns up to 6 prompts. Results are grouped by provider.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_recommendations( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$provider_slug = $request->get_param( 'provider' );
		$providers     = $provider_slug
			? array_filter( array( $provider_slug => $this->registry->get( $provider_slug ) ) )
			: $this->registry->get_available_by_feature( 'recommend' );

		if ( empty( $providers ) ) {
			return new WP_REST_Response( array() );
		}

		$grouped  = array();
		$settings = $this->get_all_settings();

		foreach ( $providers as $slug => $provider ) {
			if ( ! $this->registry->is_available( $slug ) ) {
				continue;
			}

			if ( ! ( $settings[ $slug ]['enabled'] ?? true ) ) {
				continue;
			}

			$config    = $this->get_provider_config( $slug );
			$cache_ttl = ( (int) ( $config['cache_minutes'] ?? 30 ) ) * MINUTE_IN_SECONDS;
			$cache_key = 'vip_discovery_recommend_' . $slug . '_' . md5( (string) wp_json_encode( $provider ) );
			$cached    = get_transient( $cache_key );

			if ( false !== $cached ) {
				$prompts = $cached;
			} else {
				try {
					$prompts = $this->registry->execute( $slug, 'recommend', $config );
					$prompts = is_array( $prompts ) ? $prompts : array();
					set_transient( $cache_key, $prompts, $cache_ttl );
				} catch ( \Throwable $e ) {
					continue;
				}
			}

			if ( ! empty( $prompts ) ) {
				$grouped[] = array(
					'provider' => array(
						'slug'  => $slug,
						'label' => $provider['label'],
						'icon'  => $provider['icon'],

						/*
						 * The screen needs these to know which affordances a
						 * provider can actually back. Without them it offered
						 * search to a recommend-only provider, which answered
						 * with a 500 naming the missing callback.
						 */
						'features' => $provider['features'],
					),
					'prompts' => $prompts,
				);
			}
		}

		/**
		 * Filters the grouped story prompts before they reach the ideation screen.
		 *
		 * The seam that lets one plugin enrich another's prompts without either
		 * knowing about the other — performance history against a wire item, a
		 * legal flag against a diary date. Providers cannot do this themselves:
		 * a provider only ever sees its own results, and the plugin with the
		 * extra signal is usually not the plugin that fetched the prompt.
		 *
		 * Listeners run inside a REST request that the ideation landing page
		 * waits on, so anything expensive belongs behind a cache with a
		 * cache-miss path that returns immediately rather than fetching.
		 *
		 * @param array $grouped Prompts grouped by provider, each entry
		 *                       { provider: array, prompts: array }.
		 */
		$grouped = (array) apply_filters( 'vip_workflows_discovery_prompts', $grouped );

		return new WP_REST_Response( $grouped );
	}

	/**
	 * Search a specific provider for story prompts.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function search( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$slug = $request->get_param( 'provider' );

		if ( ! $this->registry->get( $slug ) ) {
			return new WP_Error( 'invalid_provider', __( 'Unknown discovery provider.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		if ( ! $this->registry->is_available( $slug ) ) {
			return new WP_Error( 'provider_unavailable', __( 'This provider is not configured.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		$text    = $request->get_param( 'text' ) ?? '';
		$filters = $request->get_param( 'filters' );
		$filters = $filters ? json_decode( $filters, true ) : array();

		$config    = $this->get_provider_config( $slug );
		$cache_ttl = ( (int) ( $config['cache_minutes'] ?? 30 ) ) * MINUTE_IN_SECONDS;
		$cache_key = 'vip_discovery_search_' . $slug . '_' . md5( $text . wp_json_encode( $filters ) );
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return new WP_REST_Response( $cached );
		}

		try {
			$params  = array(
				'text'    => $text,
				'filters' => is_array( $filters ) ? $filters : array(),
			);
			$prompts = $this->registry->execute( $slug, 'search', $params );
			$prompts = is_array( $prompts ) ? $prompts : array();

			set_transient( $cache_key, $prompts, $cache_ttl );

			return new WP_REST_Response( $prompts );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'search_failed', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	/**
	 * Get search filter definitions for a provider.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_filters( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$slug = $request->get_param( 'provider' );

		if ( ! $this->registry->get( $slug ) ) {
			return new WP_Error( 'invalid_provider', __( 'Unknown discovery provider.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		$provider = $this->registry->get( $slug );
		if ( ! in_array( 'search', $provider['features'], true ) ) {
			return new WP_REST_Response( array() );
		}

		$cache_key = 'vip_discovery_filters_' . $slug;
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return new WP_REST_Response( $cached );
		}

		try {
			$filters = $this->registry->execute( $slug, 'filters' );
			$filters = is_array( $filters ) ? $filters : array();

			set_transient( $cache_key, $filters, DAY_IN_SECONDS );

			return new WP_REST_Response( $filters );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'filters_failed', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	/**
	 * Select a story prompt and create an ideation project from it.
	 *
	 * Calls the provider's seed callback to compose the seed text,
	 * stores the structured prompt as project meta, then delegates
	 * to the standard ideation seed flow.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function select_prompt( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$slug   = $request->get_param( 'provider' );
		$prompt = $request->get_param( 'prompt' );

		if ( ! $this->registry->get( $slug ) ) {
			return new WP_Error( 'invalid_provider', __( 'Unknown discovery provider.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		if ( ! $this->registry->is_available( $slug ) ) {
			return new WP_Error( 'provider_unavailable', __( 'This provider is not configured.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		try {
			$seed = $this->registry->execute( $slug, 'seed', $prompt );
		} catch ( \Throwable $e ) {
			return new WP_Error( 'seed_generation_failed', $e->getMessage(), array( 'status' => 500 ) );
		}

		if ( ! is_string( $seed ) || empty( trim( $seed ) ) ) {
			return new WP_Error( 'empty_seed', __( 'Provider returned an empty seed.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		$user_id    = get_current_user_id();
		$project_id = $this->orchestrator->create_from_seed( $seed, $user_id );

		if ( is_wp_error( $project_id ) ) {
			return $project_id;
		}

		update_post_meta(
			$project_id,
			'_vip_discovery_prompt',
			wp_json_encode(
				array(
					'provider' => $slug,
					'prompt'   => $prompt,
				)
			)
		);

		$state = $this->orchestrator->get_state( $project_id );

		return new WP_REST_Response( $state, 201 );
	}

	/**
	 * Get saved configuration for a provider.
	 *
	 * Providers store their settings as options keyed by slug.
	 *
	 * @param string $slug Provider slug.
	 * @return array Configuration array.
	 */
	private function get_provider_config( string $slug ): array {
		$config = get_option( 'vip_discovery_provider_' . sanitize_key( $slug ), array() );
		return is_array( $config ) ? $config : array();
	}

	/**
	 * Get all provider settings from the single option.
	 *
	 * @return array<string, array> Settings keyed by provider slug.
	 */
	private function get_all_settings(): array {
		$settings = get_option( 'vip_discovery_provider_settings', array() );
		return is_array( $settings ) ? $settings : array();
	}

	/**
	 * Check whether the current user can read this endpoint.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function read_permissions_check( WP_REST_Request $request ): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check whether the current user can create resources for this endpoint.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function create_permissions_check( WP_REST_Request $request ): bool {
		return current_user_can( 'edit_posts' );
	}
}
