<?php
/**
 * Ingestion module.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;
use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;

/**
 * Handles ingestion filtering for posts to be sent to Salesforce.
 */
class Ingestion {
	/**
	 * Post meta key to track ingestion attempts.
	 *
	 * This meta is set when we attempt to ingest a post (after passing should_ingest_post filter).
	 * It allows us to track which posts were sent to Salesforce even if the filter changes later.
	 */
	public const META_KEY_INGESTION_ATTEMPTED = 'vip_agentforce_ingestion_attempted';

	/**
	 * Initialize the module.
	 */
	public static function init(): void {
		add_action( 'save_post', [ __CLASS__, 'handle_save_post' ], 10, 2 );
		add_action( 'before_delete_post', [ __CLASS__, 'handle_before_delete_post' ], 10, 2 );
	}

	/**
	 * Handle post save - ingest or delete from Salesforce as appropriate.
	 *
	 * If the post passes the filter, it will be ingested.
	 * If it doesn't pass but was previously ingested, it will be deleted.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 */
	public static function handle_save_post( int $post_id, \WP_Post $post ): void {
		self::sync_post( $post );
	}

	/**
	 * Sync a single post to Salesforce - ingest or delete as appropriate.
	 *
	 * This is the core sync logic used by both handle_save_post and CLI sync.
	 * - If the post passes the filter, it will be ingested.
	 * - If it doesn't pass but was previously ingested, it will be deleted.
	 * - If it doesn't pass and wasn't ingested, it will be skipped.
	 *
	 * @param \WP_Post $post The post to sync.
	 * @return Sync_Result The result of the sync operation.
	 */
	public static function sync_post( \WP_Post $post ): Sync_Result {
		$should_ingest = self::should_ingest_post( $post );

		if ( ! $should_ingest ) {
			// If this post was previously ingested, delete it from Salesforce.
			if ( self::was_post_ingested( $post ) ) {
				// Only delete if we have ingestion filters registered.
				// If no filters exist, setup is incomplete - don't delete.
				if ( ! has_filter( 'vip_agentforce_should_ingest_post' ) ) {
					return new Sync_Result( Sync_Result::SKIPPED, $post );
				}
				$deleted = self::delete_post_from_salesforce( $post );
				return new Sync_Result( $deleted ? Sync_Result::DELETED : Sync_Result::FAILED_API, $post );
			}
			return new Sync_Result( Sync_Result::SKIPPED, $post );
		}

		// Mark that we're attempting to ingest this post.
		// This allows us to track posts for deletion even if:
		// - the filter changes later.
		// - an ingestion succeeded despite the API returning an error
		// - if we mark it after a successful ingestion, the marking step might have failed, and we wouldn't know it was actually ingested.
		update_post_meta( $post->ID, self::META_KEY_INGESTION_ATTEMPTED, time() );

		$record = self::transform_post( $post );
		if ( null === $record ) {
			self::fire_ingestion_failure( $post->ID, Ingestion_Failure::CODE_TRANSFORM_FAILED );
			return new Sync_Result( Sync_Result::FAILED_TRANSFORM, $post );
		}

		$result = static::send_to_api( $record );

		if ( ! $result->success ) {
			self::fire_ingestion_failure( $post->ID, Ingestion_Failure::CODE_API_ERROR, [ 'result' => $result ] );
			return new Sync_Result( Sync_Result::FAILED_API, $post, $result->error_message );
		}

		return new Sync_Result( Sync_Result::INGESTED, $post );
	}

