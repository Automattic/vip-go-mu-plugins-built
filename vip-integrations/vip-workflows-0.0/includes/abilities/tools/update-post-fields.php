<?php
/**
 * Update Post Fields ability.
 *
 * Sets title, excerpt, date, or author on a post.
 * Annotated with requires_confirmation — the agentic loop
 * will ask the user before executing.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the post field update.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_update_post_fields( ?array $input = null ) {
	$input     = $input ?? array();
	$post_id   = (int) ( $input['post_id'] ?? 0 );
	$fields    = $input['fields'] ?? array();
	$confirmed = ! empty( $input['confirmed'] );

	if ( ! $post_id ) {
		return new \WP_Error( 'missing_post_id', __( 'The "post_id" parameter is required.', 'vip-workflows' ) );
	}

	if ( empty( $fields ) || ! is_array( $fields ) ) {
		return new \WP_Error( 'missing_fields', __( 'The "fields" parameter must be a non-empty object.', 'vip-workflows' ) );
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		return new \WP_Error( 'not_found', __( 'Post not found.', 'vip-workflows' ) );
	}

	$permission_error = require_post_edit_permission( $post_id );
	if ( $permission_error ) {
		return $permission_error;
	}

	// Map allowed field names to wp_update_post keys.
	$allowed_fields = array(
		'title'   => 'post_title',
		'excerpt' => 'post_excerpt',
		'date'    => 'post_date',
		'author'  => 'post_author',
	);

	// Validate all fields before previewing or executing.
	$sanitized = array();

	foreach ( $fields as $field_name => $value ) {
		if ( ! isset( $allowed_fields[ $field_name ] ) ) {
			return new \WP_Error(
				'invalid_field',
				sprintf(
					/* translators: %s field name */
					__( 'Unknown field "%s". Allowed fields: title, excerpt, date, author.', 'vip-workflows' ),
					$field_name
				)
			);
		}

		switch ( $field_name ) {
			case 'title':
				$sanitized[ $field_name ] = sanitize_text_field( $value );
				break;
			case 'excerpt':
				$sanitized[ $field_name ] = sanitize_textarea_field( $value );
				break;
			case 'date':
				$sanitized[ $field_name ] = sanitize_text_field( $value );
				break;
			case 'author':
				$author_id = absint( $value );
				if ( ! get_userdata( $author_id ) ) {
					return new \WP_Error( 'invalid_author', __( 'Author user ID is invalid.', 'vip-workflows' ) );
				}
				// Reassigning authorship to a different user requires
				// edit_others_posts — edit_post on one's own draft is not enough,
				// or any Contributor could hand their post to another user.
				$current_author = (int) get_post_field( 'post_author', $post_id );
				if ( $author_id !== $current_author && ! current_user_can( 'edit_others_posts' ) ) {
					return new \WP_Error(
						'forbidden_author_reassign',
						__( 'You do not have permission to change the post author.', 'vip-workflows' ),
						array( 'status' => 403 )
					);
				}
				$sanitized[ $field_name ] = $author_id;
				break;
		}
	}

	// Preview mode: return what would change without executing.
	if ( ! $confirmed ) {
		$preview = array();
		foreach ( $sanitized as $field_name => $new_value ) {
			$wp_key  = $allowed_fields[ $field_name ];
			$preview[ $field_name ] = array(
				'current' => $post->$wp_key,
				'new'     => $new_value,
			);
		}

		return array(
			'post_id'               => $post_id,
			'post_title'            => $post->post_title,
			'preview'               => $preview,
			'requires_confirmation' => true,
			'message'               => __( 'These changes require confirmation. Call this tool again with confirmed=true to apply.', 'vip-workflows' ),
		);
	}

	// Confirmed — execute the update.
	$update_args = array( 'ID' => $post_id );
	foreach ( $sanitized as $field_name => $value ) {
		$update_args[ $allowed_fields[ $field_name ] ] = $value;
	}

	$result = wp_update_post( $update_args, true );

	if ( is_wp_error( $result ) ) {
		return $result;
	}

	return array(
		'post_id' => $post_id,
		'updated' => $sanitized,
		'success' => true,
	);
}

/**
 * Register the Update Post Fields ability.
 *
 * @return void
 */
function register_update_post_fields(): void {
	wp_register_ability(
		'vip-workflows/update-post-fields',
		array(
			'label'               => __( 'Update Post Fields', 'vip-workflows' ),
			'description'         => __( 'Updates a post\'s title, excerpt, date, or author. Only include the fields you want to change. Requires confirmation before executing.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'post_id', 'fields' ),
				'properties'           => array(
					'post_id'   => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to update.', 'vip-workflows' ),
					),
					'fields'    => array(
						'type'                 => 'object',
						'description'          => __( 'Object of field name → new value. Only include fields to change. Allowed: title, excerpt, date, author.', 'vip-workflows' ),
						'additionalProperties' => false,
						'properties'           => array(
							'title'   => array(
								'type'        => 'string',
								'description' => __( 'New post title.', 'vip-workflows' ),
							),
							'excerpt' => array(
								'type'        => 'string',
								'description' => __( 'New post excerpt.', 'vip-workflows' ),
							),
							'date'    => array(
								'type'        => 'string',
								'description' => __( 'New publish date (MySQL format: YYYY-MM-DD HH:MM:SS).', 'vip-workflows' ),
							),
							'author'  => array(
								'type'        => 'integer',
								'description' => __( 'New author user ID.', 'vip-workflows' ),
							),
						),
					),
					'confirmed' => array(
						'type'        => 'boolean',
						'description' => __( 'Set to true to confirm and apply the changes. First call without this to preview.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id' => array(
						'type'        => 'integer',
						'description' => __( 'The post ID.', 'vip-workflows' ),
					),
					'updated' => array(
						'type'        => 'object',
						'description' => __( 'The fields that were updated with their new values.', 'vip-workflows' ),
					),
					'success' => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the update succeeded.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_update_post_fields',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'              => false,
					'destructive'           => false,
					'idempotent'            => true,
					'requires_confirmation' => true,
				),
				'mcp'                 => array(
					'public' => true,
					'type'   => 'tool',
				),
			),
		)
	);
}
