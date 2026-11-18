<?php
defined( 'ABSPATH' ) || exit;

/*
 * Block render templates are included from inside WP_Block::render(), so the
 * variables below are method-scoped locals, not globals. PrefixAllGlobals and
 * GlobalVariablesOverride both assume file-level code runs at global scope and
 * cannot see the enclosing method, which makes them false positives here.
 */
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- Method scope; see above.

// phpcs:disable WordPress.DB.DirectDatabaseQuery -- Custom tables have no WP_Query equivalent, and these are writes or single-row key lookups. Full reasoning in includes/class-rest-api.php.

$type      = $attributes['type'] ?? '';
$output_id = $block->context['clipisode/outputId'] ?? 0;

$output = null;
$topic  = null;
if ( $output_id ) {
	global $wpdb;
	$output = $wpdb->get_row( $wpdb->prepare(
		"SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d", $output_id
	) );
	if ( $output && $output->topic_id ) {
		$topic = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM {$wpdb->prefix}clipisode_topics WHERE id = %d", $output->topic_id
		) );
	}
}

// Pre-escaped by get_block_wrapper_attributes(); echoed as-is below. The
// phpcs:ignore comments on those echoes refer to this.
$wrapper = get_block_wrapper_attributes( [
	'class' => 'cp-el cp-el-' . esc_attr( $type ),
] );

switch ( $type ) {

	case 'player':
		$url = '';
		if ( $output && $output->media_id ) {
			$url = Clipisode_Media::get_url( (int) $output->media_id ) ?: '';
		}
		if ( $url ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper is pre-escaped by get_block_wrapper_attributes().
			echo "<div $wrapper>";
			echo '<video class="cp-video" src="' . esc_url( $url ) . '" controls playsinline preload="metadata"></video>';
			echo '</div>';
		}
		break;

	case 'name':
		$name = $output ? esc_html( $output->name ) : '';
		if ( $name ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper pre-escaped by get_block_wrapper_attributes(); $name esc_html'd above.
			echo "<div $wrapper><h1 class=\"cp-meta-name\">$name</h1></div>";
		}
		break;

	case 'topic-info':
		$title  = $topic ? esc_html( $topic->title ) : '';
		$hosted = $topic ? esc_html( $topic->hosted_by ) : '';
		$sub = array_filter( [ $title, $hosted ? "Hosted by $hosted" : '' ] );
		if ( $sub ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper pre-escaped by get_block_wrapper_attributes(); every $sub member esc_html'd above.
			echo "<div $wrapper><p class=\"cp-meta-sub\">" . implode( ' &middot; ', $sub ) . '</p></div>';
		}
		break;

	case 'cta':
		$invitation_url = '';
		if ( $topic ) {
			$link = $wpdb->get_row( $wpdb->prepare(
				"SELECT slug FROM {$wpdb->prefix}clipisode_invitation_links WHERE topic_id = %d AND status = 'open' ORDER BY created_at DESC LIMIT 1",
				$topic->id
			) );
			if ( $link ) {
				$prefix         = Clipisode_Invitation::get_prefix();
				$invitation_url = home_url( $prefix . '/' . $link->slug );
			}
		}
		if ( $invitation_url ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper is pre-escaped by get_block_wrapper_attributes().
			echo "<div $wrapper>";
			echo '<a class="cp-cta" href="' . esc_url( $invitation_url ) . '">Record Your Own</a>';
			echo '</div>';
		}
		break;
}
