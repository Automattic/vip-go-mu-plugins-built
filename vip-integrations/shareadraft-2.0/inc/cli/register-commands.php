<?php

namespace Automattic\ShareADraft\Cli;

use Automattic\ShareADraft\BulkLinkRevoker;
use Automattic\ShareADraft\LinkGarbageCollector;
use Automattic\ShareADraft\LinkToggle;
use Automattic\ShareADraft\PreviewLinkMinter;
use Automattic\ShareADraft\PreviewLinkService;
use WP_CLI;

// Required explicitly rather than autoloaded: the plugin's first-party
// autoloader deliberately maps only the flat inc/ directory, and these classes
// are only ever needed on a WP-CLI invocation, which passes through here.
require_once __DIR__ . '/class-commandnamespace.php';
require_once __DIR__ . '/class-createcommand.php';
require_once __DIR__ . '/class-disablecommand.php';
require_once __DIR__ . '/class-enablecommand.php';
require_once __DIR__ . '/class-listcommand.php';
require_once __DIR__ . '/class-prunecommand.php';
require_once __DIR__ . '/class-revokecommand.php';

/**
 * Register every `wp shareadraft` command.
 *
 * Called from the composition root with the same service graph that backs the
 * REST endpoint, the abilities, and the admin table, so a link minted or
 * revoked from the shell obeys exactly the same rules. Instances (not class
 * names) are handed to WP-CLI because the commands take their collaborators
 * through the constructor, which WP-CLI could not build itself.
 */
function register_commands( PreviewLinkService $service, PreviewLinkMinter $minter, LinkGarbageCollector $collector, LinkToggle $toggle, BulkLinkRevoker $revoker ): void {
	// Declares the namespace the subcommands sit in, so `wp shareadraft`
	// itself has a description.
	WP_CLI::add_command( 'shareadraft', CommandNamespace::class );

	WP_CLI::add_command( 'shareadraft create', new CreateCommand( $minter, $toggle ) );
	WP_CLI::add_command( 'shareadraft disable', new DisableCommand( $toggle ) );
	WP_CLI::add_command( 'shareadraft enable', new EnableCommand( $toggle ) );
	WP_CLI::add_command( 'shareadraft list', new ListCommand( $service, $toggle ) );
	WP_CLI::add_command( 'shareadraft prune', new PruneCommand( $collector ) );
	WP_CLI::add_command( 'shareadraft revoke', new RevokeCommand( $service, $revoker ) );
}
