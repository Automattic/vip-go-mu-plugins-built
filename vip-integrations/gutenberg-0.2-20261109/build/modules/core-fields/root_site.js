// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-fields/build-module/root_site/description/field.mjs
var import_html_entities = require_html_entities();
/**
* The JavaScript parts of the site tagline field; its data is in
* `field.php`.
*/
const fieldExtensions$3 = { getValue: ({ item }) => (0, import_html_entities.decodeEntities)(item.description ?? "") };

// \0wp-global:@wordpress/media-utils
var require_media_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.mediaUtils;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/core-fields/build-module/lock-unlock.mjs
var import_media_utils = require_media_utils();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-fields");

// packages/core-fields/build-module/root_site/site_icon/field.mjs
const { MediaEdit: MediaEdit$1 } = unlock(import_media_utils.privateApis);
/**
* The JavaScript parts of the site icon field; its data is in `field.php`.
*/
const fieldExtensions$2 = {
	Edit: MediaEdit$1,
	setValue: ({ value }) => ({ site_icon: value ?? 0 })
};

// packages/core-fields/build-module/root_site/site_logo/field.mjs
const { MediaEdit } = unlock(import_media_utils.privateApis);
/**
* The JavaScript parts of the site logo field; its data is in `field.php`.
*/
const fieldExtensions$1 = {
	Edit: MediaEdit,
	setValue: ({ value }) => ({ site_logo: value ?? 0 })
};

// packages/core-fields/build-module/root_site/title/field.mjs
/**
* The JavaScript parts of the site title field; its data is in `field.php`.
*/
const fieldExtensions = { getValue: ({ item }) => (0, import_html_entities.decodeEntities)(item.title ?? "") };

// packages/core-fields/build-module/root_site/index.mjs
const fields = {
	description: fieldExtensions$3,
	site_icon: fieldExtensions$2,
	site_logo: fieldExtensions$1,
	title: fieldExtensions
};

export { fields as default };
//# sourceMappingURL=root_site.js.map