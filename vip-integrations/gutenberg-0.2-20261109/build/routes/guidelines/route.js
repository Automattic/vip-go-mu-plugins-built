// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/blocks
var require_blocks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blocks;
}));

// \0wp-global:@wordpress/block-library
var require_block_library = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blockLibrary;
}));

// routes/guidelines/bootstrap-block-registry.ts
var import_i18n = require_i18n();
var import_data = require_data();
var import_blocks = require_blocks();
var import_block_library = require_block_library();
let bootstrapped = false;
/**
* Bootstraps the block registry with Core blocks only.
* Used on the Guidelines admin page so block icons (and later
* 3rd party/experimental block support) are available without loading
* the full block editor.
*/
function bootstrapBlockRegistry() {
	if (bootstrapped) return;
	bootstrapped = true;
	(0, import_data.dispatch)(import_blocks.store).reapplyBlockTypeFilters();
	(0, import_block_library.registerCoreBlocks)();
}

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// routes/guidelines/entity.ts
var import_core_data = require_core_data();
let registered = false;
/**
* Registers the read-only guideline scopes registry as a core-data `root`
* entity so the Settings page can consume it with `useEntityRecords`, the same
* way it consumes post statuses. Idempotent.
*/
function registerGuidelineScopeEntity() {
	if (registered) return;
	registered = true;
	(0, import_data.dispatch)(import_core_data.store).addEntities([{
		label: (0, import_i18n.__)("Guideline Scope"),
		name: "guidelineScope",
		kind: "root",
		baseURL: "/wp/v2/knowledge/guideline-scopes",
		plural: "guidelineScopes",
		key: "slug",
		supportsPagination: false
	}]);
}

// routes/guidelines/route.ts
const route = {
	beforeLoad: () => {
		bootstrapBlockRegistry();
		registerGuidelineScopeEntity();
	},
	title: () => (0, import_i18n.__)("Guidelines")
};

export { route };