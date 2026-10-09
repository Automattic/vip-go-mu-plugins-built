<?php

namespace Automattic\ShareADraft\Cli;

use Automattic\ShareADraft\Features;
use Automattic\ShareADraft\LinkToggle;
use Automattic\ShareADraft\PreviewLink;
use Automattic\ShareADraft\PreviewLinkPresenter;
use Automattic\ShareADraft\PreviewLinkService;
use WP_CLI;
use WP_CLI\Formatter;
use WP_Post;

/**
 * The `wp shareadraft list` command.
 *
 * Reads through {@see PreviewLinkService} and shapes rows with
 * {@see PreviewLinkPresenter}, the same pair behind the REST listing and the
 * list-preview-links ability, so every surface shows the same links — live ones
 * only, and never the token itself (it is not stored; only a short hint is).
 * Behaviour is pinned by features/list.feature.
 */
final class ListCommand {
	private PreviewLinkService $service;
	private LinkToggle $toggle;

	public function __construct( PreviewLinkService $service, LinkToggle $toggle ) {
		$this->service = $service;
		$this->toggle  = $toggle;
	}

	/**
	 * List preview links, for one post or the whole site.
	 *
	 * ## OPTIONS
	 *
	 * [<post-id>]
	 * : The post whose links to list. Omit to list every live link on the site, newest first.
	 *
	 * [--created-by=<user>]
	 * : Only the links this user (an ID, login, or email) created — the site-wide listing's creator filter, so it cannot be combined with a post ID.
	 *
	 * [--field=<field>]
	 * : Print one field for each link.
	 *
	 * [--fields=<fields>]
	 * : Comma-separated list of fields to show. Available fields: post_id, id, token_hint, created_by, created_at, expires_at, expires_in, use_count, max_uses, recipients, allowed_ips.
	 *
	 * [--format=<format>]
	 * : Render output in a particular format.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - csv
	 *   - json
	 *   - count
	 *   - yaml
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     # List a post's live links.
	 *     $ wp shareadraft list 123
	 *     +------------+------------+---------------------+---------------------+------------+-----------+----------+-------------+
	 *     | token_hint | created_by | created_at          | expires_at          | expires_in | use_count | max_uses | allowed_ips |
	 *     +------------+------------+---------------------+---------------------+------------+-----------+----------+-------------+
	 *     | c3d9       | Gary Jones | 2026-09-09 01:30:00 | 2026-09-09 09:30:00 | 8 hours    | 0         |          |             |
	 *     +------------+------------+---------------------+---------------------+------------+-----------+----------+-------------+
	 *
	 *     # How many live links exist across the whole site.
	 *     $ wp shareadraft list --format=count
	 *     3
	 *
	 *     # Just the token hint, e.g. to feed `wp shareadraft revoke`.
	 *     $ wp shareadraft list 123 --field=token_hint
	 *     c3d9
	 *
	 *     # Everything one user shared, e.g. before offboarding them.
	 *     $ wp shareadraft list --created-by=jane --format=count
	 *     4
	 *
	 * @when after_wp_load
	 *
	 * @param string[]                  $args       Positional arguments.
	 * @param array<string, string|bool> $assoc_args Associative arguments.
	 */
	public function __invoke( array $args, array $assoc_args ): void {
		$post_id = isset( $args[0] ) ? (int) $args[0] : null;

		if ( null !== $post_id && ! get_post( $post_id ) instanceof WP_Post ) {
			WP_CLI::error( 'The post could not be found.' );
			return;
		}

		$created_by = null;

		if ( isset( $assoc_args['created-by'] ) && is_string( $assoc_args['created-by'] ) ) {
			if ( null !== $post_id ) {
				WP_CLI::error( 'Specify either a post ID or --created-by, not both.' );
				return;
			}

			$fetcher    = new \WP_CLI\Fetchers\User();
			$created_by = (int) $fetcher->get_check( $assoc_args['created-by'] )->ID;
		}

		// The same warning the editor's Manage modal shows. A warning (STDERR)
		// so table, CSV, and JSON output stay parseable.
		if ( $this->toggle->is_disabled() ) {
			WP_CLI::warning( 'Preview links are currently disabled site-wide. None of the listed links will work until an administrator re-enables preview links.' );
		}

		$links = null === $post_id
			? $this->service->all_links( $created_by )
			: $this->service->list_for_post( $post_id );

		$now   = time();
		$items = [];

		foreach ( $links as $link ) {
			// One link at a time through the shared presenter, so the CLI keeps
			// exactly its field set (and its live-links-only rule) while adding
			// the post ID the per-post surfaces do not need.
			$presented = PreviewLinkPresenter::present_live_links( [ $link ], $now );

			if ( [] === $presented ) {
				continue;
			}

			$row = $presented[0];

			$items[] = [
				'post_id'     => $link->post_id(),
				'id'          => $row['id'],
				'token_hint'  => $row['token_hint'],
				'created_by'  => self::creator_label( $link ),
				'created_at'  => gmdate( 'Y-m-d H:i:s', $row['created_at'] ),
				'expires_at'  => gmdate( 'Y-m-d H:i:s', $row['expires_at'] ),
				'expires_in'  => human_time_diff( $now, $row['expires_at'] ),
				'use_count'   => $row['use_count'],
				'max_uses'    => $row['max_uses'],
				'recipients'  => implode( ',', $row['recipients'] ),
				'allowed_ips' => implode( ',', $row['allowed_ips'] ),
			];
		}

		$format = isset( $assoc_args['format'] ) && is_string( $assoc_args['format'] )
			? $assoc_args['format']
			: 'table';

		if ( [] === $items && 'table' === $format ) {
			WP_CLI::log( 'No preview links found.' );
			return;
		}

		$default_fields = [ 'token_hint', 'created_by', 'created_at', 'expires_at', 'expires_in', 'use_count', 'max_uses' ];

		// Match the admin table: a restriction the site has switched off keeps
		// its column out of the default view (it stays reachable via --fields).
		if ( Features::recipients_enabled() ) {
			$default_fields[] = 'recipients';
		}

		if ( Features::ip_allowlist_enabled() ) {
			$default_fields[] = 'allowed_ips';
		}

		if ( null === $post_id ) {
			array_unshift( $default_fields, 'post_id' );
		}

		$formatter = new Formatter( $assoc_args, $default_fields );
		$formatter->display_items( $items );
	}

	/**
	 * Who created a link, matching the admin table's Created by column: the
	 * user's display name, a placeholder for a deleted user, and an em dash
	 * when no user was recorded (e.g. minted from WP-CLI without --user).
	 */
	private static function creator_label( PreviewLink $link ): string {
		if ( ! $link->has_known_creator() ) {
			return '—';
		}

		$user = get_userdata( $link->created_by() );

		return false !== $user ? $user->display_name : sprintf( 'User #%d', $link->created_by() );
	}
}
