<?php

namespace Automattic\ShareADraft;

use WP_Error;

/**
 * Registers preview-link functionality with WordPress's Abilities API, so the
 * same capability the editor uses is available to machines: MCP clients, the
 * WordPress AI Client, and the generic abilities REST runner.
 *
 * The driving use case is drafting with a local agent — the agent can mint a
 * shareable preview, see what it has already shared, and revoke what should no
 * longer be shared, without a human switching to the block editor. The ability
 * set mirrors the `wp shareadraft` commands (plus the admin page's site-wide
 * switch), and both are sibling adapters to {@see PreviewRestController}: they
 * reuse the same {@see PreviewLinkMinter}, {@see PreviewLinkPresenter}, and
 * {@see PreviewLinkService}, so a given surface cannot diverge from REST.
 *
 * @see https://developer.wordpress.org/apis/abilities/
 */
final class PreviewAbilities {
	/** Ability category slug grouping this plugin's abilities. */
	public const CATEGORY = 'shareadraft';

	/** Fully-qualified name of the create-link ability. */
	public const CREATE_LINK = 'shareadraft/create-preview-link';

	/** Fully-qualified name of the list-links ability. */
	public const LIST_LINKS = 'shareadraft/list-preview-links';

	/** Fully-qualified name of the revoke-link ability. */
	public const REVOKE_LINK = 'shareadraft/revoke-preview-link';

	/** Fully-qualified name of the prune-links ability. */
	public const PRUNE_LINKS = 'shareadraft/prune-preview-links';

	/** Fully-qualified name of the site-wide enable/disable ability. */
	public const SET_ENABLED = 'shareadraft/set-preview-links-enabled';

	/** Fully-qualified name of the switch-state read ability. */
	public const GET_STATUS = 'shareadraft/get-preview-links-status';

	private PreviewLinkService $service;
	private PreviewLinkMinter $minter;
	private LinkGarbageCollector $collector;
	private LinkToggle $toggle;
	private BulkLinkRevoker $revoker;

	public function __construct( PreviewLinkService $service, PreviewLinkMinter $minter, LinkGarbageCollector $collector, LinkToggle $toggle, BulkLinkRevoker $revoker ) {
		$this->service   = $service;
		$this->minter    = $minter;
		$this->collector = $collector;
		$this->toggle    = $toggle;
		$this->revoker   = $revoker;
	}

	/**
	 * Hook registration onto the Abilities API's init actions.
	 *
	 * The API lands in WordPress 6.9 — the plugin's minimum — so the guard is
	 * belt-and-braces: on any environment without it, the plugin loads cleanly
	 * and simply registers no abilities rather than fataling.
	 */
	public function register(): void {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_category' ] );
		add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
	}

	public function register_category(): void {
		wp_register_ability_category(
			self::CATEGORY,
			[
				'label'       => __( 'Share a Draft', 'shareadraft' ),
				'description' => __( 'Create and manage pre-publish preview links.', 'shareadraft' ),
			]
		);
	}

