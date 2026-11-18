<?php
/**
 * "Tools & Options" admin menu template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- These are not global variables; they are namespaced to GistAnswers within this template only. Variables that appear unused are consumed by the partials required below.
$data = is_object( $data ?? null ) ? $data : (object) array();

$source        = $data->source ?? '';
$page_title    = $data->page_title ?? '';
$option_fields = $data->option_fields ?? array();
$danger_fields = $data->danger_fields ?? array();
$answer_pages  = $data->answer_pages ?? array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable

?>

<?php if ( ! empty( $page_title ) ) : ?>
	<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/logo-header.php'; ?>
<?php endif; ?>

<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/tools-options-developer.php'; ?>

<div class="gist-answers-tools-options-answer-pages">
	<h2><?php esc_html_e( 'Detected Answer Pages', 'gist-answers' ); ?></h2>

	<ul>
		<?php if ( is_array( $answer_pages ) && count( $answer_pages ) > 0 ) : ?>
			<?php foreach ( $answer_pages as $page ) : // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- This is not a global variable; it is namespaced to GistAnswers within this template only. ?>
				<li><?php echo wp_kses_post( $page ); ?></li>
			<?php endforeach; ?>
		<?php else : ?>
			<li><?php esc_html_e( 'No answer pages detected', 'gist-answers' ); ?></li>
		<?php endif; ?>
	</ul>
</div><!-- .gist-answers-tools-options-answer-pages -->

<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/tools-options-danger-zone.php'; ?>
