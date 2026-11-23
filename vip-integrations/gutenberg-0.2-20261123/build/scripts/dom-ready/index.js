(function(exports) {

"use strict";
// packages/dom-ready/build-module/index.mjs
/**
	* Specify a function to execute when the DOM is fully loaded.
	*
	* @param callback A function to execute after the DOM is ready.
	*
	* @example
	* ```js
	* import domReady from '@wordpress/dom-ready';
	*
	* domReady( function() {
	* 	//do something after DOM loads.
	* } );
	* ```
	*/
	function domReady(callback) {
		if (typeof document === "undefined") return;
		if (document.readyState === "complete" || document.readyState === "interactive") {
			callback();
			return;
		}
		document.addEventListener("DOMContentLoaded", callback);
	}

exports.default = domReady;
(window.wp ||= {}).domReady = exports.default;
return exports;
})({});
//# sourceMappingURL=index.js.map