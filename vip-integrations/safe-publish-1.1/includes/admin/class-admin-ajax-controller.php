<?php
/**
 * Admin AJAX Controller class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\API\HTTP_Client;
use Safe_Publish\API\Source_Posts_API;
use Safe_Publish\API\Post_Type_Fetcher;
use Safe_Publish\Auth\VIP_Safe_Auth;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Reconcile_Logger;
use Safe_Publish\Utils\Reconcile_Outcome;
use Safe_Publish\Utils\Telemetry_Events;
use Safe_Publish\Utils\Telemetry_Service;
use Safe_Publish\Utils\Topological_Sorter;
use Safe_Publish\Validators\URL_Validator;
use WP_Post;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles AJAX endpoint registration and request handling for the admin area.
 *
 * Registers and processes all admin AJAX actions, delegating to injected
 * services for post imports, content processing, and history tracking.
 */
final class Admin_Ajax_Controller {

	use Verifies_Ajax_Request;

	/**
	 * Site transient key for the cached auth probe result.
	 *
	 * @var string
	 */
	const AUTH_STATUS_TRANSIENT = Connection_Service::AUTH_STATUS_TRANSIENT;

	/**
	 * TTL for the auth-status site transient.
	 *
	 * @var int
	 */
	const AUTH_STATUS_TTL = Connection_Service::AUTH_STATUS_TTL;

	/**
	 * Maximum number of source IDs accepted by ajax_sync_status_batch in a
	 * single call. Mirrors the catalog endpoint's MAX_PER_PAGE so one batch
	 * can't outgrow what the source serves for a regular page.
	 *
	 * @var int
	 */
	const SYNC_STATUS_BATCH_MAX = Posts_Read_Service::SYNC_STATUS_BATCH_MAX;

	/**
	 * Maximum number of items accepted by ajax_delete_failed_imports in a
	 * single call. Bounds the prepared statement so a stray script can't
	 * produce a DELETE with a million placeholders.
	 *
	 * @var int
	 */
	const DELETE_FAILED_IMPORTS_BATCH_MAX = 100;

	/**
	 * Maximum number of inbox rows accepted by
	 * ajax_set_needs_attention_ignored in a single call. Ignore is a light
	 * UPDATE, but the cap keeps request time and statement size bounded.
	 *
	 * @var int
	 */
	const SET_IGNORED_BATCH_MAX = 100;

	/**
	 * Maximum number of post ids accepted by ajax_bulk_delete_posts in a
	 * single call. Each trash op runs in PHP — keep the batch small enough
	 * that the request finishes within a typical admin-ajax timeout.
	 *
	 * @var int
	 */
	const BULK_DELETE_POSTS_BATCH_MAX = 50;

	/**
	 * Maximum number of degradations accepted by
	 * ajax_bulk_retry_attention_issues in a single call. Each retry re-runs a
	 * real reconciliation (a nav retry re-rewrites every referencing post), so
	 * the cap is tighter than the trash and ignore batches.
	 *
	 * @var int
	 */
	const RETRY_ATTENTION_BATCH_MAX = 25;

	/**
	 * Maximum number of source catalog pages scanned while filling one
	 * Available page, bounding worst-case latency when non-imported rows are
	 * sparse. If the scan hits this cap before the page fills, has_more stays
	 * true so the client can keep paging.
	 *
	 * @var int
	 */
	const AVAILABLE_FILL_MAX_FETCHES = Posts_Read_Service::AVAILABLE_FILL_MAX_FETCHES;

	/**
	 * Attention issue types the retry endpoint can reconcile. Doubles as
	 * the allowlist for the issue_type request param.
	 *
	 * @var string[]
	 */
	const ATTENTION_ISSUE_RETRYABLE_TYPES =
		Attention_Read_Service::ATTENTION_ISSUE_RETRYABLE_TYPES;

	/**
	 * Every target kind an attention issue can carry. The retry paths accept
	 * the narrower ('post', 'term') set, since each retryable type keys to an
	 * id; kind-agnostic actions like Ignore accept all of them.
	 *
	 * @var string[]
	 */
	private const ATTENTION_ISSUE_TARGET_KINDS = array(
		'post',
		'term',
		'taxonomy',
	);

	/**
	 * Source Posts API instance.
	 *
	 * @var Source_Posts_API
	 */
	private Source_Posts_API $api;

	/**
	 * History repository instance.
	 *
	 * @var History_Repository
	 */
	private History_Repository $repository;

	/**
	 * Post Import Service instance.
	 *
	 * @var Post_Import_Service
	 */
	private Post_Import_Service $post_import_service;

	/**
	 * Posts read service.
	 *
	 * @var Posts_Read_Service
	 */
	private Posts_Read_Service $posts_read_service;

	/**
	 * Telemetry service used to emit import-completion events.
	 *
	 * @var Telemetry_Service
	 */
	private Telemetry_Service $telemetry;

	/**
	 * Attention issues repository.
	 *
	 * @var Attention_Issues_Repository
	 */
	private Attention_Issues_Repository $attention_issues;

	/**
	 * Connection read service.
	 *
	 * @var Connection_Service
	 */
	private Connection_Service $connection_service;

