// packages/a11y/build-module/shared/clear.mjs
/**
* Clears the a11y-speak-region elements and hides the explanatory text.
*/
function clear() {
	const regions = document.getElementsByClassName("a11y-speak-region");
	const introText = document.getElementById("a11y-speak-intro-text");
	for (let i = 0; i < regions.length; i++) regions[i].textContent = "";
	if (introText) introText.setAttribute("hidden", "hidden");
}

// packages/a11y/build-module/shared/filter-message.mjs
let previousMessage = "";
/**
* Filter the message to be announced to the screenreader.
*
* @param message The message to be announced.
*
* @return The filtered message.
*/
function filterMessage(message) {
	message = message.replace(/<[^<>]+>/g, " ");
	if (previousMessage === message) message += "\xA0";
	previousMessage = message;
	return message;
}

// packages/a11y/build-module/shared/index.mjs
/**
* Allows you to easily announce dynamic interface updates to screen readers using ARIA live regions.
* This module is inspired by the `speak` function in `wp-a11y.js`.
*
* @param message    The message to be announced by assistive technologies.
* @param [ariaLive] The politeness level for aria-live; default: 'polite'.
*
* @example
* ```js
* import { speak } from '@wordpress/a11y';
*
* // For polite messages that shouldn't interrupt what screen readers are currently announcing.
* speak( 'The message you want to send to the ARIA live region' );
*
* // For assertive messages that should interrupt what screen readers are currently announcing.
* speak( 'The message you want to send to the ARIA live region', 'assertive' );
* ```
*/
function speak(message, ariaLive) {
	clear();
	message = filterMessage(message);
	const introText = document.getElementById("a11y-speak-intro-text");
	const containerAssertive = document.getElementById("a11y-speak-assertive");
	const containerPolite = document.getElementById("a11y-speak-polite");
	if (containerAssertive && ariaLive === "assertive") containerAssertive.textContent = message;
	else if (containerPolite) containerPolite.textContent = message;
	if (introText) introText.removeAttribute("hidden");
}

// packages/a11y/build-module/module/index.mjs
/**
* This no-op function is exported to provide compatibility with the `wp-a11y` Script.
*
* Filters should inject the relevant HTML on page load instead of requiring setup.
*/
const setup = () => {};

export { setup, speak };
//# sourceMappingURL=index.js.map