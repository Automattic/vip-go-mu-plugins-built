<?php
/**
 * Post Import Service class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\API\Source_Posts_API;
use Safe_Publish\API\Meta_Terms_Manager;
use Safe_Publish\Media\Media_Importer;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Post_Type_Map;
use Safe_Publish\Utils\Reconcile_Outcome;
use Safe_Publish\Utils\Telemetry_Events;
use Safe_Publish\Utils\Telemetry_Service;
use Exception;
use WP_Error;
use WP_Post;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles post import orchestration for both single and bulk imports.
 *
 * Coordinates content processing, post creation or updating, featured image
 * import, and history logging for each imported post.
 */
class Post_Import_Service {

	use Sanitizes_Content;

	/**
	 * Object-cache group for per-source-post import locks.
	 *
	 * @var string
	 */
	public const IMPORT_LOCK_GROUP = 'safe_publish_import_locks';

	/**
	 * Object-cache key prefix for per-source-post import locks.
	 *
	 * @var string
	 */
	public const IMPORT_LOCK_KEY_PREFIX = 'importing_';

	/**
	 * TTL for a per-source-post import lock, in seconds. Generous enough for
	 * media-heavy posts; a crashed import leaves the lock until expiry.
	 *
	 * @var int
	 */
	public const IMPORT_LOCK_TTL = 300;

	/**
	 * Source Posts API instance.
	 *
	 * @var Source_Posts_API
	 */
	private Source_Posts_API $api;

	/**
	 * Media Importer instance.
	 *
	 * @var Media_Importer
	 */
	private Media_Importer $media_importer;

	/**
	 * Content Processor instance.
	 *
	 * @var Content_Processor
	 */
	private Content_Processor $content_processor;

	/**
	 * History repository instance.
	 *
	 * @var History_Repository
	 */
	private History_Repository $repository;

	/**
	 * Meta Terms Manager instance.
	 *
	 * @var Meta_Terms_Manager
	 */
	private Meta_Terms_Manager $meta_terms_manager;

	/**
	 * Telemetry service used to emit per-item failure events.
	 *
	 * @var Telemetry_Service
	 */
	private Telemetry_Service $telemetry;

	/**
	 * Navigation cross-reference rewriter.
	 *
	 * @var Navigation_Ref_Rewriter
	 */
	private Navigation_Ref_Rewriter $nav_ref_rewriter;

	/**
	 * Attention issues repository.
	 *
	 * @var Attention_Issues_Repository
	 */
	private Attention_Issues_Repository $attention_issues;

	/**
	 * Issue types keyed to the imported post itself, reconciled from its
	 * finalized import warnings.
	 *
	 * @var string[]
	 */
	private const ATTENTION_POST_ISSUE_TYPES = array(
		'unmapped_block_reference',
		'unmigratable_reusable_block',
		'parent_orphaned',
	);

	/**
	 * Post meta recording the unix timestamp at which an orphaned post was
	 * re-linked to its parent by a retry.
	 *
	 * @var string
	 */
	public const META_PARENT_RELINKED_AT = '_safe_publish_parent_relinked_at';

	/**
	 * Constructs the Post_Import_Service instance.
	 *
	 * @param Source_Posts_API            $api                Source Posts API instance.
	 * @param Media_Importer              $media_importer     Media Importer instance.
	 * @param Content_Processor           $content_processor  Content Processor instance.
	 * @param History_Repository          $repository         History repository instance.
	 * @param Meta_Terms_Manager          $meta_terms_manager Meta Terms Manager instance.
	 * @param Telemetry_Service           $telemetry          Telemetry service.
	 * @param Navigation_Ref_Rewriter     $nav_ref_rewriter   Navigation cross-reference rewriter.
	 * @param Attention_Issues_Repository $attention_issues   Attention issues repository.
	 */
	public function __construct(
		Source_Posts_API $api,
		Media_Importer $media_importer,
		Content_Processor $content_processor,
		History_Repository $repository,
		Meta_Terms_Manager $meta_terms_manager,
		Telemetry_Service $telemetry,
		Navigation_Ref_Rewriter $nav_ref_rewriter,
		Attention_Issues_Repository $attention_issues
	) {
		$this->api                = $api;
		$this->media_importer     = $media_importer;
		$this->content_processor  = $content_processor;
		$this->repository         = $repository;
		$this->meta_terms_manager = $meta_terms_manager;
		$this->telemetry          = $telemetry;
		$this->nav_ref_rewriter   = $nav_ref_rewriter;
		$this->attention_issues   = $attention_issues;
	}

	/**
	 * Imports a single post from source post data.
	 *
	 * @param array    $post_data  Post data array containing id, title, content, link, etc.
	 * @param int|null $session_id Optional import session ID for history tracking.
	 * @param array    $options    Optional behavior overrides:
	 *                             - 'prefetched_fresh_result' (array|null, default null):
	 *                               pre-fetched fetch_fresh_post() response; skips the
	 *                               in-pipeline fetch in the bulk two-pass flow.
	 *                             - 'batch_fresh_data' (array|null, default null): map of
	 *                               source ID => pass-1 fresh data for the current bulk batch;
	 *                               drives parent resolution's in-batch detection.
	 *                             - 'session_id_map' (array<int,int>, default empty): source
	 *                               post ID => destination post ID accumulated during pass 2
	 *                               of the bulk batch; feeds block-attribute ID remapping
	 *                               for later items (e.g. wp_navigation links).
	 * @return array Result data with success status, post_id, edit_url, and error keys.
	 */
	public function import_post(
		array $post_data,
		?int $session_id = null,
		array $options = array()
	): array {
		try {
			return $this->process_post_import( $post_data, $session_id, $options );
		} catch ( Exception $e ) {
			return $this->build_exception_result( $post_data, $session_id, $e );
		}
	}

	/**
	 * Processes the post import workflow end-to-end.
	 *
	 * @param array    $post_data  Raw post data.
	 * @param int|null $session_id Import session ID.
	 * @param array    $options    Behavior overrides; see import_post().
	 * @return array Import result data.
	 */
	private function process_post_import(
		array $post_data,
		?int $session_id,
		array $options
	): array {
		$fields = $this->extract_post_fields( $post_data );

		$validation_error = $this->validate_required_fields( $fields );
		if ( null !== $validation_error ) {
			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				null,
				$validation_error['error'],
				array( 'action' => 'validation_failed' )
			);

			return $validation_error;
		}

		$post_type = $this->resolve_post_type( $fields['raw_post_type'] );

		if ( is_wp_error( $post_type ) ) {
			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				null,
				$post_type->get_error_message(),
				array( 'action' => $post_type->get_error_code() )
			);

