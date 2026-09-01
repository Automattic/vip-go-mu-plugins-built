<?php
/**
 * Metadata REST API controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * REST controller exposing sequence-defined metadata fields with current values.
 *
 * Intended for external tooling (automation scripts, Airtable sync jobs, CLI) that
 * need field schemas and values in a single call. The editor does not call this
 * endpoint — it uses useEntityProp against the standard wp/v2/posts REST API.
 */
class MetadataController extends WP_REST_Controller {


	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'posts';
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// GET /posts/{id}/metadata — field schemas + current values.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/metadata',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_metadata' ),
					'permission_callback' => array( $this, 'get_metadata_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);
	}

	/**
	 * Get metadata fields with current values for a post.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_metadata( $request ) {
		$post_id = (int) $request->get_param( 'id' );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error(
				'rest_post_not_found',
				__( 'Post not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$sequence_id = get_post_meta( $post_id, '_vip_workflows_sequence_id', true );

		if ( ! $sequence_id ) {
			return new WP_REST_Response( array( 'fields' => array() ) );
		}

		$sequence = $this->get_repository()->find( (int) $sequence_id );

		if ( ! $sequence ) {
			return new WP_REST_Response( array( 'fields' => array() ) );
		}

		$metadata_fields = $sequence->get_metadata_fields();
		$fields          = array();

		foreach ( $metadata_fields as $field ) {
			$meta_key = 'wf_meta_' . $sequence->id . '_' . $field['key'];
			$value    = get_post_meta( $post_id, $meta_key, true );

			// One rule, one place: Sequence answers "is this field filled in?"
			// for the required-field gate in StatusManager::transition() and for
			// this endpoint alike. They used to answer it separately and
			// disagreed about whitespace, so a sync job reading a field back as
			// filled could not explain why the workflow refused to move past it.
			$is_empty = Sequence::metadata_value_is_empty( (string) $field['type'], $value );

			$entry = array(
				'key'      => $field['key'],
				'label'    => $field['label'],
				'type'     => $field['type'],
				'value'    => $is_empty ? null : $value,
				'required' => ! empty( $field['required'] ),
			);

			if ( isset( $field['options'] ) ) {
				$entry['options'] = $field['options'];
			}

			$fields[] = $entry;
		}

		return new WP_REST_Response( array( 'fields' => $fields ) );
	}

	/**
	 * The repository this controller resolves a post's sequence through.
	 *
	 * Its own method so the response-shape tests can stand a double in its
	 * place: everything else in get_metadata() is the shape under test, and a
	 * real repository would need the database to answer at all.
	 *
	 * @return SequenceRepository
	 */
	protected function get_repository(): SequenceRepository {
		return new SequenceRepository();
	}

	/**
	 * Permission check for GET metadata.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function get_metadata_permissions_check( $request ) {
		$post_id = (int) $request->get_param( 'id' );
		// Align with the write path: the wf_meta_* registration gates on
		// edit_post (see class-plugin.php), so reads of non-public editorial
		// metadata require the same capability rather than read_post.
		return current_user_can( 'edit_post', $post_id );
	}
}
