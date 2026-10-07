<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Invitation {

	public static function get_prefix(): string {
		$prefix = get_option( 'clipisode_invitation_prefix', 'invitation' );
		return trim( $prefix, '/' );
	}

	public static function sanitize_prefix( string $value ): string {
		$value = sanitize_title( trim( $value, '/' ) );
		return $value ?: 'invitation';
	}

	/**
	 * Returns the configured short-URL base for invitation links, or
	 * an empty string if the short-URL feature isn't configured on
	 * this site.
	 *
	 * Today this is always empty — the short-URL feature is planned
	 * but not implemented (see docs/specs/planned/short-invitation-urls.md
	 * for the design). The method exists so the editor preview
	 * generator can reference {short_url_base} in preview-values.json
	 * templates; an empty result causes templates to fall back to
	 * the long invitation URL via the JSON's fallback shape, so
	 * starter HTML referencing {invitation_short_url} doesn't break.
	 *
	 * When the feature ships, replace the stub with a real lookup:
	 *
	 *   $value = get_option( 'clipisode_short_url_base', '' );
	 *   return is_string( $value ) ? trim( $value ) : '';
	 *
	 * Plus the runtime substitution + rs.video-style host handler
	 * described in the planning doc.
	 */
	public static function get_short_url_base(): string {
		return '';
	}

	/**
	 * Registers the public invitation-flow rewrite rule.
	 *
	 * One rule, one query var, one template. The URL prefix is
	 * stored in the `clipisode_invitation_prefix` site option
	 * (default "invitation") so non-English sites can serve the
	 * flow at locale-appropriate paths (`/invitasjon/`, `/邀請/`,
	 * etc.). Changing the option requires a rewrite-rules flush;
	 * the Settings page does that automatically when the value
	 * changes.
	 *
	 * Earlier versions of the plugin ran a parallel "v2" flow on a
	 * hardcoded /clipisode-flow/ prefix while the new
	 * clipisode_screen-driven template was under construction. That
	 * flow is now the only flow, and the configurable prefix routes
	 * directly to it. See docs/specs/shipped/kill-v1-invitation-flow.md
	 * for the cutover history.
	 */
	public function register_rewrite(): void {
		$prefix = self::get_prefix();
		add_rewrite_rule(
			'^' . preg_quote( $prefix, '/' ) . '/([a-zA-Z0-9]+)/?$',
			'index.php?clipisode_invite=$matches[1]',
			'top'
		);
	}

	public function add_query_vars( array $vars ): array {
		$vars[] = 'clipisode_invite';
		return $vars;
	}

	public function template_include( string $template ): string {
		$slug = get_query_var( 'clipisode_invite' );
		if ( $slug ) {
			return CLIPISODE_PLUGIN_DIR . 'assets/templates/clipisode-flow.php';
		}

		return $template;
	}

	public function register_routes(): void {
		register_rest_route( 'clipisode/v1', '/invitation/upload', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'upload_video' ],
			'permission_callback' => '__return_true',
		] );

		register_rest_route( 'clipisode/v1', '/invitation/submit', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'submit_reply' ],
			'permission_callback' => '__return_true',
		] );
	}

	public function upload_video( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$slug  = sanitize_text_field( $request->get_param( 'slug' ) );
		$nonce = sanitize_text_field( $request->get_param( '_clipisode_nonce' ) );

		if ( ! $slug ) {
			return new WP_REST_Response( [ 'message' => 'Missing invitation slug.' ], 400 );
		}

		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'clipisode_upload_' . $slug ) ) {
			return new WP_REST_Response( [ 'message' => 'Your session has timed out.' ], 403 );
		}

		$links_table = $wpdb->prefix . 'clipisode_invitation_links';
		$link = $wpdb->get_row( $wpdb->prepare(
			"SELECT status FROM $links_table WHERE slug = %s", $slug
		) );

		if ( ! $link ) {
			return new WP_REST_Response( [ 'message' => 'Invitation link not found.' ], 404 );
		}

		if ( $link->status !== 'open' ) {
			return new WP_REST_Response( [ 'message' => 'This invitation is no longer accepting replies.' ], 403 );
		}

		$files = $request->get_file_params();
		if ( empty( $files['video'] ) ) {
			return new WP_REST_Response( [ 'message' => 'No video file provided.' ], 400 );
		}

		$file = $files['video'];
		$ext  = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );

		if ( ! in_array( $ext, Clipisode_Media::ALLOWED_EXTENSIONS, true ) ) {
			return new WP_REST_Response( [
				'message' => 'Invalid video type. Allowed: MP4, MOV, WebM, M4V.',
			], 400 );
		}

		if ( $file['size'] > Clipisode_Media::MAX_FILE_SIZE ) {
			return new WP_REST_Response( [ 'message' => 'File too large. Maximum 80 MB.' ], 400 );
		}

		$result = Clipisode_Media::create( 'video', 'original' );
		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
		}

		return new WP_REST_Response( $result );
	}

	public function submit_reply( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$slug          = sanitize_text_field( $request->get_param( 'slug' ) );
		$nonce         = sanitize_text_field( $request->get_param( '_clipisode_nonce' ) );
		$name          = sanitize_text_field( $request->get_param( 'name' ) );
		$social_handle = sanitize_text_field( $request->get_param( 'social_handle' ) ?? '' );
		$social_network = sanitize_key( (string) ( $request->get_param( 'social_network' ) ?? '' ) );
		$media_id      = (int) $request->get_param( 'media_id' );
		if ( ! in_array( $social_network, [ 'instagram', 'x' ], true ) ) {
			$social_network = '';
		}

		if ( ! $slug || ! $name ) {
			return new WP_REST_Response( [ 'message' => 'Slug and name are required.' ], 400 );
		}

		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'clipisode_upload_' . $slug ) ) {
			return new WP_REST_Response( [ 'message' => 'Your session has timed out.' ], 403 );
		}

		$links_table = $wpdb->prefix . 'clipisode_invitation_links';
		$link = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM $links_table WHERE slug = %s", $slug
		) );

		if ( ! $link ) {
			return new WP_REST_Response( [ 'message' => 'Invitation link not found.' ], 404 );
		}

		if ( $link->status !== 'open' ) {
			return new WP_REST_Response( [ 'message' => 'This invitation is no longer accepting replies.' ], 403 );
		}

		$topics_table = $wpdb->prefix . 'clipisode_topics';
		$topic = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM $topics_table WHERE id = %d", $link->topic_id
		) );

		if ( ! $topic ) {
			return new WP_REST_Response( [ 'message' => 'Topic not found.' ], 404 );
		}

		$brand_revision_id  = null;
		$custom_revision_id = null;
		if ( $topic->brand_terms_id ) {
			$revisions = wp_get_post_revisions( (int) $topic->brand_terms_id, [ 'numberposts' => 1 ] );
			$brand_revision_id = $revisions ? array_key_first( $revisions ) : null;
		}
		if ( $topic->custom_terms_id ) {
			$revisions = wp_get_post_revisions( (int) $topic->custom_terms_id, [ 'numberposts' => 1 ] );
			$custom_revision_id = $revisions ? array_key_first( $revisions ) : null;
		}

		$wpdb->insert( $wpdb->prefix . 'clipisode_replies', [
			'topic_id'                 => $topic->id,
			'invitation_link_id'       => $link->id,
			'name'                     => $name,
			'media_id'                 => $media_id ?: null,
			'social_handle'            => $social_handle ?: null,
			'social_network'           => $social_network ?: null,
			'status'                   => 'unapproved',
			'brand_terms_id'           => $topic->brand_terms_id,
			'brand_terms_revision_id'  => $brand_revision_id,
			'custom_terms_id'          => $topic->custom_terms_id,
			'custom_terms_revision_id' => $custom_revision_id,
		] );

		return new WP_REST_Response( [ 'ok' => true, 'reply_id' => $wpdb->insert_id ] );
	}

	public static function flush_rewrites(): void {
		delete_option( 'rewrite_rules' );
	}
}