	/**
	 * Fire the ingestion failure action.
	 *
	 * @param int                  $post_id      The post ID that failed ingestion.
	 * @param string               $failure_code One of the Ingestion_Failure::CODE_* constants.
	 * @param array<string, mixed> $details      Optional additional details about the failure.
	 */
	private static function fire_ingestion_failure( int $post_id, string $failure_code, array $details = [] ): void {
		$post = get_post( $post_id );

		$error_codes = [
			Ingestion_Failure::CODE_TRANSFORM_FAILED => 'vip_agentforce_transform_failed',
			Ingestion_Failure::CODE_API_ERROR        => 'vip_agentforce_api_error',
		];

		$error_messages = [
			Ingestion_Failure::CODE_TRANSFORM_FAILED => 'Post transformation failed',
			Ingestion_Failure::CODE_API_ERROR        => 'API call failed',
		];

		$error_data = array_merge( [ 'post_id' => $post_id ], $details );

		$failure = new Ingestion_Failure(
			[
				'failure_code' => $failure_code,
				'post'         => $post,
				'error'        => new \WP_Error(
					$error_codes[ $failure_code ] ?? 'vip_agentforce_ingestion_failed',
					$error_messages[ $failure_code ] ?? 'Ingestion failed',
					$error_data
				),
			]
		);

		/**
		 * Fires when a post ingestion fails.
		 *
		 * This action only fires on actual failures (transform or API errors),
		 * not when ingestion is skipped by filters.
		 *
		 * @since 1.0.0
		 *
		 * @param Ingestion_Failure $failure The failure object containing:
		 *                                   - failure_code: One of the Ingestion_Failure::CODE_* constants
		 *                                   - post: The original WP_Post object
		 *                                   - error: WP_Error with failure details
		 */
		do_action( 'vip_agentforce_post_ingestion_failed', $failure );
	}

	/**
	 * Send record to Salesforce Data Cloud Ingestion API.
	 *
	 * @param Ingestion_Post_Record $record The record to send.
	 * @return Ingestion_API_Result The API result.
	 */
	public static function send_to_api( Ingestion_Post_Record $record ): Ingestion_API_Result {
		$record_id = $record->to_array()['site_id_blog_id_post_id'];

		return self::make_api_request(
			'POST',
			wp_json_encode( [ 'data' => [ $record->to_array() ] ] ),
			$record_id
		);
	}

	/**
	 * Validate that required API configuration fields are present.
	 *
	 * @return string|null Error message if validation fails, null if valid.
	 */
	private static function validate_api_config(): ?string {
		$config = Configs::get_config();

		$fields_to_check = [
			'ingestion_api_instance_url',
			'ingestion_api_token',
			'ingestion_api_source_name',
			'ingestion_api_object_name',
		];

		$empty_fields = [];
		foreach ( $fields_to_check as $field ) {
			if ( empty( $config[ $field ] ) ) {
				$empty_fields[] = $field;
			}
		}

		if ( ! empty( $empty_fields ) ) {
			return 'Missing required API configuration: ' . implode( ', ', $empty_fields );
		}

		return null;
	}

	/**
	 * Build the Ingestion API URL.
	 *
	 * @return string The full API URL.
	 */
	private static function build_api_url(): string {
		$config = Configs::get_config();

		$base_url    = $config['ingestion_api_instance_url'] ?? '';
		$source_name = $config['ingestion_api_source_name'] ?? '';
		$object_name = $config['ingestion_api_object_name'] ?? '';

		return rtrim( $base_url, '/' ) . '/api/v1/ingest/sources/' . rawurlencode( $source_name ) . '/' . rawurlencode( $object_name );
	}

	/**
	 * Get the API request timeout in seconds.
	 *
	 * Uses a longer timeout when running in WP-CLI context for bulk operations.
	 *
	 * @return int Timeout in seconds.
	 */
	private static function get_api_timeout(): int {
		$default = ( defined( 'WP_CLI' ) && WP_CLI ) ? 15 : 3;

		return (int) apply_filters( 'vip_agentforce_api_timeout', $default );
	}