	public function register_abilities(): void {
		$max_uses_limit = PreviewRestController::max_uses_limit();

		$create_properties = [
			'post_id'    => [
				'type'        => 'integer',
				'description' => __( 'ID of the draft to generate a preview link for.', 'shareadraft' ),
			],
			'expiration' => [
				'type'        => 'integer',
				// Mirrors the REST endpoint's accepted lifetimes so both
				// channels honour the same (filterable) set.
				'enum'        => PreviewRestController::allowed_expirations(),
				'default'     => PreviewRestController::default_expiration(),
				'description' => __( 'How long the link stays valid, in seconds.', 'shareadraft' ),
			],
			'max_uses'   => [
				'type'        => [ 'integer', 'null' ],
				'default'     => null,
				'minimum'     => 1,
				'description' => null === $max_uses_limit
					? __( 'How many people can open the link, or null for unlimited. Each browser or device counts as a new person.', 'shareadraft' )
					: sprintf(
						/* translators: %1$d: the most viewers a link may allow, e.g. 1000. */
						__( 'How many people can open the link, up to %1$d. Omitted or null means %1$d. Each browser or device counts as a new person.', 'shareadraft' ),
						$max_uses_limit
					),
			],
		];

		// Mirror the REST schema: the site's ceiling, when it has one.
		if ( null !== $max_uses_limit ) {
			$create_properties['max_uses']['maximum'] = $max_uses_limit;
		}

		// Mirror the REST schema: a restriction the site has switched off is
		// not described to agents at all. The minter also rejects a value sent
		// regardless, so both channels refuse identically.
		if ( Features::ip_allowlist_enabled() ) {
			$create_properties['allowed_ips'] = [
				'type'        => 'array',
				'items'       => [ 'type' => 'string' ],
				'default'     => [],
				'description' => __( 'IP addresses or CIDR ranges (IPv4 or IPv6) the link may be opened from. Empty means no IP restriction.', 'shareadraft' ),
			];
		}

		if ( Features::recipients_enabled() ) {
			$create_properties['recipients'] = [
				'type'        => 'array',
				'items'       => [ 'type' => 'string' ],
				'default'     => [],
				'description' => __( 'Email addresses of the named reviewers the link is bound to. Each reviewer must verify their address with an emailed code before viewing. Empty means anyone with the link can view.', 'shareadraft' ),
			];
		}

		wp_register_ability(
			self::CREATE_LINK,
			[
				'label'               => __( 'Create preview link', 'shareadraft' ),
				'description'         => __( 'Issues a shareable link that lets a logged-out reviewer view a draft before it is published. Returns the preview URL and the timestamp it expires. The URL contains a secret token, so treat the result as sensitive.', 'shareadraft' ),
				'category'            => self::CATEGORY,
				'input_schema'        => [
					'type'       => 'object',
					'required'   => [ 'post_id' ],
					'properties' => $create_properties,
				],
				'output_schema'       => [
					'type'       => 'object',
					'properties' => [
						'url'        => [
							'type'        => 'string',
							'description' => __( 'The shareable preview URL, carrying the secret token.', 'shareadraft' ),
						],
						'expires_at' => [
							'type'        => 'integer',
							'description' => __( 'Unix timestamp when the link expires.', 'shareadraft' ),
						],
					],
				],
				'execute_callback'    => [ $this, 'create_link' ],
				'permission_callback' => [ $this, 'can_create_link' ],
				'meta'                => [
					// `public` (WP 7.1+) exposes the ability to MCP and the AI
					// Client and seeds `show_in_rest`. On WP 6.9/7.0 that seeding
					// does not exist, so set `show_in_rest` explicitly to keep REST
					// exposure working across every supported version.
					'public'       => true,
					'show_in_rest' => true,
					'annotations'  => [
						// Writes a token row, but only ever adds — never removes or
						// mutates existing state — and each call yields a new link.
						'readonly'    => false,
						'destructive' => false,
						'idempotent'  => false,
					],
				],
			]
		);

		wp_register_ability(
			self::LIST_LINKS,
			[
				'label'               => __( 'List preview links', 'shareadraft' ),
				'description'         => __( 'Lists the active preview links — their usage, expiry, and a short token hint — so an existing link can be reused instead of minting a duplicate. Pass a post ID to list one post\'s links, or omit it to list every live link on the site (which needs broader permissions). The shareable URL is not returned (only a hint), because the token itself is never stored.', 'shareadraft' ),
				'category'            => self::CATEGORY,
				'input_schema'        => [
					'type'       => 'object',
					'properties' => [
						'post_id'    => [
							'type'        => 'integer',
							'description' => __( 'ID of the post whose preview links to list. Omit to list every live link on the site.', 'shareadraft' ),
						],
						'created_by' => [
							'type'        => 'integer',
							'description' => __( 'Only the links this user created — the site-wide listing\'s creator filter, so it cannot be combined with post_id.', 'shareadraft' ),
						],
					],
				],
				'output_schema'       => [
					'type'  => 'array',
					'items' => [
						'type'       => 'object',
						'properties' => [
							'post_id'     => [
								'type'        => 'integer',
								'description' => __( 'ID of the post the link previews.', 'shareadraft' ),
							],
							'id'          => [
								'type'        => 'string',
								'description' => __( 'Token hash identifying the link.', 'shareadraft' ),
							],
							'token_hint'  => [
								'type'        => 'string',
								'description' => __( 'Last few characters of the token, to recognise the link.', 'shareadraft' ),
							],
							'created_at'  => [ 'type' => 'integer' ],
							'expires_at'  => [ 'type' => 'integer' ],
							'max_uses'    => [ 'type' => [ 'integer', 'null' ] ],
							'use_count'   => [ 'type' => 'integer' ],
							'exhausted'   => [ 'type' => 'boolean' ],
							'allowed_ips' => [
								'type'        => 'array',
								'items'       => [ 'type' => 'string' ],
								'description' => __( 'IP ranges the link is restricted to; empty means no per-link restriction.', 'shareadraft' ),
							],
							'recipients'  => [
								'type'        => 'array',
								'items'       => [ 'type' => 'string' ],
								'description' => __( 'Emails of the named reviewers the link is bound to; empty means anyone with the link can view.', 'shareadraft' ),
							],
						],
					],
				],
				'execute_callback'    => [ $this, 'list_links' ],
				'permission_callback' => [ $this, 'can_list_links' ],
				'meta'                => [
					'public'       => true,
					'show_in_rest' => true,
					'annotations'  => [
						// Pure read: no state changes, and repeating it is harmless.
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					],
				],
			]
		);

		wp_register_ability(
			self::REVOKE_LINK,
			[
				'label'               => __( 'Revoke preview link', 'shareadraft' ),
				'description'         => __( 'Revokes preview links at one of four scopes, mirroring the admin page\'s tools: one of a post\'s links (a token hint or link id from list-preview-links), every live link on a post, every link a given user created (the offboarding sweep), or every live link on the site (the break-glass switch — needs administrator rights). A revoked link stops working immediately; a visitor opening it is told it was revoked.', 'shareadraft' ),
				'category'            => self::CATEGORY,
				'input_schema'        => [
					'type'       => 'object',
					'properties' => [
						'post_id'    => [
							'type'        => 'integer',
							'description' => __( 'ID of the post whose preview link to revoke. Omit for the site-wide scopes.', 'shareadraft' ),
						],
						'link'       => [
							'type'        => 'string',
							'description' => __( 'The link to revoke: a token hint or a full link id, as returned by list-preview-links. Needs post_id; omit when revoking a wider scope.', 'shareadraft' ),
						],
						'created_by' => [
							'type'        => 'integer',
							'description' => __( 'Revoke every link this user created, across the whole site — e.g. when someone leaves.', 'shareadraft' ),
						],
						'all'        => [
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'With post_id, revoke every live link on the post; on its own, revoke every live link on the site.', 'shareadraft' ),
						],
					],
				],
				'output_schema'       => [
					'type'       => 'object',
					'properties' => [
						'revoked' => [
							'type'        => 'integer',
							'description' => __( 'How many links were revoked in this run.', 'shareadraft' ),
						],
						'pending' => [
							'type'        => 'boolean',
							'description' => __( 'True when a site-wide sweep was too large for one run; the rest are being revoked in the background.', 'shareadraft' ),
						],
					],
				],
				'execute_callback'    => [ $this, 'revoke_link' ],
				'permission_callback' => [ $this, 'can_revoke_link' ],
				'meta'                => [
					'public'       => true,
					'show_in_rest' => true,
					'annotations'  => [
						// Kills working links, so clients should confirm first; but
						// repeating a revoke changes nothing further.
						'readonly'    => false,
						'destructive' => true,
						'idempotent'  => true,
					],
				],
			]
		);

