<?php
/**
 * Ideation Sources REST API Controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Ideation\Assistants\IdeationOrchestrator;
use VIPWorkflows\Ideation\Research\IdeationAnalyzer;
use VIPWorkflows\Ideation\Research\IdeationPostTypes;
use VIPWorkflows\Integrations\UrlMetaExtractor;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Ideation Sources Controller.
 */
class IdeationSourcesController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @var mixed
	 */
	protected $namespace = 'vip-workflows/v1';
	/**
	 * REST route base.
	 *
	 * @var mixed
	 */
	protected $rest_base = 'ideation';

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/sources',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'add_source' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'url'   => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'esc_url_raw',
					),
					'title' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'notes' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_textarea_field',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/sources/upload',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'upload_source' ),
				'permission_callback' => array( $this, 'upload_permissions_check' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/sources/(?P<source_id>(?!upload$)[a-zA-Z0-9]+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_source' ),
					'permission_callback' => array( $this, 'edit_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_source' ),
					'permission_callback' => array( $this, 'edit_permissions_check' ),
					'args'                => array(
						'notes' => array(
							'type'              => 'string',
							'required'          => false,
							'sanitize_callback' => 'sanitize_textarea_field',
						),
						'tags'  => array(
							'type'              => 'string',
							'required'          => false,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/sources/(?P<source_id>(?!upload$)[a-zA-Z0-9]+)/summarize',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'summarize_source' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/sources/(?P<source_id>(?!upload$)[a-zA-Z0-9]+)/retry',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'retry_source' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
			)
		);
	}

	/**
	 * Check whether the current user can edit this resource.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function edit_permissions_check( WP_REST_Request $request ): bool {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$project_id = (int) $request->get_param( 'id' );
		$project    = get_post( $project_id );

		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return false;
		}

		return get_current_user_id() === (int) $project->post_author
			|| current_user_can( 'edit_others_posts' );
	}

	/**
	 * Permission check for the source-upload route.
	 *
	 * Uploading media requires the standard upload_files capability, which WP
	 * core enforces on its own media endpoints — this custom route must too, or
	 * a Contributor (edit_posts on their own project, no upload_files) could
	 * upload media through it.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function upload_permissions_check( WP_REST_Request $request ): bool {
		return current_user_can( 'upload_files' ) && $this->edit_permissions_check( $request );
	}

	/**
	 * Add source.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function add_source( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );
		$url        = (string) $request->get_param( 'url' );

		if ( '' === trim( $url ) ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'URL is required.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		/*
		 * Identity is derived the same way an assistant-found card's is, so adding
		 * a URL that is already on the board returns the source that is there
		 * rather than a second copy of it. Checked before the metadata fetch below,
		 * which is a network round trip we would otherwise spend to discover that
		 * we already have the answer. A manual add scopes to null rather than to an
		 * ability, so it stays distinct from an assistant's card for the same URL —
		 * that card carries the assistant's analysis, this one carries the user's
		 * own notes, and collapsing them would lose one of the two.
		 */
		$source_id = IdeationOrchestrator::card_identity( $project_id, null, array( 'url' => $url ) );

		$existing = $this->get_source_row( $project_id, $source_id );
		if ( null !== $existing ) {
			return new WP_REST_Response( $this->format_source_row( $existing ), 200 );
		}

		$meta = UrlMetaExtractor::fetch( $url );
		if ( is_wp_error( $meta ) ) {
			return $meta;
		}

		$param_title = $request->get_param( 'title' );
		$title       = is_string( $param_title ) && '' !== trim( $param_title )
			? sanitize_text_field( $param_title )
			: ( $meta['title'] ?? '' );

		$notes_param = $request->get_param( 'notes' );
		$notes       = is_string( $notes_param ) ? sanitize_textarea_field( $notes_param ) : '';

		$description = $meta['description'] ?? '';
		$parsed      = wp_parse_url( $url );
		$domain      = isset( $parsed['host'] ) ? strtolower( (string) $parsed['host'] ) : null;

		$published_at = null;
		if ( ! empty( $meta['published'] ) ) {
			$ts = strtotime( (string) $meta['published'] );
			if ( false !== $ts ) {
				$published_at = gmdate( 'Y-m-d H:i:s', $ts );
			}
		}

		$now     = current_time( 'mysql' );
		$user_id = get_current_user_id();

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$inserted = $wpdb->insert(
			$table,
			array(
				'project_id'    => $project_id,
				'source_id'     => $source_id,
				'url'           => $url,
				'title'         => '' !== $title ? $title : null,
				'domain'        => $domain,
				'favicon'       => null,
				'image'         => ! empty( $meta['image'] ) ? (string) $meta['image'] : null,
				'published_at'  => $published_at,
				'author'        => ! empty( $meta['author'] ) ? (string) $meta['author'] : null,
				'excerpt'       => '' !== $description ? $description : null,
				'content'       => '' !== $description ? $description : null,
				'source_type'   => 'article',
				'origin'        => 'manual',
				'notes'         => '' !== $notes ? $notes : null,
				'added_by'      => $user_id,
				'added_at'      => $now,
				'updated_at'    => $now,
			),
			array(
				'%d',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%d',
				'%s',
				'%s',
			)
		);

		if ( false === $inserted ) {
			return new WP_Error(
				'rest_db_error',
				__( 'Could not save source.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$row = $this->get_source_row( $project_id, $source_id );
		if ( null === $row ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found after insert.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $this->format_source_row( $row ), 201 );
	}

	/**
	 * The status a failed upload deserves, or null to leave it a server error.
	 *
	 * `media_handle_upload()` returns `upload_error` for everything: a file type
	 * the site disallows and a disk it could not write to arrive under the same
	 * code and differ only in their message — which is translated, and so not
	 * something to branch on.
	 *
	 * So caller faults are identified positively here and everything else keeps
	 * the 500 it would have had. Defaulting the other way round would reproduce
	 * the very problem this endpoint had, inverted: a full disk reported as a 400
	 * sends whoever hits it to inspect their own file while the server is broken.
	 *
	 * @param array $file One entry from WP_REST_Request::get_file_params().
	 * @return int|null 400 when the caller is at fault, null when we are.
	 */
	private static function upload_error_status( array $file ): ?int {
		$php_error = isset( $file['error'] ) ? (int) $file['error'] : UPLOAD_ERR_OK;

		/*
		 * PHP's own codes are authoritative, and split cleanly: the first group
		 * describes what arrived, the second describes a server that could not
		 * receive it.
		 */
		switch ( $php_error ) {
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
			case UPLOAD_ERR_PARTIAL:
			case UPLOAD_ERR_NO_FILE:
				return 400;

			case UPLOAD_ERR_NO_TMP_DIR:
			case UPLOAD_ERR_CANT_WRITE:
			case UPLOAD_ERR_EXTENSION:
				return null;
		}

		// A file that arrived intact and carries nothing.
		if ( 0 === (int) ( $file['size'] ?? 0 ) ) {
			return 400;
		}

		/*
		 * PHP delivered the file, so the refusal came from WordPress's own checks.
		 * The only one of those the caller can act on is the file type, and it can
		 * be re-asked directly rather than inferred from a message — the same
		 * question media_handle_upload() asked, against the same allow-list.
		 *
		 * The temporary file is still in place: a type rejection happens before
		 * anything is moved. A move_uploaded_file() failure reaches here with a
		 * perfectly acceptable type and returns null, which is what we want — a
		 * file the server could not write is not a bad request.
		 */
		$checked = wp_check_filetype_and_ext(
			(string) ( $file['tmp_name'] ?? '' ),
			(string) ( $file['name'] ?? '' )
		);

		return false === $checked['type'] ? 400 : null;
	}

	/**
	 * Upload source.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function upload_source( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );

		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new WP_Error(
				'rest_no_file',
				__( 'No file uploaded.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		include_once ABSPATH . 'wp-admin/includes/image.php';
		include_once ABSPATH . 'wp-admin/includes/file.php';
		include_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_upload( 'file', $project_id );

		if ( is_wp_error( $attachment_id ) ) {
			/*
			 * media_handle_upload returns its errors without a status, and REST
			 * turns a status-less WP_Error into a 500. A file type the site does
			 * not allow, or a file over the size limit, is the caller's problem
			 * and reads as one — a 500 sends whoever hits it looking for a broken
			 * server, when the actual message is already in the response.
			 */
			$data   = $attachment_id->get_error_data();
			$status = self::upload_error_status( $files['file'] );

			if ( null !== $status && ( ! is_array( $data ) || ! isset( $data['status'] ) ) ) {
				$attachment_id->add_data(
					array( 'status' => $status ),
					$attachment_id->get_error_code()
				);
			}

			return $attachment_id;
		}

		$attachment = get_post( $attachment_id );
		if ( ! $attachment ) {
			return new WP_Error(
				'rest_attachment_missing',
				__( 'Attachment could not be loaded.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$file_path = get_attached_file( $attachment_id );
		$file_size = ( $file_path && file_exists( $file_path ) ) ? (int) filesize( $file_path ) : 0;

		/*
		 * Uploads keep a random id rather than a derived one. There is nothing
		 * stable to derive it from: the upload has already produced its own
		 * attachment, and core uniquifies the filename, so two uploads of one file
		 * differ in both attachment id and URL. Deduplicating them would also mean
		 * deciding that a second upload was a mistake, which is not ours to decide —
		 * re-uploading a revised document under the same name is normal.
		 */
		$source_id  = wp_generate_password( 12, false );
		$now        = current_time( 'mysql' );
		$user_id    = get_current_user_id();
		$attach_url = wp_get_attachment_url( $attachment_id );

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$inserted = $wpdb->insert(
			$table,
			array(
				'project_id'          => $project_id,
				'source_id'           => $source_id,
				'url'                 => $attach_url ? $attach_url : null,
				'title'               => $attachment->post_title,
				'domain'              => null,
				'source_type'         => 'document',
				'origin'              => 'manual',
				'attachment_id'       => $attachment_id,
				'file_type'           => $attachment->post_mime_type,
				'file_size'           => $file_size,
				'processing_status'   => 'pending',
				'added_by'            => $user_id,
				'added_at'            => $now,
				'updated_at'          => $now,
			),
			array(
				'%d',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%d',
				'%s',
				'%d',
				'%s',
				'%d',
				'%s',
				'%s',
			)
		);

		if ( false === $inserted ) {
			wp_delete_attachment( $attachment_id, true );
			return new WP_Error(
				'rest_db_error',
				__( 'Could not save source.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		as_enqueue_async_action(
			'vip_workflows_process_source',
			array( $project_id, $source_id ),
			'vip-workflows'
		);

		$row = $this->get_source_row( $project_id, $source_id );
		if ( null === $row ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found after insert.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $this->format_source_row( $row ), 201 );
	}

	/**
	 * Delete the source.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_source( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );
		$source_id  = (string) $request->get_param( 'source_id' );

		$row = $this->get_source_row( $project_id, $source_id );
		if ( null === $row ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$deleted = $wpdb->delete(
			$table,
			array(
				'project_id' => $project_id,
				'source_id'  => $source_id,
			),
			array( '%d', '%s' )
		);

		if ( false === $deleted || $deleted < 1 ) {
			return new WP_Error(
				'rest_db_error',
				__( 'Could not delete source.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$attachment_id = isset( $row['attachment_id'] ) ? (int) $row['attachment_id'] : 0;
		if ( $attachment_id > 0 ) {
			wp_delete_attachment( $attachment_id, true );
		}

		return new WP_REST_Response(
			array(
				'deleted'   => true,
				'source_id' => $source_id,
			),
			200
		);
	}

	/**
	 * Update the source.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_source( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );
		$source_id  = (string) $request->get_param( 'source_id' );

		$row = $this->get_source_row( $project_id, $source_id );
		if ( null === $row ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$notes_param = $request->get_param( 'notes' );
		$tags_param  = $request->get_param( 'tags' );

		$data = array(
			'updated_at' => current_time( 'mysql' ),
		);
		$formats = array( '%s' );

		if ( null !== $notes_param ) {
			$data['notes'] = is_string( $notes_param ) ? sanitize_textarea_field( $notes_param ) : '';
			$formats[]     = '%s';
		}

		if ( null !== $tags_param ) {
			$data['tags'] = is_string( $tags_param ) ? sanitize_text_field( $tags_param ) : '';
			$formats[]    = '%s';
		}

		if ( count( $data ) === 1 ) {
			return new WP_REST_Response( $this->format_source_row( $row ) );
		}

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$updated = $wpdb->update(
			$table,
			$data,
			array(
				'project_id' => $project_id,
				'source_id'  => $source_id,
			),
			$formats,
			array( '%d', '%s' )
		);

		if ( false === $updated ) {
			return new WP_Error(
				'rest_db_error',
				__( 'Could not update source.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$fresh = $this->get_source_row( $project_id, $source_id );
		if ( null === $fresh ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response( $this->format_source_row( $fresh ) );
	}

	/**
	 * Summarize source.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function summarize_source( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );
		$source_id  = (string) $request->get_param( 'source_id' );

		$row = $this->get_source_row( $project_id, $source_id );
		if ( null === $row ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$analyzer = new IdeationAnalyzer();
		$result   = $analyzer->summarize_source( $row );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$ai_analysis = array();
		if ( ! empty( $row['ai_analysis'] ) ) {
			$decoded = json_decode( (string) $row['ai_analysis'], true );
			if ( is_array( $decoded ) ) {
				$ai_analysis = $decoded;
			}
		}

		$ai_analysis['summary']     = $result['summary'];
		$ai_analysis['analyzed_at'] = $result['analyzed_at'];

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$wpdb->update(
			$table,
			array(
				'ai_analysis' => wp_json_encode( $ai_analysis ),
				'updated_at'  => current_time( 'mysql' ),
			),
			array(
				'project_id' => $project_id,
				'source_id'  => $source_id,
			),
			array( '%s', '%s' ),
			array( '%d', '%s' )
		);

		$fresh = $this->get_source_row( $project_id, $source_id );
		if ( null === $fresh ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response(
			array(
				'summary'    => $result['summary'],
				'analyzed_at' => $result['analyzed_at'],
				'source'     => $this->format_source_row( $fresh ),
			)
		);
	}

	/**
	 * Retry source.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function retry_source( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );
		$source_id  = (string) $request->get_param( 'source_id' );

		$row = $this->get_source_row( $project_id, $source_id );
		if ( null === $row ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$ai_analysis = array();
		if ( ! empty( $row['ai_analysis'] ) ) {
			$decoded = json_decode( (string) $row['ai_analysis'], true );
			if ( is_array( $decoded ) ) {
				$ai_analysis = $decoded;
			}
		}

		unset( $ai_analysis['error'] );

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$wpdb->update(
			$table,
			array(
				'processing_status' => 'pending',
				'ai_analysis'     => wp_json_encode( $ai_analysis ),
				'updated_at'      => current_time( 'mysql' ),
			),
			array(
				'project_id' => $project_id,
				'source_id'  => $source_id,
			),
			array( '%s', '%s', '%s' ),
			array( '%d', '%s' )
		);

		as_enqueue_async_action(
			'vip_workflows_process_source',
			array( $project_id, $source_id ),
			'vip-workflows'
		);

		$fresh = $this->get_source_row( $project_id, $source_id );
		if ( null === $fresh ) {
			return new WP_Error(
				'rest_not_found',
				__( 'Source not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response( $this->format_source_row( $fresh ) );
	}

	/**
	 * Get the source row.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $source_id Source ID.
	 * @return ?array
	 */
	private function get_source_row( int $project_id, string $source_id ): ?array {
		global $wpdb;

		$table = $wpdb->prefix . 'vip_ideation_sources';

		$row = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT * FROM %i WHERE project_id = %d AND source_id = %s',
				$table,
				$project_id,
				$source_id
			),
			ARRAY_A
		);

		return is_array( $row ) ? $row : null;
	}

	/**
	 * Format the source row.
	 *
	 * @param array $row row.
	 * @return array
	 */
	private function format_source_row( array $row ): array {
		if ( isset( $row['ai_analysis'] ) && is_string( $row['ai_analysis'] ) && '' !== $row['ai_analysis'] ) {
			$decoded = json_decode( $row['ai_analysis'], true );
			$row['ai_analysis'] = is_array( $decoded ) ? $decoded : null;
		}

		return $row;
	}
}
