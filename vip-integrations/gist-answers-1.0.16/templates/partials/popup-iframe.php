<?php
/**
 * Popup iframe template for the Gist Answers plugin admin menu area.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>

<div id="gist-answers-popup-iframe-outer">
	<div id="gist-answers-popup-iframe-inner">
		<iframe
			class="gist-answers-admin-menu-iframe"
			<?php
			foreach ( GIST_ANSWERS_IFRAME_ATTRS as $key => $value ) { // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
				echo esc_html( $key ) . '="' . esc_attr( $value ) . '" ';
			}
			?>
			data-nonce="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>"
		></iframe>
	</div><!-- #gist-answers-popup-iframe-inner -->

	<button class="gist-answers-popup-iframe-close" onclick="window.gistAnswersAdmin.closePopupIframe()">
		<span class="gist-answers-popup-iframe-close-background"></span>

		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
			<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" />
		</svg>
	</button><!-- #gist-answers-popup-iframe-close -->
</div><!-- #gist-answers-popup-iframe-outer -->
