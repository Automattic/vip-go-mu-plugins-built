<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_REST_API {

	private const NAMESPACE = 'clipisode/v1';

	public function register_routes(): void {
		// Terms.
		register_rest_route( self::NAMESPACE, '/terms/brand', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_brand_terms' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/terms/custom', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_custom_terms' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Hosts.
		register_rest_route( self::NAMESPACE, '/hosts', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_hosts' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_host' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/hosts/(?P<id>\d+)', [
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_host' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/hosts/default', [
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'set_default_host' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Settings.
		register_rest_route( self::NAMESPACE, '/settings', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_settings' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'update_settings' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Topics.
		register_rest_route( self::NAMESPACE, '/topics', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_topics' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_topic' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/topics/(?P<id>\d+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_topic' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'update_topic' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_topic' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Invitation links.
		register_rest_route( self::NAMESPACE, '/topics/(?P<topic_id>\d+)/invitation-links', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_invitation_links' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_invitation_link' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/invitation-links/(?P<id>\d+)', [
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'update_invitation_link' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_invitation_link' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Videos (upload / sideload / delete).
		register_rest_route( self::NAMESPACE, '/videos/upload', [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'upload_video' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/videos/sideload', [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'sideload_video' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/videos/(?P<id>\d+)', [
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_video' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Themes (CPT-based invitation designs).
		register_rest_route( self::NAMESPACE, '/themes', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_themes' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'clone_theme' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/themes/(?P<id>\d+)', [
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_theme' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Preview layouts (CPT-based preview designs).
		register_rest_route( self::NAMESPACE, '/preview-layouts', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_preview_layouts' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'clone_preview_layout' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/preview-layouts/(?P<id>\d+)', [
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_preview_layout' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Outputs.
		register_rest_route( self::NAMESPACE, '/outputs', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_outputs' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_output' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/outputs/(?P<id>\d+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_output' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'update_output' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_output' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/outputs/(?P<id>\d+)/render', [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'render_output' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_output_render' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/outputs/(?P<id>\d+)/browser-render', [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'upload_browser_output' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/outputs/(?P<id>\d+)/upload', [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'upload_output' ],
				'permission_callback' => '__return_true',
			],
		] );

		register_rest_route( self::NAMESPACE, '/outputs/(?P<id>\d+)/contents', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_output_contents' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_output_contents' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Media.
		register_rest_route( self::NAMESPACE, '/media', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_media' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'upload_media_asset' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/media/(?P<id>\d+)', [
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_media_asset' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		// Replies.
		register_rest_route( self::NAMESPACE, '/replies', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_replies' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/replies/(?P<id>\d+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_reply' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'update_reply' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );
	}

	public function check_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	// --- Terms ---

	public function get_brand_terms( WP_REST_Request $request ): WP_REST_Response {
		$brand_id = Clipisode_Post_Types::get_brand_terms_id();
		if ( ! $brand_id ) {
			$brand_id = Clipisode_Post_Types::ensure_brand_terms();
		}

		$post = get_post( $brand_id );

		return new WP_REST_Response( [
			'id'          => $post->ID,
			'title'       => $post->post_title,
			'modified'    => $post->post_modified,
			'edit_url'    => get_edit_post_link( $post->ID, 'raw' ),
			'preview_url' => get_permalink( $post->ID ),
		] );
	}

	public function list_custom_terms( WP_REST_Request $request ): WP_REST_Response {
		$posts = get_posts( [
			'post_type'   => 'clipisode_terms',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'title',
			'order'       => 'ASC',
			'meta_key'    => Clipisode_Post_Types::TERMS_TYPE_META,
			'meta_value'  => 'custom',
		] );

		$terms = array_map( fn( $p ) => [
			'id'          => $p->ID,
			'title'       => $p->post_title,
			'modified'    => $p->post_modified,
			'edit_url'    => get_edit_post_link( $p->ID, 'raw' ),
			'preview_url' => get_permalink( $p->ID ),
		], $posts );

		return new WP_REST_Response( $terms );
	}

	// --- Settings ---

	public function get_settings(): WP_REST_Response {
		return new WP_REST_Response( [
			'invitation_prefix' => Clipisode_Invitation::get_prefix(),
			'preview_prefix'    => Clipisode_Preview::get_prefix(),
			'debug_mode'        => (bool) get_option( 'clipisode_debug_mode', false ),
		] );
	}

	public function update_settings( WP_REST_Request $request ): WP_REST_Response {
		$data = $request->get_json_params();

		$flush = false;

		if ( isset( $data['invitation_prefix'] ) ) {
			$old = get_option( 'clipisode_invitation_prefix', 'invitation' );
			$new = Clipisode_Invitation::sanitize_prefix( $data['invitation_prefix'] );
			update_option( 'clipisode_invitation_prefix', $new );
			if ( $old !== $new ) {
				$flush = true;
			}
		}

		if ( isset( $data['preview_prefix'] ) ) {
			$old = get_option( 'clipisode_preview_prefix', 'clipisode' );
			$new = Clipisode_Preview::sanitize_prefix( $data['preview_prefix'] );
			update_option( 'clipisode_preview_prefix', $new );
			if ( $old !== $new ) {
				$flush = true;
			}
		}

		if ( $flush ) {
			delete_option( 'rewrite_rules' );
		}

		if ( isset( $data['debug_mode'] ) ) {
			update_option( 'clipisode_debug_mode', (bool) $data['debug_mode'] ? '1' : '' );
		}

		return $this->get_settings();
	}

	// --- Hosts ---

	public function list_hosts( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_hosts';
		$rows  = $wpdb->get_results( "SELECT * FROM $table ORDER BY name ASC" );

		$hosts = array_map( function ( $row ) {
			return [
				'id'         => (int) $row->id,
				'name'       => $row->name,
				'is_default' => (bool) $row->is_default,
				'created_at' => $row->created_at,
			];
		}, $rows );

		return new WP_REST_Response( $hosts );
	}

	public function create_host( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_hosts';
		$name  = sanitize_text_field( $request->get_param( 'name' ) );

		if ( ! $name ) {
			return new WP_REST_Response( [ 'message' => 'Name is required.' ], 400 );
		}

		$existing = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM $table WHERE name = %s",
			$name
		) );

		if ( $existing ) {
			return new WP_REST_Response( [
				'id'   => (int) $existing,
				'name' => $name,
			] );
		}

		$wpdb->insert( $table, [ 'name' => $name ] );

		return new WP_REST_Response( [
			'id'   => $wpdb->insert_id,
			'name' => $name,
		], 201 );
	}

	public function delete_host( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'clipisode_hosts', [ 'id' => (int) $request['id'] ] );
		return new WP_REST_Response( null, 204 );
	}

	public function set_default_host( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_hosts';
		$id    = $request->get_param( 'id' );

		$wpdb->update( $table, [ 'is_default' => 0 ], [ 'is_default' => 1 ] );

		if ( $id ) {
			$wpdb->update( $table, [ 'is_default' => 1 ], [ 'id' => (int) $id ] );
		}

		return $this->list_hosts( $request );
	}

	// --- Topics ---

	private function enrich_topic( object $topic ): object {
		global $wpdb;

		if ( ! empty( $topic->brand_terms_id ) ) {
			$brand_post = get_post( (int) $topic->brand_terms_id );
			$topic->brand_terms_title = $brand_post ? $brand_post->post_title : null;
			$topic->brand_terms_url   = $brand_post ? get_permalink( $brand_post->ID ) : null;
		} else {
			$topic->brand_terms_title = null;
			$topic->brand_terms_url   = null;
		}

		if ( ! empty( $topic->custom_terms_id ) ) {
			$custom_post = get_post( (int) $topic->custom_terms_id );
			$topic->custom_terms_title = $custom_post ? $custom_post->post_title : null;
			$topic->custom_terms_url   = $custom_post ? get_permalink( $custom_post->ID ) : null;
		} else {
			$topic->custom_terms_title = null;
			$topic->custom_terms_url   = null;
		}

		$topic->intro_video_url = ! empty( $topic->intro_media_id )
			? Clipisode_Media::get_url( (int) $topic->intro_media_id )
			: null;

		$topic->intro_video_filename = ! empty( $topic->intro_media_id )
			? Clipisode_Media::get_filename( (int) $topic->intro_media_id )
			: null;

		$topic->social_image_url = ! empty( $topic->social_image_media_id )
			? Clipisode_Media::get_url( (int) $topic->social_image_media_id )
			: null;

		if ( ! empty( $topic->invitation_id ) ) {
			$inv_post = get_post( (int) $topic->invitation_id );
			$topic->invitation_title    = $inv_post ? $inv_post->post_title : null;
			$topic->invitation_edit_url = $inv_post ? get_edit_post_link( $inv_post->ID, 'raw' ) : null;
			$topic->invitation_renderer_theme = Clipisode_Post_Types::invitation_renderer_theme( (int) $topic->invitation_id );
		} else {
			$topic->invitation_title    = null;
			$topic->invitation_edit_url = null;
			$topic->invitation_renderer_theme = null;
		}

		$outputs_table  = $wpdb->prefix . 'clipisode_outputs';
		$contents_table = $wpdb->prefix . 'clipisode_contents';
		$media_table    = $wpdb->prefix . 'clipisode_media';

		$raw_outputs = $wpdb->get_results( $wpdb->prepare(
			"SELECT o.*,
				COALESCE(c.clips_count, 0) AS clips_count,
				m.file_size
			FROM $outputs_table o
			LEFT JOIN (
				SELECT output_id, COUNT(*) AS clips_count
				FROM $contents_table
				GROUP BY output_id
			) c ON c.output_id = o.id
			LEFT JOIN $media_table m ON m.id = o.media_id
			WHERE o.topic_id = %d
			ORDER BY o.created_at DESC",
			(int) $topic->id
		) );

		$topic->outputs = array_map( function ( $o ) {
			$preview_url = Clipisode_Preview::get_url( (int) $o->id, $o->media_id ? (int) $o->media_id : null, $o->slug );
			$clips_count = (int) $o->clips_count;
			if ( null !== $o->composition ) {
				$composition = json_decode( $o->composition, true );
				$clips_count = count( array_filter( $composition['clips'], fn( $clip ) => $clip['included'] ) );
			}

			return (object) [
				'id'          => (int) $o->id,
				'name'        => $o->name,
				'slug'        => $o->slug,
				'url'         => $o->media_id ? Clipisode_Media::get_url( (int) $o->media_id ) : null,
				'preview_url' => $preview_url,
				'clips_count' => $clips_count,
				'file_size'   => $o->file_size ? (int) $o->file_size : null,
				'created_at'  => $o->created_at,
				'has_composition' => null !== $o->composition,
			];
		}, $raw_outputs );

		return $topic;
	}

	public function list_topics( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table     = $wpdb->prefix . 'clipisode_topics';
		$replies_tbl = $wpdb->prefix . 'clipisode_replies';
		$links_tbl = $wpdb->prefix . 'clipisode_invitation_links';

		$topics = $wpdb->get_results( "
			SELECT t.*,
				COALESCE(cl.replies_count, 0) AS replies_count,
				COALESCE(lk.links_count, 0) AS links_count,
				COALESCE(lk.clicks, 0) AS clicks
			FROM $table t
			LEFT JOIN (SELECT topic_id, COUNT(*) AS replies_count FROM $replies_tbl GROUP BY topic_id) cl ON cl.topic_id = t.id
			LEFT JOIN (SELECT topic_id, COUNT(*) AS links_count, SUM(clicks) AS clicks FROM $links_tbl GROUP BY topic_id) lk ON lk.topic_id = t.id
			ORDER BY t.created_at DESC
		" );

		$topics = array_map( [ $this, 'enrich_topic' ], $topics );

		return new WP_REST_Response( $topics );
	}

	public function get_topic( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table     = $wpdb->prefix . 'clipisode_topics';
		$replies_tbl = $wpdb->prefix . 'clipisode_replies';
		$links_tbl = $wpdb->prefix . 'clipisode_invitation_links';

		$id    = (int) $request['id'];
		$topic = $wpdb->get_row( $wpdb->prepare( "
			SELECT t.*,
				COALESCE(cl.replies_count, 0) AS replies_count,
				COALESCE(lk.links_count, 0) AS links_count,
				COALESCE(lk.clicks, 0) AS clicks
			FROM $table t
			LEFT JOIN (SELECT topic_id, COUNT(*) AS replies_count FROM $replies_tbl GROUP BY topic_id) cl ON cl.topic_id = t.id
			LEFT JOIN (SELECT topic_id, COUNT(*) AS links_count, SUM(clicks) AS clicks FROM $links_tbl GROUP BY topic_id) lk ON lk.topic_id = t.id
			WHERE t.id = %d
		", $id ) );

		if ( ! $topic ) {
			return new WP_REST_Response( [ 'message' => 'Topic not found.' ], 404 );
		}

		return new WP_REST_Response( $this->enrich_topic( $topic ) );
	}

	public function create_topic( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_topics';

		$custom_terms_id      = $request->get_param( 'custom_terms_id' );
		$intro_media_id       = $request->get_param( 'intro_media_id' );
		$invitation_id        = $request->get_param( 'invitation_id' );
		$social_image_media_id = $request->get_param( 'social_image_media_id' );
		$brand_terms_id       = Clipisode_Post_Types::ensure_brand_terms();

		$data = [
			'title'                 => sanitize_text_field( $request->get_param( 'title' ) ),
			'intro_media_id'        => $intro_media_id ? (int) $intro_media_id : null,
			'social_image_media_id' => $social_image_media_id ? (int) $social_image_media_id : null,
			'hosted_by'             => sanitize_text_field( $request->get_param( 'hosted_by' ) ?? '' ),
			'brand_terms_id'        => $brand_terms_id,
			'custom_terms_id'       => $custom_terms_id ? (int) $custom_terms_id : null,
			'invitation_id'         => $invitation_id ? (int) $invitation_id : Clipisode_Post_Types::ensure_default_invitation(),
			'status'                => 'active',
		];

		$wpdb->insert( $table, $data );
		$topic_id = $wpdb->insert_id;

		$this->ensure_host( $data['hosted_by'] );

		$wpdb->insert( $wpdb->prefix . 'clipisode_invitation_links', [
			'topic_id' => $topic_id,
			'slug'     => substr( bin2hex( random_bytes( 3 ) ), 0, 6 ),
			'type'     => 'public',
			'status'   => 'open',
		] );

		$get_request = new WP_REST_Request( 'GET' );
		$get_request->set_url_params( [ 'id' => $topic_id ] );
		return $this->get_topic( $get_request );
	}

	public function update_topic( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_topics';
		$id    = (int) $request['id'];

		$fields = [];
		foreach ( [ 'title', 'hosted_by', 'status' ] as $field ) {
			$val = $request->get_param( $field );
			if ( $val !== null ) {
				$fields[ $field ] = sanitize_text_field( $val );
			}
		}
		if ( $request->has_param( 'intro_media_id' ) ) {
			$new_media_id = $request->get_param( 'intro_media_id' );
			$new_media_id = $new_media_id ? (int) $new_media_id : null;

			$old_media_id = (int) $wpdb->get_var( $wpdb->prepare(
				"SELECT intro_media_id FROM $table WHERE id = %d",
				$id
			) );

			if ( $old_media_id && $old_media_id !== $new_media_id ) {
				Clipisode_Media::delete( $old_media_id );
			}

			$fields['intro_media_id'] = $new_media_id;
		}
		if ( $request->has_param( 'social_image_media_id' ) ) {
			$new_si_id = $request->get_param( 'social_image_media_id' );
			$new_si_id = $new_si_id ? (int) $new_si_id : null;

			$old_si_id = (int) $wpdb->get_var( $wpdb->prepare(
				"SELECT social_image_media_id FROM $table WHERE id = %d",
				$id
			) );

			if ( $old_si_id && $old_si_id !== $new_si_id ) {
				Clipisode_Media::delete( $old_si_id );
			}

			$fields['social_image_media_id'] = $new_si_id;
		}
		if ( $request->has_param( 'custom_terms_id' ) ) {
			$custom_terms_id = $request->get_param( 'custom_terms_id' );
			$fields['custom_terms_id'] = $custom_terms_id ? (int) $custom_terms_id : null;
		}
		if ( $request->has_param( 'invitation_id' ) ) {
			$invitation_id = $request->get_param( 'invitation_id' );
			$fields['invitation_id'] = $invitation_id ? (int) $invitation_id : null;
		}

		$wpdb->update( $table, $fields, [ 'id' => $id ] );

		if ( ! empty( $fields['hosted_by'] ) ) {
			$this->ensure_host( $fields['hosted_by'] );
		}

		return $this->get_topic( $request );
	}

	private function ensure_host( string $name ): void {
		if ( ! $name ) {
			return;
		}
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_hosts';
		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE name = %s", $name ) );
		if ( ! $exists ) {
			$wpdb->insert( $table, [ 'name' => $name ] );
		}
	}

	public function delete_topic( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$id = (int) $request['id'];
		if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
			return new WP_REST_Response( [ 'message' => 'The topic could not be deleted.' ], 500 );
		}
		$output_ids = $wpdb->get_col( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}clipisode_outputs WHERE topic_id = %d FOR UPDATE", $id ) );
		foreach ( $output_ids as $output_id ) {
			wp_cache_delete( 'clipisode_render_' . $output_id, 'options' );
			if ( Clipisode_Renderer::is_active( (int) $output_id ) ) {
				$wpdb->query( 'ROLLBACK' );
				return new WP_REST_Response( [ 'message' => 'Wait for this topic’s active renders to finish before deleting it.' ], 409 );
			}
		}
		$referenced = $wpdb->get_var( $wpdb->prepare(
			"SELECT c.output_id FROM {$wpdb->prefix}clipisode_contents c
			INNER JOIN {$wpdb->prefix}clipisode_outputs o ON o.id = c.output_id
			WHERE o.composition IS NOT NULL AND (o.topic_id IS NULL OR o.topic_id != %d)
			AND c.media_id IN (
				SELECT intro_media_id FROM {$wpdb->prefix}clipisode_topics WHERE id = %d
				UNION SELECT social_image_media_id FROM {$wpdb->prefix}clipisode_topics WHERE id = %d
				UNION SELECT media_id FROM {$wpdb->prefix}clipisode_replies WHERE topic_id = %d
				UNION SELECT media_id FROM {$wpdb->prefix}clipisode_outputs WHERE topic_id = %d
			) LIMIT 1",
			$id, $id, $id, $id, $id
		) );
		if ( $referenced ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'This topic contains a video used by another saved composition. Remove that video from the composition before deleting this topic.' ], 409 );
		}

		$topic_row = $wpdb->get_row( $wpdb->prepare(
			"SELECT intro_media_id, social_image_media_id FROM {$wpdb->prefix}clipisode_topics WHERE id = %d",
			$id
		) );
		$topic_media_ids = $topic_row ? [ $topic_row->intro_media_id, $topic_row->social_image_media_id ] : [];

		$output_media_ids = $wpdb->get_col( $wpdb->prepare(
			"SELECT media_id FROM {$wpdb->prefix}clipisode_outputs WHERE topic_id = %d AND media_id IS NOT NULL",
			$id
		) );

		$reply_media_ids = $wpdb->get_col( $wpdb->prepare(
			"SELECT media_id FROM {$wpdb->prefix}clipisode_replies WHERE topic_id = %d AND media_id IS NOT NULL",
			$id
		) );

		$deleted = $wpdb->query( $wpdb->prepare(
			"DELETE c FROM {$wpdb->prefix}clipisode_contents c INNER JOIN {$wpdb->prefix}clipisode_outputs o ON o.id = c.output_id WHERE o.topic_id = %d",
			$id
		) );
		if ( false === $deleted
			|| false === $wpdb->delete( $wpdb->prefix . 'clipisode_outputs', [ 'topic_id' => $id ] )
			|| false === $wpdb->delete( $wpdb->prefix . 'clipisode_replies', [ 'topic_id' => $id ] )
			|| false === $wpdb->delete( $wpdb->prefix . 'clipisode_invitation_links', [ 'topic_id' => $id ] )
			|| false === $wpdb->delete( $wpdb->prefix . 'clipisode_topics', [ 'id' => $id ] )
			|| false === $wpdb->query( 'COMMIT' ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'The topic could not be deleted.' ], 500 );
		}
		foreach ( $output_ids as $output_id ) {
			Clipisode_Renderer::forget( (int) $output_id );
		}
		$media_ids = array_unique( array_filter( array_merge( $topic_media_ids, $output_media_ids, $reply_media_ids ) ) );
		foreach ( $media_ids as $media_id ) {
			if ( ! $this->media_is_referenced( (int) $media_id ) ) {
				Clipisode_Media::delete( (int) $media_id );
			}
		}
		return new WP_REST_Response( null, 204 );
	}

	// --- Outputs ---

	private function generate_unique_slug( string $base ): string {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_outputs';
		$slug  = sanitize_title( $base );

		if ( ! $slug ) {
			$slug = 'output';
		}

		$existing = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM $table WHERE slug = %s",
			$slug
		) );

		if ( ! $existing ) {
			return $slug;
		}

		$i = 1;
		while ( $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM $table WHERE slug = %s",
			$slug . '-' . $i
		) ) ) {
			$i++;
		}

		return $slug . '-' . $i;
	}

	public function list_outputs( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$rows = $wpdb->get_results(
			"SELECT id, name, topic_id, slug, created_at, composition FROM {$wpdb->prefix}clipisode_outputs WHERE composition IS NOT NULL ORDER BY created_at DESC, id DESC"
		);
		$outputs = array_map( function ( $row ) {
			$composition = json_decode( $row->composition, true );
			return [
				'id'              => (int) $row->id,
				'name'            => $row->name,
				'topic_id'        => $row->topic_id ? (int) $row->topic_id : null,
				'slug'            => $row->slug,
				'created_at'      => $row->created_at,
				'clips_count'     => count( array_filter( $composition['clips'], fn( $clip ) => $clip['included'] ) ),
				'has_composition' => true,
			];
		}, $rows );
		return new WP_REST_Response( $outputs );
	}

	public function get_output( WP_REST_Request $request ): WP_REST_Response {
		return $this->output_response( (int) $request['id'] );
	}

	private function output_response( int $id, int $status = 200 ): WP_REST_Response {
		global $wpdb;
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d", $id ) );
		if ( ! $output ) {
			return new WP_REST_Response( [ 'message' => 'Output not found.' ], 404 );
		}
		$composition = null !== $output->composition ? Clipisode_Composition::resolve( $output->composition ) : null;
		if ( is_wp_error( $composition ) ) {
			return new WP_REST_Response( [ 'message' => $composition->get_error_message() ], 409 );
		}
		return new WP_REST_Response( [
			'id'          => (int) $output->id,
			'name'        => $output->name,
			'topic_id'    => $output->topic_id ? (int) $output->topic_id : null,
			'slug'        => $output->slug,
			'created_at'  => $output->created_at,
			'composition' => $composition,
			'composition_hash' => null !== $output->composition ? hash( 'sha256', $output->composition ) : null,
			'url'         => $output->media_id ? Clipisode_Media::get_url( (int) $output->media_id ) : null,
		], $status );
	}

	public function create_output( WP_REST_Request $request ): WP_REST_Response {
		return $this->save_composition( $request );
	}

	public function update_output( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$id = (int) $request['id'];
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d", $id ) );
		if ( ! $output ) {
			return new WP_REST_Response( [ 'message' => 'Output not found.' ], 404 );
		}
		if ( null === $output->composition ) {
			return new WP_REST_Response( [ 'message' => 'This output does not have an editable composition.' ], 409 );
		}
		return $this->save_composition( $request, $id );
	}

	private function save_composition( WP_REST_Request $request, ?int $id = null ): WP_REST_Response {
		global $wpdb;
		$name = $request->get_param( 'name' );
		if ( ! is_string( $name ) || ! trim( sanitize_text_field( $name ) ) ) {
			return new WP_REST_Response( [ 'message' => 'Name is required.' ], 400 );
		}
		$name = sanitize_text_field( $name );
		$topic_id = $request->get_param( 'topic_id' );
		if ( null !== $topic_id && ( ! is_int( $topic_id ) || $topic_id <= 0 || ! $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}clipisode_topics WHERE id = %d", $topic_id ) ) ) ) {
			return new WP_REST_Response( [ 'message' => 'Topic not found.' ], 400 );
		}
		$composition = Clipisode_Composition::sanitize( $request->get_param( 'composition' ) );
		if ( is_wp_error( $composition ) ) {
			return new WP_REST_Response( [ 'message' => $composition->get_error_message() ], 400 );
		}
		$data = [
			'name'        => $name,
			'topic_id'    => $topic_id,
			'composition' => wp_json_encode( $composition ),
		];
		$creating = null === $id;
		if ( $creating ) {
			$data['slug'] = $this->generate_unique_slug( $name );
		}

		// The composition and its source references must change together.
		if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
			return new WP_REST_Response( [ 'message' => 'The composition could not be saved.' ], 500 );
		}
		if ( ! $creating && ! $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d FOR UPDATE", $id
		) ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'Output not found.' ], 404 );
		}
		if ( ! $creating && Clipisode_Renderer::is_active( $id ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'Wait for the active render to finish before saving changes.' ], 409 );
		}
		$result = $creating
			? $wpdb->insert( $wpdb->prefix . 'clipisode_outputs', $data )
			: $wpdb->update( $wpdb->prefix . 'clipisode_outputs', $data, [ 'id' => $id ] );
		if ( $creating ) {
			$id = (int) $wpdb->insert_id;
		}
		if ( false === $result || ! $this->replace_composition_contents( $id, $composition['clips'] ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'The composition could not be saved.' ], 500 );
		}
		if ( false === $wpdb->query( 'COMMIT' ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'The composition could not be saved.' ], 500 );
		}
		return $this->output_response( $id, $creating ? 201 : 200 );
	}

	private function replace_composition_contents( int $output_id, array $clips ): bool {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_contents';
		if ( false === $wpdb->delete( $table, [ 'output_id' => $output_id ] ) ) {
			return false;
		}
		foreach ( $clips as $position => $clip ) {
			if ( false === $wpdb->insert( $table, [
				'output_id'  => $output_id,
				'media_id'   => $clip['mediaId'],
				'position'   => $position,
				'role'       => $clip['role'],
				'trim_start' => $clip['trimStart'],
				'trim_end'   => $clip['trimEnd'],
				'duration'   => $clip['duration'],
			] ) ) {
				return false;
			}
		}
		return true;
	}

	public function delete_output( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_outputs';
		$id    = (int) $request['id'];
		if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
			return new WP_REST_Response( [ 'message' => 'The Clipisode could not be deleted.' ], 500 );
		}
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d FOR UPDATE", $id ) );
		if ( ! $output ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'Output not found.' ], 404 );
		}
		wp_cache_delete( 'clipisode_render_' . $id, 'options' );
		if ( Clipisode_Renderer::is_active( $id ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'Wait for the active render to finish before deleting this Clipisode.' ], 409 );
		}
		if ( $output->media_id && $this->composition_uses_media( (int) $output->media_id ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'This output is used by a saved composition. Remove it from the composition before deleting it.' ], 409 );
		}
		if ( false === $wpdb->delete( $wpdb->prefix . 'clipisode_contents', [ 'output_id' => $id ] ) || false === $wpdb->delete( $table, [ 'id' => $id ] ) || false === $wpdb->query( 'COMMIT' ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'The Clipisode could not be deleted.' ], 500 );
		}
		Clipisode_Renderer::forget( $id );
		if ( $output->media_id && ! $this->media_is_referenced( (int) $output->media_id ) ) {
			Clipisode_Media::delete( (int) $output->media_id );
		}
		return new WP_REST_Response( null, 204 );
	}

	public function render_output( WP_REST_Request $request ): WP_REST_Response {
		return Clipisode_Renderer::start( (int) $request['id'] );
	}

	public function get_output_render( WP_REST_Request $request ): WP_REST_Response {
		return Clipisode_Renderer::status( (int) $request['id'] );
	}

	public function upload_output( WP_REST_Request $request ): WP_REST_Response {
		return $this->receive_render_upload( $request, false );
	}

	public function upload_browser_output( WP_REST_Request $request ): WP_REST_Response {
		return $this->receive_render_upload( $request, true );
	}

	private function receive_render_upload( WP_REST_Request $request, bool $browser ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_outputs';
		$id    = (int) $request['id'];
		if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
			return new WP_REST_Response( [ 'message' => 'The render upload could not be saved.' ], 500 );
		}
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d FOR UPDATE", $id ) );
		if ( ! $output ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'Output not found.' ], 404 );
		}
		wp_cache_delete( 'clipisode_render_' . $id, 'options' );
		if ( $browser ) {
			$hash = $request->get_param( 'composition_hash' );
			if ( ! is_string( $hash ) || ! preg_match( '/^[a-f0-9]{64}$/', $hash ) ) {
				$wpdb->query( 'ROLLBACK' );
				return new WP_REST_Response( [ 'message' => 'A saved composition hash is required.' ], 400 );
			}
			$hash = sanitize_text_field( $hash );
			if ( Clipisode_Renderer::is_active( $id ) ) {
				$wpdb->query( 'ROLLBACK' );
				return new WP_REST_Response( [ 'message' => 'Wait for the active server render to finish before uploading a browser export.' ], 409 );
			}
			if ( null === $output->composition || ! hash_equals( hash( 'sha256', $output->composition ), $hash ) ) {
				$wpdb->query( 'ROLLBACK' );
				return new WP_REST_Response( [ 'message' => 'The saved composition changed during export. Export the saved composition again.' ], 409 );
			}
		} else {
			$token = sanitize_text_field( $request->get_param( 'token' ) );
			if ( ! $token || ! $output->upload_token || ! hash_equals( $output->upload_token, $token ) ) {
				$wpdb->query( 'ROLLBACK' );
				return new WP_REST_Response( [ 'message' => 'Invalid upload token.' ], 403 );
			}
			$error = Clipisode_Renderer::validate_upload( $output );
			if ( is_wp_error( $error ) ) {
				$wpdb->query( 'ROLLBACK' );
				return new WP_REST_Response( [ 'message' => $error->get_error_message() ], 409 );
			}
		}
		$files = $request->get_file_params();
		if ( empty( $files['video'] ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => 'No video file provided.' ], 400 );
		}
		$result = Clipisode_Media::create( 'video', 'clipisode' );
		if ( is_wp_error( $result ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
		}
		$saved = $wpdb->update( $table, [
			'media_id'     => $result['id'],
			'upload_token' => null,
		], [ 'id' => $id ] );
		if ( false === $saved || ! ( $browser ? Clipisode_Renderer::complete_browser( $id, $hash ) : Clipisode_Renderer::complete( $id ) ) ) {
			Clipisode_Media::delete( (int) $result['id'] );
			$wpdb->query( 'ROLLBACK' );
			wp_cache_delete( 'clipisode_render_' . $id, 'options' );
			return new WP_REST_Response( [ 'message' => 'The rendered video could not be saved.' ], 500 );
		}
		if ( false === $wpdb->query( 'COMMIT' ) ) {
			Clipisode_Media::delete( (int) $result['id'] );
			$wpdb->query( 'ROLLBACK' );
			wp_cache_delete( 'clipisode_render_' . $id, 'options' );
			return new WP_REST_Response( [ 'message' => 'The rendered video could not be saved.' ], 500 );
		}
		if ( $output->media_id && ! $this->media_is_referenced( (int) $output->media_id ) ) {
			Clipisode_Media::delete( (int) $output->media_id );
		}
		return new WP_REST_Response( [ 'id' => $result['id'], 'url' => $result['url'] ] );
	}

	private function media_is_referenced( int $media_id ): bool {
		global $wpdb;
		return (bool) $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$wpdb->prefix}clipisode_outputs WHERE media_id = %d
			UNION SELECT id FROM {$wpdb->prefix}clipisode_contents WHERE media_id = %d
			UNION SELECT id FROM {$wpdb->prefix}clipisode_replies WHERE media_id = %d
			UNION SELECT id FROM {$wpdb->prefix}clipisode_topics WHERE intro_media_id = %d OR social_image_media_id = %d LIMIT 1",
			$media_id, $media_id, $media_id, $media_id, $media_id
		) );
	}

	// --- Output Contents ---

	public function get_output_contents( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_contents';
		$id    = (int) $request['id'];

		$rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table WHERE output_id = %d ORDER BY position ASC", $id
		) );

		return new WP_REST_Response( $rows );
	}

	public function create_output_contents( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_contents';
		$id    = (int) $request['id'];
		if ( $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d AND composition IS NOT NULL", $id
		) ) ) {
			return new WP_REST_Response( [ 'message' => 'Save the composition to update its source clips.' ], 409 );
		}

		$contents = $request->get_param( 'contents' );
		if ( ! is_array( $contents ) || empty( $contents ) ) {
			return new WP_REST_Response( [ 'message' => 'Contents array is required.' ], 400 );
		}

		foreach ( $contents as $item ) {
			$wpdb->insert( $table, [
				'output_id'  => $id,
				'media_id'   => (int) $item['media_id'],
				'position'   => (int) $item['position'],
				'role'       => sanitize_text_field( $item['role'] ),
				'trim_start' => (float) $item['trim_start'],
				'trim_end'   => (float) $item['trim_end'],
				'duration'   => (float) $item['duration'],
			] );
		}

		return $this->get_output_contents( $request );
	}

	// --- Invitation Links ---

	public function list_invitation_links( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table     = $wpdb->prefix . 'clipisode_invitation_links';
		$replies_tbl = $wpdb->prefix . 'clipisode_replies';
		$topic_id  = (int) $request['topic_id'];

		$links = $wpdb->get_results( $wpdb->prepare( "
			SELECT l.*, COALESCE(cl.replies_count, 0) AS replies_count
			FROM $table l
			LEFT JOIN (SELECT invitation_link_id, COUNT(*) AS replies_count FROM $replies_tbl GROUP BY invitation_link_id) cl ON cl.invitation_link_id = l.id
			WHERE l.topic_id = %d
			ORDER BY l.created_at DESC
		", $topic_id ) );

		return new WP_REST_Response( $links );
	}

	public function create_invitation_link( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_invitation_links';

		$attempts = 5;
		$result   = false;

		while ( $attempts-- > 0 ) {
			$slug   = substr( bin2hex( random_bytes( 3 ) ), 0, 6 );
			$result = $wpdb->insert( $table, [
				'topic_id' => (int) $request['topic_id'],
				'slug'     => $slug,
				'type'     => 'public',
				'status'   => 'open',
			] );
			if ( $result !== false ) {
				break;
			}
		}

		if ( $result === false ) {
			return new WP_REST_Response( [ 'message' => 'Failed to generate a unique slug.' ], 500 );
		}

		$link = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $wpdb->insert_id ) );
		$link->replies_count = 0;
		return new WP_REST_Response( $link, 201 );
	}

	public function update_invitation_link( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_invitation_links';
		$id    = (int) $request['id'];

		$fields = [];
		if ( $request->get_param( 'status' ) !== null ) {
			$fields['status'] = sanitize_text_field( $request->get_param( 'status' ) );
		}

		if ( $request->get_param( 'slug' ) !== null ) {
			$new_slug = sanitize_text_field( $request->get_param( 'slug' ) );
			if ( ! preg_match( '/^[a-zA-Z0-9]{1,20}$/', $new_slug ) ) {
				return new WP_REST_Response( [ 'message' => 'Slug must be 1–20 alphanumeric characters.' ], 400 );
			}
			$existing = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $table WHERE slug = %s AND id != %d", $new_slug, $id
			) );
			if ( $existing ) {
				return new WP_REST_Response( [ 'message' => 'That slug is already in use.' ], 409 );
			}
			$fields['slug'] = $new_slug;
		}

		if ( ! empty( $fields ) ) {
			$wpdb->update( $table, $fields, [ 'id' => $id ] );
		}

		$replies_tbl = $wpdb->prefix . 'clipisode_replies';
		$link = $wpdb->get_row( $wpdb->prepare(
			"SELECT l.*, COALESCE(cl.replies_count, 0) AS replies_count
			 FROM $table l
			 LEFT JOIN (SELECT invitation_link_id, COUNT(*) AS replies_count FROM $replies_tbl GROUP BY invitation_link_id) cl ON cl.invitation_link_id = l.id
			 WHERE l.id = %d", $id
		) );
		return new WP_REST_Response( $link );
	}

	public function delete_invitation_link( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$id = (int) $request['id'];
		$wpdb->delete( $wpdb->prefix . 'clipisode_invitation_links', [ 'id' => $id ] );
		return new WP_REST_Response( null, 204 );
	}

	// --- Replies ---

	public function list_replies( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table     = $wpdb->prefix . 'clipisode_replies';
		$topic_tbl = $wpdb->prefix . 'clipisode_topics';
		$media_tbl = $wpdb->prefix . 'clipisode_media';

		$where  = [];
		$values = [];

		$topic_id = $request->get_param( 'topic_id' );
		if ( $topic_id ) {
			$where[]  = 'cl.topic_id = %d';
			$values[] = (int) $topic_id;
		}

		$status = $request->get_param( 'status' );
		if ( $status ) {
			$where[]  = 'cl.status = %s';
			$values[] = sanitize_text_field( $status );
		}

		$tag = $request->get_param( 'tag' );
		if ( $tag ) {
			$where[]  = 'cl.tag = %s';
			$values[] = sanitize_text_field( $tag );
		}

		$where_sql = $where ? 'WHERE ' . implode( ' AND ', $where ) : '';

		$order = $request->get_param( 'order' ) === 'asc' ? 'ASC' : 'DESC';

		$query = "
			SELECT cl.*, t.title AS topic_title
			FROM $table cl
			LEFT JOIN $topic_tbl t ON t.id = cl.topic_id
			$where_sql
			ORDER BY cl.created_at $order
		";

		if ( $values ) {
			$query = $wpdb->prepare( $query, ...$values );
		}

		$replies = $wpdb->get_results( $query );

		foreach ( $replies as $reply ) {
			$reply->video_url = $reply->media_id
				? Clipisode_Media::get_url( (int) $reply->media_id )
				: null;
			$reply->video_filename = $reply->media_id
				? Clipisode_Media::get_filename( (int) $reply->media_id )
				: null;
		}

		return new WP_REST_Response( $replies );
	}

	public function get_reply( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table     = $wpdb->prefix . 'clipisode_replies';
		$topic_tbl = $wpdb->prefix . 'clipisode_topics';
		$id        = (int) $request['id'];

		$reply = $wpdb->get_row( $wpdb->prepare( "
			SELECT cl.*, t.title AS topic_title
			FROM $table cl
			LEFT JOIN $topic_tbl t ON t.id = cl.topic_id
			WHERE cl.id = %d
		", $id ) );

		if ( ! $reply ) {
			return new WP_REST_Response( [ 'message' => 'Reply not found.' ], 404 );
		}

		$reply->video_url = $reply->media_id
			? Clipisode_Media::get_url( (int) $reply->media_id )
			: null;

		$reply->video_filename = $reply->media_id
			? Clipisode_Media::get_filename( (int) $reply->media_id )
			: null;

		return new WP_REST_Response( $reply );
	}

	public function update_reply( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_replies';
		$id    = (int) $request['id'];

		$fields = [];
		foreach ( [ 'name', 'social_handle', 'social_network', 'tag', 'status' ] as $field ) {
			$val = $request->get_param( $field );
			if ( $val !== null ) {
				$fields[ $field ] = sanitize_text_field( $val );
			}
		}

		$wpdb->update( $table, $fields, [ 'id' => $id ] );

		return $this->get_reply( $request );
	}

	// --- Videos ---

	public function upload_video( WP_REST_Request $request ): WP_REST_Response {
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

		$result = Clipisode_Media::create( 'video', 'intro' );
		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
		}

		return new WP_REST_Response( $result );
	}

	public function sideload_video( WP_REST_Request $request ): WP_REST_Response {
		require_once ABSPATH . 'wp-admin/includes/file.php';

		$url = esc_url_raw( $request->get_param( 'url' ) );
		if ( ! $url ) {
			return new WP_REST_Response( [ 'message' => 'No URL provided.' ], 400 );
		}

		$tmp = download_url( $url );
		if ( is_wp_error( $tmp ) ) {
			return new WP_REST_Response( [
				'message' => 'Failed to download video: ' . $tmp->get_error_message(),
			], 400 );
		}

		$file_array = [
			'name'     => basename( wp_parse_url( $url, PHP_URL_PATH ) ) ?: 'video.mp4',
			'tmp_name' => $tmp,
		];

		$result = Clipisode_Media::create_from_sideload( 'video', 'intro', $file_array );
		if ( is_wp_error( $result ) ) {
			@unlink( $tmp );
			return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
		}

		return new WP_REST_Response( $result );
	}

	public function delete_video( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$id = (int) $request['id'];
		if ( $this->composition_uses_media( $id ) ) {
			return new WP_REST_Response( [ 'message' => 'This video is used by a saved composition. Remove it from the composition before deleting it.' ], 409 );
		}

		$exists = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM {$wpdb->prefix}clipisode_media WHERE id = %d", $id
		) );

		if ( ! $exists ) {
			return new WP_REST_Response( [ 'message' => 'Not a Clipisode-managed video.' ], 403 );
		}

		Clipisode_Media::delete( $id );

		return new WP_REST_Response( null, 204 );
	}

	// --- Media ---

	public function list_media( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$media_tbl   = $wpdb->prefix . 'clipisode_media';
		$topics_tbl  = $wpdb->prefix . 'clipisode_topics';
		$outputs_tbl = $wpdb->prefix . 'clipisode_outputs';
		$replies_tbl = $wpdb->prefix . 'clipisode_replies';

		$where  = [];
		$values = [];

		$type = $request->get_param( 'type' );
		if ( $type ) {
			$where[]  = 'm.type = %s';
			$values[] = sanitize_text_field( $type );
		}

		$label = $request->get_param( 'label' );
		if ( $label ) {
			$where[]  = 'm.label = %s';
			$values[] = sanitize_text_field( $label );
		}

		$exclude_label = $request->get_param( 'exclude_label' );
		if ( $exclude_label ) {
			$where[]  = 'm.label != %s';
			$values[] = sanitize_text_field( $exclude_label );
		}

		$ids = $request->get_param( 'ids' );
		if ( $ids ) {
			$id_list  = array_map( 'intval', explode( ',', $ids ) );
			$placeholders = implode( ',', array_fill( 0, count( $id_list ), '%d' ) );
			$where[]  = "m.id IN ($placeholders)";
			$values   = array_merge( $values, $id_list );
		}

		$where_sql = $where ? 'WHERE ' . implode( ' AND ', $where ) : '';

		$query = "
			SELECT m.*,
				(SELECT COUNT(*) FROM $media_tbl c WHERE c.parent_id = m.id) AS children_count
			FROM $media_tbl m
			$where_sql
			ORDER BY m.created_at DESC
		";

		if ( $values ) {
			$query = $wpdb->prepare( $query, ...$values );
		}

		$rows = $wpdb->get_results( $query );

		foreach ( $rows as $row ) {
			$row->url = ( $row->storage === 'local' && $row->attachment_id )
				? wp_get_attachment_url( (int) $row->attachment_id )
				: null;

			$row->used_by = $this->resolve_media_usage( (int) $row->id );
		}

		return new WP_REST_Response( $rows );
	}

	public function upload_media_asset( WP_REST_Request $request ): WP_REST_Response {
		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new WP_REST_Response( [ 'message' => 'No file provided.' ], 400 );
		}

		$file      = $files['file'];
		$mime      = $file['type'] ?? '';
		$mime_map  = [
			'video/' => 'video',
			'image/' => 'photo',
			'audio/' => 'audio',
		];

		$type = null;
		foreach ( $mime_map as $prefix => $media_type ) {
			if ( strpos( $mime, $prefix ) === 0 ) {
				$type = $media_type;
				break;
			}
		}

		if ( ! $type ) {
			return new WP_REST_Response( [ 'message' => 'Unsupported file type.' ], 400 );
		}

		$result = Clipisode_Media::create( $type, 'asset', 'file' );
		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response( [ 'message' => $result->get_error_message() ], 400 );
		}

		return new WP_REST_Response( $result, 201 );
	}

	public function delete_media_asset( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$id    = (int) $request['id'];
		$table = $wpdb->prefix . 'clipisode_media';
		if ( $this->composition_uses_media( $id ) ) {
			return new WP_REST_Response( [ 'message' => 'This video is used by a saved composition. Remove it from the composition before deleting it.' ], 409 );
		}

		$media = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		if ( ! $media ) {
			return new WP_REST_Response( [ 'message' => 'Media not found.' ], 404 );
		}

		if ( $media->label !== 'asset' ) {
			return new WP_REST_Response( [ 'message' => 'Only manually uploaded assets can be deleted from this page.' ], 403 );
		}

		Clipisode_Media::delete( $id );

		return new WP_REST_Response( null, 204 );
	}

	private function composition_uses_media( int $media_id ): bool {
		global $wpdb;
		return (bool) $wpdb->get_var( $wpdb->prepare(
			"SELECT c.output_id FROM {$wpdb->prefix}clipisode_contents c INNER JOIN {$wpdb->prefix}clipisode_outputs o ON o.id = c.output_id WHERE c.media_id = %d AND o.composition IS NOT NULL LIMIT 1",
			$media_id
		) );
	}

	private function resolve_media_usage( int $media_id ): ?array {
		global $wpdb;

		$topic = $wpdb->get_row( $wpdb->prepare(
			"SELECT id, title FROM {$wpdb->prefix}clipisode_topics WHERE intro_media_id = %d OR social_image_media_id = %d",
			$media_id, $media_id
		) );
		if ( $topic ) {
			return [
				'type'  => 'topic',
				'id'    => (int) $topic->id,
				'label' => $topic->title,
				'page'  => 'clipisode',
			];
		}

		$output = $wpdb->get_row( $wpdb->prepare(
			"SELECT o.id, o.name, o.slug, o.media_id, o.topic_id, t.title AS topic_title,
				COALESCE(c.clips_count, 0) AS clips_count
			 FROM {$wpdb->prefix}clipisode_outputs o
			 LEFT JOIN {$wpdb->prefix}clipisode_topics t ON t.id = o.topic_id
			 LEFT JOIN (
				SELECT output_id, COUNT(*) AS clips_count
				FROM {$wpdb->prefix}clipisode_contents
				GROUP BY output_id
			 ) c ON c.output_id = o.id
			 WHERE o.media_id = %d",
			$media_id
		) );
		if ( $output ) {
			return [
				'type'        => 'output',
				'id'          => (int) $output->id,
				'label'       => $output->name,
				'preview_url' => Clipisode_Preview::get_url( (int) $output->id, $output->media_id ? (int) $output->media_id : null, $output->slug ),
				'topic_id'    => $output->topic_id ? (int) $output->topic_id : null,
				'topic_title' => $output->topic_title,
				'clips_count' => (int) $output->clips_count,
				'page'        => 'clipisode',
			];
		}

		$reply = $wpdb->get_row( $wpdb->prepare(
			"SELECT r.id, r.name, r.topic_id, t.title AS topic_title
			 FROM {$wpdb->prefix}clipisode_replies r
			 LEFT JOIN {$wpdb->prefix}clipisode_topics t ON t.id = r.topic_id
			 WHERE r.media_id = %d",
			$media_id
		) );
		if ( $reply ) {
			return [
				'type'        => 'reply',
				'id'          => (int) $reply->id,
				'label'       => $reply->name,
				'topic_id'    => $reply->topic_id ? (int) $reply->topic_id : null,
				'topic_title' => $reply->topic_title,
				'page'        => 'clipisode-replies',
			];
		}

		return null;
	}

	// --- Themes (CPT) ---

	public function list_themes( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$topics_table = $wpdb->prefix . 'clipisode_topics';

		Clipisode_Post_Types::ensure_default_invitation();

		$posts = get_posts( [
			'post_type'   => 'clipisode_invite',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'date',
			'order'       => 'ASC',
		] );

		$invitations = array_map( function ( $post ) use ( $wpdb, $topics_table ) {
			$topic_count = (int) $wpdb->get_var( $wpdb->prepare(
				"SELECT COUNT(*) FROM $topics_table WHERE invitation_id = %d",
				$post->ID
			) );
			$is_default = (bool) get_post_meta( $post->ID, Clipisode_Post_Types::DEFAULT_INVITATION_META, true );

			return [
				'id'          => $post->ID,
				'title'       => $post->post_title,
				'edit_url'    => get_edit_post_link( $post->ID, 'raw' ),
				'topic_count' => $topic_count,
				'is_default'  => $is_default,
				'renderer_theme' => Clipisode_Post_Types::invitation_renderer_theme( (int) $post->ID ),
				'created_at'  => $post->post_date,
			];
		}, $posts );

		return new WP_REST_Response( $invitations );
	}

	public function clone_theme( WP_REST_Request $request ): WP_REST_Response {
		$source_id = $request->get_param( 'source_id' );
		$title     = sanitize_text_field( $request->get_param( 'title' ) );
		$requested_renderer_theme = sanitize_key( (string) $request->get_param( 'renderer_theme' ) );

		if ( ! $source_id ) {
			$source_id = Clipisode_Post_Types::ensure_default_invitation();
		}

		$source = get_post( (int) $source_id );
		if ( ! $source || $source->post_type !== 'clipisode_invite' ) {
			return new WP_REST_Response( [ 'message' => 'Source theme not found.' ], 404 );
		}

		$new_id = wp_insert_post( [
			'post_type'    => 'clipisode_invite',
			'post_title'   => $title ?: $source->post_title . ' (Copy)',
			'post_content' => $source->post_content,
			'post_status'  => 'publish',
		] );

		if ( is_wp_error( $new_id ) ) {
			return new WP_REST_Response( [ 'message' => $new_id->get_error_message() ], 400 );
		}

		if ( $requested_renderer_theme !== '' ) {
			$renderer_theme = Clipisode_Post_Types::resolve_renderer_theme_slug(
				$requested_renderer_theme,
				(int) $new_id
			);
		} else {
			$source_renderer_theme = Clipisode_Post_Types::invitation_renderer_theme( (int) $source_id );
			$guessed_renderer_theme = Clipisode_Post_Types::resolve_renderer_theme_slug( '', (int) $new_id );
			$renderer_theme = ( $source_renderer_theme === 'default' && $guessed_renderer_theme !== 'default' )
				? $guessed_renderer_theme
				: Clipisode_Post_Types::resolve_renderer_theme_slug( $source_renderer_theme, (int) $new_id );
		}
		update_post_meta( (int) $new_id, Clipisode_Post_Types::RENDERER_THEME_META, $renderer_theme );

		$cloned_screens = $this->clone_theme_screens( (int) $source_id, (int) $new_id );

		return new WP_REST_Response( [
			'id'       => $new_id,
			'title'    => get_the_title( $new_id ),
			'edit_url' => get_edit_post_link( $new_id, 'raw' ),
			'renderer_theme' => $renderer_theme,
			'screens'  => $cloned_screens,
		], 201 );
	}

	public function delete_theme( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$id = (int) $request['id'];

		$is_default = get_post_meta( $id, Clipisode_Post_Types::DEFAULT_INVITATION_META, true );
		if ( $is_default ) {
			return new WP_REST_Response( [ 'message' => 'Cannot delete the default theme.' ], 403 );
		}

		$topics_table = $wpdb->prefix . 'clipisode_topics';
		$in_use = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM $topics_table WHERE invitation_id = %d",
			$id
		) );

		if ( $in_use > 0 ) {
			return new WP_REST_Response( [
				'message' => "Cannot delete: $in_use topic(s) still use this theme.",
			], 409 );
		}

		// Remove child screens first so they don't become orphans in the DB.
		$this->delete_theme_screens( $id );

		wp_delete_post( $id, true );

		return new WP_REST_Response( null, 204 );
	}

	/**
	 * Clones every clipisode_screen child of the source theme into the destination theme.
	 *
	 * Calls seed_default_screens() on the source first so themes that pre-date the
	 * screen-CPT refactor get auto-upgraded with their 10 screens before being copied.
	 *
	 * Returns a [screen_type => new_screen_id] map.
	 */
	private function clone_theme_screens( int $source_theme_id, int $dest_theme_id ): array {
		$result = [];

		Clipisode_Post_Types::seed_default_screens( $source_theme_id );

		foreach ( Clipisode_Post_Types::SCREEN_TYPES as $screen_type ) {
			$source_screen_id = Clipisode_Post_Types::get_screen_post( $source_theme_id, $screen_type );
			if ( ! $source_screen_id ) {
				continue;
			}

			$source_screen = get_post( $source_screen_id );
			if ( ! $source_screen ) {
				continue;
			}

			$new_screen_id = wp_insert_post( [
				'post_type'    => 'clipisode_screen',
				'post_parent'  => $dest_theme_id,
				'post_title'   => $source_screen->post_title,
				'post_content' => $source_screen->post_content,
				'post_status'  => 'publish',
			] );

			if ( is_wp_error( $new_screen_id ) || ! $new_screen_id ) {
				continue;
			}

			update_post_meta( $new_screen_id, Clipisode_Post_Types::SCREEN_TYPE_META, $screen_type );

			$redirect = get_post_meta( $source_screen_id, Clipisode_Post_Types::SCREEN_REDIRECT_META, true );
			if ( $redirect !== '' ) {
				update_post_meta( $new_screen_id, Clipisode_Post_Types::SCREEN_REDIRECT_META, $redirect );
			}

			$result[ $screen_type ] = (int) $new_screen_id;
		}

		return $result;
	}

	/**
	 * Force-deletes every clipisode_screen child of the given theme.
	 *
	 * Returns the count of screens deleted. Used by delete_theme() to keep the DB
	 * clean of orphan screens whose parent theme no longer exists.
	 */
	private function delete_theme_screens( int $theme_id ): int {
		$screen_ids = get_posts( [
			'post_type'      => 'clipisode_screen',
			'post_status'    => 'any',
			'post_parent'    => $theme_id,
			'posts_per_page' => -1,
			'fields'         => 'ids',
		] );

		$count = 0;
		foreach ( $screen_ids as $screen_id ) {
			if ( wp_delete_post( (int) $screen_id, true ) ) {
				$count++;
			}
		}

		return $count;
	}

	// --- Preview Layouts ---

	public function list_preview_layouts( WP_REST_Request $request ): WP_REST_Response {
		Clipisode_Post_Types::ensure_default_preview();

		$posts = get_posts( [
			'post_type'   => 'clipisode_preview',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'date',
			'order'       => 'ASC',
		] );

		$layouts = array_map( function ( $post ) {
			$is_default = (bool) get_post_meta( $post->ID, Clipisode_Post_Types::DEFAULT_PREVIEW_META, true );

			return [
				'id'         => $post->ID,
				'title'      => $post->post_title,
				'edit_url'   => get_edit_post_link( $post->ID, 'raw' ),
				'is_default' => $is_default,
				'created_at' => $post->post_date,
			];
		}, $posts );

		return new WP_REST_Response( $layouts );
	}

	public function clone_preview_layout( WP_REST_Request $request ): WP_REST_Response {
		$source_id = $request->get_param( 'source_id' );
		$title     = sanitize_text_field( $request->get_param( 'title' ) );

		if ( ! $source_id ) {
			$source_id = Clipisode_Post_Types::ensure_default_preview();
		}

		$source = get_post( (int) $source_id );
		if ( ! $source || $source->post_type !== 'clipisode_preview' ) {
			return new WP_REST_Response( [ 'message' => 'Source layout not found.' ], 404 );
		}

		$new_id = wp_insert_post( [
			'post_type'    => 'clipisode_preview',
			'post_title'   => $title ?: $source->post_title . ' (Copy)',
			'post_content' => $source->post_content,
			'post_status'  => 'publish',
		] );

		if ( is_wp_error( $new_id ) ) {
			return new WP_REST_Response( [ 'message' => $new_id->get_error_message() ], 400 );
		}

		return new WP_REST_Response( [
			'id'       => $new_id,
			'title'    => get_the_title( $new_id ),
			'edit_url' => get_edit_post_link( $new_id, 'raw' ),
		], 201 );
	}

	public function delete_preview_layout( WP_REST_Request $request ): WP_REST_Response {
		$id = (int) $request['id'];

		$is_default = get_post_meta( $id, Clipisode_Post_Types::DEFAULT_PREVIEW_META, true );
		if ( $is_default ) {
			return new WP_REST_Response( [ 'message' => 'Cannot delete the default preview layout.' ], 403 );
		}

		wp_delete_post( $id, true );

		return new WP_REST_Response( null, 204 );
	}
}