			return $this->build_error_result(
				$fields,
				$post_type->get_error_message()
			);
		}

		$lock_acquired = $this->acquire_import_lock( $fields['source_post_id'] );

		if ( ! $lock_acquired ) {
			$error_message = __(
				'This post is currently being imported by another request. Please try again in a moment.',
				'safe-publish'
			);

			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				null,
				$error_message,
				array( 'action' => 'concurrent_import_blocked' )
			);

			return $this->build_error_result( $fields, $error_message );
		}

		try {
			$source_site_url = Options::get_connected_site_url_with_path();

			$imported_post = $this->find_imported_post(
				$fields['source_post_id'],
				$source_site_url
			);

			if ( $imported_post ) {
				return $this->handle_imported_post(
					$imported_post,
					$fields,
					$post_type,
					$session_id,
					$options
				);
			}

			return $this->handle_new_post(
				$fields,
				$post_type,
				$session_id,
				$options
			);
		} finally {
			$this->release_import_lock( $fields['source_post_id'] );
		}
	}

	/**
	 * Attempts to acquire the per-source-post import lock.
	 *
	 * Backed by wp_cache_add, which is atomic across requests only when a
	 * persistent object cache is configured (memcached/Redis). Without one,
	 * the lock degrades to a per-request no-op and the post-insert duplicate
	 * check in persist_new_post() is the safety net.
	 *
	 * @param int $source_post_id Source post ID.
	 * @return bool True when the lock was acquired, false when another
	 *              concurrent import already holds it.
	 */
	private function acquire_import_lock( int $source_post_id ): bool {
		return wp_cache_add(
			self::IMPORT_LOCK_KEY_PREFIX . $source_post_id,
			1,
			self::IMPORT_LOCK_GROUP,
			// IMPORT_LOCK_TTL is 300 seconds.
			// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
			self::IMPORT_LOCK_TTL
		);
	}

	/**
	 * Releases the per-source-post import lock.
	 *
	 * @param int $source_post_id Source post ID.
	 */
	private function release_import_lock( int $source_post_id ): void {
		wp_cache_delete(
			self::IMPORT_LOCK_KEY_PREFIX . $source_post_id,
			self::IMPORT_LOCK_GROUP
		);
	}

	/**
	 * Extracts and sanitizes post fields from raw post data.
	 *
	 * @param array $post_data Raw post data array.
	 * @return array Sanitized post fields. The source_post_id key
	 *               is null if not provided.
	 */
	private function extract_post_fields( array $post_data ): array {
		$source_post_id = absint( $post_data['id'] ?? 0 );

		return array(
			'source_post_id'    => $source_post_id > 0 ? $source_post_id : null,
			'title'             => sanitize_text_field( $post_data['title'] ?? '' ),
			'source_link'       => esc_url_raw( $post_data['link'] ?? '' ),
			'featured_media_id' => absint( $post_data['featured_media'] ?? 0 ),
			'raw_post_type'     => sanitize_text_field( $post_data['post_type'] ?? 'post' ),
			'slug'              => sanitize_text_field( $post_data['slug'] ?? '' ),
			'comment_status'    => sanitize_text_field( $post_data['comment_status'] ?? '' ),
			'ping_status'       => sanitize_text_field( $post_data['ping_status'] ?? '' ),
			'menu_order'        => absint( $post_data['menu_order'] ?? 0 ),
			'password'          => sanitize_text_field( $post_data['password'] ?? '' ),
			'meta'              => is_array( $post_data['meta'] ?? null ) ? $post_data['meta'] : array(),
			'terms'             => is_array( $post_data['terms'] ?? null ) ? $post_data['terms'] : array(),
			'source_author'     => is_array( $post_data['source_author'] ?? null )
				? $post_data['source_author']
				: null,
			'matched_author_id' => 0,
			'source_parent_id'  => absint( $post_data['parent'] ?? 0 ),
			'post_parent_id'    => 0,
			'warnings'          => array(),
		);
	}

	/**
	 * Resolves the source author to a destination user ID by email.
	 *
	 * Matches by email only — login collisions across sites can produce silent
	 * misattribution. No capability check: post_author is data attribution, not
	 * authorization, so a destination Subscriber matching by email is a valid
	 * post_author for an imported post.
	 *
	 * @param array|null $source_author Author payload from the source REST
	 *                                  response: { email, login, display_name }.
	 *                                  Null when the source did not include the
	 *                                  field.
	 * @return int|WP_Error Matched destination user ID on success, WP_Error with
	 *                      a specific operator-facing message on failure.
	 */
	public function resolve_source_author( ?array $source_author ): int|WP_Error {
		$email        = isset( $source_author['email'] )
			? (string) $source_author['email']
			: '';
		$login        = isset( $source_author['login'] )
			? (string) $source_author['login']
			: '';
		$display_name = isset( $source_author['display_name'] )
			? (string) $source_author['display_name']
			: '';

		if ( '' === $email ) {
			return new WP_Error(
				'source_author_unresolved',
				__(
					'Source post has no author or its author has been deleted on the source.',
					'safe-publish'
				),
				array( 'action' => 'source_author_unresolved' )
			);
		}

		$user = get_user_by( 'email', $email );

		if ( false === $user ) {
			return new WP_Error(
				'source_author_not_found',
				sprintf(
					/* translators: 1: display name, 2: email, 3: login. */
					__(
						'Source author %1$s (%2$s, login: %3$s) was not found on this site. Create a user with this email on the destination, then re-import.',
						'safe-publish'
					),
					$display_name,
					$email,
					$login
				),
				array( 'action' => 'source_author_not_found' )
			);
		}

		return (int) $user->ID;
	}

	/**
	 * Applies the opt-in author fallback.
	 *
	 * The fallback applies only when the error code is source_author_not_found
	 * and the safe_publish_import_allow_author_fallback filter returns true.
	 * Otherwise the WP_Error is returned verbatim — other resolution errors
	 * signal source-side data-quality issues that fallback would mask.
	 *
	 * For new posts (existing author id null), falls back to the importing user.
	 * For updates, returns the existing post_author so the destination's current
	 * attribution is preserved.
	 *
	 * @param WP_Error   $resolution_error        WP_Error from resolve_source_author().
	 * @param array|null $source_author           Source author payload used to build the warning.
	 * @param int|null   $existing_post_author_id Destination post's existing post_author for
	 *                                            updates; null for new posts.
	 * @return array{author_id: int, warning: array}|WP_Error Fallback applied, or the original
	 *                                            WP_Error returned verbatim.
	 */
	public function apply_author_fallback(
		WP_Error $resolution_error,
		?array $source_author,
		?int $existing_post_author_id
	): array|WP_Error {
		if ( 'source_author_not_found' !== $resolution_error->get_error_code() ) {
			return $resolution_error;
		}

		/**
		 * Filters whether the import may fall back to a different author when
		 * the source author cannot be matched on the destination site.
		 *
		 * When true, new posts are attributed to the importing user and
		 * updates preserve the destination's existing author; a warning is
		 * recorded in the import History in both cases. When false (default),
		 * imports abort with a no-match error.
		 *
		 * @param bool $enabled Whether the fallback is enabled. Default false.
		 */
		$fallback_enabled = apply_filters(
			'safe_publish_import_allow_author_fallback',
			false
		);

		if ( true !== $fallback_enabled ) {
			return $resolution_error;
		}

		$is_update = null !== $existing_post_author_id;
		$author_id = $is_update
			? $existing_post_author_id
			: get_current_user_id();

		$warning = array(
			'type'             => 'author_fallback_applied',
			'source'           => array(
				'email'        => (string) ( $source_author['email'] ?? '' ),
				'login'        => (string) ( $source_author['login'] ?? '' ),
				'display_name' => (string) ( $source_author['display_name'] ?? '' ),
			),
			'fallback_user_id' => $is_update ? null : $author_id,
		);

		return array(
			'author_id' => $author_id,
			'warning'   => $warning,
		);
	}

	/**
	 * Resolves a source post's parent to a destination post ID.
	 *
	 * Returns null when no resolution applies (non-hierarchical post type or
	 * top-level source post). Returns the destination post ID on a successful
	 * lookup. Returns a WP_Error tagged with a reason — 'not_imported' when
	 * the parent is unknown to both the destination and the current batch,
	 * 'failed_in_batch' when the parent was part of pass-1 fetch data but
	 * never reached a successful destination import.
	 *
	 * @param int        $source_parent_id Source post's parent ID. 0 means
	 *                                     top-level on the source.
	 * @param string     $post_type        Destination post type slug.
	 * @param string     $source_site_url  Source site URL for scoping the lookup; '' skips it.
	 * @param array|null $batch_fresh_data Map of source ID => pass-1 fresh
	 *                                     data for posts in the current bulk
	 *                                     batch. Null for single-import.
	 * @return int|WP_Error|null Destination post ID, WP_Error when
	 *                                     unresolved, or null when resolution
	 *                                     does not apply.
	 */
	public function resolve_source_parent(
		int $source_parent_id,
		string $post_type,
		string $source_site_url,
		?array $batch_fresh_data = null
	): int|WP_Error|null {
		if ( 0 === $source_parent_id ) {
			return null;
		}

		if ( ! is_post_type_hierarchical( $post_type ) ) {
			return null;
		}

		$destination_parent = $this->find_imported_post(
			$source_parent_id,
			$source_site_url
		);

		if ( null !== $destination_parent ) {
			return (int) $destination_parent->ID;
		}

		$in_batch = null !== $batch_fresh_data
			&& array_key_exists( $source_parent_id, $batch_fresh_data );

		if ( $in_batch ) {
			$parent_title = isset( $batch_fresh_data[ $source_parent_id ]['title'] )
				? (string) $batch_fresh_data[ $source_parent_id ]['title']
				: '';

			$message = sprintf(
				/* translators: 1: parent post ID, 2: parent post title */
				__(
					'Source parent post %1$d ("%2$s") failed to import earlier in this batch.',
					'safe-publish'
				),
				$source_parent_id,
				$parent_title
			);

			return new WP_Error(
				'parent_not_resolved',
				$message,
				array(
					'action'       => 'parent_not_resolved',
					'parent_id'    => $source_parent_id,
					'parent_title' => $parent_title,
					'reason'       => 'failed_in_batch',
				)
			);
		}

		$message = sprintf(
			/* translators: %d: parent post ID */
			__(
				'Source parent post %d has not been imported on this site.',
				'safe-publish'
			),
			$source_parent_id
		);

		return new WP_Error(
			'parent_not_resolved',
			$message,
			array(
				'action'       => 'parent_not_resolved',
				'parent_id'    => $source_parent_id,
				'parent_title' => null,
				'reason'       => 'not_imported',
			)
		);
	}

	/**
	 * Applies the opt-in orphan fallback when a source parent cannot be
	 * resolved on the destination.
	 *
	 * Sets post_parent to 0 and produces a parent_orphaned warning carrying
	 * the source parent id, title (when known), and reason. The reason is
	 * threaded back to the UI so admins know whether to import the parent
	 * separately or investigate the parent's failure in the same batch.
	 *
	 * @param WP_Error $resolution_error WP_Error from resolve_source_parent().
	 * @return array{post_parent_id: int, warning: array}|WP_Error Fallback
	 *                                   applied, or the original WP_Error
	 *                                   when the filter is not enabled.
	 */
	public function apply_parent_fallback(
		WP_Error $resolution_error
	): array|WP_Error {
		if ( 'parent_not_resolved' !== $resolution_error->get_error_code() ) {
			return $resolution_error;
		}

		/**
		 * Filters whether the import may import a hierarchical post as an
		 * orphan when its source parent cannot be resolved on the destination.
		 *
		 * When true, the post is imported with post_parent = 0 and a warning
		 * is recorded in the import History and surfaced in the import
		 * results UI. When false (default), imports abort with a no-match
		 * error that identifies the unresolved parent.
		 *
		 * @param bool $enabled Whether the orphan fallback is enabled. Default false.
		 */
		if ( true !== apply_filters( 'safe_publish_import_allow_orphans', false ) ) {
			return $resolution_error;
		}

		$error_data = (array) $resolution_error->get_error_data();

		$warning = array(
			'type'   => 'parent_orphaned',
			'source' => array(
				'parent_id'    => (int) $error_data['parent_id'],
				'parent_title' => $error_data['parent_title'],
			),
			'reason' => (string) $error_data['reason'],
		);

		return array(
			'post_parent_id' => 0,
			'warning'        => $warning,
		);
	}

	/**
	 * Builds a standardized error result array for an import operation.
	 *
	 * @param array  $fields        Sanitized post fields.
	 * @param string $error_message Error description.
	 * @return array Error result with source_post_id, title, success, and error keys.
	 */
	private function build_error_result( array $fields, string $error_message ): array {
		return array(
			'source_post_id' => $fields['source_post_id'],
			'title'          => $fields['title'],
			'success'        => false,
			'error'          => $error_message,
		);
	}

	/**
	 * Builds a standardized success result array for an import operation.
	 *
	 * @param array $fields   Sanitized post fields.
	 * @param int   $post_id  Created or updated WordPress post ID.
	 * @param bool  $existing Whether the post was updated (true) or newly created (false).
	 * @return array Success result with source_post_id, title, success, post_id, edit_url,
	 *               existing, and warnings keys.
	 */
	private function build_success_result( array $fields, int $post_id, bool $existing ): array {
		return array(
			'source_post_id' => $fields['source_post_id'],
			'title'          => $fields['title'],
			'success'        => true,
			'post_id'        => $post_id,
			'edit_url'       => admin_url( 'post.php?post=' . $post_id . '&action=edit' ),
			'existing'       => $existing,
			'warnings'       => $fields['warnings'],
		);
	}

	/**
	 * Validates that required fields are present for import.
	 *
	 * @param array $fields Extracted post fields.
	 * @return array|null Error result array on failure, null on success.
	 */
	private function validate_required_fields( array $fields ): ?array {
		if ( null === $fields['source_post_id'] ) {
			return $this->build_error_result(
				$fields,
				__( 'Source post ID is required.', 'safe-publish' )
			);
		}

		if ( '' === $fields['title'] ) {
			return $this->build_error_result(
				$fields,
				__( 'Post title is required.', 'safe-publish' )
			);
		}

		return null;
	}

	/**
	 * Resolves a raw post type string to a valid WordPress post type.
	 *
	 * Converts plural REST API post type names to singular and validates
	 * that the post type is registered on the destination site. Returns
	 * a WP_Error when the post type does not exist or the current user
	 * lacks the required capability.
	 *
	 * @param string $raw_post_type Raw post type string from source API.
	 * @return string|WP_Error Resolved post type slug, or WP_Error on failure.
	 */
	public function resolve_post_type( string $raw_post_type ): string|WP_Error {
		$post_type = Post_Type_Map::to_wp_slug( $raw_post_type );

		if ( ! post_type_exists( $post_type ) ) {
			$message = sprintf(
				/* translators: %s: post type slug */
				__( 'Post type "%s" is not registered on this site.', 'safe-publish' ),
				$post_type
			);

			return new WP_Error( 'post_type_not_registered', $message );
		}

		// Admins can create any registered post type.
		if ( current_user_can( 'manage_options' ) ) {
			return $post_type;
		}

		// Resolve the cap from the post type's own capability map so types
		// like wp_navigation (edit_theme_options) work alongside post/page.
		$capability = get_post_type_object( $post_type )->cap->edit_posts;

		if ( ! current_user_can( $capability ) ) {
			$message = sprintf(
				/* translators: %s: post type slug */
				__( 'You do not have permission to create "%s" posts.', 'safe-publish' ),
				$post_type
			);

			return new WP_Error( 'post_type_capability_denied', $message );
		}

		return $post_type;
	}

	/**
	 * Returns a WP_Error if media processing encountered any failures (download
	 * errors, malformed HTML, or both).
	 *
	 * Combines both error types into a single message when both are present so
	 * the user sees all issues at once.
	 *
	 * @param array $fields Sanitized post fields.
	 * @return WP_Error|null WP_Error on failure, null when no failures.
	 */
	private function get_media_processing_error( array $fields ): ?WP_Error {
		$download_msg = $this->content_processor
			->get_failed_media_error_message();
		$markup_msg   = $this->content_processor
			->get_unprocessable_media_error_message();

		if ( null === $download_msg && null === $markup_msg ) {
			return null;
		}

		$messages = array_filter( array( $download_msg, $markup_msg ) );

		$error_code = null !== $download_msg
			? 'media_download_failed'
			: 'malformed_media_markup';

		return new WP_Error(
			$error_code,
			implode( ' ', $messages ),
			array( 'fields' => $fields )
		);
	}

	/**
	 * Returns the configured connected source site URL, without a trailing
	 * slash.
	 *
	 * Media imports resolve the source REST root against this stored connection
	 * so the subsite path (e.g. "/blog") is preserved.
	 *
	 * @return string Connected site URL, or empty string when not configured.
	 */
	private function get_connected_source_url(): string {
		return untrailingslashit(
			(string) get_option( Options::OPTION_CONNECTED_SITE_URL, '' )
		);
	}

	/**
	 * Processes raw post content by importing media and fixing URLs.
	 *
	 * Media URLs resolve against the configured connected source site. Returns
	 * a WP_Error if content processing fails or if kses is enabled and
	 * sanitization would modify the content.
	 *
	 * @param string         $content        Raw post content.
	 * @param array<int,int> $session_id_map Source post ID => destination post ID for
	 *                                       the in-flight bulk batch; feeds block ID
	 *                                       remapping.
	 * @return string|WP_Error Processed content, or WP_Error on failure.
	 */
	private function process_post_content(
		string $content,
		array $session_id_map = array()
	): string|WP_Error {
		$source_site_url = $this->get_connected_source_url();

		if ( '' === $source_site_url ) {
			return $this->sanitize_field( $content, self::FIELD_CONTENT );
		}

		$processed = $this->content_processor->process_content(
			$content,
			$source_site_url,
			array( 'session_id_map' => $session_id_map )
		);

		if ( is_wp_error( $processed ) ) {
			return $processed;
		}

		return $this->sanitize_field( $processed, self::FIELD_CONTENT );
	}

	/**
	 * Adds local-state routing fields and row-level metadata to each post.
	 *
	 * Emits `local_state`, `is_imported`, plus active-row fields (`item_id`,
	 * `post_id`, `import_date_gmt`, `error_message`, `has_previous_content`,
	 * `edit_url`). Lookups are batched into one items query plus one wp_posts
	 * query for the whole page.
	 *
	 * @param array $posts Posts array fetched from the source API, passed by reference.
	 */
	public function annotate_posts_with_import_status( array &$posts ): void {
		$source_ids = array_values(
			array_filter(
				array_map(
					static fn( $post ) => absint( $post['id'] ?? 0 ),
					$posts
				),
				static fn( $id ) => $id > 0
			)
		);

		$active_by_source_id = 0 === count( $source_ids )
			? array()
			: $this->repository->get_active_items_by_source_ids( $source_ids );

		$post_ids_to_check = array_values(
			array_filter(
				array_map(
					static fn( array $row ): int => isset( $row['post_id'] )
						? (int) $row['post_id']
						: 0,
					$active_by_source_id
				),
				static fn( int $id ): bool => $id > 0
			)
		);

		$post_status_by_id = $this->fetch_post_statuses_by_id( $post_ids_to_check );

		foreach ( $posts as &$post ) {
			$source_id  = absint( $post['id'] ?? 0 );
			$active_row = $active_by_source_id[ $source_id ] ?? null;

			$post_id            = null !== $active_row && isset( $active_row['post_id'] )
				? (int) $active_row['post_id']
				: 0;
			$wp_post_status     = $post_id > 0
				? ( $post_status_by_id[ $post_id ] ?? null )
				: null;
			$local_post_present = null !== $wp_post_status && 'trash' !== $wp_post_status;

			$local_state = History_Repository::derive_active_state(
				$active_row,
				$local_post_present
			);

			$post['local_state']    = $local_state;
			$post['is_imported']    = in_array(
				$local_state,
				array( 'up-to-date', 'outdated' ),
				true
			);
			$post['wp_post_status'] = $local_post_present ? $wp_post_status : null;

			$this->attach_active_row_metadata( $post, $active_row, $local_post_present );
		}

		unset( $post );
	}

	/**
	 * Attaches active-row metadata to an annotated post. The edit URL is
	 * emitted only when the referenced local post is present so
	 * deleted_locally rows don't expose a dangling edit URL.
	 *
	 * @param array      $post                Row to mutate, passed by reference.
	 * @param array|null $active_row          Active items row, or null.
	 * @param bool       $local_post_present  Whether the referenced post still
	 *                                        exists with a non-trash status.
	 */
	private function attach_active_row_metadata(
		array &$post,
		?array $active_row,
		bool $local_post_present
	): void {
		if ( null === $active_row ) {
			$post['item_id']              = null;
			$post['post_id']              = null;
			$post['import_date_gmt']      = null;
			$post['error_message']        = null;
			$post['has_previous_content'] = false;
			$post['edit_url']             = '';
			return;
		}

		$post_id = isset( $active_row['post_id'] ) ? (int) $active_row['post_id'] : 0;

		$post['item_id']              = (int) $active_row['id'];
		$post['post_id']              = $post_id > 0 ? $post_id : null;
		$post['import_date_gmt']      = (string) ( $active_row['import_date_gmt'] ?? '' );
		$post['error_message']        = isset( $active_row['error_message'] )
			? (string) $active_row['error_message']
			: null;
		$post['has_previous_content'] = (bool) ( $active_row['has_previous_content'] ?? 0 );

		if ( $local_post_present && $post_id > 0 ) {
			$edit_url         = get_edit_post_link( $post_id, 'raw' );
			$post['edit_url'] = is_string( $edit_url ) ? $edit_url : '';
		} else {
			$post['edit_url'] = '';
		}
	}

	/**
	 * Fetches post_status for the provided post IDs in one query.
	 *
	 * Direct lookup so trashed posts are visible without N cache hits.
	 *
	 * @param int[] $post_ids Post IDs to look up.
	 * @return array<int, string> Map of post ID → post_status.
	 */
	private function fetch_post_statuses_by_id( array $post_ids ): array {
		if ( 0 === count( $post_ids ) ) {
			return array();
		}

		global $wpdb;

		$placeholders = implode( ', ', array_fill( 0, count( $post_ids ), '%d' ) );
		$values       = array_values( $post_ids );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_status FROM {$wpdb->posts}"
					. " WHERE ID IN ({$placeholders})",
				...$values
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$by_id = array();
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$by_id[ (int) $row['ID'] ] = (string) $row['post_status'];
		}

		return $by_id;
	}

	/**
	 * Returns a map of source post ID → local WP_Post for the provided IDs,
	 * scoped to the source site so two destinations connected to different
	 * sources can't collide on overlapping source post IDs.
	 *
	 * Single `meta_query` IN lookup instead of N individual `find_imported_post`
	 * calls. WP_Query primes the post-meta cache for the returned IDs, so
	 * subsequent `get_post_meta` reads inside the indexing loop are cache hits.
	 *
	 * @param int[]  $source_ids      Source post IDs to look up.
	 * @param string $source_site_url Source site URL that imports were tagged
	 *                                with; pass '' to skip the scope filter.
	 * @return array<int, WP_Post> Map keyed by source post ID.
	 */
	public function fetch_imported_posts_by_source_ids(
		array $source_ids,
		string $source_site_url
	): array {
		if ( 0 === count( $source_ids ) ) {
			return array();
		}

		$meta_query = array(
			array(
				'key'     => Options::META_SOURCE_POST_ID,
				'value'   => $source_ids,
				'compare' => 'IN',
			),
		);

		if ( '' !== $source_site_url ) {
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'key'   => Options::META_SOURCE_SITE_URL,
				'value' => $source_site_url,
			);
		}

		$imported_posts = get_posts(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'             => $meta_query,
				'post_type'              => 'any',
				'post_status'            => 'any',
				'posts_per_page'         => count( $source_ids ),
				'suppress_filters'       => false,
				'update_post_term_cache' => false,
			)
		);

		$imported_by_source_id = array();
		foreach ( $imported_posts as $post ) {
			$source_id = absint(
				get_post_meta(
					$post->ID,
					Options::META_SOURCE_POST_ID,
					true
				)
			);

			if (
				$source_id > 0
				&& ! isset( $imported_by_source_id[ $source_id ] )
			) {
				$imported_by_source_id[ $source_id ] = $post;
			}
		}

		return $imported_by_source_id;
	}

	/**
	 * Detects whether a concurrent import has created a sibling post with the
	 * same source post ID on the same source site. The winner is the post with
	 * the lowest ID (the one inserted first); when this returns non-null, the
	 * just-inserted post is the loser and should be discarded.
	 *
	 * Bypasses the WP_Query result cache so this lookup sees INSERTs
	 * committed by parallel requests.
	 *
	 * @param int    $source_post_id   Source post ID stored in postmeta.
	 * @param int    $just_inserted_id Post ID returned by wp_insert_post().
	 * @param string $source_site_url  Source site URL to scope the lookup by;
	 *                                 '' skips the scope filter.
	 * @return WP_Post|null Winning sibling, or null when the just-inserted
	 *                      post wins (lowest ID) or no sibling exists.
	 */
	private function detect_concurrent_duplicate(
		int $source_post_id,
		int $just_inserted_id,
		string $source_site_url
	): ?WP_Post {
		$meta_query = array(
			array(
				'key'   => Options::META_SOURCE_POST_ID,
				'value' => $source_post_id,
			),
		);

		if ( '' !== $source_site_url ) {
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'key'   => Options::META_SOURCE_SITE_URL,
				'value' => $source_site_url,
			);
		}

		$oldest = get_posts(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'             => $meta_query,
				'post_type'              => 'any',
				'post_status'            => 'any',
				'posts_per_page'         => 1,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'suppress_filters'       => false,
				'no_found_rows'          => true,
				'cache_results'          => false,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		if ( empty( $oldest ) || $oldest[0]->ID === $just_inserted_id ) {
			return null;
		}

		return $oldest[0];
	}

	/**
	 * Finds a previously imported WordPress post by its source post ID, scoped
	 * to the source site so two destinations connected to different sources
	 * can't collide on overlapping source post IDs.
	 *
	 * Looks across all post types so callers importing pages or custom
	 * hierarchical types can locate prior imports without knowing the
	 * destination's post type up-front.
	 *
	 * @param int    $source_post_id  Source post ID stored in post meta.
	 * @param string $source_site_url Source site URL the import was tagged
	 *                                with; pass '' to skip the scope filter.
	 * @return WP_Post|null Imported post or null if not found.
	 */
	public function find_imported_post(
		int $source_post_id,
		string $source_site_url
	): ?WP_Post {
		$meta_query = array(
			array(
				'key'   => Options::META_SOURCE_POST_ID,
				'value' => $source_post_id,
			),
		);

		if ( '' !== $source_site_url ) {
			$meta_query['relation'] = 'AND';
			$meta_query[]           = array(
				'key'   => Options::META_SOURCE_SITE_URL,
				'value' => $source_site_url,
			);
		}

		$existing_posts = get_posts(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'       => $meta_query,
				// Source post IDs identify a source-side post irrespective of
				// type, so look across all post types.
				'post_type'        => 'any',
				// 'any' excludes 'trash', 'auto-draft', and statuses with
				// exclude_from_search=true
				'post_status'      => 'any',
				'posts_per_page'   => 1,
				'suppress_filters' => false,
			)
		);

		return ! empty( $existing_posts ) ? $existing_posts[0] : null;
	}

	/**
	 * Handles import flow when a matching post already exists in WordPress.
	 *
	 * Fetches fresh content from the source site and updates the existing
	 * post. Aborts with an error result if the fetch fails; the post will
	 * not be updated with stale snapshot data.
	 *
	 * Post status is preserved on update to avoid silently unpublishing live
	 * posts; only new posts are created as drafts.
	 *
	 * @param WP_Post  $imported_post Imported WordPress post.
	 * @param array    $fields        Sanitized post fields.
	 * @param string   $post_type     Resolved post type slug.
	 * @param int|null $session_id    Import session ID for logging.
	 * @param array    $options       Behavior overrides; see import_post().
	 * @return array Import result data.
	 */
	private function handle_imported_post(
		WP_Post $imported_post,
		array $fields,
		string $post_type,
		?int $session_id,
		array $options
	): array {
		$prepared = $this->prepare_fresh_content(
			$fields,
			$post_type,
			(int) $imported_post->post_author,
			$options
		);

		if ( is_wp_error( $prepared ) ) {
			$error_data   = $prepared->get_error_data();
			$error_fields = is_array( $error_data ) && isset( $error_data['fields'] )
				? $error_data['fields']
				: $fields;

			$this->log_import_if_session(
				$session_id,
				$error_fields['source_post_id'],
				$error_fields['title'],
				'error',
				null,
				$prepared->get_error_message(),
				array( 'action' => $prepared->get_error_code() )
			);

			return $this->build_error_result(
				$error_fields,
				$prepared->get_error_message()
			);
		}

		$fields              = $prepared['fields'];
		$processed_content   = $prepared['processed_content'];
		$source_modified_gmt = $prepared['source_modified_gmt'];

		// Sideload the featured image before writing the post so that a
		// failure here does not leave the post in a partially-updated state.
		$featured_attachment_id = $this->import_featured_image_attachment(
			$fields['featured_media_id']
		);

		if ( false === $featured_attachment_id ) {
			$error_message = __( 'Failed to import featured image.', 'safe-publish' );

			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				null,
				$error_message,
				array( 'action' => 'featured_image_import_failed' )
			);

			return $this->build_error_result( $fields, $error_message );
		}

		$previous_content = $this->capture_previous_content( $imported_post );

		$post_args = array(
			'ID'             => $imported_post->ID,
			'post_title'     => $fields['title'],
			'post_excerpt'   => $fields['excerpt'],
			'post_content'   => $processed_content,
			'post_type'      => $post_type,
			'post_name'      => $fields['slug'],
			'post_parent'    => $fields['post_parent_id'],
			'comment_status' => $fields['comment_status'],
			'ping_status'    => $fields['ping_status'],
			'menu_order'     => $fields['menu_order'],
			'post_password'  => $fields['password'],
			'post_author'    => $fields['matched_author_id'],
		);

		$post_id = $this->persist_updated_post(
			$post_args,
			$featured_attachment_id,
			$fields['source_link'],
			$fields['meta'],
			$fields['terms'],
			$fields['source_author'],
			$fields['source_parent_id']
		);

		if ( is_wp_error( $post_id ) ) {
			$error_data = $post_id->get_error_data();
			$action     = is_array( $error_data ) && isset( $error_data['action'] )
				? $error_data['action']
				: 'post_update_failed';

			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				$imported_post->ID,
				$post_id->get_error_message(),
				array( 'action' => $action )
			);

			return $this->build_error_result(
				$fields,
				$post_id->get_error_message()
			);
		}

		$this->rewrite_nav_cross_refs( $fields, $post_id, $post_type );
		$this->record_attention_issues( $fields, $post_id );

		$this->log_import_if_session(
			$session_id,
			$fields['source_post_id'],
			$fields['title'],
			'updated',
			$post_id,
			null,
			$previous_content,
			$fields['warnings'],
			$source_modified_gmt
		);

		return $this->build_success_result( $fields, $post_id, true );
	}

	/**
	 * Captures the previous content of an existing post for the session
	 * rollback history log.
	 *
	 * Stores the current post fields, featured image, and tracking meta so
	 * the update can be reverted via session rollback. The returned array is
	 * used as the `changes` payload of the history log entry for an
	 * 'updated_existing' action.
	 *
	 * @param WP_Post $existing_post Existing WordPress post.
	 * @return array Previous content keyed by field name.
	 */
	private function capture_previous_content( WP_Post $existing_post ): array {
		$previous_content = array(
			'previous_content'        => $existing_post->post_content,
			'previous_title'          => $existing_post->post_title,
			'previous_excerpt'        => $existing_post->post_excerpt,
			'previous_slug'           => $existing_post->post_name,
			'previous_comment_status' => $existing_post->comment_status,
			'previous_ping_status'    => $existing_post->ping_status,
			'previous_menu_order'     => $existing_post->menu_order,
			'previous_password'       => $existing_post->post_password,
			'previous_featured_image' => get_post_thumbnail_id( $existing_post->ID ),
			'previous_meta'           => array(),
			'action'                  => 'updated_existing',
		);

		$meta_keys_to_preserve = array(
			'_edit_last',
			'_edit_lock',
			Options::META_SOURCE_LINK,
		);

		foreach ( $meta_keys_to_preserve as $meta_key ) {
			$meta_value = get_post_meta( $existing_post->ID, $meta_key, true );
			if ( '' !== $meta_value ) {
				$previous_content['previous_meta'][ $meta_key ] = $meta_value;
			}
		}

		return $previous_content;
	}

	/**
	 * Handles import flow when no matching post exists yet in WordPress.
	 *
	 * Fetches fresh content from the source site and creates a new draft
	 * post. Aborts with an error result if the fetch fails; the post will
	 * not be created with stale snapshot data.
	 *
	 * @param array    $fields     Sanitized post fields.
	 * @param string   $post_type  Resolved post type slug.
	 * @param int|null $session_id Import session ID for logging.
	 * @param array    $options    Behavior overrides; see import_post().
	 * @return array Import result data.
	 */
	private function handle_new_post(
		array $fields,
		string $post_type,
		?int $session_id,
		array $options
	): array {
		$prepared = $this->prepare_fresh_content(
			$fields,
			$post_type,
			null,
			$options
		);

		if ( is_wp_error( $prepared ) ) {
			$error_data   = $prepared->get_error_data();
			$error_fields = is_array( $error_data ) && isset( $error_data['fields'] )
				? $error_data['fields']
				: $fields;

			$this->log_import_if_session(
				$session_id,
				$error_fields['source_post_id'],
				$error_fields['title'],
				'error',
				null,
				$prepared->get_error_message(),
				array( 'action' => $prepared->get_error_code() )
			);

			return $this->build_error_result(
				$error_fields,
				$prepared->get_error_message()
			);
		}

		$fields              = $prepared['fields'];
		$processed_content   = $prepared['processed_content'];
		$source_modified_gmt = $prepared['source_modified_gmt'];

		// Sideload the featured image before creating the post so that a
		// failure here does not leave an orphaned draft in the DB.
		$featured_attachment_id = $this->import_featured_image_attachment(
			$fields['featured_media_id']
		);

		if ( false === $featured_attachment_id ) {
			$error_message = __( 'Failed to import featured image.', 'safe-publish' );

			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				null,
				$error_message,
				array( 'action' => 'featured_image_import_failed' )
			);

			return $this->build_error_result( $fields, $error_message );
		}

		$source_site_url = Options::get_connected_site_url_with_path();

		$post_id = $this->persist_new_post(
			array(
				'post_title'     => $fields['title'],
				'post_excerpt'   => $fields['excerpt'],
				'post_content'   => $processed_content,
				'post_status'    => 'draft',
				'post_type'      => $post_type,
				'post_name'      => $fields['slug'],
				'post_parent'    => $fields['post_parent_id'],
				'comment_status' => $fields['comment_status'],
				'ping_status'    => $fields['ping_status'],
				'menu_order'     => $fields['menu_order'],
				'post_password'  => $fields['password'],
				'post_author'    => $fields['matched_author_id'],
				'meta_input'     => array(
					Options::META_SOURCE_POST_ID  => $fields['source_post_id'],
					Options::META_SOURCE_LINK     => $fields['source_link'],
					Options::META_SOURCE_SITE_URL => $source_site_url,
					Options::META_IMPORTED_FROM   => Options::META_IMPORTED_FROM_VALUE,
				),
			),
			$featured_attachment_id,
			$fields['meta'],
			$fields['terms'],
			$fields['source_author'],
			$fields['source_parent_id']
		);

		if ( is_wp_error( $post_id ) ) {
			$error_data = $post_id->get_error_data();
			$action     = is_array( $error_data ) && isset( $error_data['action'] )
				? $error_data['action']
				: 'post_create_failed';

			$this->log_import_if_session(
				$session_id,
				$fields['source_post_id'],
				$fields['title'],
				'error',
				null,
				$post_id->get_error_message(),
				array( 'action' => $action )
			);

			return $this->build_error_result(
				$fields,
				$post_id->get_error_message()
			);
		}

		$this->rewrite_nav_cross_refs( $fields, $post_id, $post_type );
		$this->record_attention_issues( $fields, $post_id );

		$this->log_import_if_session(
			$session_id,
			$fields['source_post_id'],
			$fields['title'],
			'success',
			$post_id,
			null,
			array( 'action' => 'created_new_post' ),
			$fields['warnings'],
			$source_modified_gmt
		);

		return $this->build_success_result( $fields, $post_id, false );
	}

	/**
	 * Repoints destination posts that reference a freshly imported navigation
	 * menu, recording a warning when a matched post could not be updated and
	 * reconciling the menu's attention issues from the per-post outcome.
	 *
	 * No-op for non-navigation imports. Best-effort: a rewrite failure
	 * surfaces the still-stale post IDs as a warning rather than failing the
	 * menu import.
	 *
	 * @param array  $fields    Sanitized post fields; mutated by reference to
	 *                          append a warning on failure.
	 * @param int    $post_id   Destination menu post ID.
	 * @param string $post_type Resolved destination post type slug.
	 */
	private function rewrite_nav_cross_refs(
		array &$fields,
		int $post_id,
		string $post_type
	): void {
		if ( 'wp_navigation' !== $post_type ) {
			return;
		}

		$source_nav_id   = (int) $fields['source_post_id'];
		$source_site_url = Options::get_connected_site_url_with_path();

		$result = $this->nav_ref_rewriter->rewrite_cross_refs(
			$source_nav_id,
			$post_id,
			$source_site_url
		);

		if ( array() !== $result['failed'] ) {
			$fields['warnings'][] = array(
				'type'            => 'nav_ref_rewrite_failed',
				'failed_post_ids' => $result['failed'],
			);
		}

		// Posts whose write failed stay open; every other referencing post for
		// this menu now points correctly, so its issue is resolved.
		$this->attention_issues->reconcile_target_issues(
			'nav_ref_rewrite_failed',
			$source_nav_id,
			'post',
			'error',
			$source_site_url,
			$result['failed'],
			array( 'source_nav_id' => $source_nav_id )
		);
	}

	/**
	 * Records the attention issues attached to a freshly imported post.
	 *
	 * Reconciles the post's open block-reference, orphaned-parent, and
	 * reusable-block issues against its finalized import warnings: unresolved
	 * refs are upserted, and any that now resolve are cleared. Navigation
	 * rewrite failures are recorded separately, keyed to the referencing posts.
	 *
	 * @param array $fields  Finalized post fields, including warnings.
	 * @param int   $post_id Destination post id.
	 */
	private function record_attention_issues( array $fields, int $post_id ): void {
		$source_site_url = Options::get_connected_site_url_with_path();

		if ( '' === $source_site_url ) {
			return;
		}

		$current = array();

		foreach ( $fields['warnings'] as $warning ) {
			$issue = $this->warning_to_post_issue( $warning );

			if ( null !== $issue ) {
				$current[] = $issue;
			}
		}

		$this->attention_issues->reconcile_post_issues(
			$post_id,
			$source_site_url,
			self::ATTENTION_POST_ISSUE_TYPES,
			$current
		);
	}

	/**
	 * Translates a post-keyed import warning into an attention issue.
	 *
	 * Returns null for warnings that are not tracked as issues (author
	 * fallbacks) or that are reconciled elsewhere (navigation rewrite
	 * failures, which key to the referencing posts, not the imported one).
	 *
	 * @param array $warning Single import warning record.
	 * @return array|null Issue fields, or null when the warning is not tracked.
	 */
	private function warning_to_post_issue( array $warning ): ?array {
		$type = $warning['type'] ?? '';

		if ( 'unmapped_block_reference' === $type ) {
			return array(
				'issue_type'  => $type,
				'target_ref'  => (int) $warning['source_id'],
				'target_kind' => (string) $warning['kind'],
				'severity'    => 'warning',
				'detail'      => array(
					'kind'      => (string) $warning['kind'],
					'block'     => (string) ( $warning['block'] ?? '' ),
					'source_id' => (int) $warning['source_id'],
				),
			);
		}

		if ( 'unmigratable_reusable_block' === $type ) {
			return array(
				'issue_type'  => $type,
				'target_ref'  => (int) $warning['source_id'],
				'target_kind' => 'post',
				'severity'    => 'warning',
			);
		}

		if ( 'parent_orphaned' === $type ) {
			return array(
				'issue_type'  => $type,
				'target_ref'  => (int) $warning['source']['parent_id'],
				'target_kind' => 'post',
				'severity'    => 'warning',
				'detail'      => array(
					'parent_id'    => (int) $warning['source']['parent_id'],
					'parent_title' => $warning['source']['parent_title'] ?? null,
					'reason'       => (string) ( $warning['reason'] ?? '' ),
				),
			);
		}

		return null;
	}

	/**
	 * Re-runs the navigation rewriter for a menu and reconciles its issues.
	 *
	 * Self-verifying retry: re-attempts every post referencing the menu, so an
	 * issue clears precisely when its post no longer fails the rewrite.
	 *
	 * @param int    $affected_post_id Referencing post whose issue was retried.
	 * @param int    $source_nav_id    Menu's source post id.
	 * @param string $source_site_url  Path-bearing source identity.
	 * @return Reconcile_Outcome Target_absent when the menu is not present;
	 *                           write_failed when this post's rewrite failed;
	 *                           resolved otherwise.
	 */
	public function retry_nav_ref_rewrite(
		int $affected_post_id,
		int $source_nav_id,
		string $source_site_url
	): Reconcile_Outcome {
		if ( '' === $source_site_url ) {
			return Reconcile_Outcome::target_absent( 'Source identity is empty.' );
		}

		$dest_nav = $this->find_imported_navigation(
			$source_nav_id,
			$source_site_url
		);

		if ( ! $dest_nav instanceof WP_Post ) {
			return Reconcile_Outcome::target_absent(
				sprintf(
					'Destination navigation menu for source %d is not imported.',
					$source_nav_id
				)
			);
		}

		$result = $this->nav_ref_rewriter->rewrite_cross_refs(
			$source_nav_id,
			$dest_nav->ID,
			$source_site_url
		);

		$this->attention_issues->reconcile_target_issues(
			'nav_ref_rewrite_failed',
			$source_nav_id,
			'post',
			'error',
			$source_site_url,
			$result['failed'],
			array( 'source_nav_id' => $source_nav_id )
		);

		$failed_ids = array_map( 'intval', $result['failed'] );

		if ( in_array( $affected_post_id, $failed_ids, true ) ) {
			return Reconcile_Outcome::write_failed(
				'Navigation rewrite failed for the referencing post.'
			);
		}

		return Reconcile_Outcome::resolved();
	}

	/**
	 * Repoints one stale block reference in place and resolves its issue on
	 * success.
	 *
	 * Self-verifying: the issue clears only when the target now resolves and the
	 * post was repointed; otherwise the row stays, with last_seen refreshed.
	 *
	 * @param int    $affected_post_id Post holding the reference.
	 * @param int    $target_ref       Source id to repoint.
	 * @param string $target_kind      'post' or 'term'.
	 * @param string $source_site_url  Path-bearing source identity.
	 * @return Reconcile_Outcome The reconciliation outcome.
	 */
	public function retry_block_ref_repoint(
		int $affected_post_id,
		int $target_ref,
		string $target_kind,
		string $source_site_url
	): Reconcile_Outcome {
		$outcome = $this->content_processor->repoint_block_reference(
			$affected_post_id,
			$target_ref,
			$target_kind,
			$source_site_url
		);

		$this->resolve_or_touch(
			$outcome->is_resolved(),
			$affected_post_id,
			'unmapped_block_reference',
			$target_ref,
			$target_kind
		);

		return $outcome;
	}

	/**
	 * Re-resolves an orphaned source parent and re-links the post when it now
	 * exists on the destination, resolving the issue on success.
	 *
	 * @param int    $affected_post_id Orphaned child post.
	 * @param int    $source_parent_id Source parent id.
	 * @param string $source_site_url  Path-bearing source identity.
	 * @return Reconcile_Outcome The reconciliation outcome.
	 */
	public function retry_parent_relink(
		int $affected_post_id,
		int $source_parent_id,
		string $source_site_url
	): Reconcile_Outcome {
		$outcome = $this->relink_parent(
			$affected_post_id,
			$source_parent_id,
			$source_site_url
		);

		$this->resolve_or_touch(
			$outcome->is_resolved(),
			$affected_post_id,
			'parent_orphaned',
			$source_parent_id,
			'post'
		);

		return $outcome;
	}

	/**
	 * Sets the post's parent when the source parent now resolves.
	 *
	 * @param int    $affected_post_id Child post.
	 * @param int    $source_parent_id Source parent id.
	 * @param string $source_site_url  Path-bearing source identity.
	 * @return Reconcile_Outcome Resolved when re-linked; target_absent,
	 *                           write_failed, or unresolved otherwise.
	 */
	private function relink_parent(
		int $affected_post_id,
		int $source_parent_id,
		string $source_site_url
	): Reconcile_Outcome {
		$post = get_post( $affected_post_id );

		if ( ! $post instanceof WP_Post ) {
			return Reconcile_Outcome::unresolved( 'Affected post is missing.' );
		}

		$resolved = $this->resolve_source_parent(
			$source_parent_id,
			$post->post_type,
			$source_site_url
		);

		if ( ! is_int( $resolved ) || $resolved <= 0 ) {
			return Reconcile_Outcome::target_absent(
				sprintf(
					'Source parent %d is not imported on the destination.',
					$source_parent_id
				)
			);
		}

		if ( ! $this->persist_post_parent( $affected_post_id, $resolved ) ) {
			return Reconcile_Outcome::write_failed(
				'Failed to write the post parent.'
			);
		}

		clean_post_cache( $affected_post_id );
		update_post_meta(
			$affected_post_id,
			self::META_PARENT_RELINKED_AT,
			time()
		);

		return Reconcile_Outcome::resolved();
	}

	/**
	 * Resolves an issue after a successful single-row reconciliation, or
	 * refreshes it when the reconciliation ran without clearing the degradation.
	 *
	 * @param bool   $fixed            Whether the reconciliation succeeded.
	 * @param int    $affected_post_id Destination post id.
	 * @param string $issue_type       Issue type.
	 * @param int    $target_ref       Source id of the target.
	 * @param string $target_kind      'post' or 'term'.
	 */
	private function resolve_or_touch(
		bool $fixed,
		int $affected_post_id,
		string $issue_type,
		int $target_ref,
		string $target_kind
	): void {
		if ( $fixed ) {
			$this->attention_issues->resolve_issue(
				$affected_post_id,
				$issue_type,
				$target_ref,
				$target_kind
			);
			return;
		}

		$this->attention_issues->touch_issue(
			$affected_post_id,
			$issue_type,
			$target_ref,
			$target_kind
		);
	}

	/**
	 * Writes post_parent directly, bypassing wp_update_post so the re-link
	 * creates no revision and leaves post_modified intact.
	 *
	 * @param int $post_id   Child post id.
	 * @param int $parent_id Destination parent id.
	 * @return bool True when the row was updated.
	 */
	protected function persist_post_parent(
		int $post_id,
		int $parent_id
	): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->update(
			$wpdb->posts,
			array( 'post_parent' => $parent_id ),
			array( 'ID' => $post_id )
		);

		return false !== $result;
	}

	/**
	 * Finds the imported navigation menu for a source ID and identity.
	 *
	 * Queries wp_navigation explicitly because it is excluded from the
	 * post_type 'any' query find_imported_post relies on.
	 *
	 * @param int    $source_nav_id   Menu's source post id.
	 * @param string $source_site_url Path-bearing source identity.
	 * @return WP_Post|null Imported menu, or null if not found.
	 */
	private function find_imported_navigation(
		int $source_nav_id,
		string $source_site_url
	): ?WP_Post {
		$menus = get_posts(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'       => array(
					'relation' => 'AND',
					array(
						'key'   => Options::META_SOURCE_POST_ID,
						'value' => $source_nav_id,
					),
					array(
						'key'   => Options::META_SOURCE_SITE_URL,
						'value' => $source_site_url,
					),
				),
				'post_type'        => 'wp_navigation',
				'post_status'      => 'any',
				'posts_per_page'   => 1,
				'suppress_filters' => false,
			)
		);

		return empty( $menus ) ? null : $menus[0];
	}

	/**
	 * Fetches fresh content and prepares all fields for import.
	 *
	 * Handles the fetch, field updates, excerpt sanitization, content
	 * processing, and media error checks that are common to both the new and
	 * existing post import flows.
	 *
	 * @param array    $fields                  Sanitized post fields from extract_post_fields().
	 * @param string   $post_type               Resolved destination post type slug.
	 * @param int|null $existing_post_author_id Destination post's existing post_author for the
	 *                                          update path; null for new posts.
	 * @param array    $options                 Behavior overrides; see import_post(). Reads
	 *                                          'prefetched_fresh_result' (skips the in-pipeline
	 *                                          fetch), 'batch_fresh_data' (drives parent
	 *                                          resolution's in-batch detection), and
	 *                                          'session_id_map' (feeds block ID remapping).
	 * @return array{
	 *     fields: array,
	 *     processed_content: string,
	 *     source_modified_gmt: string|null
	 * }|WP_Error Prepared data or error.
	 */
	private function prepare_fresh_content(
		array $fields,
		string $post_type,
		?int $existing_post_author_id,
		array $options
	): array|WP_Error {
		$prefetched_fresh_result = $options['prefetched_fresh_result'] ?? null;
		$batch_fresh_data        = $options['batch_fresh_data'] ?? null;
		$session_id_map          = is_array( $options['session_id_map'] ?? null )
			? $options['session_id_map']
			: array();

		if ( null !== $prefetched_fresh_result ) {
			$fresh_result = $prefetched_fresh_result;
		} else {
			$fresh_result = $this->api->fetch_fresh_post(
				$fields['source_post_id'],
				$fields['raw_post_type']
			);

			if ( is_wp_error( $fresh_result ) ) {
				return new WP_Error(
					'fetch_failed',
					$fresh_result->get_error_message()
				);
			}
		}

		$fields['title']             = $fresh_result['title'];
		$fields['featured_media_id'] = $fresh_result['featured_media'];
		$fields['slug']              = $fresh_result['slug'];
		$fields['comment_status']    = $fresh_result['comment_status'];
		$fields['ping_status']       = $fresh_result['ping_status'];
		$fields['menu_order']        = $fresh_result['menu_order'];
		$fields['password']          = $fresh_result['password'];
		$fields['source_parent_id']  = absint( $fresh_result['parent'] ?? 0 );
		$fields['source_author']     = is_array( $fresh_result['source_author'] ?? null )
			? $fresh_result['source_author']
			: null;

		// Resolve the source author before any media processing so a failed
		// resolution does not leave orphan attachments behind.
		$matched_author_id = $this->resolve_source_author(
			$fields['source_author']
		);

		if ( is_wp_error( $matched_author_id ) ) {
			$fallback = $this->apply_author_fallback(
				$matched_author_id,
				$fields['source_author'],
				$existing_post_author_id
			);

			if ( is_wp_error( $fallback ) ) {
				return new WP_Error(
					$fallback->get_error_code(),
					$fallback->get_error_message(),
					array( 'fields' => $fields )
				);
			}

			$fields['matched_author_id'] = $fallback['author_id'];
			$fields['warnings'][]        = $fallback['warning'];
		} else {
			$fields['matched_author_id'] = $matched_author_id;
		}

		// Resolve the source parent before any media processing so a failed
		// resolution does not leave orphan attachments behind.
		$resolved_parent = $this->resolve_source_parent(
			$fields['source_parent_id'],
			$post_type,
			Options::get_connected_site_url_with_path(),
			$batch_fresh_data
		);

		if ( $resolved_parent instanceof WP_Error ) {
			$fallback = $this->apply_parent_fallback( $resolved_parent );

			if ( is_wp_error( $fallback ) ) {
				return new WP_Error(
					$fallback->get_error_code(),
					$fallback->get_error_message(),
					array( 'fields' => $fields )
				);
			}

			$fields['post_parent_id'] = $fallback['post_parent_id'];
			$fields['warnings'][]     = $fallback['warning'];
		} elseif ( null !== $resolved_parent ) {
			$fields['post_parent_id'] = (int) $resolved_parent;
		}

		$sanitized_excerpt = $this->sanitize_field(
			$fresh_result['excerpt'],
			self::FIELD_EXCERPT
		);

		if ( is_wp_error( $sanitized_excerpt ) ) {
			return new WP_Error(
				'excerpt_sanitization_failed',
				$sanitized_excerpt->get_error_message(),
				array( 'fields' => $fields )
			);
		}

		$fields['excerpt'] = $sanitized_excerpt;

		$processed_content = $this->process_post_content(
			$fresh_result['content'] ?? '',
			$session_id_map
		);

		if ( is_wp_error( $processed_content ) ) {
			$this->content_processor->delete_newly_created_media();

			return new WP_Error(
				'content_processing_failed',
				$processed_content->get_error_message(),
				array( 'fields' => $fields )
			);
		}

		$media_error = $this->get_media_processing_error( $fields );

		if ( null !== $media_error ) {
			$this->content_processor->delete_newly_created_media();

			return $media_error;
		}

		$fields['warnings'] = array_merge(
			$fields['warnings'],
			$this->content_processor->get_warnings()
		);

		// Unsanitized values; sanitized downstream before being stored.
		$fields['meta']  = is_array( $fresh_result['meta'] ?? null )
			? $fresh_result['meta']
			: $fields['meta'];
		$fields['terms'] = is_array( $fresh_result['terms'] ?? null )
			? $fresh_result['terms']
			: $fields['terms'];

		return array(
			'fields'              => $fields,
			'processed_content'   => $processed_content,
			'source_modified_gmt' => isset( $fresh_result['modified_gmt'] )
				? (string) $fresh_result['modified_gmt']
				: null,
		);
	}

	/**
	 * Persists an existing post update with all associated data.
	 *
	 * Handles wp_update_post, source link meta, import date, thumbnail,
	 * custom meta, and terms. If any step after wp_update_post() fails, the
	 * post is rolled back to its pre-update state and any media sideloaded
	 * during this attempt is deleted. Used by both single and bulk import
	 * paths.
	 *
	 * @param array        $post_args              Arguments for wp_update_post().
	 * @param int          $featured_attachment_id Sideloaded featured image attachment ID (0 = none).
	 * @param string       $source_link            Source post URL for meta tracking.
	 * @param array|object $meta                   Meta data.
	 * @param array|object $terms                  Terms data.
	 * @param array        $source_author          Source author payload (email, login,
	 *                                             display_name) used to refresh diagnostic meta.
	 * @param int          $source_parent_id       Source post's parent ID used to refresh the
	 *                                             diagnostic parent meta on hierarchical posts.
	 * @return int|WP_Error Post ID on success, WP_Error on failure.
	 */
	public function persist_updated_post(
		array $post_args,
		int $featured_attachment_id,
		string $source_link,
		array|object $meta,
		array|object $terms,
		array $source_author,
		int $source_parent_id
	): int|WP_Error {
		$post_id  = $post_args['ID'];
		$snapshot = $this->capture_pre_update_state(
			$post_id,
			$meta,
			$terms
		);

		$this->content_processor->disable_content_filters();
		$result = wp_update_post( $post_args );
		$this->content_processor->restore_content_filters();

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( 0 === $result ) {
			return new WP_Error(
				'post_update_failed',
				__( 'Failed to update post.', 'safe-publish' ),
				array( 'action' => 'post_update_failed' )
			);
		}

		update_post_meta(
			$post_id,
			Options::META_SOURCE_LINK,
			$source_link
		);
		update_post_meta(
			$post_id,
			Options::META_SOURCE_SITE_URL,
			Options::get_connected_site_url_with_path()
		);

		if ( $featured_attachment_id > 0 ) {
			set_post_thumbnail( $post_id, $featured_attachment_id );
		}

		$this->write_source_author_meta( $post_id, $source_author );
		$this->write_source_parent_meta(
			$post_id,
			$source_parent_id,
			(string) ( $post_args['post_type'] ?? '' )
		);

		$meta_result = $this->meta_terms_manager->update_meta(
			$post_id,
			$meta
		);

		if ( is_wp_error( $meta_result ) ) {
			$this->rollback_failed_update( $post_id, $snapshot );

			return new WP_Error(
				'meta_update_failed',
				$meta_result->get_error_message(),
				array( 'action' => 'meta_update_failed' )
			);
		}

		$terms_result = $this->meta_terms_manager->update_terms(
			$post_id,
			$terms,
			Options::get_connected_site_url_with_path()
		);

		if ( is_wp_error( $terms_result ) ) {
			$this->rollback_failed_update( $post_id, $snapshot );

			return new WP_Error(
				'terms_update_failed',
				$terms_result->get_error_message(),
				array( 'action' => 'terms_update_failed' )
			);
		}

		return $post_id;
	}

	/**
	 * Captures the pre-update state of a post for rollback.
	 *
	 * Snapshots post fields, tracking meta, featured image, custom meta keys
	 * about to be overwritten, and term assignments for taxonomies about to be
	 * updated.
	 *
	 * @param int          $post_id Post ID.
	 * @param array|object $meta    Meta about to be written.
	 * @param array|object $terms   Terms about to be written.
	 * @return array Snapshot data.
	 */
	private function capture_pre_update_state(
		int $post_id,
		array|object $meta,
		array|object $terms
	): array {
		$post = get_post( $post_id, ARRAY_A );

		$snapshot = array(
			'post_fields'    => $post,
			'tracking_meta'  => array(
				Options::META_SOURCE_LINK           => get_post_meta(
					$post_id,
					Options::META_SOURCE_LINK,
					true
				),
				Options::META_SOURCE_SITE_URL       => get_post_meta(
					$post_id,
					Options::META_SOURCE_SITE_URL,
					true
				),
				Options::META_SOURCE_AUTHOR_EMAIL   => get_post_meta(
					$post_id,
					Options::META_SOURCE_AUTHOR_EMAIL,
					true
				),
				Options::META_SOURCE_AUTHOR_LOGIN   => get_post_meta(
					$post_id,
					Options::META_SOURCE_AUTHOR_LOGIN,
					true
				),
				Options::META_SOURCE_POST_PARENT_ID => get_post_meta(
					$post_id,
					Options::META_SOURCE_POST_PARENT_ID,
					true
				),
			),
			'featured_image' => get_post_thumbnail_id( $post_id ),
			'custom_meta'    => array(),
			'terms'          => array(),
		);

		foreach ( (array) $meta as $key => $_ ) {
			$key                             = sanitize_text_field( (string) $key );
			$snapshot['custom_meta'][ $key ] = get_post_meta(
				$post_id,
				$key,
				true
			);
		}

		foreach ( (array) $terms as $taxonomy => $_ ) {
			$taxonomy = sanitize_key( (string) $taxonomy );
			$existing = wp_get_object_terms(
				$post_id,
				$taxonomy,
				array( 'fields' => 'ids' )
			);

			if ( ! is_wp_error( $existing ) ) {
				$snapshot['terms'][ $taxonomy ] = $existing;
			}
		}

		return $snapshot;
	}

	/**
	 * Restores a post to its pre-update state from a snapshot.
	 *
	 * @param int   $post_id  Post ID.
	 * @param array $snapshot Snapshot from capture_pre_update_state().
	 */
	private function restore_pre_update_state(
		int $post_id,
		array $snapshot
	): void {
		wp_update_post( $snapshot['post_fields'] );

		foreach ( $snapshot['tracking_meta'] as $key => $value ) {
			if ( '' === $value ) {
				delete_post_meta( $post_id, $key );
			} else {
				update_post_meta( $post_id, $key, $value );
			}
		}

		if ( $snapshot['featured_image'] ) {
			set_post_thumbnail( $post_id, $snapshot['featured_image'] );
		} else {
			delete_post_thumbnail( $post_id );
		}

		foreach ( $snapshot['custom_meta'] as $key => $value ) {
			if ( '' === $value ) {
				delete_post_meta( $post_id, $key );
			} else {
				update_post_meta( $post_id, $key, $value );
			}
		}

		foreach ( $snapshot['terms'] as $taxonomy => $term_ids ) {
			wp_set_object_terms( $post_id, $term_ids, $taxonomy );
		}
	}

	/**
	 * Rolls back a failed update: restores the post to its pre-update state and
	 * deletes any media sideloaded during the failed attempt.
	 *
	 * @param int   $post_id  Post ID.
	 * @param array $snapshot Snapshot from capture_pre_update_state().
	 */
	private function rollback_failed_update(
		int $post_id,
		array $snapshot
	): void {
		$this->restore_pre_update_state( $post_id, $snapshot );
		$this->content_processor->delete_newly_created_media();
	}

	/**
	 * Persists a new post with all associated data.
	 *
	 * Handles wp_insert_post, thumbnail, custom meta, and terms. On meta or
	 * terms failure the post and any sideloaded media are cleaned up. Used by
	 * both single and bulk import paths.
	 *
	 * @param array        $post_args              Arguments for wp_insert_post() (including meta_input).
	 * @param int          $featured_attachment_id Sideloaded featured image attachment ID (0 = none).
	 * @param array|object $meta                   Meta data.
	 * @param array|object $terms                  Terms data.
	 * @param array        $source_author          Source author payload (email, login,
	 *                                             display_name) used to write diagnostic meta.
	 * @param int          $source_parent_id       Source post's parent ID used to write the
	 *                                             diagnostic parent meta on hierarchical posts.
	 * @return int|WP_Error Post ID on success, WP_Error on failure.
	 */
	public function persist_new_post(
		array $post_args,
		int $featured_attachment_id,
		array|object $meta,
		array|object $terms,
		array $source_author,
		int $source_parent_id
	): int|WP_Error {
		$this->content_processor->disable_content_filters();
		$post_id = wp_insert_post( $post_args );
		$this->content_processor->restore_content_filters();

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$source_post_id = absint(
			$post_args['meta_input'][ Options::META_SOURCE_POST_ID ] ?? 0
		);

		$source_site_url = (string) (
			$post_args['meta_input'][ Options::META_SOURCE_SITE_URL ] ?? ''
		);

		if ( $source_post_id > 0 ) {
			$winner = $this->detect_concurrent_duplicate(
				$source_post_id,
				$post_id,
				$source_site_url
			);

			if ( null !== $winner ) {
				wp_delete_post( $post_id, true );

				if ( $featured_attachment_id > 0 ) {
					wp_delete_attachment( $featured_attachment_id, true );
				}

				$this->content_processor->delete_newly_created_media();

				return new WP_Error(
					'duplicate_import',
					__(
						'Another import for this source post completed first; this duplicate was discarded.',
						'safe-publish'
					),
					array(
						'action'          => 'concurrent_import_lost_race',
						'winning_post_id' => $winner->ID,
					)
				);
			}
		}

		if ( $featured_attachment_id > 0 ) {
			set_post_thumbnail( $post_id, $featured_attachment_id );
		}

		$this->write_source_author_meta( $post_id, $source_author );
		$this->write_source_parent_meta(
			$post_id,
			$source_parent_id,
			(string) ( $post_args['post_type'] ?? '' )
		);

		$meta_result = $this->meta_terms_manager->update_meta(
			$post_id,
			$meta
		);

		if ( is_wp_error( $meta_result ) ) {
			wp_delete_post( $post_id, true );
			$this->content_processor->delete_newly_created_media();

			return new WP_Error(
				'meta_update_failed',
				$meta_result->get_error_message(),
				array( 'action' => 'meta_update_failed' )
			);
		}

		$terms_result = $this->meta_terms_manager->update_terms(
			$post_id,
			$terms,
			$source_site_url
		);

		if ( is_wp_error( $terms_result ) ) {
			wp_delete_post( $post_id, true );
			$this->content_processor->delete_newly_created_media();

			return new WP_Error(
				'terms_update_failed',
				$terms_result->get_error_message(),
				array( 'action' => 'terms_update_failed' )
			);
		}

		return $post_id;
	}

	/**
	 * Writes the diagnostic source parent meta on a hierarchical imported post.
	 *
	 * Non-hierarchical post types ignore the meta entirely; their post_parent
	 * always stays 0 and the value carries no meaning. On hierarchical types
	 * the meta is overwritten with the current source parent, or deleted when
	 * the source post is now top-level, so the meta tracks the current source
	 * state on every update. The audit trail of historical values lives in
	 * the per-item history table.
	 *
	 * @param int    $post_id          Destination post ID.
	 * @param int    $source_parent_id Source post's parent ID (0 = top-level).
	 * @param string $post_type        Destination post type slug.
	 */
	private function write_source_parent_meta(
		int $post_id,
		int $source_parent_id,
		string $post_type
	): void {
		if ( ! is_post_type_hierarchical( $post_type ) ) {
			return;
		}

		if ( 0 === $source_parent_id ) {
			delete_post_meta( $post_id, Options::META_SOURCE_POST_PARENT_ID );
			return;
		}

		update_post_meta(
			$post_id,
			Options::META_SOURCE_POST_PARENT_ID,
			$source_parent_id
		);
	}

	/**
	 * Writes the diagnostic source author meta on an imported post.
	 *
	 * Stores the source author email and login under private (underscore-
	 * prefixed) meta keys for traceability. Always overwrites previous values
	 * so the meta reflects the current source state; the audit trail of
	 * historical values lives in the per-item history table.
	 *
	 * @param int   $post_id       Destination post ID.
	 * @param array $source_author Source author payload (email, login, display_name).
	 */
	private function write_source_author_meta(
		int $post_id,
		array $source_author
	): void {
		update_post_meta(
			$post_id,
			Options::META_SOURCE_AUTHOR_EMAIL,
			isset( $source_author['email'] ) ? (string) $source_author['email'] : ''
		);
		update_post_meta(
			$post_id,
			Options::META_SOURCE_AUTHOR_LOGIN,
			isset( $source_author['login'] ) ? (string) $source_author['login'] : ''
		);
	}

	/**
	 * Sideloads a featured image from a source post without setting it as a
	 * post thumbnail.
	 *
	 * Separating the sideload from thumbnail assignment allows callers to fetch
	 * the image before the post exists in the DB, so a download failure does not
	 * leave the post in a partially-written state.
	 *
	 * Returns 0 when there is nothing to import: either no featured media ID is
	 * set, or the connected source site is not configured. Returns the
	 * attachment ID (> 0) on a successful import, and false when a media ID is
	 * set against a configured source but the sideload fails. The source media
	 * is fetched from the configured connected site.
	 *
	 * @param int $featured_media_id Source featured media ID.
	 * @return int|false Attachment ID, 0 if nothing imported, false on failure.
	 */
	public function import_featured_image_attachment(
		int $featured_media_id
	): int|false {
		if ( 0 === $featured_media_id ) {
			return 0;
		}

		$source_site_url = $this->get_connected_source_url();

		if ( '' === $source_site_url ) {
			return 0;
		}

		$attachment_id = $this->media_importer->import_featured_image(
			$featured_media_id,
			$source_site_url
		);

		return $attachment_id;
	}

	/**
	 * Logs an import action to history, only when a session ID is provided.
	 *
	 * @param int|null    $session_id          Import session ID.
	 * @param int|null    $source_post_id      Source post ID, or null if not provided.
	 * @param string      $title               Post title.
	 * @param string      $status              Import status (success, updated, error).
	 * @param int|null    $post_id             WordPress post ID or null on failure.
	 * @param string|null $error               Error message or null on success.
	 * @param array       $changes             Contextual changes data for the item.
	 * @param array       $warnings            Non-fatal warnings raised during import.
	 * @param string|null $source_modified_gmt Source post's modified_gmt at import time;
	 *                                         null when the fetch failed before reading it.
	 */
	private function log_import_if_session(
		?int $session_id,
		?int $source_post_id,
		string $title,
		string $status,
		?int $post_id,
		?string $error,
		array $changes,
		array $warnings = array(),
		?string $source_modified_gmt = null
	): void {
		if ( null === $session_id ) {
			return;
		}

		$this->repository->log_import_action(
			$session_id,
			$source_post_id,
			$title,
			$status,
			$post_id,
			$error,
			$changes,
			$warnings,
			$source_modified_gmt
		);

		if ( 'error' === $status ) {
			$this->emit_item_failed_telemetry( $session_id, $changes );
		}
	}

	/**
	 * Emits an import_item_failed telemetry event for a per-item failure.
	 * Normalizes the raw action code into the bounded error_code enum and
	 * attaches a media_failure_count when the failure is media-related.
	 *
	 * @param int                  $session_id Import session ID.
	 * @param array<string, mixed> $changes    Per-item changes payload; expected
	 *                                         to carry an `action` code.
	 */
	private function emit_item_failed_telemetry(
		int $session_id,
		array $changes
	): void {
		$raw_code   = (string) ( $changes['action'] ?? '' );
		$error_code = Telemetry_Events::normalize_error_code( $raw_code );

		$session      = $this->repository->get_session( $session_id );
		$raw_type     = (string) ( $session['session_type'] ?? '' );
		$session_type = Telemetry_Events::normalize_session_type( $raw_type );

		$properties = array(
			'error_code'   => $error_code,
			'session_type' => $session_type,
		);

		if ( Telemetry_Events::is_media_error_code( $error_code ) ) {
			$properties['media_failure_count'] = count(
				$this->content_processor->get_failed_media()
			);
		}

		$this->telemetry->record_event(
			Telemetry_Events::IMPORT_ITEM_FAILED,
			$properties
		);
	}

	/**
	 * Builds an error result array after an unexpected exception during import.
	 *
	 * Also logs the exception to history if a session ID is available.
	 *
	 * @param array     $post_data  Original post data passed to import.
	 * @param int|null  $session_id Import session ID.
	 * @param Exception $e          The caught exception.
	 * @return array Error result data.
	 */
	private function build_exception_result(
		array $post_data,
		?int $session_id,
		Exception $e
	): array {
		$fields = $this->extract_post_fields( $post_data );

		if ( '' === $fields['title'] ) {
			$fields['title'] = __( 'Unknown', 'safe-publish' );
		}

		$this->log_import_if_session(
			$session_id,
			$fields['source_post_id'],
			$fields['title'],
			'error',
			null,
			$e->getMessage(),
			array()
		);

		return $this->build_error_result( $fields, $e->getMessage() );
	}
}
