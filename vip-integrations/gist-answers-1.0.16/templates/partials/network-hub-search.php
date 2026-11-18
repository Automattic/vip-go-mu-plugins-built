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
$search_term = strval( $search_term ?? '' );
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<div class="gist-answers-network-hub-search">
	<label for="gist-answers-network-hub-search-input"><?php esc_html_e( 'Search site titles', 'gist-answers' ); ?></label>

	<input
		type="text"
		id="gist-answers-network-hub-search-input"
		value="<?php echo esc_attr( $search_term ); ?>"
		placeholder="<?php esc_attr_e( 'Search site titles', 'gist-answers' ); ?>"
		onkeydown="'Enter' === event.key && window.gistAnswersAdmin.searchNetworkHubByTitle()"
		data-accept-empty="<?php echo ! empty( $search_term ) ? '1' : '0'; ?>"
	/>

	<button type="button" onclick="window.gistAnswersAdmin.searchNetworkHubByTitle()">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m21 21-4.34-4.34"/>
			<circle cx="11" cy="11" r="8"/>
		</svg>
	</button>
</div><!-- .gist-answers-network-hub-search -->
