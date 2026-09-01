<?php
/**
 * Ability executor.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

use VIPWorkflows\API\AvailabilitySerializer;
use VIPWorkflows\Automation\EventBus;

/**
 * Executes abilities and stores results.
 *
 * Resolves abilities from WP Core's registry via wp_get_ability(). Abilities
 * registered through vip_workflows_register_ability() are Ability instances
 * (our WP_Ability subclass) and support is_available(). Plain WP_Ability
 * instances from wp_register_ability() are always treated as available.
 */
class AbilityExecutor {


	/**
	 * Repository instance.
	 *
	 * @var AbilityResultRepository
	 */
	private AbilityResultRepository $repository;
	/**
	 * Event bus.
	 *
	 * @var EventBus
	 */
	private EventBus $event_bus;

	/**
	 * The surface the ability currently running was invoked from.
	 *
	 * Empty except for the duration of an execute() call that declared one.
	 *
	 * @var string
	 */
	private static string $current_context = '';

	/**
	 * Construct the AbilityExecutor instance.
	 *
	 * @param ?AbilityResultRepository $repository repository.
	 * @param ?EventBus                $event_bus event bus.
	 */
	public function __construct(
		?AbilityResultRepository $repository = null,
		?EventBus $event_bus = null
	) {
		$this->repository = $repository ?? new AbilityResultRepository();
		$this->event_bus  = $event_bus ?? \VIPWorkflows\Plugin::get_instance()->get_event_bus();
	}

	/**
	 * Execute an ability.
	 *
	 * ABOUT $context
	 * --------------
	 * A declared extension surface: it names where a run came from, so an ability
	 * that is reached from more than one surface can answer each of them
	 * appropriately. The values in use here are:
	 *
	 * - `transition`  A workflow transition gate. The caller reads only the
	 *                 result's `issues` and the user is waiting on a save, so an
	 *                 ability with an expensive path should prefer a cached or
	 *                 deferred answer over stalling the transition for one.
	 * - `ideation`    An ideation phase transition gate. Same reading, on a project.
	 * - `agent`       A stage agent, running unattended in cron. Nobody is waiting.
	 * - `''`          Invoked directly — a person asked for this run and is
	 *                 waiting on its result, so it should compute it.
	 *
	 * It is deliberately *not* part of `$input`. Abilities declare strict input
	 * schemas — most transition-eligible ones set `additionalProperties => false` —
	 * so an extra key in the validated input would fail validation on every one of
	 * them. The context therefore travels beside the input, and abilities read it
	 * through self::current_context().
	 *
	 * @param  string $ability_name Ability name/ID.
	 * @param  array  $input        Input parameters.
	 * @param  string $context      Surface this run was invoked from. See above.
	 * @return AbilityResult
	 * @throws \InvalidArgumentException If ability not found.
	 * @throws \RuntimeException If ability is disabled.
	 */
	public function execute( string $ability_name, array $input = array(), string $context = '' ): AbilityResult {
		$ability = wp_get_ability( $ability_name );

		if ( ! $ability ) {
			throw new \InvalidArgumentException(
				/* translators: %s: ability name. */
				sprintf( esc_html__( 'Ability "%s" not found.', 'vip-workflows' ), esc_html( $ability_name ) )
			);
		}

		$settings = AbilitySettings::get_instance();
		if ( ! $settings->is_enabled( $ability_name ) ) {
			throw new \RuntimeException(
				/* translators: %s: ability name. */
				sprintf( esc_html__( 'Ability "%s" is disabled.', 'vip-workflows' ), esc_html( $ability_name ) )
			);
		}

		if ( $ability instanceof Ability ) {
			$availability = $ability->get_availability();

			if ( ! $availability->is_available() ) {
				/*
				 * `error` stays the generic, register-neutral line it always was:
				 * the stored row has no reader, so it must not carry either
				 * audience's wording. What is missing travels as structured
				 * identity in its own field — not in `output`, which is contracted
				 * to match the ability's `output_schema` and has nothing to hold
				 * here, since the ability never ran. The wording is derived from the
				 * ability's live availability wherever the row is read. An ability
				 * whose callback returned a bare `false` has no requirements, and
				 * the generic line is all there is to say about it.
				 */
				$result                     = AbilityResult::failure( $ability_name, __( 'Ability is not configured.', 'vip-workflows' ) );
				$result->unmet_requirements = AvailabilitySerializer::to_persistable( $availability );
				$result->post_id            = $this->resolve_post_id( $input );
				$this->repository->save( $result );
				return $result;
			}
		}

		$default_options = $settings->get_options( $ability_name );
		$input           = array_merge( $default_options, $input );

		$start_time = microtime( true );

		/*
		 * Restored rather than cleared, so an ability that executes another
		 * ability does not leave the outer run's surface reading as a direct
		 * invocation once the inner one returns.
		 */
		$previous_context = self::$current_context;

		try {
			self::$current_context = $context;

			$raw_result = $ability->execute( $input );

			if ( is_wp_error( $raw_result ) ) {
				/*
				 * A WP_Error always means the ability failed. Its data may be an
				 * array — for example, one containing a REST status — but that data
				 * describes the error; it does not make the result successful.
				 */
				$result = AbilityResult::failure( $ability_name, $raw_result->get_error_message() );
			} elseif ( $raw_result instanceof AbilityResult ) {
				$result = $raw_result;
			} elseif ( is_array( $raw_result ) ) {
				$result = AbilityResult::success( $ability_name, $raw_result );
			} else {
				$result = AbilityResult::success( $ability_name, array( 'data' => $raw_result ) );
			}
		} catch ( \Exception $e ) {
			$result = AbilityResult::failure( $ability_name, $e->getMessage() );
		} finally {
			self::$current_context = $previous_context;
		}

		$result->duration_ms = (int) ( ( microtime( true ) - $start_time ) * 1000 );
		$result->post_id     = $this->resolve_post_id( $input );

		$this->repository->save( $result );

		$this->event_bus->emit(
			$result->success ? 'ability.executed' : 'ability.failed',
			array(
				'ability_id'  => $ability_name,
				'post_id'     => $result->post_id,
				'success'     => $result->success,
				'duration_ms' => $result->duration_ms,
				'output'      => $result->output,
			),
			array( 'post_id' => $result->post_id )
		);

		return $result;
	}