		wp_register_ability(
			self::PRUNE_LINKS,
			[
				'label'               => __( 'Prune preview links', 'shareadraft' ),
				'description'         => __( 'Deletes expired and revoked preview links past their retention period, site-wide. The scheduled sweep does this daily; run it when waiting is not acceptable. Until a dead link is pruned, a visitor opening it is told why it stopped working; after, they see a plain 404.', 'shareadraft' ),
				'category'            => self::CATEGORY,
				'input_schema'        => [
					'type'       => 'object',
					'properties' => [
						'grace' => [
							'type'        => 'integer',
							'minimum'     => 0,
							'description' => __( 'Override the retention period for dead links, in seconds. 0 deletes every expired or revoked link immediately. Omit to use the configured grace period.', 'shareadraft' ),
						],
					],
				],
				'output_schema'       => [
					'type'       => 'object',
					'properties' => [
						'pruned' => [
							'type'        => 'integer',
							'description' => __( 'How many dead links were deleted.', 'shareadraft' ),
						],
					],
				],
				'execute_callback'    => [ $this, 'prune_links' ],
				'permission_callback' => [ $this, 'can_prune_links' ],
				'meta'                => [
					'public'       => true,
					'show_in_rest' => true,
					'annotations'  => [
						// Deletes records for good, so clients should confirm first;
						// repeating a sweep finds nothing more to delete.
						'readonly'    => false,
						'destructive' => true,
						'idempotent'  => true,
					],
				],
			]
		);

