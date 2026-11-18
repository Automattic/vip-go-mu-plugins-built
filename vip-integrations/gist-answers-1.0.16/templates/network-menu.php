<?php
/**
 * Network admin menu template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- These are not global variables; they are namespaced to GistAnswers within this template only. Variables that appear unused are consumed by the partials required below.
$data = is_object( $data ) ? $data : (object) array();

$source          = $data->source ?? '';
$page_title      = $data->page_title ?? '';
$explainer_text  = $data->explainer_text ?? '';
$user_sites      = $data->user_sites ?? array();
$user_has_sites  = $data->user_has_sites ?? false;
$environment     = $data->environment ?? '';
$error_message   = $data->error_message ?? '';
$sortable_column = $data->sortable_column ?? '';
$sort_inverted   = $data->sort_inverted ?? false;
$max_pages       = $data->max_pages ?? 1;
$current_page    = $data->current_page ?? 1;
$search_term     = $data->search_term ?? '';

$wizard_content_data = is_object( $data->wizard_content_data ?? null ) ? $data->wizard_content_data : (object) array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable

?>

<?php if ( ! empty( $page_title ) ) : ?>
	<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/logo-header.php'; ?>
<?php endif; ?>

<?php if ( $user_has_sites ) : ?>
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

			<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/network-hub-list.php'; ?>
		</div><!-- .gist-answers-admin-submenu-container -->
	</div><!-- .gist-answers-admin-submenu-outer-container -->
<?php else : ?>
	<div class="gist-answers-connection-wizard-warning">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
			<path d="M12 9v4"/>
			<path d="M12 17h.01"/>
		</svg>

		<span><?php esc_html_e( 'You do not have access to any public sites on this network. Please consult your network administrator.', 'gist-answers' ); ?></span>
	</div><!-- .gist-answers-connection-wizard-warning -->
<?php endif; ?>

<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/connection-wizard.php'; ?>
