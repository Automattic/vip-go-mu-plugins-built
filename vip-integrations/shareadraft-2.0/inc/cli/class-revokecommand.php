<?php

namespace Automattic\ShareADraft\Cli;

use Automattic\ShareADraft\BulkLinkRevoker;
use Automattic\ShareADraft\PreviewLink;
use Automattic\ShareADraft\PreviewLinkService;
use WP_CLI;

/**
 * The `wp shareadraft revoke` command.
 *
 * Revokes through {@see PreviewLinkService::revoke()}, the same path as the
 * editor and the admin table, so a revoked link leaves the tombstone the gate
 * needs to tell a visitor "this link was revoked" rather than a bare 404.
 * The wider scopes are the incident-response levers, and reuse the admin
 * page's {@see BulkLinkRevoker}: `<post-id> --all` kills every live link on a
 * post, `--created-by` is the offboarding sweep, and a bare `--all` is the
 * break-glass revoke-everything. Behaviour is pinned by
 * features/revoke.feature.
 */
final class RevokeCommand {
	private PreviewLinkService $service;
	private BulkLinkRevoker $revoker;

	public function __construct( PreviewLinkService $service, BulkLinkRevoker $revoker ) {
		$this->service = $service;
		$this->revoker = $revoker;
	}

	/**
	 * Revoke preview links: one link, a post's, a creator's, or all of them.
	 *
	 * ## OPTIONS
	 *
	 * [<post-id>]
	 * : The post whose link to revoke. Omit for the site-wide scopes.
	 *
	 * [<link>]
	 * : The link to revoke: a token hint as shown by `wp shareadraft list`, or a full link id.
	 *
	 * [--created-by=<user>]
	 * : Revoke every link this user (an ID, login, or email) created, across the whole site — e.g. when someone leaves.
	 *
	 * [--all]
	 * : With a post, revoke every live link on it. On its own, revoke every live link on the site (asks for confirmation; pass --yes to skip).
	 *
	 * [--yes]
	 * : Skip the confirmation the site-wide --all asks for.
	 *
	 * ## EXAMPLES
	 *
	 *     # Revoke the link whose token hint is "ab3f".
	 *     $ wp shareadraft revoke 123 ab3f
	 *     Success: Revoked 1 preview link.
	 *
	 *     # A preview URL leaked: kill every live link on the post.
	 *     $ wp shareadraft revoke 123 --all
	 *     Success: Revoked 2 preview links.
	 *
	 *     # Someone left: kill every link they created, site-wide.
	 *     $ wp shareadraft revoke --created-by=jane
	 *     Success: Revoked 4 preview links.
	 *
	 *     # Break glass: kill every live link on the site.
	 *     $ wp shareadraft revoke --all --yes
	 *     Success: Revoked 12 preview links.
	 *
	 * @when after_wp_load
	 *
	 * @param string[]                  $args       Positional arguments.
	 * @param array<string, string|bool> $assoc_args Associative arguments.
	 */
	public function __invoke( array $args, array $assoc_args ): void {
		$post_id    = isset( $args[0] ) ? (int) $args[0] : null;
		$identifier = isset( $args[1] ) ? (string) $args[1] : '';
		$all        = (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'all', false );
		$created_by = isset( $assoc_args['created-by'] ) && is_string( $assoc_args['created-by'] )
			? $assoc_args['created-by']
			: '';

		if ( '' !== $created_by && ( null !== $post_id || $all ) ) {
			WP_CLI::error( 'Specify --created-by on its own, without a post ID or --all.' );
			return;
		}

		if ( '' !== $created_by ) {
			$this->revoke_by_creator( $created_by );
			return;
		}

		if ( null === $post_id ) {
			if ( ! $all ) {
				WP_CLI::error( 'Specify a post ID, --created-by, or --all.' );
				return;
			}

			$this->revoke_everything( $assoc_args );
			return;
		}

		if ( $all && '' !== $identifier ) {
			WP_CLI::error( 'Specify either a link or --all, not both.' );
			return;
		}

		if ( ! $all && '' === $identifier ) {
			WP_CLI::error( 'Specify the link to revoke (a token hint or full id), or --all.' );
			return;
		}

		if ( $all ) {
			self::report( $this->service->revoke_active_links_for_post( $post_id ) );
			return;
		}

		$matches = PreviewLinkService::matching_links( $this->service->list_for_post( $post_id ), $identifier );

		if ( [] === $matches ) {
			WP_CLI::error( sprintf( 'No preview link matches "%s".', $identifier ) );
			return;
		}

		if ( count( $matches ) > 1 ) {
			WP_CLI::error(
				sprintf(
					'"%s" matches more than one link; use one of these full ids instead: %s.',
					$identifier,
					implode( ', ', array_map( static fn ( PreviewLink $link ): string => $link->token_hash(), $matches ) )
				)
			);
			return;
		}

		if ( ! $this->service->revoke( $post_id, $matches[0]->token_hash() ) ) {
			WP_CLI::error( 'The preview link could not be revoked; try again.' );
			return;
		}

		WP_CLI::success( 'Revoked 1 preview link.' );
	}

	/**
	 * The offboarding sweep: every link the user created, site-wide.
	 */
	private function revoke_by_creator( string $user ): void {
		$fetcher = new \WP_CLI\Fetchers\User();
		$found   = $fetcher->get_check( $user );

		self::report( $this->revoker->revoke_by_creator( (int) $found->ID ), $this->revoker->has_pending_work() );
	}

	/**
	 * The break-glass sweep, behind the same confirmation the admin page asks
	 * for — its blast radius is every live link on the site.
	 *
	 * @param array<string, string|bool> $assoc_args Associative arguments.
	 */
	private function revoke_everything( array $assoc_args ): void {
		WP_CLI::confirm( 'Revoke every preview link on the site?', $assoc_args );

		self::report( $this->revoker->revoke_all(), $this->revoker->has_pending_work() );
	}

	/**
	 * The shared success line, warning first when a sweep was too large for one
	 * run and continues on cron.
	 */
	private static function report( int $revoked, bool $pending = false ): void {
		if ( $pending ) {
			WP_CLI::warning( 'The sweep is larger than one run; the rest are being revoked in the background.' );
		}

		WP_CLI::success(
			1 === $revoked ? 'Revoked 1 preview link.' : sprintf( 'Revoked %d preview links.', $revoked )
		);
	}
}
