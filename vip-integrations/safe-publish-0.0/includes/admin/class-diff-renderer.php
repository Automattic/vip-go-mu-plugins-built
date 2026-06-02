<?php
/**
 * Diff Renderer class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generates HTML diffs between previous (pre-import) and current post fields.
 *
 * Consumed by the Imports → Posts tab's Post Diff action via the
 * `safe_publish_get_post_diff` AJAX endpoint.
 */
final class Diff_Renderer {

	/**
	 * Generates comprehensive HTML diff between old and new content.
	 *
	 * @param string $old_title   Old title.
	 * @param string $new_title   New title.
	 * @param string $old_excerpt Old excerpt.
	 * @param string $new_excerpt New excerpt.
	 * @param string $old_content Old content.
	 * @param string $new_content New content.
	 * @return string HTML diff.
	 */
	public function generate_comprehensive_diff_html(
		string $old_title,
		string $new_title,
		string $old_excerpt,
		string $new_excerpt,
		string $old_content,
		string $new_content
	): string {
		$diff_html = '<div class="safe-publish-diff-container">';

		// Title diff.
		if ( $old_title !== $new_title ) {
			$diff_html .= '<div class="safe-publish-diff-section">';
			$diff_html .= '<h4>' . __( 'Title Changes', 'safe-publish' ) . '</h4>';
			$diff_html .= '<div class="safe-publish-diff-before">';
			$diff_html .= '<strong>' . __( 'Before:', 'safe-publish' ) . '</strong><br>';
			$diff_html .= esc_html( $old_title );
			$diff_html .= '</div>';
			$diff_html .= '<div class="safe-publish-diff-after">';
			$diff_html .= '<strong>' . __( 'After:', 'safe-publish' ) . '</strong><br>';
			$diff_html .= esc_html( $new_title );
			$diff_html .= '</div>';
			$diff_html .= '</div>';
		}

		// Excerpt diff.
		if ( $old_excerpt !== $new_excerpt ) {
			$diff_html .= '<div class="safe-publish-diff-section">';
			$diff_html .= '<h4>' . __( 'Excerpt Changes', 'safe-publish' ) . '</h4>';
			$diff_html .= '<div class="safe-publish-diff-before">';
			$diff_html .= '<strong>' . __( 'Before:', 'safe-publish' ) . '</strong><br>';
			$diff_html .= '<pre>' . esc_html( $old_excerpt ) . '</pre>';
			$diff_html .= '</div>';
			$diff_html .= '<div class="safe-publish-diff-after">';
			$diff_html .= '<strong>' . __( 'After:', 'safe-publish' ) . '</strong><br>';
			$diff_html .= '<pre>' . esc_html( $new_excerpt ) . '</pre>';
			$diff_html .= '</div>';
			$diff_html .= '</div>';
		}

		// Content diff.
		$diff_html .= '<div class="safe-publish-diff-section is-scrollable">';
		$diff_html .= '<h4>' . __( 'Content Changes', 'safe-publish' ) . '</h4>';
		$diff_html .= '<div class="safe-publish-diff-before">';
		$diff_html .= '<strong>' . __( 'Before (Original Content):', 'safe-publish' ) . '</strong><br>';
		$diff_html .= '<pre>' . esc_html( $old_content ) . '</pre>';
		$diff_html .= '</div>';
		$diff_html .= '<div class="safe-publish-diff-after">';
		$diff_html .= '<strong>' . __( 'After (Imported Content):', 'safe-publish' ) . '</strong><br>';
		$diff_html .= '<pre>' . esc_html( $new_content ) . '</pre>';
		$diff_html .= '</div>';
		$diff_html .= '</div>';

		$diff_html .= '</div>';

		return $diff_html;
	}

	/**
	 * Generates a no-diff message when previous content is unavailable.
	 *
	 * @param string $new_title   New title.
	 * @param string $new_excerpt New excerpt.
	 * @param string $new_content New content.
	 * @return string HTML for no-diff message.
	 */
	public function generate_no_diff_message(
		string $new_title,
		string $new_excerpt,
		string $new_content
	): string {
		$diff_html  = '<div class="safe-publish-no-diff-message">';
		$diff_html .= '<h4>' . __( 'No Previous Content Available', 'safe-publish' ) . '</h4>';
		$diff_html .= '<p>' . __( 'This import was processed before content change tracking was enabled. Only the current content is available.', 'safe-publish' ) . '</p>';
		$diff_html .= '<div class="safe-publish-no-diff-current">';
		$diff_html .= '<h5>' . __( 'Current Content:', 'safe-publish' ) . '</h5>';

		if ( $new_title ) {
			$diff_html .= '<p><strong>' . __( 'Title:', 'safe-publish' ) . '</strong> ' . esc_html( $new_title ) . '</p>';
		}

		if ( $new_excerpt ) {
			$diff_html .= '<p><strong>' . __( 'Excerpt:', 'safe-publish' ) . '</strong></p>';
			$diff_html .= '<div class="safe-publish-no-diff-field">';
			$diff_html .= '<pre>' . esc_html( $new_excerpt ) . '</pre>';
			$diff_html .= '</div>';
		}

		$diff_html .= '<p><strong>' . __( 'Content:', 'safe-publish' ) . '</strong></p>';
		$diff_html .= '<div class="safe-publish-no-diff-field is-scrollable">';
		$diff_html .= '<pre>' . esc_html( $new_content ) . '</pre>';
		$diff_html .= '</div>';
		$diff_html .= '</div>';
		$diff_html .= '</div>';

		return $diff_html;
	}
}
