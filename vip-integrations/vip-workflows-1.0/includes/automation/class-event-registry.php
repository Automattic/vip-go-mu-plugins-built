<?php
/**
 * Event registry.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Automation;

/**
 * Registry of valid event types.
 */
class EventRegistry {


	/**
	 * Registered event types with metadata.
	 *
	 * @var array
	 */
	private array $event_types = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->register_core_events();
	}

	/**
	 * Register core event types.
	 */
	private function register_core_events(): void {
		// Post workflow lifecycle events.
		$this->register(
			'post.workflow_assigned',
			array(
				'label'       => 'Workflow Assigned',
				'description' => 'Fired when a post is assigned to a workflow',
				'category'    => 'workflow',
			)
		);

		$this->register(
			'post.stage_changed',
			array(
				'label'       => 'Stage Changed',
				'description' => 'Fired when a post transitions between workflow stages',
				'category'    => 'workflow',
			)
		);

		$this->register(
			'post.workflow_completed',
			array(
				'label'       => 'Workflow Completed',
				'description' => 'Fired when a post reaches a terminal workflow stage',
				'category'    => 'workflow',
			)
		);

		// Stage events (pattern: stage.{key}.entered, stage.{key}.completed).
		$this->register(
			'stage.*.entered',
			array(
				'label'       => 'Stage Entered',
				'description' => 'Fired when a specific stage is entered',
				'category'    => 'stage',
				'pattern'     => true,
			)
		);

		$this->register(
			'stage.*.completed',
			array(
				'label'       => 'Stage Completed',
				'description' => 'Fired when a specific stage is completed',
				'category'    => 'stage',
				'pattern'     => true,
			)
		);

		// Post events.
		$this->register(
			'post.published',
			array(
				'label'       => 'Post Published',
				'description' => 'Fired when a post is published',
				'category'    => 'post',
			)
		);

		// Task events.
		$this->register(
			'task.created',
			array(
				'label'       => 'Task Created',
				'description' => 'Fired when a task is created',
				'category'    => 'task',
			)
		);

		$this->register(
			'task.completed',
			array(
				'label'       => 'Task Completed',
				'description' => 'Fired when a task is marked as done',
				'category'    => 'task',
			)
		);
	}

	/**
	 * Register an event type.
	 *
	 * @param string $event_type Event type identifier.
	 * @param array  $metadata   Event metadata.
	 */
	public function register( string $event_type, array $metadata ): void {
		$this->event_types[ $event_type ] = array_merge(
			array(
				'label'       => $event_type,
				'description' => '',
				'category'    => 'custom',
				'pattern'     => false,
			),
			$metadata
		);
	}

	/**
	 * Check if an event type is valid.
	 *
	 * @param  string $event_type Event type to check.
	 * @return bool
	 */
	public function is_valid( string $event_type ): bool {
		return null !== $this->get_metadata( $event_type );
	}

	/**
	 * Get all registered event types.
	 *
	 * @return array
	 */
	public function get_all(): array {
		return $this->event_types;
	}

	/**
	 * Get event types by category.
	 *
	 * @param  string $category Category name.
	 * @return array
	 */
	public function get_by_category( string $category ): array {
		return array_filter(
			$this->event_types,
			fn( $metadata ) => $metadata['category'] === $category
		);
	}

	/**
	 * Get event metadata.
	 *
	 * Resolves a pattern registration as well as an exact one, so an emitted
	 * `stage.draft.entered` answers with what `stage.*.entered` registered. A
	 * caller holding a concrete slug — an audit-log row, an emitted event — has
	 * no way to know which of the two it is, and every one of them wants the
	 * registration that governs it.
	 *
	 * @param  string $event_type Event type.
	 * @return array|null
	 */
	public function get_metadata( string $event_type ): ?array {
		// Direct match.
		if ( isset( $this->event_types[ $event_type ] ) ) {
			return $this->event_types[ $event_type ];
		}

		// Check pattern matches (e.g., stage.draft.entered matches stage.*.entered).
		foreach ( $this->event_types as $registered => $metadata ) {
			if ( ! empty( $metadata['pattern'] ) ) {
				// Escape first, then turn the escaped wildcard (\*) into a single-segment matcher,
				// so 'stage.*.entered' matches 'stage.draft.entered' but not 'stage.draft.entered.extra'.
				$pattern = str_replace( '\\*', '[^.]+', preg_quote( $registered, '/' ) );
				if ( preg_match( '/^' . $pattern . '$/', $event_type ) ) {
					return $metadata;
				}
			}
		}

		return null;
	}

	/**
	 * The human-readable name for an event type, if this registry knows it.
	 *
	 * @param  string $event_type Event type.
	 * @return string|null Label, or null when nothing here claims the slug.
	 */
	public function get_label( string $event_type ): ?string {
		$metadata = $this->get_metadata( $event_type );

		return $metadata['label'] ?? null;
	}
}
