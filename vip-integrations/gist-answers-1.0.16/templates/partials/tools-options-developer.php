<?php
/**
 * Developer options form template for the Gist Answers plugin.
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
$option_fields = $data->option_fields ?? array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<form class="gist-answers-developer-options" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
	<input type="hidden" name="action" value="gist_answers_save_developer_options">

	<?php wp_nonce_field( 'gist_answers_save_developer_options', AdminMain::SAVE_DEVELOPER_OPTIONS_NONCE ); ?>

	<input type="hidden" name="gist_answers_admin_page_source" value="<?php echo esc_attr( $source ); ?>">

	<div class="gist-answers-admin-form-inner">
		<?php foreach ( $option_fields as $field ) : // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- This is not a global variable; it is namespaced to GistAnswers within this template only. ?>
			<?php
			// phpcs:disable Squiz.PHP.NonExecutableCode.Unreachable -- Multiple false positives here; there is no executable code after any of the break statements.
			switch ( $field->type ?? '' ) :
				default:
					require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/admin-form-field.php';
					break;
				?>

				<?php
				case 'logging-info':
					?>
					<p><?php esc_html_e( 'Log entries are written to the server\'s PHP error log, with credentials redacted.', 'gist-answers' ); ?></p>

					<?php break; ?>

				<?php
				case 'divider':
					?>
					<hr>

					<?php break; ?>
				<?php
				endswitch;
				// phpcs:enable Squiz.PHP.NonExecutableCode.Unreachable
			?>
		<?php endforeach; ?>
	</div><!-- .gist-answers-admin-form-inner -->

	<button
		class="gist-answers-button"
		type="submit"
		onclick="window.gistAnswersAdmin.showAdminLoader()"
	><?php esc_html_e( 'Save settings', 'gist-answers' ); ?></button>
</form><!-- .gist-answers-developer-options -->