	/**
	 * Attention inbox reader.
	 *
	 * @var Attention_Read_Service
	 */
	private Attention_Read_Service $attention_read_service;

	/**
	 * Constructs the Admin_Ajax_Controller instance.
	 *
	 * @param Source_Posts_API            $api                Source Posts API instance.
	 * @param History_Repository          $repository         History repository instance.
	 * @param Post_Import_Service         $post_import_service Post Import Service instance.
	 * @param Post_Type_Fetcher           $post_type_fetcher  Post Type Fetcher instance.
	 * @param Telemetry_Service           $telemetry          Telemetry service.
	 * @param Attention_Issues_Repository $attention_issues   Attention issues repository.
	 * @param Posts_Read_Service|null     $posts_read_service Posts reader.
	 * @param Connection_Service|null     $connection_service Connection read service.
	 */
	public function __construct(
		Source_Posts_API $api,
		History_Repository $repository,
		Post_Import_Service $post_import_service,
		Post_Type_Fetcher $post_type_fetcher,
		Telemetry_Service $telemetry,
		Attention_Issues_Repository $attention_issues,
		?Posts_Read_Service $posts_read_service = null,
		?Connection_Service $connection_service = null
	) {
		$this->api                    = $api;
		$this->repository             = $repository;
		$this->post_import_service    = $post_import_service;
		$this->telemetry              = $telemetry;
		$this->attention_issues       = $attention_issues;
		$this->connection_service     = $connection_service
			?? new Connection_Service( $api, $telemetry );
		$this->posts_read_service     = $posts_read_service ?? new Posts_Read_Service(
			$api,
			$repository,
			$post_import_service,
			$post_type_fetcher,
			$attention_issues
		);
		$this->attention_read_service = new Attention_Read_Service(
			$repository,
			$attention_issues,
			$post_import_service
		);
	}

	/**
	 * Registers all AJAX action handlers.
	 */
	public function register_handlers(): void {
		add_action( 'wp_ajax_safe_publish_list_posts', array( $this, 'ajax_list_posts' ) );
		add_action( 'wp_ajax_safe_publish_list_needs_attention', array( $this, 'ajax_list_needs_attention' ) );
		add_action( 'wp_ajax_safe_publish_retry_attention_issue', array( $this, 'ajax_retry_attention_issue' ) );
		add_action( 'wp_ajax_safe_publish_bulk_retry_attention_issues', array( $this, 'ajax_bulk_retry_attention_issues' ) );
		add_action( 'wp_ajax_safe_publish_delete_failed_items', array( $this, 'ajax_delete_failed_items' ) );
		add_action( 'wp_ajax_safe_publish_set_needs_attention_ignored', array( $this, 'ajax_set_needs_attention_ignored' ) );
		add_action( 'wp_ajax_safe_publish_fetch_post_types', array( $this, 'ajax_fetch_post_types' ) );
		add_action( 'wp_ajax_safe_publish_test_connection', array( $this, 'ajax_test_connection' ) );
		add_action( 'wp_ajax_safe_publish_auth_status', array( $this, 'ajax_auth_status' ) );
		add_action( 'wp_ajax_safe_publish_create_draft', array( $this, 'ajax_create_draft' ) );
		add_action( 'wp_ajax_safe_publish_bulk_import', array( $this, 'ajax_bulk_import' ) );
		add_action( 'wp_ajax_safe_publish_delete_post', array( $this, 'ajax_delete_post' ) );
		add_action( 'wp_ajax_safe_publish_bulk_delete_posts', array( $this, 'ajax_bulk_delete_posts' ) );
		add_action( 'wp_ajax_safe_publish_sync_status_batch', array( $this, 'ajax_sync_status_batch' ) );

		// Preserve the public callback identity for remove_action() callers.
		$options  = array(
			Options::OPTION_CONNECTED_SITE_URL,
			Options::OPTION_BASIC_AUTH_USERNAME,
			Options::OPTION_BASIC_AUTH_PASSWORD,
		);
		$callback = array( __CLASS__, 'bust_auth_status_cache' );

		foreach ( $options as $option ) {
			add_action( 'add_option_' . $option, $callback );
			add_action( 'update_option_' . $option, $callback );
		}
	}

	/**
	 * Deletes the cached auth-status site transient.
	 */
	public static function bust_auth_status_cache(): void {
		Connection_Service::bust_auth_status_cache();
	}

	/**
	 * Handles the posts read request after verifying AJAX authorization.
	 */
	public function ajax_list_posts(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- service sanitizes the unslashed input.
		$result = $this->posts_read_service->list_posts( wp_unslash( $_POST ) );
		if ( is_wp_error( $result ) ) {
			$status = in_array(
				$result->get_error_code(),
				array( 'posts_read_missing_secret', 'posts_read_short_secret' ),
				true
			) ? 401 : null;
			wp_send_json_error( $result->get_error_message(), $status );
		}
		wp_send_json_success( $result );
	}

