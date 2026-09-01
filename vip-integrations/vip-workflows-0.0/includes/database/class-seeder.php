<?php
/**
 * Database seeder.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Database;

use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Workflow\StagePalette;

/**
 * Seeds initial data for the plugin.
 */
class Seeder {


	/**
	 * Color the stages of a seeded sequence from the shared palette.
	 *
	 * By position, cycling — the same rule StagePalette::at() gives the sequence
	 * editor for a stage someone adds by hand, so a seeded sequence and a
	 * hand-built one are colored alike, and adjacent stages stay distinct. The
	 * stage definitions below therefore declare no color of their own: there is
	 * one place a seeded color is decided, and this is it.
	 *
	 * @param  array $statuses Stage definitions, in stage order.
	 * @return array The same definitions, each carrying its palette color.
	 */
	private function apply_palette_colors( array $statuses ): array {
		foreach ( array_keys( $statuses ) as $index ) {
			$statuses[ $index ]['color'] = StagePalette::at( $index );
		}

		return $statuses;
	}

	/**
	 * Seed all initial data.
	 */
	public function seed(): void {
		$this->seed_roles();
		$this->seed_sequences();
	}

	/**
	 * Seed default workflow roles.
	 */
	private function seed_roles(): void {
		global $wpdb;

		$table = Schema::get_table_name( 'workflows_roles' );

		$roles = array(
			array(
				'role_key'     => 'author',
				'display_name' => 'Author',
				'description'  => 'Creates and writes content',
				'capabilities' => wp_json_encode( array( 'create_posts', 'edit_own_posts' ) ),
			),
			array(
				'role_key'     => 'editor',
				'display_name' => 'Editor',
				'description'  => 'Reviews and approves content',
				'capabilities' => wp_json_encode( array( 'edit_posts', 'approve_posts', 'transition_status' ) ),
			),
			array(
				'role_key'     => 'reviewer',
				'display_name' => 'Reviewer',
				'description'  => 'Reviews content for specific criteria',
				'capabilities' => wp_json_encode( array( 'review_posts', 'add_comments' ) ),
			),
		);

		foreach ( $roles as $role ) {
			$exists = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT id FROM {$table} WHERE role_key = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$role['role_key']
				)
			);

			if ( ! $exists ) {
				$wpdb->insert( $table, $role );
			}
		}
	}

	/**
	 * Seed default sequences.
	 */
	private function seed_sequences(): void {
		$repository = new SequenceRepository();

		$this->seed_editorial_sequence( $repository );
	}

	/**
	 * Seed the Editorial Review sequence.
	 *
	 * @param SequenceRepository $repository Sequence repository.
	 */
	private function seed_editorial_sequence( SequenceRepository $repository ): void {
		$existing = $repository->find_by_slug( 'editorial-review' );
		if ( $existing ) {
			return;
		}

		$config = array(
			'version'        => '2.0',
			'post_types'     => array( 'post' ),
			'reviewer_roles' => array( 'editor', 'administrator' ),
			'statuses'       => array(
				array(
					'key'          => 'draft',
					'label'        => 'Draft',
					'description'  => 'Author is writing the content',
					'icon'         => 'pencil',
					'status'       => 'draft',
					'region_entry' => true, // Draft-region checkpoint.
					'transitions'  => array(
						array(
							'to' => 'review',
							'label' => 'Submit for Review',
						),
					),
				),
				array(
					'key'         => 'review',
					'label'       => 'In Review',
					'description' => 'Editor is reviewing the content',
					'icon'        => 'visibility',
					'status'      => 'draft',
					'transitions' => array(
						array(
							'to' => 'ready',
							'label' => 'Approve',
						),
						array(
							'to' => 'draft',
							'label' => 'Request Changes',
						),
					),
				),
				array(
					'key'         => 'ready',
					'label'       => 'Ready to Publish',
					'description' => 'Approved and awaiting publication',
					'icon'        => 'yes-alt',
					'status'      => 'draft',
					'transitions' => array(
						array(
							'to' => 'publish',
							'label' => 'Publish Now',
						),
						array(
							'to' => 'review',
							'label' => 'Send Back for Review',
						),
					),
				),
				array(
					'key'          => 'publish',
					'label'        => 'Published',
					'description'  => 'Content is live',
					'icon'         => 'megaphone',
					'status'       => 'publish',
					'region_entry' => true, // Publish-region checkpoint — where core-driven publishes seat.
					'transitions'  => array(
						array(
							'to' => 'promote',
							'label' => 'Promote',
						),
					),
				),
				array(
					'key'         => 'promote',
					'label'       => 'Promote',
					'description' => 'Post-publish: amplify the already-live post',
					'icon'        => 'share',
					'status'      => 'publish', // Post-publish stage — the post stays live.
					'is_terminal' => true,
					'transitions' => array(),
				),
			),
			'settings'     => array(
				'allow_skip' => false,
			),
			'metadata_fields' => array(
				array(
					'key'        => 'content_pillar',
					'label'      => 'Content pillar',
					'type'       => 'select',
					'options'    => array( 'News', 'Opinion', 'Analysis', 'Feature' ),
					'required'   => false,
					'searchable' => true,
				),
				array(
					'key'        => 'seo_focus_keyword',
					'label'      => 'SEO focus keyword',
					'type'       => 'text',
					'required'   => false,
					'searchable' => true,
				),
				array(
					'key'        => 'embargo_until',
					'label'      => 'Embargo until',
					'type'       => 'date',
					'required'   => false,
					'searchable' => false,
				),
			),
		);

		$config['statuses'] = $this->apply_palette_colors( $config['statuses'] );

		$repository->create(
			'Editorial Review',
			'editorial-review',
			'Standard editorial workflow for blog posts and articles',
			$config,
			0
		);
	}

	/**
	 * Seed the default Phase sequence.
	 *
	 * Not part of the default seed: phase sequences are an ideation-owned
	 * surface, so IdeationExperiment::activate() seeds this when the Ideation
	 * experiment is switched on.
	 */
	public function seed_phase_sequence(): void {
		$repository = new SequenceRepository();

		$existing = $repository->find_by_slug( 'content-lifecycle' );
		if ( $existing ) {
			return;
		}

		$config = array(
			'phases' => array(
				array(
					'key'         => 'ideation',
					'label'       => 'Ideation',
					'transitions' => array(
						array(
							'to'             => 'editorial',
							'label'          => 'Create Draft',
							'required_tools' => array(),
							'allowed_roles'  => array(),
							'notifications'  => array(),
						),
					),
				),
				array(
					'key'         => 'editorial',
					'label'       => 'Editorial',
					'transitions' => array(),
				),
			),
		);

		$repository->create(
			'Content Lifecycle',
			'content-lifecycle',
			'Defines transitions between content lifecycle phases',
			$config,
			0,
			'phase'
		);
	}
}