	/**
	 * Make an API request to the Salesforce Data Cloud Ingestion API.
	 *
	 * @param string $method    HTTP method ('POST' or 'DELETE').
	 * @param string $body      JSON-encoded request body.
	 * @param string $record_id The record ID for the result.
	 * @return Ingestion_API_Result The API result.
	 */
	private static function make_api_request( string $method, string $body, string $record_id ): Ingestion_API_Result {
		$config_error = self::validate_api_config();
		if ( null !== $config_error ) {
			return Ingestion_API_Result::failure( $config_error, null, $record_id );
		}

		$config = Configs::get_config();
		$token  = $config['ingestion_api_token'] ?? '';
		$url    = self::build_api_url();

		$response = wp_remote_request(
			$url,
			[
				'method'  => $method,
				'headers' => [
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . $token,
				],
				'body'    => $body,
				'timeout' => self::get_api_timeout(),
			]
		);

		if ( is_wp_error( $response ) ) {
			return Ingestion_API_Result::failure( $response->get_error_message(), $response, $record_id );
		}

		$status_code = wp_remote_retrieve_response_code( $response );

		if ( 202 !== $status_code ) {
			return Ingestion_API_Result::failure(
				'Unexpected response code: ' . $status_code,
				$response,
				$record_id
			);
		}

		return Ingestion_API_Result::success( $record_id, $response );
	}

	/**
	 * Transform a post into an Ingestion_Post_Record.
	 *
	 * @param \WP_Post $post The post to transform.
	 * @return Ingestion_Post_Record|null The transformed record, or null if transformation failed.
	 */
	public static function transform_post( \WP_Post $post ): ?Ingestion_Post_Record {
		/**
		 * Filter to transform a WP_Post into an Ingestion_Post_Record for Salesforce.
		 *
		 * NOTE: The first transformer is the Default_Transformer, which provides a basic mapping.
		 *
		 * @param Ingestion_Post_Record|null $record The transformed record (null if not yet transformed by Default_Transformer).
		 * @param \WP_Post                   $post   The post being transformed.
		 * @return Ingestion_Post_Record|null The transformed record, or null to skip ingestion.
		 */
		$record = apply_filters( 'vip_agentforce_transform_post', null, $post );

		if ( ! $record instanceof Ingestion_Post_Record ) {
			return null;
		}

		return $record;
	}

	/**
	 * Determine if a post should be ingested.
	 *
	 * Returns false by default unless a filter explicitly opts in.
	 * This prevents accidental mass ingestion on sites with millions of posts.
	 *
	 * @param \WP_Post $post The post to evaluate.
	 * @return bool Whether the post should be ingested.
	 */
	public static function should_ingest_post( \WP_Post $post ): bool {
		// Safety: No filters = no ingestion.
		if ( ! has_filter( 'vip_agentforce_should_ingest_post' ) ) {
			return false;
		}

		// Only 'publish' status allowed.
		if ( 'publish' !== $post->post_status ) {
			return false;
		}

		/**
		 * Filter whether a post should be ingested into Salesforce.
		 *
		 * @param bool|null $should_ingest Default null indicates no filter has decided yet.
		 *                                 Filters can check for null to see if a prior filter
		 *                                 already made a decision, useful for conditional overrides.
		 * @param \WP_Post  $post          The post being evaluated.
		 * @return bool Whether to ingest the post.
		 */
		return (bool) apply_filters( 'vip_agentforce_should_ingest_post', null, $post );
	}

	/**
	 * Handle permanent post deletion.
	 *
	 * When a published post is permanently deleted, we delete it from Salesforce
	 * if it was ingestible.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 */
	public static function handle_before_delete_post( int $post_id, \WP_Post $post ): void {
		// Only act if the post was published (otherwise it wouldn't be in Salesforce).
		if ( 'publish' !== $post->post_status ) {
			return;
		}

		// Check if the post was previously ingested (has tracking meta).
		if ( ! self::was_post_ingested( $post ) ) {
			return;
		}

		self::delete_post_from_salesforce( $post );
	}

	/**
	 * Check if a post was previously ingested (or ingestion was attempted).
	 *
	 * This checks for the ingestion meta first - if it exists, we know we attempted
	 * to ingest this post. This is more reliable than checking the filter, as filters
	 * can change over time.
	 *
	 * Post revisions and autosaves are never considered ingested, even if they have the meta.
	 *
	 * @param \WP_Post $post The post to check.
	 * @return bool Whether the post was previously ingested.
	 */
	public static function was_post_ingested( \WP_Post $post ): bool {
		if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return false;
		}

		// Check if we have a record of attempting to ingest this post.
		$ingestion_attempted = get_post_meta( $post->ID, self::META_KEY_INGESTION_ATTEMPTED, true );

