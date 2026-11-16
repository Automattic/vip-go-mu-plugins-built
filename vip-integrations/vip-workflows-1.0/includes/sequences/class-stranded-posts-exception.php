<?php
/**
 * StrandedPostsException — a sequence write refused because it would strand posts.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Sequences;

use WP_Error;

/**
 * Thrown by SequenceRepository when an update would remove a stage that posts
 * sit at, or a delete would remove a sequence that posts still hold.
 *
 * A post's place in a workflow is two meta values: its sequence ID and its
 * stage key. A write that removes either target leaves the post pointing at
 * nothing, and the publish boundary then refuses every status change for it
 * (deliberately — it fails closed on workflow state it cannot resolve). So
 * the repository refuses the write instead, and this carries what the admin
 * needs to fix it: which stages, how many posts, and which ones.
 *
 * It deliberately does not extend InvalidArgumentException. Callers already
 * map that to "the config is malformed", and this is not a malformed config:
 * the same save succeeds once the posts are moved.
 */
class StrandedPostsException extends \Exception {

	public const ERROR_CODE = 'rest_sequence_would_strand_posts';

	/**
	 * Sequence ID the write targeted.
	 *
	 * @var int
	 */
	public int $sequence_id;

	/**
	 * Removed stages that posts sit at, as key => label. Empty for a delete.
	 *
	 * @var array<string, string>
	 */
	public array $stages;

	/**
	 * Total number of affected posts.
	 *
	 * @var int
	 */
	public int $total;

	/**
	 * The first affected posts (capped), from StageQuery::posts_holding_sequence().
	 *
	 * @var array<int, array{id: int, title: string, status: string, stage: string}>
	 */
	public array $posts;

	/**
	 * Constructor.
	 *
	 * @param int                   $sequence_id Sequence ID.
	 * @param array<string, string> $stages      Removed stages as key => label; empty for a delete.
	 * @param int                   $total       Total affected posts.
	 * @param array                 $posts       Capped list of affected posts.
	 */
	public function __construct( int $sequence_id, array $stages, int $total, array $posts ) {
		$this->sequence_id = $sequence_id;
		$this->stages      = $stages;
		$this->total       = $total;
		$this->posts       = $posts;

		parent::__construct( $this->build_message() );
	}

	/**
	 * Whether the refused write was a delete (no stages named).
	 *
	 * @return bool
	 */
	public function is_delete(): bool {
		return empty( $this->stages );
	}

	/**
	 * The REST-facing error: a 409 whose data lists the affected posts.
	 *
	 * @return WP_Error
	 */
	public function to_wp_error(): WP_Error {
		$posts = array();
		foreach ( $this->posts as $post ) {
			$link    = get_edit_post_link( $post['id'], 'raw' );
			$posts[] = array(
				'id'        => $post['id'],
				'title'     => $post['title'],
				'status'    => $post['status'],
				'stage'     => $post['stage'],
				'edit_link' => $link ? $link : null,
			);
		}

		$stages = array();
		foreach ( $this->stages as $key => $label ) {
			$stages[] = array(
				'key'   => (string) $key,
				'label' => $label,
			);
		}

		return new WP_Error(
			self::ERROR_CODE,
			$this->getMessage(),
			array(
				'status' => 409,
				'stages' => $stages,
				'total'  => $this->total,
				'posts'  => $posts,
			)
		);
	}

	/**
	 * Human-readable reason, naming the stages for an update.
	 *
	 * @return string
	 */
	private function build_message(): string {
		if ( $this->is_delete() ) {
			return sprintf(
				/* translators: %d: number of posts still in the workflow. */
				_n(
					'%d post is still in this sequence. Remove it from the workflow, then delete.',
					'%d posts are still in this sequence. Remove them from the workflow, then delete.',
					$this->total,
					'vip-workflows'
				),
				$this->total
			);
		}

		$labels = array_map(
			static function ( string $label ): string {
				return '“' . $label . '”';
			},
			array_values( $this->stages )
		);

		return sprintf(
			/* translators: 1: comma-separated stage names in quotes, 2: number of posts at those stages. */
			_n(
				'%2$d post is still in %1$s. Move it to another stage, then save.',
				'%2$d posts are still in %1$s. Move them to another stage, then save.',
				$this->total,
				'vip-workflows'
			),
			implode( ', ', $labels ),
			$this->total
		);
	}
}
