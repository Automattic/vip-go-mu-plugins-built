<?php

/**
 * Robots.txt integration for the Cloudflare "Content Signals" proposal.
 *
 * Injects `Content-Signal:` directive lines into the site's robots.txt body
 * so crawlers and AI agents that honor the proposal can discover the site's
 * stance on AI training, AI input, and search use without first having to
 * fetch a markdown response and inspect HTTP headers.
 *
 * @see https://developers.cloudflare.com/bots/concepts/content-signals/
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Adds a `Content-Signal:` directive to robots.txt.
 *
 * @package Content_For_Agents
 */
class Robots_Txt {

	/**
	 * Constructor.
	 *
	 * @param Loader $loader The loader instance.
	 */
	public function __construct( Loader $loader ) {
		$loader->add_filter( 'robots_txt', $this, 'add_content_signal_directive', 5, 2 );
		$loader->add_filter( 'robots_txt', $this, 'add_llms_txt_reference', 5, 2 );
	}

	/**
	 * Inject a `Content-Signal:` directive into robots.txt.
	 *
	 * The Content Signals proposal places `Content-Signal:` lines inside a
	 * `User-agent:` group. We attach the directive to the catch-all
	 * `User-agent: *` group that WordPress emits at the top of robots.txt.
	 *
	 * Runs at priority 5 so the directive is injected before other plugins
	 * append their own rules to the catch-all group.
	 *
	 * @hook robots_txt
	 *
	 * @param string $output The robots.txt output.
	 * @param int    $is_public Whether the site is set to be publicly accessible (1) or not (0).
	 * @return string Modified robots.txt output.
	 */
	public function add_content_signal_directive( $output, $is_public ): string {
		if ( ! $is_public ) {
			return (string) $output;
		}

		$signal = Markdown_Response::get_content_signal_header();
		if ( '' === $signal ) {
			return (string) $output;
		}

		$directive = 'Content-Signal: ' . $signal;

		// Avoid duplicating the directive if another integration (or a re-run) already added it.
		if ( false !== strpos( (string) $output, $directive ) ) {
			return (string) $output;
		}

		$lines    = preg_split( '/\R/', (string) $output );
		$injected = false;

		if ( is_array( $lines ) ) {
			foreach ( $lines as $i => $line ) {
				if ( preg_match( '/^\s*User-agent:\s*\*\s*$/i', $line ) ) {
					array_splice( $lines, $i + 1, 0, array( $directive ) );
					$injected = true;
					break;
				}
			}
		}

		if ( $injected && is_array( $lines ) ) {
			return implode( "\n", $lines );
		}

		// No `User-agent: *` group present — emit our own group so the directive still has a valid scope.
		$prefix = "User-agent: *\n" . $directive . "\n\n";
		return $prefix . (string) $output;
	}

	/**
	 * Inject an agent-index comment referencing /llms.txt (not a Sitemap directive).
	 *
	 * @hook robots_txt
	 *
	 * @param string $output The robots.txt output.
	 * @param int    $is_public Whether the site is public.
	 * @return string
	 */
	public function add_llms_txt_reference( $output, $is_public ): string {
		if ( ! $is_public ) {
			return (string) $output;
		}

		$llms_url = home_url( '/llms.txt' );
		$marker   = '# Agent index';

		if ( false !== strpos( (string) $output, $marker ) ) {
			return (string) $output;
		}

		$block = "# Agent index: machine-readable directory for AI agents (noindex; not for search crawlers):\n# {$llms_url}\n";

		$lines    = preg_split( '/\R/', (string) $output );
		$injected = false;

		if ( is_array( $lines ) ) {
			foreach ( $lines as $i => $line ) {
				if ( preg_match( '/^\s*User-agent:\s*\*\s*$/i', $line ) ) {
					array_splice( $lines, $i + 1, 0, array( $block ) );
					$injected = true;
					break;
				}
			}
		}

		if ( $injected && is_array( $lines ) ) {
			return implode( "\n", $lines );
		}

		return "User-agent: *\n{$block}\n" . (string) $output;
	}
}
