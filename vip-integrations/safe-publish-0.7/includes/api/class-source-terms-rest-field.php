<?php
/**
 * Source Terms REST Field class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Auth\HMAC_Authenticator;
use WP_Post;
use WP_REST_Request;
use WP_Term;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the safe_publish_terms REST field so the destination can rebuild
 * each term's hierarchy and description, which core omits from the embedded
 * wp:term payload (id, link, name, slug, taxonomy only).
 *
 * For every REST-exposed taxonomy on the post, the field carries the directly
 * assigned terms plus, for hierarchical taxonomies, their unassigned ancestors,
 * so the destination can create parents before children. Populated only for
 * HMAC-authenticated single-item requests, the same gate as the author field.
 */
class Source_Terms_REST_Field {

	/**
	 * REST field name added to public post type responses.
	 *
	 * @var string
	 */
	const FIELD_NAME = 'safe_publish_terms';

	/**
	 * HMAC authenticator used to gate access to the field value.
	 *
	 * @var HMAC_Authenticator
	 */
	private HMAC_Authenticator $authenticator;

	/**
	 * Constructs the Source_Terms_REST_Field instance.
	 *
	 * @param HMAC_Authenticator $authenticator HMAC authenticator instance.
	 */
	public function __construct( HMAC_Authenticator $authenticator ) {
		$this->authenticator = $authenticator;
	}

	/**
	 * Registers the rest_api_init hook that adds the REST field.
	 */
	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_field' ) );
	}

	/**
	 * Registers the field on every public, REST-exposed post type, excluding
	 * attachments.
	 */
	public function register_field(): void {
		$post_types = get_post_types(
			array(
				'public'       => true,
				'show_in_rest' => true,
			)
		);

		unset( $post_types['attachment'] );

		register_rest_field(
			array_values( $post_types ),
			self::FIELD_NAME,
			array(
				'get_callback' => array( $this, 'get_callback' ),
				'schema'       => null,
			)
		);
	}

	/**
	 * Returns the taxonomy => term-records map for HMAC-authenticated
	 * single-item requests, and null otherwise so the field carries no data
	 * for public, cookie-authenticated, third-party, or collection consumers.
	 *
	 * @param array           $post_array Post data as built by WP_REST_Posts_Controller.
	 * @param string          $_attribute Field name (unused).
	 * @param WP_REST_Request $request    Current REST request.
	 * @return array<string, list<array{id:int, name:string, slug:string, parent:int, description:string, assigned:bool}>>|null
	 *         Taxonomy => term records, or null otherwise.
	 */
	public function get_callback(
		array $post_array,
		// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		string $_attribute,
		WP_REST_Request $request
	): ?array {
		if ( ! $this->authenticator->is_authenticated() ) {
			return null;
		}

		if ( ! $this->is_single_item_request( $request ) ) {
			return null;
		}

		$post_id = isset( $post_array['id'] ) ? (int) $post_array['id'] : 0;
		$post    = $post_id > 0 ? get_post( $post_id ) : null;

		if ( ! $post instanceof WP_Post ) {
			return array();
		}

		return $this->collect_terms( $post );
	}

	/**
	 * Builds the taxonomy => term-records map: assigned terms plus each
	 * hierarchical term's ancestors (assigned=false), de-duplicated by term id.
	 *
	 * @param WP_Post $post Post whose terms are collected.
	 * @return array<string, list<array{id:int, name:string, slug:string, parent:int, description:string, assigned:bool}>>
	 */
	private function collect_terms( WP_Post $post ): array {
		$map = array();

		foreach ( get_object_taxonomies( $post->post_type, 'objects' ) as $taxonomy ) {
			if ( true !== $taxonomy->show_in_rest ) {
				continue;
			}

			$tax   = $taxonomy->name;
			$terms = get_the_terms( $post, $tax );

			if ( ! is_array( $terms ) ) {
				continue;
			}

			$records = array();

			foreach ( $terms as $term ) {
				$this->add_record( $records, $term, true );

				if ( true !== $taxonomy->hierarchical ) {
					continue;
				}

				foreach ( get_ancestors( $term->term_id, $tax, 'taxonomy' ) as $ancestor_id ) {
					$ancestor = get_term( (int) $ancestor_id, $tax );
					if ( $ancestor instanceof WP_Term ) {
						$this->add_record( $records, $ancestor, false );
					}
				}
			}

			if ( array() !== $records ) {
				$map[ $tax ] = array_values( $records );
			}
		}

		return $map;
	}

	/**
	 * Records a term keyed by id. A term seen both assigned and as an ancestor
	 * keeps assigned=true.
	 *
	 * @param array<int, array{id:int, name:string, slug:string, parent:int, description:string, assigned:bool}> $records  Records so far, keyed by term id.
	 * @param WP_Term                                                                                            $term     Term to record.
	 * @param bool                                                                                               $assigned Whether the term is directly assigned to the post.
	 */
	private function add_record( array &$records, WP_Term $term, bool $assigned ): void {
		$id = (int) $term->term_id;

		if ( isset( $records[ $id ] ) ) {
			if ( $assigned ) {
				$records[ $id ]['assigned'] = true;
			}
			return;
		}

		$records[ $id ] = array(
			'id'          => $id,
			'name'        => (string) $term->name,
			'slug'        => (string) $term->slug,
			'parent'      => (int) $term->parent,
			'description' => (string) $term->description,
			'assigned'    => $assigned,
		);
	}

	/**
	 * Detects whether the request resolves a single post via its id route
	 * parameter.
	 *
	 * @param WP_REST_Request $request Current REST request.
	 * @return bool True when the route bound a positive numeric id.
	 */
	private function is_single_item_request( WP_REST_Request $request ): bool {
		$request_id = $request->get_url_params()['id'] ?? null;

		return is_numeric( $request_id ) && (int) $request_id > 0;
	}
}
