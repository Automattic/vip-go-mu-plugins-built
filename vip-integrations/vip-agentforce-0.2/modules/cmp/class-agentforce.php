<?php
/**
 * Agentforce class.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Cmp;

use Automattic\VIP\Salesforce\Agentforce\Utils\Traits\Singleton;

/**
 * Class Agentforce
 */
class Agentforce {

	use Singleton;

	/**
	 * Construct method.
	 */
	protected function __construct() {
		$this->setup_hooks();
	}

	/**
	 * To setup action/filter.
	 *
	 * @return void
	 */
	protected function setup_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'render_custom_css' ), 20 );
	}

	/**
	 * Add custom CSS to the frontend stylesheet.
	 *
	 * @return void
	 */
	public function render_custom_css(): void {
		$css = $this->get_custom_css();

		if ( '' === $css ) {
			return;
		}

		wp_add_inline_style( 'vip-agentforce-style', $css );
	}

	/**
	 * Build the custom CSS that should be appended to the frontend stylesheet.
	 *
	 * @return string
	 */
	private function get_custom_css(): string {
		$custom_css = get_option( 'vip_agentforce_custom_css', '' );
		$alignment  = get_option( 'vip_agentforce_alignment', 'bottom-right' );
		$styles     = array();

		if ( 'bottom-left' === $alignment ) {
			$styles[] = implode(
				"\n",
				array(
					'.embedded-messaging > .embeddedMessagingFrame { left: 10px }',
					'.embedded-messaging > .embeddedMessagingFrame.isMinimized { right: unset; }',
					'.embedded-messaging > .embeddedMessagingFrame.isMaximized { right: unset; }',
					'button#embeddedMessagingConversationButton { right: unset; left: 10px; }',
				)
			);
		}

		if ( is_string( $custom_css ) && '' !== trim( $custom_css ) ) {
			$custom_css = Settings_Page::sanitize_custom_css( $custom_css );
			$styles[]   = $custom_css;
		}

		return implode( "\n", $styles );
	}
}