	/**
	 * The surface the ability currently running was invoked from.
	 *
	 * Abilities call this to tell one caller from another. See execute() for the
	 * declared values and why this is not part of the validated input.
	 *
	 * @return string The context, or '' when nothing is executing or the run was
	 *                invoked directly.
	 */
	public static function current_context(): string {
		return self::$current_context;
	}

	/**
	 * Execute multiple abilities on same content.
	 *
	 * @param  array  $ability_names Array of ability names.
	 * @param  array  $input         Input parameters.
	 * @param  string $context       Surface this batch was invoked from. See execute().
	 * @return array<string, AbilityResult>
	 */
	public function execute_batch( array $ability_names, array $input = array(), string $context = '' ): array {
		$results = array();

		foreach ( $ability_names as $ability_name ) {
			try {
				$results[ $ability_name ] = $this->execute( $ability_name, $input, $context );
			} catch ( \Exception $e ) {
				$results[ $ability_name ] = AbilityResult::failure( $ability_name, $e->getMessage() );
			}
		}

		return $results;
	}

	/**
	 * Get results for a post.
	 *
	 * @param  int         $post_id      Post ID.
	 * @param  string|null $ability_name Filter by ability.
	 * @param  int         $limit        Max results.
	 * @return array<AbilityResult>
	 */
	public function get_results_for_post( int $post_id, ?string $ability_name = null, int $limit = 10 ): array {
		return $this->repository->find_by_post( $post_id, $ability_name, $limit );
	}

	/**
	 * Get latest result for a post and ability.
	 *
	 * @param  int    $post_id      Post ID.
	 * @param  string $ability_name Ability name.
	 * @return AbilityResult|null
	 */
	public function get_latest_result( int $post_id, string $ability_name ): ?AbilityResult {
		$results = $this->repository->find_by_post( $post_id, $ability_name, 1 );
		return $results[0] ?? null;
	}

	/**
	 * Resolve post ID from input parameters.
	 *
	 * @param  array $input Input parameters.
	 * @return int|null
	 */
	private function resolve_post_id( array $input ): ?int {
		if ( isset( $input['project_id'] ) ) {
			return (int) $input['project_id'];
		}

		if ( isset( $input['post_id'] ) ) {
			return (int) $input['post_id'];
		}

		return null;
	}
}
