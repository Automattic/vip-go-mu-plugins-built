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
		add_action( 'wp_enqueue_scripts', array( $this, 'render_inline_styles' ), 20 );
	}

	/**
	 * Add inline styles to the frontend stylesheet.
	 *
	 * @return void
	 */
	public function render_inline_styles(): void {
		$css = $this->get_inline_styles();

		if ( '' === $css ) {
			return;
		}

		wp_add_inline_style( 'vip-agentforce-style', $css );
	}

	/**
	 * Build the inline styles that should be appended to the frontend stylesheet.
	 *
	 * @return string
	 */
	private function get_inline_styles(): string {
		$alignment = get_option( 'vip_agentforce_alignment', 'bottom-right' );
		$styles    = array();

		// Our custom launcher is the only entry point. Hide Salesforce's minimized chat
		// bubble (the round frame shown when an active conversation is collapsed or
		// restored on reload) so it does not sit behind our launcher. The maximized frame
		// is unaffected, so re-opening from our launcher still works.
		$styles[] = '.embedded-messaging > .embeddedMessagingFrame.isMinimized { display: none !important; }';

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

		return implode( "\n", $styles );
	}
}
