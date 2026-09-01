<?php
/**
 * Editor integration.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Editor;

use VIPWorkflows\ModuleInterface;
use VIPWorkflows\Plugin;

/**
 * Handles editor (Gutenberg) integration.
 */
class EditorIntegration implements ModuleInterface {


	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'editor';
	}

	/**
	 * Initialize editor integration.
	 */
	public function init(): void {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
	}

	/**
	 * Enqueue editor assets.
	 */
	public function enqueue_editor_assets(): void {
		// Only load on post edit screens.
		$screen = get_current_screen();
		if ( ! $screen || 'post' !== $screen->base ) {
			return;
		}

		$asset_file = VIP_WORKFLOWS_PLUGIN_DIR . 'build/editor.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		// DataViews styles, copied from the pinned @wordpress/dataviews package at
		// build time (they cannot be bundled — see webpack.config.js). The sidebar's
		// history dialog renders a DataViews activity stream, which without these
		// arrives unstyled. Same handle the admin bundle registers, so whichever
		// screen asks for it first wins and the other reuses it.
		wp_enqueue_style(
			'vip-workflows-dataviews',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/dataviews.css',
			array( 'wp-components' ),
			$asset['version']
		);
		wp_style_add_data( 'vip-workflows-dataviews', 'rtl', 'replace' );

		// The bundle's two stylesheets, the same split class-admin.php enqueues:
		// component-level CSS imports land in editor.css (wp-scripts routes only
		// files literally named style.css into style-editor.css). The transition
		// rail lives in editor.css, and its SVG track must be positioned by it —
		// unstyled, the track sits in normal flow, every mount grows the box the
		// rail measures itself against, and the measure loop crashes the editor.
		wp_enqueue_style(
			'vip-workflows-editor-components',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/editor.css',
			array( 'wp-components', 'vip-workflows-dataviews' ),
			$asset['version']
		);

		wp_enqueue_style(
			'vip-workflows-editor',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/style-editor.css',
			array( 'vip-workflows-editor-components' ),
			$asset['version']
		);

		wp_enqueue_script(
			'vip-workflows-editor',
			VIP_WORKFLOWS_PLUGIN_URL . 'build/editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$post_id = get_the_ID();
		$post    = get_post( $post_id );

		// Get workflow info for this post.
		$status_manager  = Plugin::get_instance()->get_status_manager();
		$sequence       = $status_manager ? $status_manager->get_sequence_for_post( $post_id ) : null;
		$current_status  = $status_manager && $sequence ? $status_manager->get_current_status( $post_id ) : null;
		$transitions     = $status_manager && $sequence ? $status_manager->get_available_transitions( $post_id ) : array();

		// Check if this specific post is in a workflow (has sequence assigned).
		$has_workflow = (bool) $sequence;

		// Check workflow enforcement mode for new posts.
		$enforcement_mode = \VIPWorkflows\Admin\Settings::get_workflow_enforcement_mode();
		$is_new_post      = in_array( $post->post_status, array( 'auto-draft', 'draft' ), true )
			&& empty( $post->post_content )
			&& __( 'Auto Draft', 'vip-workflows' ) === $post->post_title;

		// Determine if we should show the workflow modal.
		$show_workflow_modal = $enforcement_mode && $is_new_post && ! $sequence;

		$metadata_fields = $sequence ? $sequence->get_metadata_fields_with_meta_keys() : array();

		$roles = $this->get_available_roles();

		// Inline JSON rather than wp_localize_script(): localize casts every
		// top-level scalar to a string, which handed the editor store a string
		// postId. Invalidating the post's entity resolution with that string is a
		// silent no-op — the cache is keyed by the numeric id — so the editor kept
		// showing the pre-transition status until a full reload. JSON keeps the
		// ints ints and the booleans booleans.
		wp_add_inline_script(
			'vip-workflows-editor',
			'window.vipWorkflowsEditor = ' . wp_json_encode(
				array(
					'apiUrl'              => rest_url( 'vip-workflows/v1' ),
					'nonce'               => wp_create_nonce( 'wp_rest' ),
					'postId'              => $post_id,
					'postType'            => $post->post_type,
					'postStatus'          => $post->post_status,
					'hasWorkflow'         => $has_workflow,
					'showWorkflowModal'   => $show_workflow_modal,
					'workflowEnforcement' => $enforcement_mode, // 'require', 'recommend', or false.
					'sequence'           => $sequence ? array(
						'id'       => $sequence->id,
						'name'     => $sequence->name,
						'slug'     => $sequence->slug,
						'statuses' => $sequence->get_statuses(),
					) : null,
					'currentStatus'       => $current_status,
					'transitions'         => $transitions,
					'currentUser'         => get_current_user_id(),
					'metadataFields'      => $metadata_fields,
					'roles'               => $roles,
				)
			) . ';',
			'before'
		);
	}

	/**
	 * Get the available roles for assignment, shaped for the editor store.
	 *
	 * @return array<int, array{slug: string, name: string}>
	 */
	private function get_available_roles(): array {
		$wp_roles = wp_roles();
		$roles    = array();

		foreach ( $wp_roles->roles as $slug => $role ) {
			$roles[] = array(
				'slug' => $slug,
				'name' => translate_user_role( $role['name'] ),
			);
		}

		return $roles;
	}
}
