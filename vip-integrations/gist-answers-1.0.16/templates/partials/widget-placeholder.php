<?php
/**
 * Widget placeholder for rendering Gist.ai widgets in the WordPress admin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$type = strval( $type ?? '' );

switch ( $type ) {
	case 'answer':
		$title = __( 'Gist Answer Widget (placeholder)', 'gist-answers' );
		break;

	case 'question':
		$title = __( 'Gist Question Widget (placeholder)', 'gist-answers' );
		break;

	default:
		$title = __( 'Gist Widget (placeholder)', 'gist-answers' );
		$type  = 'default';
		break;
}
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

// The block inserter's hover preview shows a mock-up of the widget instead of the placeholder: the question bar, and
// for an answer widget, placeholder lines of answer text above it.
if ( ! empty( $is_preview ) ) :
	?>

<div class="gist-answers-block-preview gist-answers-block-preview-for-<?php echo esc_attr( $type ); ?>">
	<?php if ( 'answer' === $type ) : ?>
		<div class="gist-answers-block-preview-answer" aria-hidden="true">
			<?php for ( $line = 0; $line < 6; $line++ ) : // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Not a global variable; it is namespaced to GistAnswers within this template only. ?>
				<span class="gist-answers-block-preview-answer-line"></span>
			<?php endfor; ?>
		</div><!-- .gist-answers-block-preview-answer -->
	<?php endif; ?>

	<div class="gist-answers-block-preview-bar">
		<span class="gist-answers-block-preview-sparkle">
			<img src="<?php echo esc_url( GIST_ANSWERS_PLUGIN_URL . 'public/images/preview-sparkle.svg' ); ?>" width="18" height="18" alt="" />
		</span>

		<span class="gist-answers-block-preview-text">
			<?php
			if ( 'answer' === $type ) {
				esc_html_e( 'Ask a follow up', 'gist-answers' );
			} else {
				esc_html_e( 'Ask AI anything', 'gist-answers' );
			}
			?>
		</span>

		<span class="gist-answers-block-preview-submit">
			<img src="<?php echo esc_url( GIST_ANSWERS_PLUGIN_URL . 'public/images/preview-arrow-right.svg' ); ?>" width="14" height="14" alt="" />
		</span>
	</div><!-- .gist-answers-block-preview-bar -->
</div><!-- .gist-answers-block-preview -->

	<?php
	return;
endif;

?>

<div class="gist-answers-admin-placeholder gist-answers-admin-placeholder-for-<?php echo esc_attr( $type ); ?>">
	<div class="gist-answers-admin-placeholder-inner">
		<svg width="20" height="17" viewBox="20 26 157 130" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M151.486 27.8265L153.574 40.3527C154.351 45.0204 158.009 48.6783 162.677 49.4567L175.204 51.5439C176.126 51.6953 176.849 52.4181 177 53.3403C177.195 54.5271 176.391 55.6476 175.204 55.8425L162.677 57.9305C158.009 58.7087 154.351 62.3666 153.574 67.0341L151.486 79.5601C151.335 80.4834 150.611 81.2067 149.688 81.3579C148.501 81.5523 147.381 80.7473 147.187 79.5601L145.099 67.0341C144.321 62.3663 140.663 58.7084 135.995 57.9305L123.468 55.8425C122.546 55.691 121.823 54.9683 121.672 54.0461C121.477 52.8592 122.281 51.7388 123.468 51.5439L135.995 49.4567C140.663 48.6788 144.321 45.0207 145.099 40.3527L147.187 27.8265C147.338 26.9035 148.062 26.18 148.985 26.0289C150.172 25.8346 151.292 26.6394 151.486 27.8265ZM79.6838 38.0996L81.7714 50.6253L83.8591 63.1511C85.4143 72.4862 92.7295 79.8016 102.065 81.3582L127.117 85.5326C128.962 85.8355 130.407 87.281 130.71 89.1251C131.1 91.4988 129.492 93.7394 127.117 94.1293L102.065 98.3053C92.7297 99.8616 85.4146 107.177 83.8591 116.512L79.6838 141.563C79.3816 143.409 77.9347 144.856 76.0887 145.158C73.7145 145.547 71.4747 143.937 71.0859 141.563L66.9109 116.512C65.3548 107.176 58.0388 99.8608 48.7029 98.3053L23.6508 94.1293C21.8067 93.8264 20.3611 92.3811 20.0583 90.5371C19.6684 88.163 21.2768 85.9225 23.6508 85.5326L48.7029 81.3582C58.0391 79.8025 65.3551 72.4867 66.9109 63.1511L71.0859 38.0996C71.3883 36.2536 72.8353 34.8067 74.681 34.5046C77.0554 34.116 79.2952 35.7255 79.6838 38.0996Z"></path>
			<path d="M142.213 124.884L140.63 115.385C140.483 114.485 139.634 113.875 138.733 114.022C138.033 114.137 137.485 114.685 137.37 115.385L135.787 124.884C135.197 128.423 132.423 131.197 128.883 131.787L119.384 133.37C118.484 133.518 117.874 134.367 118.022 135.267C118.137 135.967 118.685 136.515 119.384 136.63L128.883 138.213C132.423 138.803 135.197 141.577 135.787 145.116L137.37 154.615C137.518 155.515 138.367 156.125 139.267 155.978C139.967 155.863 140.516 155.315 140.63 154.615L142.213 145.116C142.803 141.577 145.577 138.803 149.116 138.213L158.616 136.63C159.516 136.482 160.126 135.632 159.978 134.732C159.863 134.033 159.315 133.485 158.616 133.37L149.116 131.787C145.577 131.197 142.803 128.423 142.213 124.884Z"></path>
		</svg>

		<span class="gist-answers-admin-placeholder-title"><?php echo esc_html( $title ); ?></span>
	</div><!-- .gist-answers-admin-placeholder-inner -->
</div><!-- .gist-answers-admin-placeholder -->
