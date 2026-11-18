<?php
/**
 * Danger zone options form template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

use GistAnswers\Admin\AdminMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$data = is_object( $data ?? null ) ? $data : (object) array();

$source        = $data->source ?? '';
$danger_fields = $data->danger_fields ?? array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<form class="gist-answers-danger-zone-options" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
	<fieldset>
		<legend><?php esc_html_e( 'Danger zone', 'gist-answers' ); ?></legend>

		<input type="hidden" name="action" value="gist_answers_save_danger_zone_options">

		<?php wp_nonce_field( 'gist_answers_save_danger_zone_options', AdminMain::SAVE_DANGER_ZONE_OPTIONS_NONCE ); ?>

		<input type="hidden" name="gist_answers_admin_page_source" value="<?php echo esc_attr( $source ); ?>">

		<div class="gist-answers-admin-form-inner">
			<p><?php echo wp_kses_post( __( 'This section allows you to delete or reset some or all of the Gist Answers plugin data. Note that actions taken here will affect <strong>ALL</strong> sites on a WordPress multisite network. Use with caution: <strong>These actions cannot be undone!</strong>', 'gist-answers' ) ); ?></p>

			<?php foreach ( $danger_fields as $field ) : // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- This is not a global variable; it is namespaced to GistAnswers within this template only, and is consumed by the admin-form-field partial. ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/admin-form-field.php'; ?>
			<?php endforeach; ?>
		</div><!-- .gist-answers-admin-form-inner -->

		<button
			class="gist-answers-button"
			type="submit"
			onclick="return window.gistAnswersAdmin.confirmPluginDataReset()"
		><?php esc_html_e( 'Reset plugin data', 'gist-answers' ); ?></button>
	</fieldset>
</form><!-- .gist-answers-danger-zone-options -->
