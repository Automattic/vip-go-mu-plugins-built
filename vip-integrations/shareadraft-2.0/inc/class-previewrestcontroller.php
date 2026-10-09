<?php

namespace Automattic\ShareADraft;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * REST endpoint the editor calls to mint a preview link.
 *
 * Instance-based and injected with {@see PreviewLinkService}, so the same service
 * graph assembled in the composition root backs both minting (here) and
 * enforcement ({@see PreviewGate}).
 */
final class PreviewRestController {
	public const NAMESPACE = 'shareadraft/v1';
	public const ROUTE     = '/preview-links';

	/**
	 * The built-in ceiling on a link's viewer cap, before
	 * {@see max_uses_limit()} lets a site change or lift it.
	 */
	public const MAX_USES_LIMIT = 1000;

	private PreviewLinkService $service;
	private PreviewLinkMinter $minter;

	public function __construct( PreviewLinkService $service, PreviewLinkMinter $minter ) {
		$this->service = $service;
		$this->minter  = $minter;
	}

	/**
	 * Allowed link lifetimes, shown in the editor dropdown and enforced here.
	 * Source of truth for both the UI and validation.
	 *
	 * The default set is deliberately time-limited; a site that wants longer or
	 * never-expiring links can add options through the filter (e.g. a very large
	 * number of seconds for an effectively indefinite link).
	 *
	 * Options without a positive whole number of `seconds` and a string `label`
	 * are dropped; if none survive, the built-in set is used.
	 *
	 * @return non-empty-list<array{seconds: int, label: string}>
	 */
	public static function expiration_options(): array {
		$options = [
			[
				'seconds' => HOUR_IN_SECONDS,
				'label'   => __( '1 hour', 'shareadraft' ),
			],
			[
				'seconds' => 8 * HOUR_IN_SECONDS,
				'label'   => __( '8 hours', 'shareadraft' ),
			],
			[
				'seconds' => DAY_IN_SECONDS,
				'label'   => __( '24 hours', 'shareadraft' ),
			],
			[
				'seconds' => WEEK_IN_SECONDS,
				'label'   => __( '7 days', 'shareadraft' ),
			],
		];

		/**
		 * Filters the link-lifetime options offered in the editor and accepted by
		 * the endpoint.
		 *
		 * @param list<array{seconds: int, label: string}> $options Ordered options.
		 */
		/** @var mixed $filtered */
		$filtered = apply_filters( 'shareadraft_expiration_options', $options );

		if ( ! is_array( $filtered ) ) {
			return $options;
		}

		$valid = [];

		/** @var mixed $option */
		foreach ( $filtered as $option ) {
			if ( ! is_array( $option ) || ! isset( $option['label'] ) || ! is_string( $option['label'] ) ) {
				continue;
			}

			$seconds = self::positive_int( $option['seconds'] ?? null );

			if ( null !== $seconds ) {
				$valid[] = [
					'seconds' => $seconds,
					'label'   => $option['label'],
				];
			}
		}

		return [] === $valid ? $options : $valid;
	}

	/**
	 * The lifetime pre-selected in the editor, in seconds.
	 *
	 * Always one of {@see allowed_expirations()}: a default the site no longer
	 * offers falls back to the first option, so the editor, WP-CLI and the
	 * abilities never default to a lifetime the endpoint would reject.
	 */
	public static function default_expiration(): int {
		/**
		 * Filters the preview link lifetime pre-selected in the editor.
		 *
		 * @param int $default Default lifetime in seconds (8 hours).
		 */
		$default = self::positive_int( apply_filters( 'shareadraft_default_expiration', 8 * HOUR_IN_SECONDS ) );
		$allowed = self::allowed_expirations();

		return null !== $default && in_array( $default, $allowed, true ) ? $default : $allowed[0];
	}

	/**
	 * The most viewers a link may allow, or null when the site sets no ceiling.
	 *
	 * Under a ceiling a link is always capped: a link minted without a cap gets
	 * the ceiling. With no ceiling, any positive cap is accepted and a link
	 * minted without one is unlimited. Enforced by {@see PreviewLinkMinter},
	 * so every channel honours the same limit. A value that is neither null
	 * nor a positive whole number falls back to the built-in ceiling.
	 */
	public static function max_uses_limit(): ?int {
		/**
		 * Filters the most viewers a preview link may allow. Return null to
		 * allow any number, and unlimited links.
		 *
		 * @param int|null $limit Maximum viewer cap (1000).
		 */
		$limit = apply_filters( 'shareadraft_max_uses_limit', self::MAX_USES_LIMIT );

		return null === $limit ? null : ( self::positive_int( $limit ) ?? self::MAX_USES_LIMIT );
	}

	/**
	 * A positive whole number from filtered input, or null. Accepts integers and
	 * numeric strings such as "3600"; rejects booleans, fractions, zero and
	 * negatives.
	 */
	private static function positive_int( mixed $value ): ?int {
		if ( is_bool( $value ) ) {
			return null;
		}

		$int = filter_var( $value, FILTER_VALIDATE_INT, [ 'options' => [ 'min_range' => 1 ] ] );

		return false === $int ? null : $int;
	}

