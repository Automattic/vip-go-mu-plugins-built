(function(exports, _wordpress_hooks) {

"use strict";
// packages/deprecated/build-module/index.mjs
/**
	* Object map tracking messages which have been logged, for use in ensuring a
	* message is only logged once.
	*/
	const logged = Object.create(null);
	/**
	* Logs a message to notify developers about a deprecated feature.
	*
	* @param {string}            feature   Name of the deprecated feature.
	* @param {DeprecatedOptions} [options] Personalisation options
	*
	* @example
	* ```js
	* import deprecated from '@wordpress/deprecated';
	*
	* deprecated( 'Eating meat', {
	* 	since: '2019.01.01',
	* 	version: '2020.01.01',
	* 	alternative: 'vegetables',
	* 	plugin: 'the earth',
	* 	hint: 'You may find it beneficial to transition gradually.',
	* } );
	*
	* // Logs: 'Eating meat is deprecated since version 2019.01.01 and will be removed from the earth in version 2020.01.01. Please use vegetables instead. Note: You may find it beneficial to transition gradually.'
	* ```
	*/
	function deprecated(feature, options = {}) {
		const { since, version, alternative, plugin, link, hint } = options;
		const pluginMessage = plugin ? ` from ${plugin}` : "";
		const message = `${feature} is deprecated${since ? ` since version ${since}` : ""}${version ? ` and will be removed${pluginMessage} in version ${version}` : ""}.${alternative ? ` Please use ${alternative} instead.` : ""}${link ? ` See: ${link}` : ""}${hint ? ` Note: ${hint}` : ""}`;
		if (message in logged) return;
		/**
		* Fires whenever a deprecated feature is encountered
		*
		* @param {string}            feature Name of the deprecated feature.
		* @param {DeprecatedOptions} options Personalisation options
		* @param {string}            message Message sent to console.warn
		*/
		(0, _wordpress_hooks.doAction)("deprecated", feature, options, message);
		console.warn(message);
		logged[message] = true;
	}

exports.default = deprecated;
exports.logged = logged;
(window.wp ||= {}).deprecated = exports.default;
return exports;
})({}, window.wp.hooks);
//# sourceMappingURL=index.js.map