		wp_register_ability(
			self::SET_ENABLED,
			[
				'label'               => __( 'Enable or disable preview links', 'shareadraft' ),
				'description'         => __( 'Turns preview links on or off site-wide. Disabling is a reversible pause, not a revocation: every link keeps its own state and simply stops working until links are re-enabled, which makes it the first response to a suspected leak. Returns the resulting state, including who disabled links and when.', 'shareadraft' ),
				'category'            => self::CATEGORY,
				'input_schema'        => [
					'type'       => 'object',
					'required'   => [ 'enabled' ],
					'properties' => [
						'enabled' => [
							'type'        => 'boolean',
							'description' => __( 'Whether preview links should work: false pauses every link on the site, true lets them work again.', 'shareadraft' ),
						],
					],
				],
				'output_schema'       => [
					'type'       => 'object',
					'properties' => [
						'enabled'     => [
							'type'        => 'boolean',
							'description' => __( 'Whether preview links now work.', 'shareadraft' ),
						],
						'disabled_at' => [
							'type'        => [ 'integer', 'null' ],
							'description' => __( 'Unix timestamp links were disabled, or null while enabled.', 'shareadraft' ),
						],
						'disabled_by' => [
							'type'        => [ 'integer', 'null' ],
							'description' => __( 'ID of the user who disabled links (0 when unknown), or null while enabled.', 'shareadraft' ),
						],
					],
				],
				'execute_callback'    => [ $this, 'set_links_enabled' ],
				'permission_callback' => [ $this, 'can_set_links_enabled' ],
				'meta'                => [
					'public'       => true,
					'show_in_rest' => true,
					'annotations'  => [
						// A reversible pause, not data loss: nothing is deleted and
						// re-enabling restores every link exactly as it was. Setting
						// the same state twice changes nothing.
						'readonly'    => false,
						'destructive' => false,
						'idempotent'  => true,
					],
				],
			]
		);

