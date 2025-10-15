<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Admin;

/**
 * Service class for managing contextual help content.
 *
 * @package Automattic\RewriteRulesInspector\Admin
 * @since 1.5.0
 */
final class ContextualHelp {

	/**
	 * Add screen help tabs to explain rewrite rules and permastructs.
	 *
	 * @since 1.5.0
	 */
	public function add_help_tabs(): void {
		$screen = get_current_screen();
		
		// Overview tab.
		$screen->add_help_tab(
			[
				'id'      => 'overview',
				'title'   => __( 'Overview', 'rewrite-rules-inspector' ),
				'content' => '<p>' . __( 'The Rewrite Rules Inspector helps you understand and debug your WordPress site\'s URL structure. It shows you all the rewrite rules and permastructs that WordPress uses to handle URLs.', 'rewrite-rules-inspector' ) . '</p>',
			]
		);
		
		// Rewrite Rules tab.
		$screen->add_help_tab(
			[
				'id'      => 'rewrite-rules',
				'title'   => __( 'Rewrite Rules', 'rewrite-rules-inspector' ),
				'content' => '<p>' . __( '<strong>Rewrite Rules</strong> are the actual URL patterns that WordPress uses to match incoming requests and determine what content to display.', 'rewrite-rules-inspector' ) . '</p>' .
					'<p>' . __( 'Each rule consists of:', 'rewrite-rules-inspector' ) . '</p>' .
					'<ul>' .
					'<li>' . __( '<strong>Rule:</strong> A regular expression pattern that matches URLs (e.g., <code>^category/([^/]+)/?$</code>)', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( '<strong>Rewrite:</strong> The internal WordPress query that gets executed (e.g., <code>index.php?category_name=$matches[1]</code>)', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( '<strong>Source:</strong> Where the rule comes from (e.g., category, post, custom permastruct)', 'rewrite-rules-inspector' ) . '</li>' .
					'</ul>' .
					'<p>' . __( 'When someone visits a URL, WordPress checks these rules in order until it finds a match, then executes the corresponding rewrite to determine what content to show.', 'rewrite-rules-inspector' ) . '</p>',
			]
		);
		
		// Permastructs tab.
		$screen->add_help_tab(
			[
				'id'      => 'permastructs',
				'title'   => __( 'Permastructs', 'rewrite-rules-inspector' ),
				'content' => '<p>' . __( '<strong>Permastructs</strong> are the URL structure templates that define how different types of content should be accessed via URLs.', 'rewrite-rules-inspector' ) . '</p>' .
					'<p>' . __( 'For example:', 'rewrite-rules-inspector' ) . '</p>' .
					'<ul>' .
					/* translators: %year%, %monthnum%, %day%, %postname% are permalink structure tags. Keep them as-is in the URL example. */
					'<li>' . __( '<strong>Post Permalink:</strong> <code>/%year%/%monthnum%/%day%/%postname%/</code> - defines how individual posts are accessed', 'rewrite-rules-inspector' ) . '</li>' .
					/* translators: %category% is a permalink structure tag. Keep it as-is in the URL example. */
					'<li>' . __( '<strong>Category Archive:</strong> <code>/category/%category%</code> - defines how category pages are accessed', 'rewrite-rules-inspector' ) . '</li>' .
					/* translators: %post_tag% is a permalink structure tag. Keep it as-is in the URL example. */
					'<li>' . __( '<strong>Tag Archive:</strong> <code>/tag/%post_tag%</code> - defines how tag pages are accessed', 'rewrite-rules-inspector' ) . '</li>' .
					'</ul>' .
					'<p>' . __( 'WordPress uses these permastructs to generate the actual rewrite rules. The permastructs are like blueprints, while the rewrite rules are the specific patterns that get created from those blueprints.', 'rewrite-rules-inspector' ) . '</p>' .
					'<p>' . __( 'You can customize permastructs through WordPress settings (Settings → Permalinks) or by using WordPress functions like <code>add_permastruct()</code> in your theme or plugin.', 'rewrite-rules-inspector' ) . '</p>',
			]
		);
		
		// Troubleshooting tab.
		$screen->add_help_tab(
			[
				'id'      => 'troubleshooting',
				'title'   => __( 'Troubleshooting', 'rewrite-rules-inspector' ),
				'content' => '<p>' . __( '<strong>Common Issues:</strong>', 'rewrite-rules-inspector' ) . '</p>' .
					'<ul>' .
					'<li>' . __( '<strong>Missing Rules:</strong> If you see rules marked as "missing", try clicking the "Flush Rules" button to regenerate them.', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( '<strong>404 Errors:</strong> Check if the URL pattern exists in the rewrite rules. Use the "Match URL" filter to test specific URLs.', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( '<strong>Custom URLs Not Working:</strong> Verify that your custom permastruct is properly registered and that rewrite rules have been flushed.', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( '<strong>Plugin Conflicts:</strong> Some plugins may modify rewrite rules. Check the "Source" column to see which rules come from which sources.', 'rewrite-rules-inspector' ) . '</li>' .
					'</ul>' .
					'<p>' . __( '<strong>Tips:</strong>', 'rewrite-rules-inspector' ) . '</p>' .
					'<ul>' .
					'<li>' . __( 'Use the "Rule Source" filter to focus on specific types of rules.', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( 'Download the rules as a text file for offline analysis.', 'rewrite-rules-inspector' ) . '</li>' .
					'<li>' . __( 'Check the permastructs section to understand the URL structure templates.', 'rewrite-rules-inspector' ) . '</li>' .
					'</ul>',
			]
		);
	}

	/**
	 * Set the help sidebar content.
	 *
	 * @since 1.5.0
	 */
	public function set_help_sidebar(): void {
		$screen = get_current_screen();
		
		$screen->set_help_sidebar(
			'<p><strong>' . __( 'For more information:', 'rewrite-rules-inspector' ) . '</strong></p>' .
			'<p><a href="https://wordpress.org/support/article/using-permalinks/" target="_blank">' . __( 'WordPress Permalinks Documentation', 'rewrite-rules-inspector' ) . '</a></p>' .
			'<p><a href="https://developer.wordpress.org/reference/functions/add_rewrite_rule/" target="_blank">' . __( 'WordPress Rewrite API', 'rewrite-rules-inspector' ) . '</a></p>' .
			'<p><a href="https://github.com/Automattic/Rewrite-Rules-Inspector" target="_blank">' . __( 'Plugin on GitHub', 'rewrite-rules-inspector' ) . '</a></p>'
		);
	}

	/**
	 * Add all help content to the current screen.
	 *
	 * @since 1.5.0
	 */
	public function add_help_content(): void {
		$this->add_help_tabs();
		$this->set_help_sidebar();
	}
}
