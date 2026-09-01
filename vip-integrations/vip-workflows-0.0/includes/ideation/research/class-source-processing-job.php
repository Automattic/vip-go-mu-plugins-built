<?php
/**
 * Source Processing Job - Async processing of uploaded ideation sources.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Research;

use VIPWorkflows\Integrations\Markdown;
use VIPWorkflows\Integrations\MediaProcessor;
use VIPWorkflows\ModuleInterface;

/**
 * Handles async processing of uploaded ideation sources.
 */
class SourceProcessingJob implements ModuleInterface {


	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'source-processing-job';
	}

	/**
	 * Initialize the job handler.
	 */
	public function init(): void {
		add_action( 'vip_workflows_process_source', array( $this, 'process' ), 10, 2 );
	}

	/**
	 * Process an uploaded source.
	 *
	 * @param int    $project_id Project ID.
	 * @param string $source_id  Source ID.
	 */
	public function process( int $project_id, string $source_id ): void {
		global $wpdb;
		$sources_table = $wpdb->prefix . 'vip_ideation_sources';

		$source = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT * FROM %i WHERE project_id = %d AND source_id = %s',
				$sources_table,
				$project_id,
				$source_id
			),
			ARRAY_A
		);

		if ( ! $source ) {
			return;
		}

		if ( 'complete' === $source['processing_status'] || 'error' === $source['processing_status'] ) {
			return;
		}

		$wpdb->update(
			$sources_table,
			array(
				'processing_status' => 'processing',
				'updated_at'        => current_time( 'mysql' ),
			),
			array(
				'project_id' => $project_id,
				'source_id' => $source_id,
			),
			array( '%s', '%s' ),
			array( '%d', '%s' )
		);

		$attachment_id = (int) $source['attachment_id'];
		$file_path     = get_attached_file( $attachment_id );

		if ( ! $file_path || ! file_exists( $file_path ) ) {
			$this->mark_error( $project_id, $source_id, __( 'File not found.', 'vip-workflows' ) );
			return;
		}

		$mime_type = $source['file_type'] ? $source['file_type'] : get_post_mime_type( $attachment_id );

		$processor = new MediaProcessor();

		try {
			$result = $processor->process_file( $file_path, $mime_type );
		} catch ( \Exception $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging.
			error_log( '[VIP Workflows] Source processing exception: ' . $e->getMessage() );
			$this->mark_error( $project_id, $source_id, $e->getMessage() );
			return;
		}

		if ( is_wp_error( $result ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging.
			error_log( '[VIP Workflows] Source processing error: ' . $result->get_error_message() );
			$this->mark_error( $project_id, $source_id, $result->get_error_message() );
			return;
		}

		$update_data = array(
			'processing_status' => 'complete',
			'updated_at'        => current_time( 'mysql' ),
		);

		if ( ! empty( $result['content'] ) ) {
			$update_data['content'] = $result['content'];
		}

		if ( ! empty( $result['summary'] ) ) {
			// The summary is markdown because the card modal renders it as
			// formatted text; `excerpt` is shown wherever plain text is expected,
			// including the board card preview, so it gets the derived plain form.
			$update_data['excerpt'] = Markdown::to_plain_text( (string) $result['summary'] );
		}

		$ai_analysis = array(
			'type'         => $result['type'] ?? 'unknown',
			'processed_at' => $result['processed_at'] ?? current_time( 'mysql' ),
		);

		if ( ! empty( $result['summary'] ) ) {
			$ai_analysis['summary'] = $result['summary'];
		}

		if ( ! empty( $result['key_points'] ) ) {
			$ai_analysis['key_points'] = $result['key_points'];
		}

		$update_data['ai_analysis'] = wp_json_encode( $ai_analysis );

		$updated = $wpdb->update(
			$sources_table,
			$update_data,
			array(
				'project_id' => $project_id,
				'source_id' => $source_id,
			),
			array_fill( 0, count( $update_data ), '%s' ),
			array( '%d', '%s' )
		);

		if ( false === $updated ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging.
			error_log(
				sprintf(
					'[VIP Workflows] Failed to update source %s for project %d: %s',
					$source_id,
					$project_id,
					$wpdb->last_error
				)
			);
		}

		/**
		 * Fires when an ideation source has been processed.
		 *
		 * @param int    $project_id Project ID.
		 * @param string $source_id  Source ID.
		 * @param array  $result     Processing result.
		 */
		do_action( 'vip_workflows_source_processed', $project_id, $source_id, $result );
	}

	/**
	 * Mark a source as errored.
	 *
	 * @param int    $project_id Project ID.
	 * @param string $source_id  Source ID.
	 * @param string $error      Error message.
	 */
	private function mark_error( int $project_id, string $source_id, string $error ): void {
		global $wpdb;
		$sources_table = $wpdb->prefix . 'vip_ideation_sources';

		$wpdb->update(
			$sources_table,
			array(
				'processing_status' => 'error',
				'ai_analysis'       => wp_json_encode( array( 'error' => $error ) ),
				'updated_at'        => current_time( 'mysql' ),
			),
			array(
				'project_id' => $project_id,
				'source_id' => $source_id,
			),
			array( '%s', '%s', '%s' ),
			array( '%d', '%s' )
		);
	}
}
