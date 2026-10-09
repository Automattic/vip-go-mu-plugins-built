<?php

namespace Automattic\ShareADraft;

/**
 * Composition root: assembles the object graph and registers its hooks.
 *
 * The one config value read here is the optional `ip_allowlist` key: central
 * CIDR ranges set once in the VIP Dashboard that apply to every preview link,
 * unioned with each link's own ranges. It is read defensively — absent, empty,
 * or malformed all mean "no central ranges" — so the plugin never depends on
 * the Dashboard side existing.
 */
final class Plugin {
	/** @var self|null */
	private static $instance;

	// @codeCoverageIgnoreStart
	// This code is executed in bootstrap.php, before PHPUnit initializes test coverage
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register the plugin's hooks with WordPress.
	 *
	 * The plugin entry file calls this during load.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'init' ] );
	}

	public function init(): void {
		// Translations ship inside the plugin rather than coming from
		// translate.wordpress.org, so the plugin's own languages/ directory has
		// to be registered explicitly. PHP strings resolve from here; the
		// editor script's JSON catalogues are pointed at the same directory in
		// EditorAssets.
		load_plugin_textdomain(
			'shareadraft',
			false,
			dirname( plugin_basename( VIP_SHAREADRAFT_FILE ) ) . '/languages'
		);

		// Central IP ranges from the VIP Dashboard, if any. Untrusted customer
		// input: anything unusable is dropped rather than half-applied, and
		// named on the Preview Links screen so a typo is not silently ignored.
		$raw_ip_ranges      = Config::get_instance()->get( 'ip_allowlist' );
		$central_ip_ranges  = IpAllowlist::sanitize( $raw_ip_ranges );
		$rejected_ip_ranges = IpAllowlist::rejected( $raw_ip_ranges );

		// Composition root: assemble the domain graph once (no container) and
		// share it between minting (REST) and enforcement (the gate). Swapping
		// storage, clock, or policy is a one-line change here.
		$clock   = new SystemClock();
		$service = new PreviewLinkService(
			new PostMetaTokenRepository(),
			new AccessPolicy( $central_ip_ranges ),
			$clock
		);
		$minter  = new PreviewLinkMinter( $service );

		$rest_controller = new PreviewRestController( $service, $minter );
		add_action( 'rest_api_init', [ $rest_controller, 'register_routes' ] );

		// The site-wide enable/disable switch: a reversible pause the gate
		// honours, distinct from revocation.
		$toggle = new LinkToggle();

		$collector = new LinkGarbageCollector( $service );

		( new PreviewGate( $service, new RecipientVerifier(), $toggle ) )->register();
		( new PublishCleanup( $service ) )->register();
		$collector->register();
		( new EditorAssets( [] !== $central_ip_ranges, $toggle->is_disabled() ) )->register();

		// Bulk revocation: the break-glass sweep, offboarding on user deletion,
		// and the customer-facing revoke-user-links action.
		$revoker = new BulkLinkRevoker( $service );
		$revoker->register();

		// Site-wide audit + revoke table for editors.
		( new PreviewLinksAdminPage( $service, $clock, $revoker, $toggle, $central_ip_ranges, $rejected_ip_ranges ) )->register();

		// Expose link management to MCP, the AI Client, and the abilities REST
		// runner, mirroring the `wp shareadraft` commands. Shares the same
		// minter and service as the REST endpoint above.
		( new PreviewAbilities( $service, $minter, $collector, $toggle, $revoker ) )->register();

		// Reviewer emails in core's Export/Erase Personal Data tools.
		( new PersonalData( $service ) )->register();

		// Surfaces whether the cleanup sweep is actually running, which is the
		// one part of the plugin that depends on cron firing.
		( new SiteHealth( $clock ) )->register();

		// The `wp shareadraft` commands, sharing the same graph as every
		// other surface. Loaded only under WP-CLI: the CLI classes are the one
		// part of the plugin the flat first-party autoloader does not map.
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			require_once __DIR__ . '/cli/register-commands.php';
			Cli\register_commands( $service, $minter, $collector, $toggle, $revoker );
		}

		// Development-checkout safety net: build/ is not committed, and the
		// enqueues above silently skip a missing build, so remind admins to run
		// the build rather than leaving them to wonder where the UI went.
		( new BuildNotice() )->register();
	}
	// @codeCoverageIgnoreEnd
}
