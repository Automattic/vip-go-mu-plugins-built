<?php
/**
 * SVG tooltip template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$tooltip_content = strval( $tooltip_content ?? '' );
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<aside class="gist-answers-svg-tooltip">
	<?php echo wp_kses_post( $tooltip_content ); ?>
</aside><!-- .gist-answers-svg-tooltip -->
