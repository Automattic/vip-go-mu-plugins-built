<?php
defined( 'ABSPATH' ) || exit;

/*
 * Block render templates are included from inside WP_Block::render(), so the
 * variables below are method-scoped locals, not globals. PrefixAllGlobals and
 * GlobalVariablesOverride both assume file-level code runs at global scope and
 * cannot see the enclosing method, which makes them false positives here.
 */
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- Method scope; see above.

$wrapper = get_block_wrapper_attributes( [
	'class' => 'cp-preview-root',
] );

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper is pre-escaped by get_block_wrapper_attributes(); $content is this block's already-rendered inner block HTML.
echo "<div $wrapper>$content</div>";
