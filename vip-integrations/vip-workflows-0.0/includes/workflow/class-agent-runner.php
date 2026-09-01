<?php
/**
 * Agent Runner - handles async agent task execution.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\ModuleInterface;

/**
 * Manages agent task execution for automated workflow assignments.
 */
class AgentRunner implements ModuleInterface {


	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'agent-runner';
	}

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		add_action( 'vip_workflows_agent_assigned', array( $this, 'queue_agent_task' ), 10, 3 );
		add_action( 'vip_workflows_run_agent', array( $this, 'run_agent' ) );
	}

	/**
	 * Queue an agent task when assigned.
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $agent_id Agent ID.
	 * @param array  $config   Sequence input config.
	 */
	public function queue_agent_task( int $post_id, string $agent_id, array $config ): void {
		$agents = $this->get_registered_agents();

		if ( ! isset( $agents[ $agent_id ] ) ) {
         // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( "VIP Workflows: Unknown agent '{$agent_id}'" );
			return;
		}

		$task_data = array(
			'post_id'  => $post_id,
			'agent_id' => $agent_id,
			'config'   => $config,
			'queued'   => current_time( 'mysql' ),
		);

		// Schedule task to run async.
		wp_schedule_single_event( time(), 'vip_workflows_run_agent', array( $task_data ) );
	}

	/**
	 * Run an agent task.
	 *
	 * @param array $task_data Task data from queue.
	 */
	public function run_agent( array $task_data ): void {
		$post_id  = $task_data['post_id'] ?? 0;
		$agent_id = $task_data['agent_id'] ?? '';
		$config   = $task_data['config'] ?? array();

		if ( ! $post_id || ! $agent_id ) {
			return;
		}

		$agents = $this->get_registered_agents();
		if ( ! isset( $agents[ $agent_id ] ) ) {
			return;
		}

		$agent            = $agents[ $agent_id ];
		$assignment_manager = new AssignmentManager();
		$meta_key         = $config['meta_key'] ?? $agent_id;

		try {
			// Execute agent handler.
			$result = call_user_func( $agent['handler'], $post_id, $config );

			// Mark assignment completed.
			$assignment_manager->mark_completed(
				$post_id,
				$meta_key,
				array(
					'result' => $result,
				)
			);

			/**
			 * Fires when an agent task completes successfully.
			 *
			 * @param int    $post_id  Post ID.
			 * @param string $agent_id Agent ID.
			 * @param mixed  $result   Agent result.
			 */
			do_action( 'vip_workflows_agent_completed', $post_id, $agent_id, $result );

		} catch ( \Exception $e ) {
			// Mark assignment expired on failure.
			$assignment_manager->mark_expired( $post_id, $meta_key, $e->getMessage() );

			/**
			 * Fires when an agent task fails.
			 *
			 * @param int    $post_id  Post ID.
			 * @param string $agent_id Agent ID.
			 * @param string $error    Error message.
			 */
			do_action( 'vip_workflows_agent_failed', $post_id, $agent_id, $e->getMessage() );
		}
	}

	/**
	 * Get registered agents.
	 *
	 * @return array Array of agent definitions.
	 */
	public function get_registered_agents(): array {
		/**
		 * Filter registered agents.
		 *
		 * Example registration:
		 * ```php
		 * add_filter( 'vip_workflows_agents', function( $agents ) {
		 *     $agents['seo-checker'] = [
		 *         'label'       => 'SEO Checker',
		 *         'description' => 'Validates SEO requirements',
		 *         'handler'     => 'my_seo_checker_function',
		 *     ];
		 *     return $agents;
		 * });
		 * ```
		 *
		 * @param array $agents Registered agents.
		 */
		return apply_filters( 'vip_workflows_agents', array() );
	}

	/**
	 * Get agent info for UI.
	 *
	 * @return array Array of agent info for dropdowns.
	 */
	public function get_agents_for_ui(): array {
		$agents = $this->get_registered_agents();
		$result = array();

		foreach ( $agents as $id => $agent ) {
			$result[] = array(
				'id'          => $id,
				'label'       => $agent['label'] ?? $id,
				'description' => $agent['description'] ?? '',
			);
		}

		return $result;
	}
}
