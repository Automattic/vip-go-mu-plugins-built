<?php
/**
 * Ability result data object.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * Represents the result of an ability execution.
 *
 * The `output` property holds the raw return value from the ability's execute
 * callback, matching whatever shape the ability's output_schema declares.
 * Consumers interpret it per the ability's schema.
 */
class AbilityResult {


	/**
	 * Result ID (set after save).
	 *
	 * @var int|null
	 */
	public ?int $id = null;

	/**
	 * Ability ID that produced this result.
	 *
	 * @var string
	 */
	public string $ability_id;

	/**
	 * Post ID this was run against (nullable for standalone abilities).
	 *
	 * @var int|null
	 */
	public ?int $post_id = null;

	/**
	 * Whether execution succeeded.
	 *
	 * @var bool
	 */
	public bool $success = true;

	/**
	 * Summary message.
	 *
	 * @var string
	 */
	public string $summary = '';

	/**
	 * Raw output from the execute callback, matching the ability's output_schema.
	 *
	 * @var array
	 */
	public array $output = array();

	/**
	 * Register-free identity of the requirements that blocked this execution.
	 *
	 * Its own field rather than a key in `$output`, because `$output` is contracted
	 * to match the ability's `output_schema` and this never appears in any schema —
	 * the ability did not run, so it produced no output at all. Sharing the field
	 * would make every consumer that reads `$output` per the schema wrong about one
	 * row shape, and would put a plugin-internal key inside a payload third parties
	 * declare.
	 *
	 * Identity only — no wording, no destination. See
	 * `AvailabilitySerializer::to_persistable()` for why a stored gate outcome must
	 * not carry either message register.
	 *
	 * Empty for every result but a gated one, including an ability whose legacy
	 * bool callback returned `false` and so named nothing.
	 *
	 * @var array<int, array<string, mixed>>
	 */
	public array $unmet_requirements = array();

	/**
	 * Error message if failed.
	 *
	 * @var string|null
	 */
	public ?string $error = null;

	/**
	 * Execution duration in milliseconds.
	 *
	 * @var int
	 */
	public int $duration_ms = 0;

	/**
	 * User who triggered the execution.
	 *
	 * @var int
	 */
	public int $created_by = 0;

	/**
	 * When the result was created.
	 *
	 * @var string
	 */
	public string $created_at = '';

	/**
	 * Create a successful result.
	 *
	 * @param  string $ability_id Ability ID.
	 * @param  array  $data       Output data from the execute callback.
	 * @return self
	 */
	public static function success( string $ability_id, array $data = array() ): self {
		$result             = new self();
		$result->ability_id = $ability_id;
		$result->success    = true;
		$result->output     = $data;
		$result->summary    = $data['summary'] ?? '';
		$result->created_by = get_current_user_id();
		$result->created_at = current_time( 'mysql' );

		return $result;
	}

	/**
	 * Create a failed result.
	 *
	 * @param  string $ability_id Ability ID.
	 * @param  string $error      Error message.
	 * @return self
	 */
	public static function failure( string $ability_id, string $error ): self {
		$result             = new self();
		$result->ability_id = $ability_id;
		$result->success    = false;
		$result->error      = $error;
		$result->created_by = get_current_user_id();
		$result->created_at = current_time( 'mysql' );

		return $result;
	}

	/**
	 * Convert to array for API responses.
	 *
	 * @return array
	 */
	public function to_array(): array {
		return array(
			'id'                 => $this->id,
			'ability_id'         => $this->ability_id,
			'post_id'            => $this->post_id,
			'success'            => $this->success,
			'summary'            => $this->summary,
			'output'             => $this->output,
			'unmet_requirements' => $this->unmet_requirements,
			'error'              => $this->error,
			'duration_ms'        => $this->duration_ms,
			'created_by'         => $this->created_by,
			'created_at'         => $this->created_at,
		);
	}
}
