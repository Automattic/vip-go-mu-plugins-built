<?php
/**
 * Site activation choice modal template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

use GistAnswers\Admin\AdminMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>

<div
	id="gist-answers-activation-modal"
	onclick="window.gistAnswersAdmin.closeActivationModal(event)"
	data-placeholder-label="<?php esc_attr_e( 'Select an existing test website', 'gist-answers' ); ?>"
	data-lookup-error-label="<?php /* translators: %d: The HTTP status code of the failed request. */ esc_attr_e( 'Error %d: unable to look up websites in Gist Answers. Please try again later.', 'gist-answers' ); ?>"
>
	<div class="gist-answers-activation-modal-dialog" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Activate website', 'gist-answers' ); ?>">
		<div class="gist-answers-activation-modal-header">
			<?php echo wp_kses_post( AdminMain::get_logo_img() ); ?>

			<button
				type="button"
				class="gist-answers-activation-modal-close"
				aria-label="<?php esc_attr_e( 'Close', 'gist-answers' ); ?>"
				onclick="window.gistAnswersAdmin.closeActivationModal()"
			>
				<img src="<?php echo esc_url( GIST_ANSWERS_PLUGIN_URL . 'public/images/icon-close.svg' ); ?>" width="16" height="16" alt="" />
			</button>
		</div><!-- .gist-answers-activation-modal-header -->

		<p class="gist-answers-activation-modal-intro">
			<?php esc_html_e( 'If this is a test website and you haven\'t yet activated a corresponding production website in your Gist Answers account, close this window and do that first so we can ingest the correct web content.', 'gist-answers' ); ?>
			<span class="gist-answers-activation-modal-has-websites-only"><?php esc_html_e( 'You won\'t need to add widgets to your production site until you\'re ready.', 'gist-answers' ); ?></span>
		</p>

		<div class="gist-answers-activation-modal-choices">
			<div class="gist-answers-activation-modal-choice gist-answers-activation-modal-choice-preproduction">
				<label class="gist-answers-activation-modal-option">
					<input
						type="radio"
						name="gist_answers_activation_choice"
						value="preproduction"
						checked
						onchange="window.gistAnswersAdmin.handleActivationChoiceChange()"
					/>
					<span><?php esc_html_e( 'This is a test website linked to:', 'gist-answers' ); ?></span>
				</label>

				<div class="gist-answers-activation-modal-field">
					<div class="gist-answers-activation-modal-field-inner">
						<div class="gist-answers-activation-modal-field-body">
							<div class="gist-answers-activation-modal-production">
								<select
									id="gist-answers-activation-modal-publisher"
									class="gist-answers-activation-modal-publisher"
									aria-label="<?php esc_attr_e( 'Production website', 'gist-answers' ); ?>"
									onchange="window.gistAnswersAdmin.handleActivationChoiceChange()"
								></select>
							</div><!-- .gist-answers-activation-modal-production -->
						</div>
					</div>
				</div>
			</div><!-- .gist-answers-activation-modal-choice -->

			<div class="gist-answers-activation-modal-choice">
				<label class="gist-answers-activation-modal-option">
					<?php // A radio button when there are websites to link to (the other choice), otherwise a checkbox; see showActivationModal() in admin.js. ?>
					<input
						type="radio"
						class="gist-answers-activation-modal-new-input"
						name="gist_answers_activation_choice"
						value="new"
						onchange="window.gistAnswersAdmin.handleActivationChoiceChange()"
					/>
					<span><?php esc_html_e( 'This is not a test website', 'gist-answers' ); ?></span>
				</label>

				<div class="gist-answers-activation-modal-field">
					<div class="gist-answers-activation-modal-field-inner">
						<div class="gist-answers-activation-modal-field-body">
							<p class="gist-answers-activation-modal-intro">
								<?php esc_html_e( 'Activate it as a new website at:', 'gist-answers' ); ?>
								<br />
								<span class="gist-answers-activation-modal-site-url"></span>
							</p>
						</div>
					</div>
				</div>
			</div><!-- .gist-answers-activation-modal-choice -->
		</div><!-- .gist-answers-activation-modal-choices -->

		<div class="gist-answers-activation-modal-footer">
			<button type="button" class="gist-answers-button gist-answers-activation-modal-secondary" onclick="window.gistAnswersAdmin.closeActivationModal()"><?php esc_html_e( 'Cancel', 'gist-answers' ); ?></button>
			<button type="button" class="gist-answers-button gist-answers-activation-modal-continue" onclick="window.gistAnswersAdmin.confirmActivationChoice()"><?php esc_html_e( 'Submit', 'gist-answers' ); ?></button>
		</div><!-- .gist-answers-activation-modal-footer -->
	</div><!-- .gist-answers-activation-modal-dialog -->
</div><!-- #gist-answers-activation-modal -->
