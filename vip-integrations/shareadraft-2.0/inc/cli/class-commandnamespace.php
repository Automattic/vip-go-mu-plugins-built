<?php

namespace Automattic\ShareADraft\Cli;

use WP_CLI\Dispatcher\CommandNamespace as WpCliCommandNamespace;

// Each subcommand registers itself, which leaves WP-CLI to invent the
// `shareadraft` namespace containing them — and an invented namespace has no
// description. This class exists only to give it one, and WP-CLI renders the
// docblock below verbatim in `wp help shareadraft`, so it must hold nothing
// but the user-facing summary.

/**
 * Create and manage pre-publish preview links.
 */
final class CommandNamespace extends WpCliCommandNamespace {
}
