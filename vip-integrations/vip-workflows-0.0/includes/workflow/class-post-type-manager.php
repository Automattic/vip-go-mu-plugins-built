<?php
/**
 * Post Type Manager - maps post types to the sequences that drive them.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\Sequences\SequenceRepository;

/**
 * Maps existing post types to the sequences that drive them.
 */
class PostTypeManager {


	/**
	 * Sequence repository.
	 *
	 * @var SequenceRepository
	 */
	private SequenceRepository $repository;

	/**
	 * Post type to sequence mapping.
	 *
	 * @var array
	 */
	private array $post_type_sequences = array();

	/**
	 * Constructor.
	 *
	 * @param SequenceRepository|null $repository Sequence repository.
	 */
	public function __construct( ?SequenceRepository $repository = null ) {
		$this->repository = $repository ?? new SequenceRepository();
	}

	/**
	 * Initialize - register hooks.
	 */
	public function init(): void {
		add_action( 'init', array( $this, 'register_post_types' ), 5 );
		add_action( 'wp_insert_post', array( $this, 'assign_workflow_from_url' ), 10, 3 );
	}

	/**
	 * Map post types to the sequences that drive them.
	 *
	 * Workflow sequences only. A phase sequence carries no `post_types`, so
	 * get_post_types() returns the `post` default and mapping one here would
	 * offer it as an assignable sequence on every post.
	 */
	public function register_post_types(): void {
		$sequences = $this->repository->get_workflow_sequences( array( 'status' => 'active' ) );

		foreach ( $sequences as $sequence ) {
			foreach ( $sequence->get_post_types() as $post_type ) {
				$this->post_type_sequences[ $post_type ][] = $sequence->id;
			}
		}
	}

	/**
	 * Get sequence(s) for a post type.
	 *
	 * @param  string $post_type Post type.
	 * @return array Sequence IDs.
	 */
	public function get_sequences_for_post_type( string $post_type ): array {
		return $this->post_type_sequences[ $post_type ] ?? array();
	}

	/**
	 * Get the sequence IDs eligible for a specific post.
	 *
	 * Starts from the post type mapping, then lets integrations narrow the list
	 * per post via the `vip_workflows_sequences_for_post` filter — for example,
	 * restricting a sequence to a particular section, category, or set of terms.
	 *
	 * @param  \WP_Post $post Post object.
	 * @return int[] Sequence IDs eligible for this post.
	 */
	public function get_sequences_for_post( \WP_Post $post ): array {
		$sequence_ids = $this->get_sequences_for_post_type( $post->post_type );

		/**
		 * Filters which workflow sequences are eligible for a given post.
		 *
		 * The list arrives pre-populated from the post type mapping. Return a
		 * subset (or reordered list) to control which sequences can be started
		 * on the post — e.g. limit a sequence to posts in a given category or
		 * section by inspecting the post's terms.
		 *
		 * @param int[]    $sequence_ids Sequence IDs eligible for the post.
		 * @param \WP_Post $post          The post being evaluated.
		 */
		$sequence_ids = apply_filters( 'vip_workflows_sequences_for_post', $sequence_ids, $post );

		return array_values( array_map( 'intval', $sequence_ids ) );
	}

	/**
	 * Get the primary sequence for a post type.
	 * If multiple sequences handle the same post type, returns the first one.
	 *
	 * @param  string $post_type Post type.
	 * @return int|null Sequence ID or null.
	 */
	public function get_primary_sequence_for_post_type( string $post_type ): ?int {
		$sequences = $this->get_sequences_for_post_type( $post_type );
		return ! empty( $sequences ) ? $sequences[0] : null;
	}

	/**
	 * Check if a post type has workflow enabled.
	 *
	 * @param  string $post_type Post type.
	 * @return bool
	 */
	public function has_workflow( string $post_type ): bool {
		return ! empty( $this->get_sequences_for_post_type( $post_type ) );
	}

	/**
	 * Assign workflow sequence from URL parameter (when creating from dashboard).
	 *
	 * Only assigns a workflow if ?vip_workflows_sequence=ID is in the URL.
	 * This allows users to create posts without workflows when using Posts → Add New.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 * @param bool     $update  Whether this is an update.
	 */
	public function assign_workflow_from_url( int $post_id, \WP_Post $post, bool $update ): void {
		// Only on new posts.
		if ( $update ) {
			return;
		}

		// Skip revisions and autosaves.
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		// Check if already assigned.
		$existing = get_post_meta( $post_id, '_vip_workflows_sequence_id', true );
		if ( $existing ) {
			return;
		}

		// Check for sequence ID in URL or referrer.
		$sequence_id = $this->get_sequence_id_from_request();
		if ( ! $sequence_id ) {
			return;
		}

		// Verify the sequence exists.
		$sequence = $this->repository->find( $sequence_id );
		if ( ! $sequence ) {
			return;
		}

		// Verify the sequence is eligible for this post (post type + any
		// section/term restrictions added via the sequences_for_post filter).
		if ( ! in_array( $sequence_id, $this->get_sequences_for_post( $post ), true ) ) {
			return;
		}

		// Get the initial stage (honors an explicit is_initial flag, like assign_sequence()).
		if ( empty( $sequence->get_statuses() ) ) {
			return;
		}

		$initial_status = $sequence->get_initial_status();

		// Assign sequence and stage.
		update_post_meta( $post_id, '_vip_workflows_sequence_id', $sequence_id );
		update_post_meta( $post_id, StatusManager::STAGE_META_KEY, $initial_status );
	}

	/**
	 * Get sequence ID from request (URL param or referrer).
	 *
	 * @return int|null
	 */
	private function get_sequence_id_from_request(): ?int {
		// Check direct URL param.
     // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! empty( $_GET['vip_workflows_sequence'] ) ) {
			return absint( $_GET['vip_workflows_sequence'] );
		}

		// Check referrer (for when WP redirects after post creation).
		$referrer = wp_get_referer();
		if ( $referrer ) {
			$query = wp_parse_url( $referrer, PHP_URL_QUERY );
			if ( $query ) {
				parse_str( $query, $params );
				if ( ! empty( $params['vip_workflows_sequence'] ) ) {
					return absint( $params['vip_workflows_sequence'] );
				}
			}
		}

		return null;
	}
}
