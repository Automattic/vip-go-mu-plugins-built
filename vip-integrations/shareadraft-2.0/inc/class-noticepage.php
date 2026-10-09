<?php

namespace Automattic\ShareADraft;

/**
 * Renders the standalone pages the gate shows instead of a draft: the
 * email-verification steps, the expired/revoked/exhausted notices, and the
 * crawler stub.
 *
 * The design goal is the wp-login.php philosophy: a centred card carrying the
 * site's own icon and name, so a reviewer who was emailed a link sees a page
 * that plainly belongs to the site rather than a bare error screen — without
 * touching the theme, which cannot be rendered safely here (block themes do
 * not expose header/footer to PHP, and the page must never leak draft
 * content).
 *
 * Delivery still goes through wp_die(), deliberately: it is the request-exit
 * seam the test suite intercepts, and it owns the status code and page shell.
 * The card and a <style> block restyling that shell travel as the message, so
 * the generic wp_die look never shows.
 */
final class NoticePage {
	/**
	 * Render a notice page and end the request.
	 *
	 * @param string $title   Page title, also shown as the card's heading.
	 *                        Plain text; escaped here.
	 * @param string $content Body HTML. Callers pass pre-escaped markup.
	 * @param int    $status  HTTP status for the response.
	 */
	public static function render( string $title, string $content, int $status ): void {
		/**
		 * Filters the body content of the standalone preview notice pages (the
		 * email-verification steps, the expired/revoked/exhausted notices, and
		 * the crawler stub), for sites that want their own wording or extra
		 * branding inside the card. The returned value is trusted HTML.
		 *
		 * A site wanting a wholly different page, not just different content,
		 * can hook `wp_die_handler` instead: every notice exits through
		 * wp_die() with the status passed here.
		 *
		 * @param string $content The card's body HTML.
		 * @param array{title: string, status: int} $context The page title and HTTP status.
		 */
		/** @var mixed $filtered */
		$filtered = apply_filters(
			'shareadraft_notice_content',
			$content,
			[
				'title'  => $title,
				'status' => $status,
			]
		);

		$content = is_string( $filtered ) ? $filtered : $content;

		$icon_url = get_site_icon_url( 128 );

		$identity = sprintf(
			'%s<p class="shareadraft-site-name">%s</p>',
			'' === $icon_url
				? ''
				: sprintf( '<img class="shareadraft-site-icon" src="%s" alt="" width="64" height="64" />', esc_url( $icon_url ) ),
			esc_html( get_bloginfo( 'name', 'display' ) )
		);

		$html = self::styles() . sprintf(
			'<div class="shareadraft-notice">%s<h1>%s</h1>%s</div>',
			$identity,
			esc_html( $title ),
			$content
		);

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $html is assembled above from escaped parts (the filter's return is documented as trusted HTML), and $status is a typed int, not markup.
		wp_die( $html, esc_html( $title ), [ 'response' => $status ] );
	}

	/**
	 * The card's stylesheet. Travels in the body (valid HTML, and the only
	 * place wp_die lets us put it) and restyles wp_die's own shell — later in
	 * the document, so equal-specificity rules win. Colours meet WCAG AA in
	 * both schemes, and focus stays visible on every control.
	 */
	private static function styles(): string {
		return '<style>
			html { background: #f0f0f1; }
			body#error-page {
				max-width: 26rem;
				margin: 10vh auto 2rem;
				padding: 2rem 2.25rem;
				background: #fff;
				border: 1px solid #dcdcde;
				border-radius: 8px;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
				color: #1e1e1e;
			}
			.shareadraft-site-icon { display: block; margin: 0 auto 1rem; border-radius: 25%; }
			.shareadraft-site-name { margin: 0 0 0.25rem; text-align: center; font-size: 0.875rem; color: #646970; }
			.shareadraft-notice h1 { margin: 0 0 1.25rem; text-align: center; font-size: 1.25rem; font-weight: 600; border: 0; padding: 0; color: inherit; }
			.shareadraft-notice p { margin: 0 0 1rem; font-size: 0.9375rem; line-height: 1.6; color: #3c434a; }
			.shareadraft-notice label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; font-weight: 600; }
			.shareadraft-notice input[type="email"],
			.shareadraft-notice input[type="text"] {
				width: 100%;
				box-sizing: border-box;
				padding: 0.625rem 0.75rem;
				font-size: 1rem;
				color: inherit;
				background: #fff;
				border: 1px solid #767676;
				border-radius: 4px;
			}
			.shareadraft-notice input.shareadraft-code { text-align: center; letter-spacing: 0.375em; font-variant-numeric: tabular-nums; }
			.shareadraft-notice input:focus { border-color: #2271b1; outline: 2px solid #2271b1; outline-offset: 1px; }
			.shareadraft-notice .button-primary {
				display: block;
				width: 100%;
				padding: 0.625rem 1rem;
				font-size: 1rem;
				font-weight: 600;
				color: #fff;
				background: #2271b1;
				border: 0;
				border-radius: 4px;
				cursor: pointer;
			}
			.shareadraft-notice .button-primary:hover { background: #135e96; }
			.shareadraft-notice .button-primary:focus-visible { outline: 2px solid #2271b1; outline-offset: 2px; }
			.shareadraft-alt-actions { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem 1rem; font-size: 0.875rem; }
			.shareadraft-notice a,
			.shareadraft-notice .button-link { padding: 0; font: inherit; color: #2271b1; text-decoration: underline; background: none; border: 0; cursor: pointer; }
			.shareadraft-notice .button-link:focus-visible { outline: 2px solid #2271b1; outline-offset: 2px; }
			@media (prefers-color-scheme: dark) {
				html { background: #1d2327; }
				body#error-page { background: #2c3338; border-color: #3c434a; color: #f0f0f1; }
				.shareadraft-site-name { color: #a7aaad; }
				.shareadraft-notice p { color: #c3c4c7; }
				.shareadraft-notice input[type="email"],
				.shareadraft-notice input[type="text"] { background: #1d2327; border-color: #8c8f94; }
				.shareadraft-notice a,
				.shareadraft-notice .button-link { color: #72aee6; }
			}
		</style>';
	}
}
