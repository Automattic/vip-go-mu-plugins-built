/**
 * Rewrite Rules Inspector Admin JavaScript
 *
 * @package automattic\rewrite-rules-inspector
 * @since 1.5.0
 */

(function($) {
	'use strict';

	/**
	 * Initialize admin functionality when document is ready.
	 */
	$(document).ready(function() {
		initAccessibilityEnhancements();
	});


	/**
	 * Initialize accessibility enhancements.
	 */
	function initAccessibilityEnhancements() {
		// Add ARIA live region for dynamic content updates.
		if (!$('#rri-live-region').length) {
			$('body').append('<div id="rri-live-region" class="screen-reader-text" aria-live="polite" aria-atomic="true"></div>');
		}
	}

	/**
	 * Utility function to check if element is in viewport.
	 */
	function isInViewport(element) {
		const rect = element.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

})(jQuery);
