// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// routes/connectors-home/route.ts
var import_core_data = require_core_data();
var import_data = require_data();
var import_i18n = require_i18n();
const route = {
	title: () => (0, import_i18n.__)("Connectors"),
	loader: async () => {
		await (0, import_data.resolveSelect)(import_core_data.store).canUser("create", {
			kind: "root",
			name: "plugin"
		});
	}
};

export { route };