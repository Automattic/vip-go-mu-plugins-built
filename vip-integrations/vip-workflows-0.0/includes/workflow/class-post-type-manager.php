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
}