	/**
	 * Lists the Needs attention inbox: Failures then degradations, as one
	 * server-paginated stream. Failures come first (errors before
	 * degradations); a failed-update row carries an edit link to its live post.
	 */
	public function ajax_list_needs_attention(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- the service sanitizes these unslashed query values.
		$payload = $this->attention_read_service->list_needs_attention(
			array(
				'page'     => wp_unslash( $_POST['page'] ?? 1 ),
				'per_page' => wp_unslash( $_POST['per_page'] ?? 20 ),
				'view'     => wp_unslash( $_POST['view'] ?? 'open' ),
			)
		);
		// phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

		if ( is_wp_error( $payload ) ) {
			wp_send_json_error( $payload->get_error_message() );
		}

		wp_send_json_success( $payload );
	}

	/**
	 * Re-runs an issue's reconciliation and reports its outcome and whether it
	 * cleared.
	 *
	 * Self-verifying: The row is resolved or refreshed by the reconciliation
	 * itself, so the response reflects the issue's state after the real work
	 * ran.
	 */
	public function ajax_retry_attention_issue(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$affected_post_id = absint( $_POST['affected_post_id'] ?? 0 );
		$issue_type       = sanitize_text_field(
			wp_unslash( $_POST['issue_type'] ?? '' )
		);
		$target_ref       = absint( $_POST['target_ref'] ?? 0 );
		$target_kind      = sanitize_text_field(
			wp_unslash( $_POST['target_kind'] ?? '' )
		);
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		if ( ! in_array( $issue_type, self::ATTENTION_ISSUE_RETRYABLE_TYPES, true ) ) {
			wp_send_json_error( __( 'Unknown issue type.', 'safe-publish' ) );
		}

		if ( ! in_array( $target_kind, array( 'post', 'term' ), true ) ) {
			wp_send_json_error( __( 'Unknown target kind.', 'safe-publish' ) );
		}

		$issue = $this->attention_issues->get_issue(
			$affected_post_id,
			$issue_type,
			$target_ref,
			$target_kind
		);

		if ( null === $issue ) {
			wp_send_json_error( __( 'Issue not found.', 'safe-publish' ) );
		}

		$outcome = $this->dispatch_retry( $issue );

		$resolved = null === $this->attention_issues->get_issue(
			$affected_post_id,
			$issue_type,
			$target_ref,
			$target_kind
		);

		$this->record_reconcile_outcome( $issue, $outcome );

		wp_send_json_success(
			array(
				'resolved' => $resolved,
				'outcome'  => $outcome->type,
				'detail'   => $outcome->detail,
			)
		);
	}

