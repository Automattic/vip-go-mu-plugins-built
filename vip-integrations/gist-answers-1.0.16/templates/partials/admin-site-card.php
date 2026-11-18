<?php
/**
 * Logo header template for the Gist Answers plugin admin menus.
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
$source    = strval( $source ?? '' );
$gist_site = is_object( $gist_site ?? null ) ? $gist_site : null;

$is_network = 'network' === $source;

if ( is_object( $gist_site ) ) {
	$blog_id      = $gist_site->get_blog_id();
	$display_name = $gist_site->get_display_name();
	$admin_url    = $gist_site->get_admin_url();
	$gist_url     = $gist_site->get_gist_url();
	$is_activated = $gist_site->has_valid_publisher();
	$has_widgets  = $gist_site->get_widgets_count() > 0;

	if ( $is_activated ) {
		if ( $has_widgets ) {

			$button_text   = __( 'View widgets', 'gist-answers' );
			$button_action = 'window.gistAnswersAdmin.openWidgetsPopupIframe(event, \'list\')';
			$button_class  = 'gist-answers-admin-site-card-button-view-widgets';

			$button_animation = false;

		} else {

			$button_text   = __( 'Set up widgets', 'gist-answers' );
			$button_action = 'window.gistAnswersAdmin.openWidgetsPopupIframe(event, \'list\')';
			$button_class  = 'gist-answers-admin-site-card-button-set-up-widgets';

			$button_animation = false;
		}
	} else {

		$button_text   = __( 'Activate website', 'gist-answers' );
		$button_action = 'window.gistAnswersAdmin.activateSite(event)';
		$button_class  = 'gist-answers-admin-site-card-button-activate-site';

		$button_animation = true;
	}
}

$publisher_id = $gist_site->get_publisher_id();

$site_status = $gist_site->get_cached_status();
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<?php if ( is_object( $gist_site ) ) : ?>
	<tr class="gist-answers-admin-site-card" data-publisher-id="<?php echo esc_attr( $publisher_id ); ?>">
		<td>
			<div>
				<a
					href="<?php echo esc_url( $is_network ? $gist_url : $admin_url ); ?>"
					<?php echo $is_network ? 'target="_blank"' : ''; ?>
				><?php echo esc_html( $display_name ); ?></a>
			</div>
		</td>

		<td>
			<div>
				<span class="gist-answers-admin-site-card-status"></span>
			</div>
		</td>

		<td>
			<div>
				<?php if ( $is_activated ) : ?>
					<?php if ( ! $is_network ) : ?>
						<label><?php esc_html_e( 'Content ingestion', 'gist-answers' ); ?></label>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
						</svg>

						<?php $tooltip_content = __( 'Use the toggle to temporarily pause content ingestion. (New content won\'t be available for answers.)', 'gist-answers' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- This is not a global variable; it is namespaced to GistAnswers within this template only, and is consumed by the svg-tooltip partial. ?>

						<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/svg-tooltip.php'; ?>
					<?php endif; ?>

					<input
						type="checkbox"
						disabled
						onchange="window.gistAnswersAdmin.toggleIngestionForSite(event, '<?php echo esc_js( __( 'Ingestion paused', 'gist-answers' ) ); ?>', '<?php echo esc_js( __( 'Ingestion queued', 'gist-answers' ) ); ?>')"
					/>
				<?php endif; ?>
			</div>
		</td>

		<td>
			<div>
				<?php if ( $button_animation ) : ?>
					<div class="gist-answers-button-with-submission-animation">
						<button
							type="button"
							class="gist-answers-button <?php echo esc_attr( $button_class ); ?>"
							data-blog-id="<?php echo esc_attr( $blog_id ); ?>"
							onclick="<?php echo esc_attr( $button_action ); ?>"
						><?php echo esc_html( $button_text ); ?></button>

						<div class="gist-answers-button-submission-animation">
							<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
						</div><!-- .gist-answers-button-submission-animation -->
					</div><!-- .gist-answers-button-with-submission-animation -->
				<?php else : ?>
					<div class="gist-answers-button-without-submission-animation">
						<button
							type="button"
							class="gist-answers-button <?php echo esc_attr( $button_class ); ?>"
							data-blog-id="<?php echo esc_attr( $blog_id ); ?>"
							onclick="<?php echo esc_attr( $button_action ); ?>"
						><?php echo esc_html( $button_text ); ?></button>
					</div><!-- .gist-answers-button-without-submission-animation -->
				<?php endif; ?>
			</div>

			<form
				class="gist-answers-site-activation"
				data-blog-id="<?php echo esc_attr( $blog_id ); ?>"
				method="post"
				action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
			>
				<input type="hidden" name="action" value="gist_answers_site_activation">

				<?php wp_nonce_field( 'gist_answers_site_activation', AdminMain::SITE_ACTIVATION_NONCE ); ?>

				<input type="hidden" name="gist_answers_blog_id" value="<?php echo esc_attr( $blog_id ); ?>">

				<input type="hidden" name="gist_answers_source" value="<?php echo esc_attr( $source ); ?>">

				<input type="hidden" name="gist_answers_activation_mode" value="new">

				<input type="hidden" name="gist_answers_publisher_id" value="">
			</form><!-- .gist-answers-site-activation -->
		</td>
	</tr><!-- .gist-answers-admin-site-card -->

	<script>
		addEventListener('DOMContentLoaded', function() {
			window.gistAnswersAdmin.updateSiteStatusFor('<?php echo esc_js( $publisher_id ); ?>', <?php echo wp_json_encode( $site_status ); ?>);
		});
	</script>
<?php endif; ?>
