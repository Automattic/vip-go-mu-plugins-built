// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// routes/lock-unlock/index.ts
var import_data = require_data();
var import_core_data = require_core_data();
var import_i18n = require_i18n();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/routes");

// routes/identity/route.ts
/**
* The stage only renders a form, so it requests the `form` of the entity view
* configuration alone. Must match the fields the stage requests so both resolve
* under the same cache key.
*/
const VIEW_CONFIG_FIELDS = "form";
/**
* Route configuration for the site identity.
*/
const route = {
	title: () => (0, import_i18n._x)("Identity", "site identity"),
	async canvas() {
		return {
			isPreview: true,
			renderingMode: "template-locked"
		};
	},
	loader: async () => {
		await Promise.all([(0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("root", "site"), unlock((0, import_data.resolveSelect)(import_core_data.store)).getViewConfig("root", "site", { fields: VIEW_CONFIG_FIELDS })]);
	}
};

export { route };