	/**
	 * Retries a batch of degradations, serializing dispatch_retry over each and
	 * aggregating the outcomes. Safe Publish management access gates both the
	 * single and bulk retry handlers.
	 */
	public function ajax_bulk_retry_attention_issues(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- JSON decoded and each field sanitized in validate_retry_descriptor().
		$raw_items = wp_unslash( $_POST['items'] ?? '' );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$items = is_string( $raw_items ) ? json_decode( $raw_items, true ) : null;
		if ( ! is_array( $items ) || 0 === count( $items ) ) {
			wp_send_json_error( __( 'No items provided.', 'safe-publish' ) );
		}

		if ( count( $items ) > self::RETRY_ATTENTION_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of items per batch */
					__(
						'Retry is limited to %d items at a time.',
						'safe-publish'
					),
					self::RETRY_ATTENTION_BATCH_MAX
				)
			);
		}

		wp_send_json_success( $this->run_bulk_retry( $items ) );
	}

	/**
	 * Runs each descriptor's retry and tallies the outcomes. A descriptor whose
	 * row is already gone — e.g. a sibling nav retry in this batch reconciled it
	 * — counts as resolved; a malformed one counts as skipped.
	 *
	 * @param array[] $items Degradation identity descriptors.
	 * @return array<string, int> Outcome counts.
	 */
	private function run_bulk_retry( array $items ): array {
		$counts = array(
			'resolved'      => 0,
			'target_absent' => 0,
			'write_failed'  => 0,
			'unresolved'    => 0,
			'skipped'       => 0,
		);

		foreach ( $items as $item ) {
			$identity = $this->validate_retry_descriptor( $item );
			if ( null === $identity ) {
				++$counts['skipped'];
				continue;
			}

			$issue = $this->attention_issues->get_issue(
				$identity['affected_post_id'],
				$identity['issue_type'],
				$identity['target_ref'],
				$identity['target_kind']
			);

			if ( null === $issue ) {
				++$counts['resolved'];
				continue;
			}

			$outcome = $this->dispatch_retry( $issue );
			$this->record_reconcile_outcome( $issue, $outcome );
			++$counts[ $outcome->type ];
		}

		return $counts;
	}

	/**
	 * Validates one bulk-retry descriptor, returning the identity fields a
	 * retryable issue is keyed by — all of them id-keyed, so the lookup takes
	 * the default empty slug — or null when the type or kind is outside the
	 * retryable allowlist.
	 *
	 * @param mixed $item Raw descriptor.
	 * @return array{affected_post_id: int, issue_type: string, target_ref: int, target_kind: string}|null
	 */
	private function validate_retry_descriptor( mixed $item ): ?array {
		if ( ! is_array( $item ) ) {
			return null;
		}

		$issue_type = sanitize_text_field(
			(string) ( $item['issue_type'] ?? '' )
		);
		if (
			! in_array( $issue_type, self::ATTENTION_ISSUE_RETRYABLE_TYPES, true )
		) {
			return null;
		}

		$target_kind = sanitize_text_field(
			(string) ( $item['target_kind'] ?? '' )
		);
		if ( ! in_array( $target_kind, array( 'post', 'term' ), true ) ) {
			return null;
		}

		return array(
			'affected_post_id' => absint( $item['affected_post_id'] ?? 0 ),
			'issue_type'       => $issue_type,
			'target_ref'       => absint( $item['target_ref'] ?? 0 ),
			'target_kind'      => $target_kind,
		);
	}

	/**
	 * Records the retry's actual reconciliation outcome to the audit log.
	 *
	 * @param array             $issue   Pre-retry issue row.
	 * @param Reconcile_Outcome $outcome What the reconciliation did.
	 */
	private function record_reconcile_outcome(
		array $issue,
		Reconcile_Outcome $outcome
	): void {
		( new Reconcile_Logger() )->record(
			$outcome,
			(string) $issue['issue_type'],
			(int) $issue['affected_post_id'],
			(int) $issue['target_ref'],
			(string) $issue['target_kind']
		);
	}

	/**
	 * Routes a fetched issue row to the reconciliation for its type and returns
	 * the outcome.
	 *
	 * @param array $issue Issue row from the repository.
	 * @return Reconcile_Outcome The reconciliation outcome.
	 */
	private function dispatch_retry( array $issue ): Reconcile_Outcome {
		$affected_post_id = (int) $issue['affected_post_id'];
		$target_ref       = (int) $issue['target_ref'];
		$target_kind      = (string) $issue['target_kind'];
		$source_site_url  = (string) $issue['source_site_url'];

		switch ( (string) $issue['issue_type'] ) {
			case 'nav_ref_rewrite_failed':
				return $this->post_import_service->retry_nav_ref_rewrite(
					$affected_post_id,
					$target_ref,
					$source_site_url
				);
			case 'unmapped_block_reference':
				return $this->post_import_service->retry_block_ref_repoint(
					$affected_post_id,
					$target_ref,
					$target_kind,
					$source_site_url
				);
			case 'unmapped_gallery_reference':
				return $this->post_import_service->retry_gallery_ref_remap(
					$affected_post_id,
					$target_ref,
					$source_site_url
				);
			case 'parent_orphaned':
				return $this->post_import_service->retry_parent_relink(
					$affected_post_id,
					$target_ref,
					$source_site_url
				);
		}

		return Reconcile_Outcome::unresolved( 'Unknown issue type.' );
	}

	/**
	 * Removes failure rows by id. The repository helper scopes to
	 * status='error' so success/updated rows are unreachable.
	 */
	public function ajax_delete_failed_items(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- each element is downstream-sanitized via absint().
		$raw_item_ids   = (array) wp_unslash( $_POST['item_ids'] ?? array() );
		$raw_source_ids = (array) wp_unslash(
			$_POST['source_post_ids'] ?? array()
		);
		// phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

		$item_ids        = array_map( 'absint', $raw_item_ids );
		$source_post_ids = array_map( 'absint', $raw_source_ids );

		if ( 0 === count( $item_ids ) && 0 === count( $source_post_ids ) ) {
			wp_send_json_error( __( 'No items provided.', 'safe-publish' ) );
		}

		$total = count( $item_ids ) + count( $source_post_ids );
		if ( $total > self::DELETE_FAILED_IMPORTS_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of items per batch */
					__(
						'Failed-import removal is limited to %d items at a time.',
						'safe-publish'
					),
					self::DELETE_FAILED_IMPORTS_BATCH_MAX
				)
			);
		}

		$deleted = $this->repository->delete_failed_items(
			$item_ids,
			$source_post_ids,
			Options::get_connected_site_url_with_path()
		);

		wp_send_json_success( array( 'deleted' => $deleted ) );
	}

	/**
	 * Ignores or restores inbox rows in bulk. Ignore is a reversible, soft
	 * acknowledge, distinct from Remove which hard-deletes a failure row.
	 *
	 * Takes a JSON items array of descriptors carrying their kind: Failures
	 * route to the id/source scope, degradations to their identity.
	 */
	public function ajax_set_needs_attention_ignored(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$ignored = 1 === absint( $_POST['ignored'] ?? 0 );
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- JSON decoded and each field sanitized in apply_needs_attention_ignored().
		$raw_items = wp_unslash( $_POST['items'] ?? '' );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$items = is_string( $raw_items ) ? json_decode( $raw_items, true ) : null;
		if ( ! is_array( $items ) || 0 === count( $items ) ) {
			wp_send_json_error( __( 'No items provided.', 'safe-publish' ) );
		}

		if ( count( $items ) > self::SET_IGNORED_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of items per batch */
					__(
						'Ignoring is limited to %d items at a time.',
						'safe-publish'
					),
					self::SET_IGNORED_BATCH_MAX
				)
			);
		}

		$updated = $this->apply_needs_attention_ignored( $items, $ignored );

		wp_send_json_success( array( 'updated' => $updated ) );
	}

	/**
	 * Applies an ignore/restore to a batch of inbox descriptors, routing each
	 * by kind, and returns the number of rows changed.
	 *
	 * @param array[] $items   Descriptors, each carrying a 'kind'.
	 * @param bool    $ignored True to ignore, false to restore.
	 * @return int Rows updated across failures and degradations.
	 */
	private function apply_needs_attention_ignored(
		array $items,
		bool $ignored
	): int {
		$item_ids   = array();
		$source_ids = array();
		$updated    = 0;

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$kind = $item['kind'] ?? '';

			if ( 'failure' === $kind ) {
				$source_id = absint( $item['source_post_id'] ?? 0 );
				if ( $source_id > 0 ) {
					$source_ids[] = $source_id;
				} else {
					$item_ids[] = absint( $item['item_id'] ?? 0 );
				}
			} elseif ( 'degradation' === $kind ) {
				$updated += $this->set_degradation_ignored( $item, $ignored );
			}
		}

		if ( count( $item_ids ) > 0 || count( $source_ids ) > 0 ) {
			$updated += $this->repository->set_failed_items_ignored(
				$item_ids,
				$source_ids,
				$ignored,
				Options::get_connected_site_url_with_path()
			);
		}

		return $updated;
	}

	/**
	 * Ignores or restores one degradation descriptor after validating its
	 * target kind; an unknown identity harmlessly matches nothing.
	 *
	 * @param array $item    Degradation descriptor.
	 * @param bool  $ignored True to ignore, false to restore.
	 * @return int Rows updated (0 or 1).
	 */
	private function set_degradation_ignored( array $item, bool $ignored ): int {
		$target_kind = sanitize_text_field(
			(string) ( $item['target_kind'] ?? '' )
		);
		if (
			! in_array( $target_kind, self::ATTENTION_ISSUE_TARGET_KINDS, true )
		) {
			return 0;
		}

		$issue_type = sanitize_text_field(
			(string) ( $item['issue_type'] ?? '' )
		);

		return $this->attention_issues->set_issue_ignored(
			absint( $item['affected_post_id'] ?? 0 ),
			$issue_type,
			absint( $item['target_ref'] ?? 0 ),
			$target_kind,
			sanitize_text_field( (string) ( $item['target_slug'] ?? '' ) ),
			$ignored
		);
	}

	/**
	 * Handles the posts read request after verifying AJAX authorization.
	 */
	public function ajax_fetch_post_types(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- service sanitizes the unslashed input.
		$result = $this->posts_read_service->fetch_post_types( wp_unslash( $_POST ) );
		if ( is_wp_error( $result ) ) {
			$status = in_array(
				$result->get_error_code(),
				array( 'posts_read_missing_secret', 'posts_read_short_secret' ),
				true
			) ? 401 : null;
			wp_send_json_error( $result->get_error_message(), $status );
		}
		wp_send_json_success( $result );
	}

	/**
	 * Handles AJAX request for testing connection.
	 */
	public function ajax_test_connection(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Service sanitizes the unslashed form fields.
		$results = $this->connection_service->test_connection( wp_unslash( $_POST ) );
		if ( is_wp_error( $results ) ) {
			$data = $results->get_error_data();
			wp_send_json_error(
				$results->get_error_message(),
				is_array( $data ) ? ( $data['status'] ?? null ) : null
			);
		}

		wp_send_json_success( $results );
	}

	/**
	 * Handles AJAX request for the cached auth-status probe.
	 *
	 * Returns the cached probe result so the import and settings UIs can
	 * surface live auth state on page load without each one issuing its own
	 * network request.
	 */
	public function ajax_auth_status(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		$probe = $this->connection_service->auth_status( array() );
		if ( is_wp_error( $probe ) ) {
			wp_send_json_error( $probe->get_error_message() );
		}

		wp_send_json_success( $probe );
	}

	/**
	 * Handles AJAX request for creating a draft post.
	 *
	 * Validates input, checks for an existing post with the same source ID,
	 * returns a confirmation prompt when one exists (unless force_update is set),
	 * processes content, creates or updates the post, and logs history.
	 */
	public function ajax_create_draft(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		$this->validate_auth_or_fail();
		$this->validate_connection_or_fail();

		$source_post_id = absint( $_POST['source_post_id'] ?? 0 );
		$title          = sanitize_text_field( wp_unslash( $_POST['title'] ?? '' ) );
		$raw_post_type  = sanitize_text_field( wp_unslash( $_POST['post_type'] ?? 'post' ) );
		$force_update   = isset( $_POST['force_update'] ) && 'true' === $_POST['force_update'];

		// Validate basic input before any session or duplicate-detection work so
		// that malformed requests do not leave history rows behind and cannot
		// reach the confirm-prompt branch by way of an existing post lookup.
		// Post_Import_Service::validate_required_fields() and resolve_post_type()
		// repeat these checks as defense-in-depth and to cover the bulk-import
		// code path.
		if ( 0 === $source_post_id ) {
			wp_send_json_error( __( 'Source post ID is required.', 'safe-publish' ) );
		}

		if ( '' === $title ) {
			wp_send_json_error( __( 'Post title is required.', 'safe-publish' ) );
		}

		$post_type = $this->post_import_service->resolve_post_type( $raw_post_type );

		if ( is_wp_error( $post_type ) ) {
			wp_send_json_error( $post_type->get_error_message() );
		}

		// Force-update confirmation prompt is HTTP UX, not import logic: If the
		// post is already imported and the caller hasn't opted into updating,
		// return the prompt response instead of running the import.
		$imported_post = $this->post_import_service->find_imported_post(
			$source_post_id,
			Options::get_connected_site_url_with_path()
		);

		if ( $imported_post && ! $force_update ) {
			wp_send_json_success(
				array(
					'existing'       => true,
					'post_id'        => $imported_post->ID,
					'post_title'     => $imported_post->post_title,
					'edit_url'       => admin_url( 'post.php?post=' . $imported_post->ID . '&action=edit' ),
					'message'        => sprintf(
						/* translators: %s: title of the existing post */
						__( 'Post "%s" already exists. Do you want to update it with the latest content from the source site?', 'safe-publish' ),
						$imported_post->post_title
					),
					'confirm_action' => 'update_existing',
				)
			);
		}

		// Session is created only after the request is eligible to proceed —
		// past basic validation and past the confirm-prompt short-circuit — so
		// that rejected requests do not leave rows in the history table.
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		$session_result  = $this->repository->create_session( $source_site_url, 'single' );

		if ( is_wp_error( $session_result ) ) {
			wp_send_json_error( $session_result->get_error_message() );
		}

		$session_id = $session_result;

		// Meta and terms come from the fresh source payload, not the request.
		$post_data = array(
			'id'        => $source_post_id,
			'title'     => $title,
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized by Post_Import_Service::extract_post_fields().
			'link'      => wp_unslash( $_POST['source_link'] ?? '' ),
			'post_type' => $raw_post_type,
		);

		$result = $this->post_import_service->import_post(
			$post_data,
			$session_id
		);

		$this->repository->complete_session( $session_id );

		if ( ! $result['success'] ) {
			$response_error = $result['error'];
			if (
				isset( $result[ HTTP_Client::ERROR_DATA_SOURCE_ERROR ] )
				&& is_array( $result[ HTTP_Client::ERROR_DATA_SOURCE_ERROR ] )
			) {
				$response_error = array(
					'message'                            => $result['error'],
					HTTP_Client::ERROR_DATA_SOURCE_ERROR =>
						$result[ HTTP_Client::ERROR_DATA_SOURCE_ERROR ],
				);
			}
			wp_send_json_error( $response_error );
		}

		$this->telemetry->record_event(
			Telemetry_Events::SINGLE_IMPORT_COMPLETED,
			array(
				'outcome'       => $result['existing']
					? Telemetry_Events::SINGLE_OUTCOME_UPDATED
					: Telemetry_Events::SINGLE_OUTCOME_NEW,
				'warning_count' => count( $result['warnings'] ?? array() ),
			)
		);

		$result['message'] = $result['existing']
			? __( 'Existing post updated with latest content.', 'safe-publish' )
			: __( 'Draft post created.', 'safe-publish' );

		wp_send_json_success( $result );
	}

	/**
	 * Handles AJAX request for bulk importing posts.
	 *
	 * Runs in two passes so parent-child relationships are preserved across a
	 * batch: Pass 1 fetches each post's fresh REST payload without writing to
	 * the DB, and pass 2 processes the batch in topological order so a source
	 * parent is imported before its children.
	 */
	public function ajax_bulk_import(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		$this->validate_auth_or_fail();
		$this->validate_connection_or_fail();

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- JSON string not sanitized to preserve structure; validated after decode.
		$posts_data_json = isset( $_POST['posts_data'] ) ? wp_unslash( $_POST['posts_data'] ) : '';

		if ( empty( $posts_data_json ) ) {
			wp_send_json_error( __( 'Posts data is required.', 'safe-publish' ) );
		}

		$posts_data = json_decode( $posts_data_json, true );

		if ( ! is_array( $posts_data ) || empty( $posts_data ) ) {
			wp_send_json_error( __( 'Invalid posts data provided.', 'safe-publish' ) );
		}

		// Limit bulk operations to prevent timeout/memory issues.
		if ( count( $posts_data ) > 50 ) {
			wp_send_json_error( __( 'Bulk import limited to 50 posts at a time.', 'safe-publish' ) );
		}

		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		$session_result  = $this->repository->create_session( $source_site_url, 'bulk' );

		if ( is_wp_error( $session_result ) ) {
			wp_send_json_error( $session_result->get_error_message() );
		}

		$session_id = $session_result;

		// Pass 1: Fetch each post's REST payload without touching the DB. The
		// payload is the same source of truth used by pass 2, so prefetched
		// posts skip the in-pipeline fetch when they're processed.
		$batch_fresh_data = array();
		$request_index    = array();
		foreach ( $posts_data as $index => $post_data ) {
			$source_post_id = absint( $post_data['id'] ?? 0 );
			if ( 0 === $source_post_id ) {
				continue;
			}

			$post_type = sanitize_text_field( $post_data['post_type'] ?? 'post' );
			$fresh     = $this->api->fetch_fresh_post( $source_post_id, $post_type );
			if ( is_wp_error( $fresh ) ) {
				continue;
			}

			$batch_fresh_data[ $source_post_id ] = $fresh;
			$request_index[ $source_post_id ]    = $index;
		}

		// Topologically sort so each source parent is processed before its
		// children. Cycle leftovers fall through to the normal unresolvable-
		// parent error path.
		$parent_map = array();
		foreach ( $batch_fresh_data as $source_id => $fresh ) {
			$parent_map[ $source_id ] = absint( $fresh['parent'] ?? 0 );
		}

		$sort_result  = Topological_Sorter::sort( $parent_map );
		$sorted_order = self::order_dependent_types(
			array_merge( $sort_result['sorted'], $sort_result['leftover'] ),
			$batch_fresh_data
		);
		$processed    = array();

		// Source ID => destination ID accumulator. Feeds block-attribute ID
		// remapping for items referencing in-batch imports (e.g. wp_navigation
		// links, core/block refs).
		$session_id_map = array();

		$results    = array();
		$successful = 0;
		$failed     = 0;

		// Pass 2: Process in topological order, then append items whose pass-1
		// fetch failed (or was skipped) in request order — import_post() will
		// re-fetch them and surface the underlying failure.
		foreach ( $sorted_order as $source_id ) {
			$index     = $request_index[ $source_id ];
			$post_data = $posts_data[ $index ];
			$prefetch  = $batch_fresh_data[ $source_id ];

			$result    = $this->post_import_service->import_post(
				$post_data,
				$session_id,
				array(
					'prefetched_fresh_result' => $prefetch,
					'batch_fresh_data'        => $batch_fresh_data,
					'session_id_map'          => $session_id_map,
				)
			);
			$results[] = $result;

			$processed[ $source_id ] = true;

			if ( $result['success'] ) {
				++$successful;
				$session_id_map[ $source_id ] = (int) $result['post_id'];
			} else {
				++$failed;
			}
		}

		foreach ( $posts_data as $post_data ) {
			$source_post_id = absint( $post_data['id'] ?? 0 );
			if ( $source_post_id > 0 && isset( $processed[ $source_post_id ] ) ) {
				continue;
			}

			$result    = $this->post_import_service->import_post(
				$post_data,
				$session_id,
				array(
					'batch_fresh_data' => $batch_fresh_data,
					'session_id_map'   => $session_id_map,
				)
			);
			$results[] = $result;

			if ( $result['success'] ) {
				++$successful;
				if ( $source_post_id > 0 ) {
					$session_id_map[ $source_post_id ] = (int) $result['post_id'];
				}
			} else {
				++$failed;
			}
		}

		$this->repository->complete_session( $session_id );

		Post_Import_Notice::record(
			$session_id,
			count( $results ),
			$successful,
			$failed
		);

		$this->telemetry->record_event(
			Telemetry_Events::BULK_IMPORT_COMPLETED,
			array(
				'batch_size'   => count( $results ),
				'successful'   => $successful,
				'failed'       => $failed,
				'has_failures' => $failed > 0,
			)
		);

		wp_send_json_success(
			array(
				'total'      => count( $results ),
				'successful' => $successful,
				'failed'     => $failed,
				'results'    => $results,
				'session_id' => $session_id,
			)
		);
	}

	/**
	 * Handles AJAX request for deleting a locally imported post.
	 *
	 * Moves the local post to trash by its WordPress post ID. The Imports →
	 * Posts tab is the only caller and already has the local ID in hand, so
	 * no source-side lookup is needed; the imported-post meta is still
	 * required so this endpoint can't be repurposed to trash arbitrary posts.
	 */
	public function ajax_delete_post(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		$post_id = absint( $_POST['post_id'] ?? 0 );

		if ( ! $post_id ) {
			wp_send_json_error( __( 'Post ID is required.', 'safe-publish' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			wp_send_json_error( __( 'Post not found.', 'safe-publish' ) );
		}

		$source_id = (string) get_post_meta(
			$post->ID,
			Options::META_SOURCE_POST_ID,
			true
		);

		if ( '' === $source_id ) {
			wp_send_json_error( __( 'Post not found.', 'safe-publish' ) );
		}

		if ( ! current_user_can( 'delete_post', $post->ID ) ) {
			wp_send_json_error( __( 'Forbidden', 'safe-publish' ), 403 );
		}

		$result = wp_trash_post( $post->ID );

		if ( ! $result ) {
			wp_send_json_error( __( 'Failed to move the post to trash.', 'safe-publish' ) );
		}

		wp_send_json_success( array( 'message' => __( 'Post moved to trash.', 'safe-publish' ) ) );
	}

	/**
	 * Handles AJAX request for bulk-trashing imported posts from the
	 * Manage page.
	 *
	 * Each id is verified to map to a real post that this plugin imported
	 * (META_SOURCE_POST_ID present) and that the caller can delete; rows
	 * that fail either check are skipped, not aborted. The endpoint moves
	 * matched posts to the trash via wp_trash_post — same disposition as
	 * the single-delete path.
	 */
	public function ajax_bulk_delete_posts(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- each element is downstream-sanitized via absint().
		$raw_ids = (array) wp_unslash( $_POST['post_ids'] ?? array() );

		$post_ids = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', $raw_ids ),
					static fn( int $id ): bool => $id > 0
				)
			)
		);

		if ( 0 === count( $post_ids ) ) {
			wp_send_json_error( __( 'No posts provided.', 'safe-publish' ) );
		}

		if ( count( $post_ids ) > self::BULK_DELETE_POSTS_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of posts per batch */
					__(
						'Bulk trash is limited to %d posts at a time.',
						'safe-publish'
					),
					self::BULK_DELETE_POSTS_BATCH_MAX
				)
			);
		}

		$deleted = 0;
		$skipped = 0;

		foreach ( $post_ids as $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) {
				++$skipped;
				continue;
			}

			$source_id = (string) get_post_meta(
				$post->ID,
				Options::META_SOURCE_POST_ID,
				true
			);
			if ( '' === $source_id ) {
				++$skipped;
				continue;
			}

			if ( ! current_user_can( 'delete_post', $post->ID ) ) {
				++$skipped;
				continue;
			}

			if ( wp_trash_post( $post->ID ) ) {
				++$deleted;
			} else {
				++$skipped;
			}
		}

		wp_send_json_success(
			array(
				'deleted' => $deleted,
				'skipped' => $skipped,
			)
		);
	}

	/**
	 * Handles the posts read request after verifying AJAX authorization.
	 */
	public function ajax_sync_status_batch(): void {
		if ( ! check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce', false ) ) {
			$this->send_session_expired_error();
		}
		$this->verify_ajax_capability();

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- service sanitizes the unslashed input.
		$result = $this->posts_read_service->sync_status_batch( wp_unslash( $_POST ) );
		if ( is_wp_error( $result ) ) {
			$status = in_array(
				$result->get_error_code(),
				array( 'posts_read_missing_secret', 'posts_read_short_secret' ),
				true
			) ? 401 : null;
			wp_send_json_error( $result->get_error_message(), $status );
		}
		wp_send_json_success( $result );
	}

	/**
	 * Orders dependent types around the posts that reference them so the
	 * referenced side populates the session ID map first.
	 *
	 * Reusable blocks (wp_block) move to the front: A post's core/block ref
	 * must resolve against an already-imported block. Navigation menus
	 * (wp_navigation) move to the back: They reference pages via
	 * core/navigation-link `id`, so those pages must import first. Every other
	 * type keeps its topological position.
	 *
	 * @param int[]                            $sorted_order     Source IDs in topo order.
	 * @param array<int, array<string, mixed>> $batch_fresh_data Pass-1 fresh data
	 *                                                           keyed by source ID.
	 * @return int[] Reordered source IDs (request-order preserved within each
	 *               group).
	 */
	private static function order_dependent_types(
		array $sorted_order,
		array $batch_fresh_data
	): array {
		$head = array();
		$body = array();
		$tail = array();
		foreach ( $sorted_order as $source_id ) {
			$post_type = (string) ( $batch_fresh_data[ $source_id ]['post_type'] ?? '' );
			if ( 'wp_block' === $post_type ) {
				$head[] = $source_id;
			} elseif ( 'wp_navigation' === $post_type ) {
				$tail[] = $source_id;
			} else {
				$body[] = $source_id;
			}
		}

		return array_merge( $head, $body, $tail );
	}

	/**
	 * Sends a JSON error response when the Shared Secret does not satisfy
	 * VIP_Safe_Auth::has_valid_credential_format(). Splits the failure into
	 * "missing" and "too short" so the operator gets an actionable message.
	 */
	private function validate_auth_or_fail(): void {
		$credentials = Auth_Credential_Provider::get_credentials();

		if ( VIP_Safe_Auth::has_valid_credential_format( $credentials ) ) {
			return;
		}

		if ( '' === ( $credentials['shared_secret'] ?? '' ) ) {
			wp_send_json_error(
				__(
					'Shared Secret is not configured. Add SAFE_PUBLISH_SHARED_SECRET to wp-config.php on both sites.',
					'safe-publish'
				),
				401
			);
		} else {
			wp_send_json_error(
				__(
					'Shared Secret is too short. SAFE_PUBLISH_SHARED_SECRET must be at least 16 characters.',
					'safe-publish'
				),
				401
			);
		}
	}

	/**
	 * Sends a JSON error response when no usable source site is connected.
	 * Applies the fetch layer's URL validation, so an unparseable, non-HTTP, or
	 * private-host connection never opens a session.
	 */
	private function validate_connection_or_fail(): void {
		$connected_site_url = (string) Options::get_value(
			Options::OPTION_CONNECTED_SITE_URL,
			''
		);

		if ( URL_Validator::is_valid_external_url( $connected_site_url ) ) {
			return;
		}

		wp_send_json_error(
			__(
				'No source site is connected. Configure a valid connected site URL in the settings page before importing.',
				'safe-publish'
			)
		);
	}
}
