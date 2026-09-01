<?php
/**
 * Main plugin class.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows;

use VIPWorkflows\API\RestController;
use VIPWorkflows\Automation\EventBus;
use VIPWorkflows\Automation\EventRegistry;
use VIPWorkflows\Admin\Admin;
use VIPWorkflows\Editor\EditorIntegration;
use VIPWorkflows\Workflow\AgentRunner;
use VIPWorkflows\Workflow\StageAgentRunner;
use VIPWorkflows\Workflow\PostTypeManager;
use VIPWorkflows\Workflow\PublishBoundaryGuard;
use VIPWorkflows\Workflow\StatusManager;
use VIPWorkflows\Workflow\WorkflowEvents;
use VIPWorkflows\Maintenance\Cleanup;
use VIPWorkflows\Notifications\NotificationDispatcher;
use VIPWorkflows\Experiments\ExperimentCLI;
use VIPWorkflows\Experiments\ExperimentRegistry;
use VIPWorkflows\Experiments\IdeationExperiment;
use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Story\Story;

// Load Abilities API functions.
require_once __DIR__ . '/abilities/functions.php';

/**
 * Plugin bootstrap class.
 */
final class Plugin {


	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static ?Plugin $instance = null;

	/**
	 * Event bus instance.
	 *
	 * @var EventBus|null
	 */
	private ?EventBus $event_bus = null;

	/**
	 * Post type manager.
	 *
	 * @var PostTypeManager|null
	 */
	private ?PostTypeManager $post_type_manager = null;

	/**
	 * Status manager.
	 *
	 * @var StatusManager|null
	 */
	private ?StatusManager $status_manager = null;


	/**
	 * Feature registry.
	 *
	 * @var ExperimentRegistry|null
	 */
	private ?ExperimentRegistry $experiment_registry = null;

	/**
	 * Registered modules.
	 *
	 * @var array<string, ModuleInterface>
	 */
	private array $modules = array();

	/**
	 * Get singleton instance.
	 *
	 * @return Plugin
	 */
	public static function get_instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Prevent cloning.
	 */
	private function __clone() {
	}

	/**
	 * Prevent unserialization.
	 *
	 * @throws \Exception Always.
	 */
	public function __wakeup(): void {
		throw new \Exception( 'Cannot unserialize singleton' );
	}

	/**
	 * Private constructor.
	 */
	private function __construct() {
	}

	/**
	 * Initialize the plugin.
	 */
	public function init(): void {
		// No manual textdomain load: the plugin ships no bundled translations,
		// and WordPress (4.6+) auto-loads any translations just-in-time after
		// `init` from the global languages directory and hosted language packs.
		// Registering a custom path here would re-introduce the
		// Avoid a _load_textdomain_just_in_time() notice.
		$this->init_components();
		$this->register_hooks();
	}

	/**
	 * Initialize plugin components.
	 */
	private function init_components(): void {
		// --- Core services (order matters, these are dependencies) ---

		$this->event_bus = new EventBus( new EventRegistry() );

		$this->post_type_manager = new PostTypeManager();
		$this->post_type_manager->init();

		$this->status_manager = new StatusManager( null, $this->post_type_manager );
		$this->status_manager->init();

		// Save-layer publish veto: a non-bypass user's status change into or out
		// of the publish region on a workflow post is refused, with the audited
		// "remove from workflow" escape as the way through.
		( new PublishBoundaryGuard( $this->status_manager ) )->init();

		if ( function_exists( 'wp_register_ability' ) ) {
			add_action( 'wp_abilities_api_categories_init', array( $this, 'register_ability_categories' ) );
			add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
		}

		// Configurable AI system prompts. Core prompts register on
		// the PromptRegistry's collection hook; call sites resolve via get().
		add_action( 'vip_workflows_register_prompts', array( \VIPWorkflows\AI\CorePrompts::class, 'register' ) );

		// AI credentials via the WordPress Connectors API. Register
		// the plugin's custom (non-AI) connectors when connectors are available;
		// AI providers (openai/anthropic/google) are core's default connectors.
		add_action( 'wp_connectors_init', array( \VIPWorkflows\AI\ConnectorsCredentialBackend::class, 'register_custom_connectors' ) );

		// REST API.
		$rest_controller = new RestController();
		$rest_controller->init();

		// --- Experiments (toggleable) ---

		$this->experiment_registry = new ExperimentRegistry();
		$this->experiment_registry->register( new IdeationExperiment() );

		/**
		 * Fires when experiments should be registered.
		 *
		 * @param ExperimentRegistry $registry Experiment registry instance.
		 *
		 * @since 1.3.0
		 */
		do_action( 'vip_workflows_register_experiments', $this->experiment_registry );

		$this->experiment_registry->register_modules( $this );

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			\WP_CLI::add_command( 'vip-workflows experiment', ExperimentCLI::class );
		}

