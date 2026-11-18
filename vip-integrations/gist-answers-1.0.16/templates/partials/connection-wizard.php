<?php
/**
 * Connection wizard template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

use GistAnswers\Plugin\CommonMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$source = strval( $source ?? '' );

$wizard_content_data = is_object( $wizard_content_data ?? null ) ? $wizard_content_data : (object) array();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<div
	class="gist-answers-connection-wizard gist-answers-connection-wizard-<?php echo esc_attr( $source ); ?>"
	data-show-wizard="<?php echo esc_attr( ( $wizard_content_data->show_wizard ?? false ) ? 1 : 0 ); ?>"
>
	<div class="gist-answers-connection-wizard-inner">
		<?php
		if ( ! empty( $wizard_content_data->message ?? '' ) && in_array(
			$wizard_content_data->status ?? '',
			array(
				'error',
				'warning',
			),
			true
		) ) :
			?>
			<div class="gist-answers-connection-wizard-<?php echo esc_attr( $wizard_content_data->status ); ?>">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
					<path d="M12 9v4"/>
					<path d="M12 17h.01"/>
				</svg>

				<span><?php echo wp_kses_post( $wizard_content_data->message ); ?></span>
			</div><!-- .gist-answers-connection-wizard-<?php echo esc_attr( $wizard_content_data->status ); ?> -->
		<?php endif; ?>

		<?php if ( ! ( $wizard_content_data->hide_connection_form ?? false ) ) : ?>
			<p>
				<?php
				echo wp_kses_post(
					sprintf(
						// translators: %s is a mailto link to the Gist Answers support email address.
						__( 'Connect your WordPress installation to your Gist Answers account. To get started, obtain an API token from %s and enter your API token below.', 'gist-answers' ),
						CommonMain::get_api_contact_mailto_link(),
					),
					'gist-answers',
				);
				?>
			</p>

			<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/forms/gist-connection.php'; ?>
		<?php endif; ?>
	</div><!-- .gist-answers-connection-wizard-inner -->

	<?php if ( $wizard_content_data->can_hide_wizard ?? false ) : ?>
		<script>
			document.addEventListener('DOMContentLoaded', function() {
				setTimeout(function() {
					window.gistAnswersAdmin.hideConnectionWizard();
				}, 1500);
			});
		</script>
	<?php endif; ?>
</div><!-- .gist-answers-connection-wizard -->
