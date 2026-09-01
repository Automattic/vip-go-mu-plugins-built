<?php
/**
 * Ideation Admin Support.
 *
 * Localizes ideation data for the admin scripts.
 * Note: Page rendering is now handled by the main admin AppShell.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Admin;

use VIPWorkflows\ModuleInterface;
use VIPWorkflows\Workflow\StatusManager;

/**
 * Handles localized data for the ideation admin scripts.
 */
class IdeationAdmin implements ModuleInterface {


	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'ideation-admin';
	}

	/**
	 * Initialize admin support.
	 */
	public function init(): void {
		// Priority 20: must run after Admin::enqueue_scripts (priority 10)
		// registers the 'vip-workflows-admin' handle. wp_localize_script() is
		// a no-op on unregistered handles, and feature modules init before
		// the core Admin module.
		add_action( 'admin_enqueue_scripts', array( $this, 'localize_ideation_data' ), 20 );
	}

	/**
	 * Localize ideation data for admin scripts.
	 *
	 * Attaches ideation-specific data to the main admin script.
	 *
	 * @param string $hook_suffix Admin page hook suffix.
	 */
	public function localize_ideation_data( string $hook_suffix ): void {
		// Only load on VIP Workflows pages.
		if ( ! str_contains( $hook_suffix, 'vip-workflows' ) ) {
			return;
		}

		// Add ideation data to the main admin script.
		wp_localize_script(
			'vip-workflows-admin',
			'vipWorkflowsIdeation',
			array(
				'restUrl'            => rest_url( 'vip-workflows/v1/' ),
				'nonce'              => wp_create_nonce( 'wp_rest' ),
				'currentUserId'      => get_current_user_id(),
				'currentUser'        => array(
					'id'     => get_current_user_id(),
					'name'   => wp_get_current_user()->display_name,
					'avatar' => get_avatar_url( get_current_user_id(), array( 'size' => 32 ) ),
				),
				'canManage'          => current_user_can( 'edit_others_posts' ),
				'canEditOthersPosts' => current_user_can( 'edit_others_posts' ),
				'urgencyLevels'      => array(
					'normal'   => __( 'Normal', 'vip-workflows' ),
					'urgent'   => __( 'Urgent', 'vip-workflows' ),
					'breaking' => __( 'Breaking', 'vip-workflows' ),
				),
				'users'              => $this->get_assignable_users(),
				'roles'              => $this->get_available_roles(),
				'sequences'         => $this->get_sequences(),
				'phaseConfig'        => $this->get_phase_config(),
			)
		);
	}

	/**
	 * Get users that can be assigned work.
	 *
	 * @return array
	 */
	private function get_assignable_users(): array {
		$users = get_users(
			array(
				'capability' => 'edit_posts',
				'number'     => 100,
				'orderby'    => 'display_name',
			)
		);

		return array_map(
			fn( $user ) => array(
				'id'     => $user->ID,
				'name'   => $user->display_name,
				'email'  => $user->user_email,
				'avatar' => get_avatar_url( $user->ID, array( 'size' => 32 ) ),
			),
			$users
		);
	}

	/**
	 * Get available roles.
	 *
	 * @return array
	 */
	private function get_available_roles(): array {
		$wp_roles = wp_roles();
		$roles    = array();

		foreach ( $wp_roles->roles as $slug => $role ) {
			$roles[] = array(
				'slug' => $slug,
				'name' => $role['name'],
			);
		}

		return $roles;
	}

	/**
	 * Get available workflow sequences.
	 *
	 * @return array
	 */
	private function get_sequences(): array {
		$repository = new \VIPWorkflows\Sequences\SequenceRepository();
		$sequences = $repository->get_workflow_sequences( array( 'status' => 'active' ) );

		return array_map(
			fn( $bp ) => array(
				'id'   => $bp->id,
				'name' => $bp->name,
				'type' => $bp->type,
			),
			$sequences
		);
	}

	/**
	 * Get phase config for the frontend.
	 *
	 * Returns null when no phase sequence exists (no restrictions).
	 * Returns { active: true, transitions: {...} } when one does.
	 *
	 * @return array|null
	 */
	private function get_phase_config(): ?array {
		$repository = new \VIPWorkflows\Sequences\SequenceRepository();
		$sequence  = $repository->get_active_phase_sequence();

		if ( ! $sequence ) {
			return null;
		}

		// Keyed, because a transition's label is derived from the phase it leads
		// to and the phases arrive as a list.
		$phases_by_key = array();
		foreach ( $sequence->get_phases() as $phase ) {
			$phases_by_key[ $phase['key'] ?? '' ] = $phase;
		}

		$ideation_phase = $phases_by_key['ideation'] ?? null;

		$transitions = array();
		$user_id     = get_current_user_id();

		if ( $ideation_phase && ! empty( $ideation_phase['transitions'] ) ) {
			foreach ( $ideation_phase['transitions'] as $transition ) {
				$to = $transition['to'] ?? '';

				$transitions[ $to ] = array(
					// The same derivation the editorial sidebar uses, rather
					// than a second one here. A phase transition is stored with
					// an empty label when the author did not write one, so a
					// null-coalesce on the key never fires and this screen was
					// handed a blank; StatusManager derives "Move to {phase}"
					// from the destination's current label instead, which is
					// also the string the sequence editor shows the author as
					// the field's default.
					'label'   => StatusManager::transition_label( $transition, $phases_by_key[ $to ] ?? array() ),
					'allowed' => $sequence->is_phase_transition_allowed( 'ideation', $to, $user_id ),
				);
			}
		}

		return array(
			'active'      => true,
			'transitions' => $transitions,
		);
	}
}