		// --- Modules (self-contained, order does NOT matter) ---

		$this->register_module( new EditorIntegration() );
		$this->register_module( new Cleanup() );
		$this->register_module( new Story() );
		$this->register_module( new WorkflowEvents() );
		$this->register_module( new AgentRunner() );
		$this->register_module( new StageAgentRunner() );
		$this->register_module( new NotificationDispatcher() );

		if ( is_admin() ) {
			$this->register_module( new Admin() );
		}

		/**
		 * Fires when modules should be registered.
		 *
		 * External plugins can register their own modules:
		 *
		 * add_action( 'vip_workflows_register_modules', function( $plugin ) {
		 *     $plugin->register_module( new MyModule() );
		 * } );
		 *
		 * @param Plugin $plugin Plugin instance.
		 *
		 * @since 1.2.0
		 */
		do_action( 'vip_workflows_register_modules', $this );

		// Initialize all registered modules.
		foreach ( $this->modules as $module ) {
			$module->init();
		}

		$this->init_ai_client();
	}

	/**
	 * Register ability categories.
	 *
	 * Called on wp_abilities_api_categories_init hook.
	 * Categories must be registered before abilities that reference them.
	 */
	public function register_ability_categories(): void {
		wp_register_ability_category(
			'vip-workflows',
			array(
				'label'       => __( 'VIP Workflows', 'vip-workflows' ),
				'description' => __( 'Content analysis and workflow automation abilities.', 'vip-workflows' ),
			)
		);

		wp_register_ability_category(
			'research',
			array(
				'label'       => __( 'Research', 'vip-workflows' ),
				'description' => __( 'Research agents that discover sources, media, and context during ideation.', 'vip-workflows' ),
			)
		);
	}

	/**
	 * Register abilities using WordPress Abilities API.
	 *
	 * Called on the wp_abilities_api_init hook (Abilities API provided by WordPress 7.0+ core).
	 *
	 * @see https://developer.wordpress.org/news/2025/11/introducing-the-wordpress-abilities-api/
	 */
	public function register_abilities(): void {
		// Load and register built-in tools.
		include_once __DIR__ . '/abilities/tools/seo-check.php';
		include_once __DIR__ . '/abilities/tools/readability.php';
		include_once __DIR__ . '/abilities/tools/keyword-check.php';

		// Shared helpers for workflow tools.
		include_once __DIR__ . '/abilities/tools/helpers.php';

		// Stage agents (run when a post enters an AI-owned workflow stage).
		include_once __DIR__ . '/abilities/agents/class-stage-agent.php';

		// Register built-in research agents (ideation-only surface).
		if ( self::experiment_enabled( 'ideation' ) ) {
			\VIPWorkflows\Ideation\Assistants\ArchiveScout::register_ability();
			\VIPWorkflows\Ideation\Assistants\WebResearcher::register_ability();
			\VIPWorkflows\Ideation\Assistants\MediaScout::register_ability();
		}

		// Workflow query + action tools (MCP-enabled).
		include_once __DIR__ . '/abilities/tools/get-workflow-summary.php';
		include_once __DIR__ . '/abilities/tools/get-my-assignments.php';
		include_once __DIR__ . '/abilities/tools/get-posts-by-status.php';
		include_once __DIR__ . '/abilities/tools/get-recent-activity.php';
		include_once __DIR__ . '/abilities/tools/get-stale-posts.php';
		include_once __DIR__ . '/abilities/tools/get-transition-history.php';
		include_once __DIR__ . '/abilities/tools/get-available-transitions.php';
		include_once __DIR__ . '/abilities/tools/get-sequences.php';
		include_once __DIR__ . '/abilities/tools/create-sequence.php';
		include_once __DIR__ . '/abilities/tools/update-sequence.php';
		include_once __DIR__ . '/abilities/tools/activate-sequence.php';
		include_once __DIR__ . '/abilities/tools/validate-sequence.php';
		include_once __DIR__ . '/abilities/tools/import-sequence.php';
		include_once __DIR__ . '/abilities/tools/transition-post.php';
		include_once __DIR__ . '/abilities/tools/remove-from-workflow.php';
		include_once __DIR__ . '/abilities/tools/update-post-fields.php';

		\VIPWorkflows\Abilities\Tools\register_seo_check();
		\VIPWorkflows\Abilities\Tools\register_readability();
		\VIPWorkflows\Abilities\Tools\register_keyword_check();

		// Workflow query + action tools.
		\VIPWorkflows\Abilities\Tools\register_get_workflow_summary();
		\VIPWorkflows\Abilities\Tools\register_get_my_assignments();
		\VIPWorkflows\Abilities\Tools\register_get_posts_by_status();
		\VIPWorkflows\Abilities\Tools\register_get_recent_activity();
		\VIPWorkflows\Abilities\Tools\register_get_stale_posts();
		\VIPWorkflows\Abilities\Tools\register_get_transition_history();
		\VIPWorkflows\Abilities\Tools\register_get_available_transitions();
		\VIPWorkflows\Abilities\Tools\register_get_sequences();
		\VIPWorkflows\Abilities\Tools\register_create_sequence();
		\VIPWorkflows\Abilities\Tools\register_update_sequence();
		\VIPWorkflows\Abilities\Tools\register_activate_sequence();
		\VIPWorkflows\Abilities\Tools\register_validate_sequence();
		\VIPWorkflows\Abilities\Tools\register_import_sequence();
		\VIPWorkflows\Abilities\Tools\register_transition_post();
		\VIPWorkflows\Abilities\Tools\register_remove_from_workflow();
		\VIPWorkflows\Abilities\Tools\register_update_post_fields();

		/**
		 * Fires when abilities should be registered.
		 *
		 * Use wp_register_ability() to register abilities:
		 *
		 * wp_register_ability( 'my-plugin/my-ability', [
		 *     'label'               => __( 'My Ability', 'my-plugin' ),
		 *     'description'         => __( 'Does something useful.', 'my-plugin' ),
		 *     'category'            => 'vip-workflows',
		 *     'input_schema'        => [ ... ],
		 *     'output_schema'       => [ ... ],
		 *     'execute_callback'    => 'my_execute_function',
		 *     'permission_callback' => function() { return current_user_can('edit_posts'); },
		 * ] );
		 *
		 * @since 1.0.0
		 */
		do_action( 'vip_workflows_register_abilities' );
	}

	/**
	 * Register WordPress hooks.
	 */
	private function register_hooks(): void {
		// Register ActionScheduler handlers.
		add_action( 'vip_workflows_execute_flow', array( $this, 'handle_flow_execution' ), 10, 4 );

		// Register post meta.
		add_action( 'init', array( $this, 'register_meta' ) );
	}

	/**
	 * Handle automation flow execution (called by ActionScheduler).
	 *
	 * @param int   $flow_id    The automation flow ID.
	 * @param int   $event_id   The triggering event ID.
	 * @param array $event_data The event data.
	 * @param array $context    The execution context.
	 */
	public function handle_flow_execution( int $flow_id, int $event_id, array $event_data, array $context ): void {
		$this->get_event_bus()->handle_flow_execution( $flow_id, $event_id, $event_data, $context );
	}

	/**
	 * Register post meta fields.
	 */
	public function register_meta(): void {
		// Sequence ID - which sequence this post follows.
		register_post_meta(
			'',
			'_vip_workflows_sequence_id',
			array(
				'type'              => 'integer',
				'single'            => true,

				/*
				 * Workflow state, not a field. Supplying an auth_callback
				 * overrides core's is_protected_meta() default-deny, so this was
				 * readable anonymously and writable by any edit_post holder — and
				 * zeroing it is how a post leaves the workflow, silently, where
				 * DELETE /workflow/post/{id}/sequence does the same job audited.
				 */
				'show_in_rest'      => false,
				'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
					// Object-scoped: writing this post's sequence requires edit
					// rights on that post, not a bare edit_posts capability.
					return current_user_can( 'edit_post', $post_id );
				},
				'sanitize_callback' => 'absint',
			)
		);

		$this->register_metadata_fields();
	}

	/**
	 * Register post meta for each metadata field defined in active sequences.
	 *
	 * Meta keys take the form wf_meta_{sequence_id}_{field_key} (e.g. wf_meta_42_section).
	 * Sequence integer ID namespaces each field, eliminating cross-sequence key collisions.
	 */
	private function register_metadata_fields(): void {
		$repository = new SequenceRepository();
		$sequences = $repository->get_all( array( 'status' => 'active' ) );

		foreach ( $sequences as $sequence ) {
			$metadata_fields = $sequence->get_metadata_fields();
			if ( empty( $metadata_fields ) ) {
				continue;
			}

			$post_types = $sequence->get_post_types();

			foreach ( $metadata_fields as $field ) {
				$meta_key = 'wf_meta_' . $sequence->id . '_' . $field['key'];

				$type = match ( $field['type'] ) {
					'user'  => 'integer',
					default => 'string',
				};

				// Newlines are the whole difference between a textarea and a text
				// field, and sanitize_text_field() collapses them — so a briefing
				// note came back as one paragraph however it was entered.
				$sanitize_callback = match ( $field['type'] ) {
					'user'     => 'absint',
					'textarea' => 'sanitize_textarea_field',
					default    => 'sanitize_text_field',
				};

				foreach ( $post_types as $post_type ) {
					// Core emits a _doing_it_wrong on every load when meta asks
					// for revision support on a post type that has none, and
					// sequence CPTs do not declare 'revisions' in their
					// supports list. Track the post type instead of asserting.
					$args = array(
						'type'              => $type,
						'single'            => true,
						'show_in_rest'      => true,
						'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
							return current_user_can( 'edit_post', $post_id );
						},
						'sanitize_callback' => $sanitize_callback,
					);

					if ( post_type_supports( $post_type, 'revisions' ) ) {
						$args['revisions_enabled'] = true;
					}

					register_post_meta( $post_type, $meta_key, $args );
				}
			}
		}
	}

	/**
	 * Get the event bus instance.
	 *
	 * @return EventBus
	 */
	public function get_event_bus(): EventBus {
		return $this->event_bus;
	}

	/**
	 * Get the post type manager.
	 *
	 * @return PostTypeManager
	 */
	public function get_post_type_manager(): PostTypeManager {
		return $this->post_type_manager;
	}

	/**
	 * Get the status manager.
	 *
	 * @return StatusManager
	 */
	public function get_status_manager(): StatusManager {
		return $this->status_manager;
	}

	/**
	 * Get the experiment registry.
	 *
	 * @return ExperimentRegistry
	 */
	public function get_experiment_registry(): ExperimentRegistry {
		return $this->experiment_registry;
	}

	/**
	 * Check whether an experiment is enabled.
	 *
	 * Convenience wrapper around the experiment registry for use at call sites
	 * that only have access to the Plugin class (e.g. module init methods,
	 * template includes, REST permission callbacks). Returns false when the
	 * singleton has not been initialised yet or when the experiment key is not
	 * registered.
	 *
	 * @since 1.0.0
	 *
	 * @param  string $key Experiment identifier (e.g. 'ideation').
	 * @return bool True if the experiment is registered and enabled.
	 */
	public static function experiment_enabled( string $key ): bool {
		$instance = self::$instance;
		if ( null === $instance || null === $instance->experiment_registry ) {
			return false;
		}
		return $instance->experiment_registry->is_enabled( $key );
	}

	/**
	 * Register a module.
	 *
	 * @param ModuleInterface $module The module to register.
	 */
	public function register_module( ModuleInterface $module ): void {
		$this->modules[ $module->get_id() ] = $module;
	}

	/**
	 * Get a registered module by ID.
	 *
	 * @param  string $id Module identifier.
	 * @return ModuleInterface|null
	 */
	public function get_module( string $id ): ?ModuleInterface {
		return $this->modules[ $id ] ?? null;
	}

	/**
	 * Initialize AI client for third-party providers.
	 *
	 * Configures authentication and event dispatching for OpenAI, Anthropic, Google AI.
	 * Child plugins can use \WordPress\AiClient\AiClient directly without handling keys.
	 */
	private function init_ai_client(): void {
		// WordPress 7.0+ bundles php-ai-client in core, and the plugin requires 7.0
		// (see VIP_WORKFLOWS_MIN_WP_VERSION). If the core AI client is missing, the
		// environment is broken — surface it loudly rather than silently degrade.
		if ( ! class_exists( 'WordPress\AiClient\AiClient' ) ) {
			_doing_it_wrong(
				__METHOD__,
				esc_html__( 'WordPress 7.0+ core PHP AI Client is required but was not found.', 'vip-workflows' ),
				'1.0.0'
			);
			return;
		}

		$registry = \WordPress\AiClient\AiClient::defaultRegistry();

		// Register the vendored OpenAI provider (core ships no concrete providers).
		// Idempotent: core or another plugin may have registered it already.
		if ( ! $registry->hasProvider( \WordPress\OpenAiAiProvider\Provider\OpenAiProvider::class ) ) {
			$registry->registerProvider( \WordPress\OpenAiAiProvider\Provider\OpenAiProvider::class );
		}

		// Authenticate every configured generation provider via the credential
		// adapter. Set unconditionally when we have a key:
		// idempotent with core's connector → AI-client wiring, and covers keys
		// held in the legacy/fallback store on connectors-capable environments.
		$credentials = \VIPWorkflows\AI\Credentials::get_instance();
		foreach ( \VIPWorkflows\AI\Credentials::AI_PROVIDERS as $provider ) {
			$key = $credentials->api_key( $provider );
			if ( '' !== $key && $registry->hasProvider( $provider ) ) {
				$registry->setProviderRequestAuthentication(
					$provider,
					new \WordPress\AiClient\Providers\Http\DTO\ApiKeyRequestAuthentication( $key )
				);
			}
		}

		\WordPress\AiClient\AiClient::setEventDispatcher( new \VIPWorkflows\AI\EventDispatcher() );

		// WP HTTP API defaults to 5s; AI generation needs more headroom, for
		// every provider (not just OpenAI).
		add_filter( 'http_request_timeout', array( self::class, 'extend_ai_request_timeout' ), 10, 2 );
	}

	/**
	 * AI provider API hosts that need an extended HTTP timeout.
	 *
	 * @var string[]
	 */
	private const AI_REQUEST_HOSTS = array(
		'api.openai.com',
		'api.anthropic.com',
		'generativelanguage.googleapis.com',
	);

	/**
	 * Timeout (seconds) allowed for AI provider generation requests.
	 *
	 * @var float
	 */
	private const AI_REQUEST_TIMEOUT = 60.0;

	/**
	 * Extend the HTTP request timeout for AI provider generation calls.
	 *
	 * WordPress defaults to 5 seconds, which is far too short for LLM generation
	 * (reformatting a long article routinely takes tens of seconds). Applies to
	 * every supported provider host, not just OpenAI.
	 *
	 * @param  float  $timeout Current timeout in seconds.
	 * @param  string $url     Request URL.
	 * @return float Timeout in seconds.
	 */
	public static function extend_ai_request_timeout( float $timeout, string $url ): float {
		foreach ( self::AI_REQUEST_HOSTS as $host ) {
			if ( str_contains( $url, $host ) ) {
				return max( $timeout, self::AI_REQUEST_TIMEOUT );
			}
		}
		return $timeout;
	}
}
