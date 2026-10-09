<?php

namespace Automattic\ShareADraft\Cli;

use Automattic\ShareADraft\LinkToggle;
use Automattic\ShareADraft\PreviewLinkMinter;
use Automattic\ShareADraft\PreviewRestController;
use WP_CLI;
use WP_Error;

/**
 * The `wp shareadraft create` command.
 *
 * A thin adapter over {@see PreviewLinkMinter}, the same orchestration behind
 * the REST endpoint and the create-preview-link ability, so a link minted from
 * the shell passes exactly the same validation and records the same telemetry
 * (with `cli` as its channel). CLI output is deliberately untranslated, as is
 * conventional for WP-CLI commands. Behaviour is pinned by
 * features/create.feature.
 */
final class CreateCommand {
	private PreviewLinkMinter $minter;
	private LinkToggle $toggle;

	public function __construct( PreviewLinkMinter $minter, LinkToggle $toggle ) {
		$this->minter = $minter;
		$this->toggle = $toggle;
	}

	/**
	 * Create a preview link for a post.
	 *
	 * Prints the shareable URL. The URL carries the secret token — the only moment it exists in plaintext — so treat the output as sensitive.
	 *
	 * ## OPTIONS
	 *
	 * <post-id>
	 * : The post to create a preview link for.
	 *
	 * [--expiration=<seconds>]
	 * : How long the link stays valid, in seconds. Must be one of the allowed lifetimes (3600, 28800, 86400, or 604800 unless the site filters `shareadraft_expiration_options`). Defaults to the site's default lifetime (8 hours unless filtered).
	 *
	 * [--max-uses=<count>]
	 * : How many people can open the link, between 1 and the site's maximum (1000 unless the site filters `shareadraft_max_uses_limit`). Each browser or device counts as a new person. Defaults to the site's maximum, or unlimited if the site has none.
	 *
	 * [--allowed-ips=<ranges>]
	 * : Comma-separated IP addresses or CIDR ranges (IPv4 or IPv6) the link may be opened from. Defaults to no IP restriction.
	 *
	 * [--recipients=<emails>]
	 * : Comma-separated email addresses of the named reviewers the link is bound to. Each reviewer must verify their address with an emailed code before viewing. Defaults to a bearer link anyone holding the URL may use.
	 *
	 * [--porcelain]
	 * : Output just the preview URL.
	 *
	 * ## EXAMPLES
	 *
	 *     # Create a link with the default lifetime.
	 *     $ wp shareadraft create 123
	 *     https://example.com/?p=123&preview=true&shareadraft-token=4f7a1b9c…20e3c3d9
	 *     Success: Link expires 2026-09-09 09:30:00 UTC.
	 *
	 *     # A single-viewer link that lasts an hour, printing only the URL for a script.
	 *     $ wp shareadraft create 123 --expiration=3600 --max-uses=1 --porcelain
	 *     https://example.com/?p=123&preview=true&shareadraft-token=4f7a1b9c…20e3c3d9
	 *
	 *     # Restrict the link to an office network.
	 *     $ wp shareadraft create 123 --allowed-ips=203.0.113.0/24
	 *     https://example.com/?p=123&preview=true&shareadraft-token=4f7a1b9c…20e3c3d9
	 *     Success: Link expires 2026-09-09 09:30:00 UTC.
	 *
	 * @when after_wp_load
	 *
	 * @param string[]                  $args       Positional arguments.
	 * @param array<string, string|bool> $assoc_args Associative arguments.
	 */
	public function __invoke( array $args, array $assoc_args ): void {
		$post_id = (int) ( $args[0] ?? 0 );

		$expiration = isset( $assoc_args['expiration'] )
			? (int) $assoc_args['expiration']
			: PreviewRestController::default_expiration();

		$allowed = PreviewRestController::allowed_expirations();

		if ( ! in_array( $expiration, $allowed, true ) ) {
			WP_CLI::error(
				sprintf(
					'%d is not an allowed lifetime. Allowed values (in seconds): %s.',
					$expiration,
					implode( ', ', $allowed )
				)
			);
			return;
		}

		// The minter resolves an omitted cap and enforces the site's ceiling.
		$max_uses = isset( $assoc_args['max-uses'] ) ? (int) $assoc_args['max-uses'] : null;

		$allowed_ips = [];

		if ( isset( $assoc_args['allowed-ips'] ) && is_string( $assoc_args['allowed-ips'] ) ) {
			// The minter validates each range; splitting is all that happens here.
			$allowed_ips = array_values(
				array_filter( array_map( 'trim', explode( ',', $assoc_args['allowed-ips'] ) ), static fn( string $range ): bool => '' !== $range )
			);
		}

		$recipients = [];

		if ( isset( $assoc_args['recipients'] ) && is_string( $assoc_args['recipients'] ) ) {
			// Likewise: address validity (and whether the feature is enabled on
			// this site) is the minter's call, shared with every other channel.
			$recipients = array_values(
				array_filter( array_map( 'trim', explode( ',', $assoc_args['recipients'] ) ), static fn( string $email ): bool => '' !== $email )
			);
		}

		$result = $this->minter->mint( $post_id, $expiration, $max_uses, 'cli', $allowed_ips, $recipients );

		if ( $result instanceof WP_Error ) {
			WP_CLI::error( $result->get_error_message() );
			return;
		}

		// The same warning the editor's Generate modal shows: minting still
		// works while links are paused, but the caller should know the link is
		// inert. A warning (STDERR) so --porcelain output stays clean.
		if ( $this->toggle->is_disabled() ) {
			WP_CLI::warning( 'Preview links are currently disabled site-wide. The link was created, but it will not work until an administrator re-enables preview links.' );
		}

		WP_CLI::line( $result['url'] );

		if ( ! (bool) \WP_CLI\Utils\get_flag_value( $assoc_args, 'porcelain', false ) ) {
			WP_CLI::success( sprintf( 'Link expires %s UTC.', gmdate( 'Y-m-d H:i:s', $result['expires_at'] ) ) );
		}
	}
}
