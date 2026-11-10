(function(exports, _wordpress_dom_ready, _wordpress_i18n) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

_wordpress_dom_ready = __toESM(_wordpress_dom_ready, 1);

// packages/a11y/build-module/script/add-container.mjs
/**
	* Build the live regions markup.
	*
	* @param {'polite'|'assertive'} [ariaLive] Value for the 'aria-live' attribute; default: 'polite'.
	*
	* @return The ARIA live region HTML element.
	*/
	function addContainer(ariaLive = "polite") {
		const container = document.createElement("div");
		container.id = `a11y-speak-${ariaLive}`;
		container.className = "a11y-speak-region";
		container.setAttribute("style", "position:absolute;margin:-1px;padding:0;height:1px;width:1px;overflow:hidden;clip-path:inset(50%);border:0;word-wrap:normal !important;word-break:normal !important;");
		container.setAttribute("aria-live", ariaLive);
		container.setAttribute("aria-relevant", "additions text");
		container.setAttribute("aria-atomic", "true");
		const { body } = document;
		if (body) body.appendChild(container);
		return container;
	}

// packages/a11y/build-module/script/add-intro-text.mjs
/**
	* Build the explanatory text to be placed before the aria live regions.
	*
	* This text is initially hidden from assistive technologies by using a `hidden`
	* HTML attribute which is then removed once a message fills the aria-live regions.
	*
	* @return The explanatory text HTML element.
	*/
	function addIntroText() {
		const introText = document.createElement("p");
		introText.id = "a11y-speak-intro-text";
		introText.className = "a11y-speak-intro-text";
		introText.textContent = (0, _wordpress_i18n.__)("Notifications");
		introText.setAttribute("style", "position:absolute;margin:-1px;padding:0;height:1px;width:1px;overflow:hidden;clip-path:inset(50%);border:0;word-wrap:normal !important;word-break:normal !important;");
		introText.setAttribute("hidden", "");
		const { body } = document;
		if (body) body.appendChild(introText);
		return introText;
	}

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

// packages/a11y/build-module/index.mjs
/**
	* Create the live regions.
	*/
	function setup() {
		const introText = document.getElementById("a11y-speak-intro-text");
		const containerAssertive = document.getElementById("a11y-speak-assertive");
		const containerPolite = document.getElementById("a11y-speak-polite");
		if (introText === null) addIntroText();
		if (containerAssertive === null) addContainer("assertive");
		if (containerPolite === null) addContainer("polite");
	}
	/**
	* Run setup on domReady.
	*/
	(0, _wordpress_dom_ready.default)(setup);

exports.setup = setup;
exports.speak = speak;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).a11y = exports;
return exports;
})({}, window.wp.domReady, window.wp.i18n);
//# sourceMappingURL=index.js.map