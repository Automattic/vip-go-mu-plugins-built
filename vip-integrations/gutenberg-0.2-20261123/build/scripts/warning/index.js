(function(exports) {

"use strict";
// packages/warning/build-module/utils.mjs
/**
	* Object map tracking messages which have been logged, for use in ensuring a
	* message is only logged once.
	*/
	const logged = /* @__PURE__ */ new Set();

// packages/warning/build-module/index.mjs
	function isDev() {
		return true;
	}
	/**
	* Shows a warning with `message` if environment is not `production`.
	*
	* @param message Message to show in the warning.
	*
	* @example
	* ```js
	* import warning from '@wordpress/warning';
	*
	* function MyComponent( props ) {
	*   if ( ! props.title ) {
	*     warning( '`props.title` was not passed' );
	*   }
	*   ...
	* }
	* ```
	*/
	function warning(message) {
		if (!isDev()) return;
		if (logged.has(message)) return;
		console.warn(message);
		try {
			throw Error(message);
		} catch {}
		logged.add(message);
	}

exports.default = warning;
(window.wp ||= {}).warning = exports.default;
return exports;
})({});
//# sourceMappingURL=index.js.map