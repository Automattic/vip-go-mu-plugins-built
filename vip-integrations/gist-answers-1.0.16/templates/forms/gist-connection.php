<?php
/**
 * Connection form template for the Gist Answers plugin.
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
$source = strval( $source ?? '' );
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<form id="gist-answers-connection-wizard-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
	<input type="hidden" name="action" value="gist_answers_connect">

	<?php wp_nonce_field( 'gist_answers_connect', AdminMain::CONNECT_NONCE ); ?>

	<input type="hidden" name="source" value="<?php echo esc_attr( $source ); ?>">

	<label for="gist_answers_api_token"><?php esc_html_e( 'Gist API token', 'gist-answers' ); ?></label>

	<input
		type="text"
		id="gist_answers_api_token"
		name="gist_answers_api_token"
		placeholder="<?php echo esc_attr__( 'Enter API token', 'gist-answers' ); ?>"
		autocomplete="one-time-code"
		required
		onfocus="this.type='password'"
		oninput="window.gistAnswersAdmin.handleApiTokenInputChange(event)"
		<?php if ( $wizard_content_data->can_hide_wizard ?? false ) : ?>
			value="<?php echo esc_attr( str_repeat( '•', 67 ) ); ?>"
			disabled
		<?php endif; ?>
	>

	<div class="gist-answers-connection-wizard-form-error">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
			<path d="M12 9v4"/>
			<path d="M12 17h.01"/>
		</svg>

		<span><?php esc_html_e( 'Invalid API token', 'gist-answers' ); ?></span>
	</div><!-- .gist-answers-connection-wizard-form-error -->

	<div class="gist-answers-button-with-submission-animation">
		<button
			class="gist-answers-button"
			type="submit"
			disabled
			onclick="window.gistAnswersAdmin.showButtonSubmitAnimation(event, 'form')"
		><?php esc_html_e( 'Continue', 'gist-answers' ); ?></button>

		<div class="gist-answers-button-submission-animation">
			<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
		</div><!-- .gist-answers-button-submission-animation -->

		<?php if ( $wizard_content_data->can_hide_wizard ?? false ) : ?>
			<div class="gist-answers-button-submitted">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20 6 9 17l-5-5"/>
				</svg>
			</div><!-- .gist-answers-button-submitted -->
		<?php endif; ?>
	</div><!-- .gist-answers-button-with-submission-animation -->
</form><!-- #gist-answers-connection-wizard-form -->