		if ( ! empty( $ingestion_attempted ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Delete a post from Salesforce.
	 *
	 * @param \WP_Post $post The post to delete.
	 * @return bool True if deletion succeeded, false if it failed.
	 */
	private static function delete_post_from_salesforce( \WP_Post $post ): bool {
		$record_id = self::build_record_id( $post );
		$result    = static::delete_from_api( $post );

		if ( ! $result->success ) {
			self::fire_deletion_failure(
				$post->ID,
				$record_id,
				Deletion_Failure::CODE_DELETE_API_ERROR,
				[
					'result' => $result,
				]
			);
			return false;
		}

		// Clear the ingestion tracking meta since the post is no longer in Salesforce.
		delete_post_meta( $post->ID, self::META_KEY_INGESTION_ATTEMPTED );

		return true;
	}

	/**
	 * Delete a post record from Salesforce API.
	 *
	 * @param \WP_Post $post The post to delete.
	 * @return Ingestion_API_Result The API result.
	 */
	public static function delete_from_api( \WP_Post $post ): Ingestion_API_Result {
		$record_id = self::build_record_id( $post );

		return self::delete_record_id_from_api( $record_id );
	}

	/**
	 * Delete a record from Salesforce API by record ID.
	 *
	 * This method allows deletion by record_id directly, useful for CLI commands
	 * where the post may not exist in WordPress.
	 *
	 * @param string $record_id The record ID in format site_id_blog_id_post_id.
	 * @return Ingestion_API_Result The API result.
	 */
	public static function delete_record_id_from_api( string $record_id ): Ingestion_API_Result {
		return self::make_api_request(
			'DELETE',
			wp_json_encode( [ 'ids' => [ $record_id ] ] ),
			$record_id
		);
	}

	/**
	 * Build the record ID for a post (site_id_blog_id_post_id format).
	 *
	 * @param \WP_Post $post The post.
	 * @return string The record ID.
	 */
	private static function build_record_id( \WP_Post $post ): string {
		$site_id = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id = (string) get_current_blog_id();
		$post_id = (string) $post->ID;

		return $site_id . '_' . $blog_id . '_' . $post_id;
	}

	/**
	 * Fire the deletion failure action.
	 *
	 * @param int                  $post_id      The post ID that failed deletion.
	 * @param string               $record_id    The Salesforce record ID.
	 * @param string               $failure_code One of the Deletion_Failure::CODE_* constants.
	 * @param array<string, mixed> $details      Optional additional details about the failure.
	 */
	private static function fire_deletion_failure( int $post_id, string $record_id, string $failure_code, array $details = [] ): void {
		$post = get_post( $post_id );

		$error_codes = [
			Deletion_Failure::CODE_DELETE_API_ERROR => 'vip_agentforce_delete_api_error',
		];

		$error_messages = [
			Deletion_Failure::CODE_DELETE_API_ERROR => 'Delete API call failed',
		];

		$error_data = array_merge(
			[
				'post_id'   => $post_id,
				'record_id' => $record_id,
			],
			$details
		);

		$failure = new Deletion_Failure(
			[
				'failure_code' => $failure_code,
				'post'         => $post,
				'record_id'    => $record_id,
				'error'        => new \WP_Error(
					$error_codes[ $failure_code ] ?? 'vip_agentforce_deletion_failed',
					$error_messages[ $failure_code ] ?? 'Deletion failed',
					$error_data
				),
			]
		);

		/**
		 * Fires when a post deletion from Salesforce fails.
		 *
		 * This action fires when we attempt to delete a post from Salesforce
		 * but the API call fails.
		 *
		 * @since 1.0.0
		 *
		 * @param Deletion_Failure $failure The failure object containing:
		 *                                  - failure_code: One of the Deletion_Failure::CODE_* constants
		 *                                  - post: The original WP_Post object
		 *                                  - record_id: The Salesforce record ID that failed to delete
		 *                                  - error: WP_Error with failure details
		 */
		do_action( 'vip_agentforce_post_deletion_failed', $failure );
	}
}

Ingestion::init();
