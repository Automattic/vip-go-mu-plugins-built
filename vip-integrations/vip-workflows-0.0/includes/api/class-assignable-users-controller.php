<?php
/**
 * Assignable-users REST controller.
 *
 * Backs every "pick a person" control in the plugin — the assignment modal, the
 * Kanban author filter, and the editor metadata panel's user fields.
 *
 * It exists so those controls do not have to go through core's `wp/v2/users`.
 * Listing the full user base there needs `list_users`, a capability core grants
 * to administrators only; the plugin used to hand it to every Editor and Author
 * via a `user_has_cap` filter so the pickers would return more than just
 * published authors. That filter applied to *every* `list_users` check on the
 * site, not merely these pickers, which meant an Author could open
 * wp-admin/users.php and read every account's email address, administrators
 * included.
 *
 * The fix is to stop borrowing a core capability for a plugin feature. This
 * route answers the narrow question the pickers actually ask — "who can I
 * assign work to?" — and returns only an id and a display name. No email, no
 * roles, no registration data, nothing core's `view` context would not already
 * expose about a post author.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;

/**
 * REST controller listing users that work can be assigned to.
 */
class AssignableUsersController extends WP_REST_Controller {

	/**
	 * Hard ceiling on returned users, whatever per_page asks for.
	 */
	private const MAX_PER_PAGE = 100;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'assignable-users';
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'search'   => array(
							'description'       => 'Substring match against the display name.',
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'per_page' => array(
							'description'       => 'Maximum users to return.',
							'type'              => 'integer',
							'default'           => 50,
							'minimum'           => 1,
							'maximum'           => self::MAX_PER_PAGE,
							'sanitize_callback' => 'absint',
						),
						'roles'    => array(
							'description'       => 'Comma-separated role slugs to filter by.',
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'include'  => array(
							'description' => 'Specific user IDs to resolve.',
							'type'        => 'string',
						),
					),
				),
			)
		);
	}

	/**
	 * Permission check.
	 *
	 * Anyone who can edit content can see who work is assignable to — that is
	 * the same population the assignment UI is offered to. Deliberately not
	 * `list_users`: this route returns strictly less than core's user endpoint,
	 * so it does not need a capability that also unlocks wp-admin/users.php.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function get_items_permissions_check( $request ): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * List assignable users.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		$args = array(
			'number'  => min( (int) $request->get_param( 'per_page' ), self::MAX_PER_PAGE ),
			'orderby' => 'display_name',
			'order'   => 'ASC',
			'fields'  => array( 'ID', 'display_name' ),
		);

		$search = (string) $request->get_param( 'search' );
		if ( '' !== $search ) {
			// Name and login, never user_email. Core's default search spans the
			// email column, which would let a caller confirm an address one
			// substring at a time — the very disclosure this route exists to
			// avoid. Logins are already visible wherever a user is credited, and
			// people do type them into pickers, so they stay searchable.
			$args['search']         = '*' . $search . '*';
			$args['search_columns'] = array( 'display_name', 'user_login', 'user_nicename' );
		}

		$roles = (string) $request->get_param( 'roles' );
		if ( '' !== $roles ) {
			$args['role__in'] = array_filter( array_map( 'sanitize_key', explode( ',', $roles ) ) );
		}

		$include = (string) $request->get_param( 'include' );
		if ( '' !== $include ) {
			$ids = array_filter( array_map( 'absint', explode( ',', $include ) ) );
			if ( ! empty( $ids ) ) {
				$args['include'] = $ids;
				// An explicit id lookup must be able to resolve every id it was
				// given, or the editor panel cannot label an existing value.
				$args['number'] = min( count( $ids ), self::MAX_PER_PAGE );
			}
		}

		$users = get_users( $args );

		$items = array_map(
			function ( $user ) {
				return array(
					'id'   => (int) $user->ID,
					'name' => $user->display_name,
				);
			},
			$users
		);

		return new WP_REST_Response( $items );
	}
}