	public function register_routes(): void {
		$max_uses_limit = self::max_uses_limit();

		$post_id_arg = [
			'post_id' => [
				'required' => true,
				'type'     => 'integer',
			],
		];

		$create_args = $post_id_arg + [
			'expiration' => [
				'required' => true,
				'type'     => 'integer',
				'enum'     => self::allowed_expirations(),
			],
			'max_uses'   => [
				// Omitted (or null) means the site's ceiling, or unlimited
				// when it has none. Left null here so the minter resolves it
				// when the link is minted, and enforces the ceiling.
				'type'    => [ 'integer', 'null' ],
				'default' => null,
				'minimum' => 1,
			],
		];

		if ( null !== $max_uses_limit ) {
			$create_args['max_uses']['maximum'] = $max_uses_limit;
		}

		// A restriction the site has switched off is left out of the schema so
		// it never shows in the endpoint's OPTIONS description; the minter also
		// rejects a value smuggled past the schema.
		if ( Features::ip_allowlist_enabled() ) {
			$create_args['allowed_ips'] = [
				// The schema only checks "array of strings"; whether each
				// entry is a real CIDR range is validated in the minter,
				// so REST and the abilities channel reject identically.
				'type'    => 'array',
				'items'   => [ 'type' => 'string' ],
				'default' => [],
			];
		}

		if ( Features::recipients_enabled() ) {
			$create_args['recipients'] = [
				// Like allowed_ips: address validity is the minter's job.
				'type'    => 'array',
				'items'   => [ 'type' => 'string' ],
				'default' => [],
			];
		}

		register_rest_route(
			self::NAMESPACE,
			self::ROUTE,
			[
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_link' ],
					'permission_callback' => [ $this, 'can_manage_links' ],
					'args'                => $create_args,
				],
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'list_links' ],
					'permission_callback' => [ $this, 'can_manage_links' ],
					'args'                => $post_id_arg,
				],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			self::ROUTE . '/(?P<id>[a-f0-9]{64})',
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'revoke_link' ],
				'permission_callback' => [ $this, 'can_manage_links' ],
				'args'                => $post_id_arg,
			]
		);
	}

	/**
	 * Links may be managed only by someone who can edit the target post.
	 */
	public function can_manage_links( WP_REST_Request $request ): bool {
		return current_user_can( 'edit_post', self::int_value( $request->get_param( 'post_id' ) ) );
	}

	public function list_links( WP_REST_Request $request ): WP_REST_Response {
		return rest_ensure_response(
			PreviewLinkPresenter::present_live_links(
				$this->service->list_for_post( self::int_value( $request->get_param( 'post_id' ) ) ),
				time()
			)
		);
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public function revoke_link( WP_REST_Request $request ) {
		$post_id    = self::int_value( $request->get_param( 'post_id' ) );
		$token_hash = $request->get_param( 'id' );
		$token_hash = is_string( $token_hash ) ? $token_hash : '';

		if ( ! $this->service->revoke( $post_id, $token_hash ) ) {
			return new WP_Error(
				'shareadraft_link_not_found',
				__( 'No matching preview link to revoke.', 'shareadraft' ),
				[ 'status' => 404 ]
			);
		}

		return rest_ensure_response( [ 'revoked' => true ] );
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_link( WP_REST_Request $request ) {
		$max_uses_param = $request->get_param( 'max_uses' );
		$max_uses       = null === $max_uses_param ? null : self::int_value( $max_uses_param );

		// A WP_Error from the minter (e.g. a missing post, an invalid IP range
		// or address, or a disabled restriction) passes straight through:
		// rest_ensure_response() returns it unchanged and the REST server
		// renders it with its status.
		return rest_ensure_response(
			$this->minter->mint(
				self::int_value( $request->get_param( 'post_id' ) ),
				self::int_value( $request->get_param( 'expiration' ) ),
				$max_uses,
				'rest',
				self::string_list( $request->get_param( 'allowed_ips' ) ),
				self::string_list( $request->get_param( 'recipients' ) )
			)
		);
	}

	/**
	 * The integer in an untyped request value. The schema has already rejected
	 * anything non-numeric, so the fallback only guards the type.
	 *
	 * @param mixed $value The raw parameter value.
	 */
	private static function int_value( $value ): int {
		return is_numeric( $value ) ? (int) $value : 0;
	}

	/**
	 * The strings from an untyped request value. A parameter absent from the
	 * schema (because its feature is switched off) arrives unvalidated, so the
	 * shape cannot be trusted; anything unusable reads as empty and the minter
	 * then refuses a non-empty list for a disabled feature.
	 *
	 * @param mixed $value The raw parameter value.
	 * @return list<string>
	 */
	private static function string_list( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$strings = [];

		/** @var mixed $item */
		foreach ( $value as $item ) {
			if ( is_string( $item ) ) {
				$strings[] = $item;
			}
		}

		return $strings;
	}

	/**
	 * The link lifetimes (in seconds) the plugin accepts, derived from the
	 * filterable {@see expiration_options()}. Shared with the abilities layer so
	 * REST and MCP honour the same set.
	 *
	 * @return non-empty-list<int>
	 */
	public static function allowed_expirations(): array {
		return array_map(
			/** @param array{seconds: int, label: string} $option */
			static fn ( array $option ): int => $option['seconds'],
			self::expiration_options()
		);
	}
}
