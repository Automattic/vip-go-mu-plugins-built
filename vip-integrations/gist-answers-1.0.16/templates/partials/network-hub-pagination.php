<?php
/**
 * Network hub list template for the Gist Answers plugin admin menus.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$max_pages    = intval( $max_pages ?? 1 );
$current_page = intval( $current_page ?? 1 );
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<div class="gist-answers-network-hub-pagination">
	<button
		type="button"
		<?php echo $current_page <= 1 ? 'disabled' : ''; ?>
		onclick="window.gistAnswersAdmin.goToNetworkHubPage(<?php echo esc_attr( $current_page - 1 ); ?>, '<?php echo esc_attr( $max_pages ); ?>')"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="15 18 9 12 15 6"/>
		</svg>
	</button>

	<p>
		<span><?php echo esc_html( $current_page ); ?></span>

		<span><?php echo esc_html_x( 'of', 'for pagination, as in 1 of 2', 'gist-answers' ); ?></span>

		<span><?php echo esc_html( $max_pages ); ?></span>
	</p>

	<button
		type="button"
		<?php echo $current_page >= $max_pages ? 'disabled' : ''; ?>
		onclick="window.gistAnswersAdmin.goToNetworkHubPage(<?php echo esc_attr( $current_page + 1 ); ?>, '<?php echo esc_attr( $max_pages ); ?>')"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="9 18 15 12 9 6"/>
		</svg>
	</button>
</div><!-- .gist-answers-network-hub-pagination -->
