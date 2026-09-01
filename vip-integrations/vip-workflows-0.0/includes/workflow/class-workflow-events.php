<?php
/**
 * Workflow Events Handler.
 *
 * Emits workflow events to the EventBus for automation flows.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\ModuleInterface;
use VIPWorkflows\Plugin;

/**
 * Handles emitting workflow events to the EventBus.
 */
class WorkflowEvents implements ModuleInterface {


	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'workflow-events';
	}

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		// Workflow stage transitions.
		add_action( 'vip_workflows_status_transition', array( $this, 'on_status_transition' ), 10, 5 );

		// Go-live emits via two complementary paths, exactly-once by construction:
		// workflow-driven publishes emit from the workflow stage action above
		// (where the new stage is correct by definition), and core-driven
		// publishes (cron future→publish, quick edit, REST, CLI) emit here —
		// suppressed while a workflow transition is mid-commit.
		add_action( 'transition_post_status', array( $this, 'on_go_live' ), 10, 3 );
	}

	/**
	 * Handle status transition.
	 *
	 * Emits the stage-change events for both causes — 'workflow' (edge traversal)
	 * and 'core' (checkpoint reseat after a core-driven status change).
	 *
	 * Go-live (workflow-driven path): a stage change whose crossing committed
	 * `publish` from a non-publish status IS the go-live moment, so
	 * post.published is emitted here too — the payload's stage is the action's
	 * new stage, correct by definition. Core-driven publishes emit from
	 * on_go_live(), which suppresses itself while a workflow transition is
	 * mid-commit; emission is exactly-once by construction. A committed status
	 * of `future` (scheduled gate publish) is not a go-live; cron's
	 * future→publish emits later via the core path.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $new_status New stage key (unprefixed).
	 * @param string $old_status Old stage key (unprefixed).
	 * @param object $sequence  Sequence object.
	 * @param array  $context    Transition context: 'cause' (workflow|core),
	 *                           'committed_status', and 'previous_status'.
	 *                           Additive — legacy 4-arg emitters omit it.
	 */
	public function on_status_transition( int $post_id, string $new_status, string $old_status, $sequence, array $context = array() ): void {
		$event_bus = Plugin::get_instance()->get_event_bus();
		if ( ! $event_bus ) {
			return;
		}

		$post   = get_post( $post_id );
		$author = $post ? get_userdata( $post->post_author ) : null;

		// previous_status defaults to committed_status for legacy 4-arg emitters —
		// the conservative "nothing crossed" reading (no spurious go-live).
		$cause            = (string) ( $context['cause'] ?? 'workflow' );
		$committed_status = (string) ( $context['committed_status'] ?? ( $post ? $post->post_status : '' ) );
		$previous_status  = (string) ( $context['previous_status'] ?? $committed_status );

		// Get status labels from sequence.
		$from_config = $sequence->get_status( $old_status );
		$to_config   = $sequence->get_status( $new_status );

		$event_data = array(
			'post_id'          => $post_id,
			'post_title'       => $post ? $post->post_title : '',
			'post_type'        => $post ? $post->post_type : '',
			'from_status'      => $old_status,
			'to_status'        => $new_status,

			/*
			 * A live lookup is right here: a notification describes a change
			 * happening now, so the stage's current name is the correct one. When
			 * the sequence cannot answer, the raw key is used rather than a
			 * humanized version of it — a generated key dressed up as "Status_3"
			 * reads as a stage someone named, which is precisely the confusion
			 * this avoids.
			 */
			'from_label'       => $from_config['label'] ?? $old_status,
			'to_label'         => $to_config['label'] ?? $new_status,
			'author_id'        => $post ? $post->post_author : 0,
			'author_name'      => $author ? $author->display_name : '',
			'sequence_id'     => $sequence->uuid ?? '',
			'sequence_name'   => $sequence->name ?? '',
			'cause'            => $cause,
			'committed_status' => $committed_status,
			'previous_status'  => $previous_status,
		);

		// Context for event storage.
		$event_context = array(
			'post_id' => $post_id,
		);

		// Emit generic stage changed event. The bus stores every emission in the
		// workflow-events table as its own bookkeeping (automation executions
		// reference the stored row by id); the audit log excludes this row and
		// the per-stage one below, serving StatusManager's `status_transition`
		// row as the single visible entry per stage change.
		$event_bus->emit( 'post.stage_changed', $event_data, $event_context );

		// Emit specific stage entered event (stage.{key}.entered pattern).
		$event_bus->emit( "stage.{$new_status}.entered", $event_data, $event_context );

		// Workflow-driven go-live. Repeat go-lives (publish → draft → publish)
		// legitimately emit again; consumers filter on previous_status.
		if ( 'workflow' === $cause && 'publish' === $committed_status && 'publish' !== $previous_status ) {
			$event_bus->emit(
				'post.published',
				array_merge( $event_data, array( 'stage' => $new_status ) ),
				$event_context
			);
		}
	}

	/**
	 * Emit post.published at real go-live, off core's status transition.
	 *
	 * The core-driven half of the go-live split: fires for any `!== 'publish'`
	 * → `'publish'` transition on a workflow-managed post that is NOT mid
	 * workflow-transition — cron's `future` → `publish` at the scheduled time,
	 * quick edit, REST, CLI. Workflow-driven publishes are suppressed here (the
	 * stage meta is not written yet when core fires this hook mid-commit) and
	 * emit from on_status_transition() instead.
	 *
	 * @param string   $new_status New core post status.
	 * @param string   $old_status Old core post status.
	 * @param \WP_Post $post       Post object.
	 */
	public function on_go_live( string $new_status, string $old_status, $post ): void {
		if ( 'publish' !== $new_status || 'publish' === $old_status ) {
			return;
		}

		// Untrash restores a post to the status it held before trashing; a
		// `trash` → `publish` restore of a previously-live post is NOT a go-live,
		// so it must not re-emit post.published (bulk restore would otherwise fire
		// a notification storm). `trash` is a transient overlay, never a stage.
		if ( 'trash' === $old_status ) {
			return;
		}

		// A workflow transition is mid-commit: its stage meta is not written yet
		// and the workflow path emits at the correct moment with the correct
		// stage. Suppress this fire so emission stays exactly-once.
		if ( \VIPWorkflows\Workflow\StatusManager::is_transition_in_progress( $post->ID ) ) {
			return;
		}

		// Only workflow-managed posts emit workflow events.
		if ( ! get_post_meta( $post->ID, \VIPWorkflows\Workflow\StatusManager::SEQUENCE_META_KEY, true ) ) {
			return;
		}

		$event_bus = Plugin::get_instance()->get_event_bus();
		if ( ! $event_bus ) {
			return;
		}

		$status_manager = Plugin::get_instance()->get_status_manager();
		$sequence      = $status_manager ? $status_manager->get_sequence_for_post( $post->ID ) : null;
		if ( ! $sequence ) {
			// Sequence meta exists but the sequence no longer resolves — a
			// data-integrity condition; log it rather than emitting a half-formed event.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( 'VIP Workflows: post %d went live carrying a sequence reference that no longer resolves; post.published not emitted.', $post->ID ) );
			return;
		}

		$author = get_userdata( $post->post_author );

		$event_bus->emit(
			'post.published',
			array(
				'post_id'          => $post->ID,
				'post_title'       => $post->post_title,
				'post_type'        => $post->post_type,
				'stage'            => (string) get_post_meta( $post->ID, \VIPWorkflows\Workflow\StatusManager::STAGE_META_KEY, true ),
				'previous_status'  => $old_status,
				'committed_status' => 'publish',
				'cause'            => 'core',
				'author_id'        => $post->post_author,
				'author_name'      => $author ? $author->display_name : '',
				'sequence_id'     => $sequence->uuid ?? '',
				'sequence_name'   => $sequence->name ?? '',
			),
			array( 'post_id' => $post->ID )
		);
	}
}