		wp_register_ability(
			self::GET_STATUS,
			[
				'label'               => __( 'Get preview links status', 'shareadraft' ),
				'description'         => __( 'Reports whether preview links currently work site-wide, and — while they are disabled — who paused them and when. Check this before minting or sharing: a link created while links are disabled will not work until they are re-enabled.', 'shareadraft' ),
				'category'            => self::CATEGORY,
				'input_schema'        => [
					'type'       => 'object',
					'properties' => [],
				],
				'output_schema'       => [
					'type'       => 'object',
					'properties' => [
						'enabled'     => [
							'type'        => 'boolean',
							'description' => __( 'Whether preview links currently work.', 'shareadraft' ),
						],
						'disabled_at' => [
							'type'        => [ 'integer', 'null' ],
							'description' => __( 'Unix timestamp links were disabled, or null while enabled.', 'shareadraft' ),
						],
						'disabled_by' => [
							'type'        => [ 'integer', 'null' ],
							'description' => __( 'ID of the user who disabled links (0 when unknown), or null while enabled.', 'shareadraft' ),
						],
					],
				],
				'execute_callback'    => [ $this, 'get_links_status' ],
				'permission_callback' => [ $this, 'can_get_links_status' ],
				'meta'                => [
					'public'       => true,
					'show_in_rest' => true,
					'annotations'  => [
						// Pure read: no state changes, and repeating it is harmless.
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					],
				],
			]
		);
	}

	/**
	 * Only someone who can edit the target post may mint a link for it — the
	 * same gate the REST endpoint applies.
	 *
	 * Input is not guaranteed to be schema-validated when a caller runs the
	 * permission check on its own, so read it defensively.
	 *
	 * @param mixed $input The ability input.
	 */
	public function can_create_link( $input ): bool {
		$post_id = is_array( $input ) && isset( $input['post_id'] ) && is_numeric( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		return current_user_can( 'edit_post', $post_id );
	}

	/**
	 * @param mixed $input The schema-validated ability input.
	 * @return array{url: string, expires_at: int}|WP_Error
	 */
	public function create_link( $input ) {
		$input = is_array( $input ) ? $input : [];

		$post_id    = isset( $input['post_id'] ) && is_numeric( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$expiration = isset( $input['expiration'] ) && is_numeric( $input['expiration'] ) ? (int) $input['expiration'] : PreviewRestController::default_expiration();
		$max_uses   = isset( $input['max_uses'] ) && is_numeric( $input['max_uses'] ) ? (int) $input['max_uses'] : null;

		$allowed_ips = [];

		if ( isset( $input['allowed_ips'] ) && is_array( $input['allowed_ips'] ) ) {
			/** @var mixed $range */
			foreach ( $input['allowed_ips'] as $range ) {
				if ( is_string( $range ) ) {
					$allowed_ips[] = $range;
				}
			}
		}

		$recipients = [];

		if ( isset( $input['recipients'] ) && is_array( $input['recipients'] ) ) {
			/** @var mixed $recipient */
			foreach ( $input['recipients'] as $recipient ) {
				if ( is_string( $recipient ) ) {
					$recipients[] = $recipient;
				}
			}
		}

		return $this->minter->mint( $post_id, $expiration, $max_uses, 'ability', $allowed_ips, $recipients );
	}

	/**
	 * Listing one post is gated the same way as minting: you must be able to
	 * edit the post. Listing the whole site needs `edit_others_posts` — the same
	 * capability as the site-wide admin table, whose view this mirrors.
	 *
	 * @param mixed $input The ability input.
	 */
	public function can_list_links( $input ): bool {
		$post_id = is_array( $input ) && isset( $input['post_id'] ) && is_numeric( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		return $post_id > 0
			? current_user_can( 'edit_post', $post_id )
			: current_user_can( 'edit_others_posts' );
	}

	/**
	 * @param mixed $input The schema-validated ability input.
	 * @return list<array{post_id: int, id: string, token_hint: string, created_at: int, expires_at: int, max_uses: int|null, use_count: int, exhausted: bool, allowed_ips: list<string>, recipients: list<string>}>|WP_Error
	 */
	public function list_links( $input ) {
		$input      = is_array( $input ) ? $input : [];
		$post_id    = isset( $input['post_id'] ) && is_numeric( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$created_by = isset( $input['created_by'] ) && is_numeric( $input['created_by'] ) ? (int) $input['created_by'] : 0;

		if ( $post_id > 0 && $created_by > 0 ) {
			return new WP_Error(
				'shareadraft_list_conflicting_input',
				__( 'The created_by filter belongs to the site-wide listing; specify it without post_id.', 'shareadraft' )
			);
		}

		$links = $post_id > 0
			? $this->service->list_for_post( $post_id )
			: $this->service->all_links( $created_by > 0 ? $created_by : null );

		$now   = time();
		$items = [];

		foreach ( $links as $link ) {
			// The site-wide gate is edit_others_posts, which a post type with
			// its own capabilities can fall outside; leave out links on posts
			// the caller cannot edit, as the admin table redacts them.
			if ( ! current_user_can( 'edit_post', $link->post_id() ) ) {
				continue;
			}

			// One link at a time through the shared presenter, so this surface
			// keeps exactly its field set (and its live-links-only rule) while
			// pairing each row with the post it belongs to.
			$presented = PreviewLinkPresenter::present_live_links( [ $link ], $now );

			if ( [] === $presented ) {
				continue;
			}

			$items[] = [ 'post_id' => $link->post_id() ] + $presented[0];
		}

		return $items;
	}

	/**
	 * Each revoke scope carries the gate its admin-page counterpart does: a
	 * post's links need `edit_post` (the editor's Manage modal), a creator sweep
	 * needs `edit_others_posts` (the site-wide table's bulk action), and the
	 * break-glass revoke-everything needs `manage_options`.
	 *
	 * The creator sweep is deliberately not narrowed to posts the caller can
	 * edit: it is offboarding, and quietly leaving some of a leaver's links
	 * working would be worse than over-revoking.
	 *
	 * @param mixed $input The ability input.
	 */
	public function can_revoke_link( $input ): bool {
		$input      = is_array( $input ) ? $input : [];
		$post_id    = isset( $input['post_id'] ) && is_numeric( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$created_by = isset( $input['created_by'] ) && is_numeric( $input['created_by'] ) ? (int) $input['created_by'] : 0;
		$all        = (bool) ( $input['all'] ?? false );

		// Resolve the target in the same precedence revoke_link() acts on it:
		// a creator sweep outranks post_id, so the gate must check created_by
		// first or an edit_post pass on an unrelated post would authorise a
		// site-wide sweep that is meant to need edit_others_posts.
		if ( $created_by > 0 ) {
			return current_user_can( 'edit_others_posts' );
		}

		if ( $all && 0 === $post_id ) {
			return current_user_can( 'manage_options' );
		}

		if ( $post_id > 0 ) {
			return current_user_can( 'edit_post', $post_id );
		}

		return false;
	}

	/**
	 * @param mixed $input The schema-validated ability input.
	 * @return array{revoked: int, pending: bool}|WP_Error
	 */
	public function revoke_link( $input ) {
		$input = is_array( $input ) ? $input : [];

		$post_id    = isset( $input['post_id'] ) && is_numeric( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$identifier = isset( $input['link'] ) && is_string( $input['link'] ) ? $input['link'] : '';
		$created_by = isset( $input['created_by'] ) && is_numeric( $input['created_by'] ) ? (int) $input['created_by'] : 0;
		$all        = (bool) ( $input['all'] ?? false );

		$targets = (int) ( '' !== $identifier ) + (int) ( $created_by > 0 ) + (int) $all;

		if ( $targets > 1 ) {
			return new WP_Error(
				'shareadraft_revoke_conflicting_input',
				__( 'Specify exactly one of link, created_by, or all.', 'shareadraft' )
			);
		}

		if ( $created_by > 0 ) {
			return [
				'revoked' => $this->revoker->revoke_by_creator( $created_by ),
				'pending' => $this->revoker->has_pending_work(),
			];
		}

		if ( $all && 0 === $post_id ) {
			return [
				'revoked' => $this->revoker->revoke_all(),
				'pending' => $this->revoker->has_pending_work(),
			];
		}

		if ( $all ) {
			return [
				'revoked' => $this->service->revoke_active_links_for_post( $post_id ),
				'pending' => false,
			];
		}

		if ( '' === $identifier || 0 === $post_id ) {
			return new WP_Error(
				'shareadraft_revoke_missing_target',
				__( 'Specify a post_id and the link to revoke (a token hint or full id), a created_by user, or all.', 'shareadraft' )
			);
		}

		$matches = PreviewLinkService::matching_links( $this->service->list_for_post( $post_id ), $identifier );

		if ( [] === $matches ) {
			return new WP_Error(
				'shareadraft_link_not_found',
				sprintf(
					/* translators: %s: the token hint or link id the caller supplied. */
					__( 'No preview link matches "%s".', 'shareadraft' ),
					$identifier
				)
			);
		}

		if ( count( $matches ) > 1 ) {
			return new WP_Error(
				'shareadraft_link_ambiguous',
				sprintf(
					/* translators: 1: the token hint the caller supplied, 2: comma-separated list of full link ids. */
					__( '"%1$s" matches more than one link; use one of these full ids instead: %2$s.', 'shareadraft' ),
					$identifier,
					implode( ', ', array_map( static fn ( PreviewLink $link ): string => $link->token_hash(), $matches ) )
				)
			);
		}

		if ( ! $this->service->revoke( $post_id, $matches[0]->token_hash() ) ) {
			return new WP_Error(
				'shareadraft_revoke_failed',
				__( 'The preview link could not be revoked; try again.', 'shareadraft' )
			);
		}

		return [
			'revoked' => 1,
			'pending' => false,
		];
	}

	/**
	 * Pruning deletes records site-wide, so it is held to `manage_options` —
	 * the same bar as the admin page's break-glass actions. The input plays no
	 * part in the decision, so the callback takes none.
	 */
	public function can_prune_links(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * @param mixed $input The schema-validated ability input.
	 * @return array{pruned: int}
	 */
	public function prune_links( $input ): array {
		$grace = is_array( $input ) && isset( $input['grace'] ) && is_numeric( $input['grace'] ) && (int) $input['grace'] >= 0
			? (int) $input['grace']
			: null;

		return [ 'pruned' => $this->collector->sweep_all( $grace ) ];
	}

	/**
	 * The switch pauses or restores every link on the site, so it is held to
	 * `manage_options` — the same bar as the admin page's toggle slider. The
	 * input plays no part in the decision, so the callback takes none.
	 */
	public function can_set_links_enabled(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * @param mixed $input The schema-validated ability input.
	 * @return array{enabled: bool, disabled_at: int|null, disabled_by: int|null}
	 */
	public function set_links_enabled( $input ): array {
		$enabled = is_array( $input ) && (bool) ( $input['enabled'] ?? false );

		if ( $enabled ) {
			$this->toggle->enable();
		} else {
			$this->toggle->disable();
		}

		return $this->links_status();
	}

	/**
	 * Anyone who can hold a preview link — an author drafting — may ask whether
	 * links currently work; the answer decides whether sharing one is useful.
	 */
	public function can_get_links_status(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * @return array{enabled: bool, disabled_at: int|null, disabled_by: int|null}
	 */
	public function get_links_status(): array {
		return $this->links_status();
	}

	/**
	 * The switch state, shaped once for both the read and the write-and-report.
	 *
	 * @return array{enabled: bool, disabled_at: int|null, disabled_by: int|null}
	 */
	private function links_status(): array {
		return [
			'enabled'     => ! $this->toggle->is_disabled(),
			'disabled_at' => $this->toggle->disabled_at(),
			'disabled_by' => $this->toggle->disabled_by(),
		];
	}
}
