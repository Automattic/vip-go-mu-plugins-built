<?php
/**
 * Alert modal template for the Gist Answers plugin.
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

<div id="gist-answers-alert-modal" onclick="window.gistAnswersAdmin.closeAlertModal(event)">
	<div class="gist-answers-alert-modal-outer-container">
		<div class="gist-answers-alert-modal-inner-container">
			<div class="gist-answers-alert-modal-content-container">
				<div class="gist-answers-alert-modal-header">
					<?php echo wp_kses_post( AdminMain::get_logo_img() ); ?>

					<button type="button" class="gist-answers-alert-modal-close" onclick="window.gistAnswersAdmin.closeAlertModal()">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div><!-- .gist-answers-alert-modal-header -->

				<div id="gist-answers-alert-modal-content"></div>

				<div class="gist-answers-alert-modal-footer">
					<button type="button" class="gist-answers-button" onclick="window.gistAnswersAdmin.closeAlertModal()"><?php esc_html_e( 'Close', 'gist-answers' ); ?></button>
				</div><!-- .gist-answers-alert-modal-footer -->
			</div><!-- .gist-answers-alert-modal-content-container -->
		</div><!-- .gist-answers-alert-modal-inner-container -->
	</div><!-- .gist-answers-alert-modal-outer-container -->
</div><!-- #gist-answers-alert-modal -->
