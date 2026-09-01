<?php
/**
 * AI Event Dispatcher for logging and monitoring.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

use WordPress\AiClientDependencies\Psr\EventDispatcher\EventDispatcherInterface;
use WordPress\AiClient\Events\AfterGenerateResultEvent;
use WordPress\AiClient\Events\BeforeGenerateResultEvent;

/**
 * PSR-14 event dispatcher for AI client events (Core-bundled PHP AI Client).
 *
 * Logs all AI prompts and responses for auditing, debugging, and cost tracking.
 */
class EventDispatcher implements EventDispatcherInterface {


	/**
	 * Dispatch an event.
	 *
	 * @param object $event The event to dispatch.
	 * @return object The event (unmodified).
	 */
	public function dispatch( object $event ): object {
		if ( $event instanceof BeforeGenerateResultEvent ) {
			$this->log_prompt( $event );
		}

		if ( $event instanceof AfterGenerateResultEvent ) {
			$this->log_result( $event );
		}

		return $event;
	}

	/**
	 * Log prompt before generation.
	 *
	 * @param BeforeGenerateResultEvent $event Event object.
	 */
	private function log_prompt( BeforeGenerateResultEvent $event ): void {
		$model = $event->getModel();

		$log_data = array(
			'timestamp' => current_time( 'mysql' ),
			'user_id'   => get_current_user_id(),
			'provider'  => $model->providerMetadata()->getId(),
			'model'     => $model->metadata()->getId(),
			'messages'  => $event->getMessages(),
			'capability' => $event->getCapability() ? $event->getCapability()->value : null,
		);

		/**
		 * Fires before AI generation request.
		 *
		 * @param array                     $log_data Event log data.
		 * @param BeforeGenerateResultEvent $event    Full event object.
		 */
		do_action( 'vip_workflows_ai_before_generate', $log_data, $event );

		// Store in transient for matching with result.
		$request_id = $this->generate_request_id( $log_data );
		set_transient( "vip_workflows_ai_request_{$request_id}", $log_data, HOUR_IN_SECONDS );
	}

	/**
	 * Log result after generation.
	 *
	 * @param AfterGenerateResultEvent $event Event object.
	 */
	private function log_result( AfterGenerateResultEvent $event ): void {
		$result = $event->getResult();
		$usage  = $result->getTokenUsage();
		$candidates = $result->getCandidates();

		try {
			$raw_output = $result->toText();
		} catch ( \Throwable $e ) {
			$raw_output = '[non-text result]';
		}

		$log_data = array(
			'timestamp'        => current_time( 'mysql' ),
			'raw_output'       => $raw_output,
			'tokens_prompt'    => $usage ? $usage->getPromptTokens() : null,
			'tokens_completion' => $usage ? $usage->getCompletionTokens() : null,
			'tokens_total'     => $usage ? $usage->getTotalTokens() : null,
			'finish_reason'    => ! empty( $candidates ) ? $candidates[0]->getFinishReason()->value : null,
		);

		/**
		 * Fires after AI generation result.
		 *
		 * @param array                    $log_data Event log data.
		 * @param AfterGenerateResultEvent $event    Full event object.
		 */
		do_action( 'vip_workflows_ai_after_generate', $log_data, $event );
	}

	/**
	 * Generate unique request ID for matching prompt with result.
	 *
	 * @param array $log_data Log data.
	 * @return string Request ID.
	 */
	private function generate_request_id( array $log_data ): string {
		return md5( wp_json_encode( $log_data ) . microtime( true ) );
	}
}
