<?php
/**
 * "Dashboard" admin menu template for the Gist Answers plugin.
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

$source         = $data->source ?? '';
$page_title     = $data->page_title ?? '';
$explainer_text = $data->explainer_text ?? '';
$gist_site      = $data->gist_site ?? null;
$environment    = $data->environment ?? '';
$error_message  = $data->error_message ?? '';

$wizard_content_data = is_object( $data->wizard_content_data ?? null ) ? $data->wizard_content_data : (object) array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable

?>

<?php if ( ! empty( $page_title ) ) : ?>
	<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/logo-header.php'; ?>
<?php endif; ?>

<div class="gist-answers-admin-submenu-outer-container">
	<div class="gist-answers-admin-submenu-container">
		<?php if ( ! empty( $error_message ) ) : ?>
			<div class="gist-answers-connection-wizard-error">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
					<path d="M12 9v4"/>
					<path d="M12 17h.01"/>
				</svg>

				<span><?php echo wp_kses_post( $error_message ); ?></span>
			</div><!-- .gist-answers-connection-wizard-error -->

			<script>
				addEventListener( 'DOMContentLoaded', () => {
					window.gistAnswersAdmin.removeStatusFlag( 'activated' );
				} );
			</script>
		<?php endif; ?>

		<?php if ( is_object( $gist_site ) && $gist_site->has_valid_publisher() ) : ?>
			<div class="gist-answers-network-hub-list-controls gist-answers-single-site-list-controls">
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/refresh-statuses-button.php'; ?>
			</div><!-- .gist-answers-single-site-list-controls -->
		<?php endif; ?>

		<table class="gist-answers-single-site-list" data-nonce="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>">
			<tbody>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/admin-site-card.php'; ?>
			</tbody>
		</table><!-- .gist-answers-single-site-list -->

		<script>
			document.addEventListener('DOMContentLoaded', function() {
				window.gistAnswersAdmin.loadSiteStatuses();
			});
		</script>
	</div><!-- .gist-answers-admin-submenu-container -->
</div><!-- .gist-answers-admin-submenu-outer-container -->

<?php if ( ! empty( (array) $gist_site ) ) : ?>
	<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/connection-wizard.php'; ?>
<?php endif; ?>
