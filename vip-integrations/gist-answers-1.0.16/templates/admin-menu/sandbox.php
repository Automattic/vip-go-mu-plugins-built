<?php
/**
 * "Sandbox" admin menu template for the Gist Answers plugin.
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

$source              = $data->source ?? '';
$iframe_url          = $data->iframe_url ?? '';
$wizard_content_data = is_object( $data->wizard_content_data ?? null ) ? $data->wizard_content_data : (object) array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable

?>

<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/logo-header.php'; ?>

<?php if ( ! empty( $iframe_url ) ) : ?>
	<div class="gist-answers-admin-menu-fixed-container">
		<iframe
			class="gist-answers-admin-menu-iframe"
			src="<?php echo esc_url( $iframe_url ); ?>"
			<?php
			foreach ( GIST_ANSWERS_IFRAME_ATTRS as $key => $value ) { // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
				echo esc_html( $key ) . '="' . esc_attr( $value ) . '" ';
			}
			?>
		></iframe>
	</div><!-- .gist-answers-admin-menu-fixed-container -->
<?php else : ?>
	<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/connection-wizard.php'; ?>
<?php endif; ?>
